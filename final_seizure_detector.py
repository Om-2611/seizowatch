import cv2
import numpy as np
from collections import deque
import numpy.fft as fft
from onnx_inference import verify_with_dl

# Camera Setup
cap = cv2.VideoCapture(0)
ret, prev_frame = cap.read()
prev_gray = cv2.cvtColor(prev_frame, cv2.COLOR_BGR2GRAY)

# Buffers
motion_signal = deque(maxlen=60)

# Thresholds
MOTION_THRESHOLD = 1_500_000
RHYTHM_THRESHOLD = 4
SEIZURE_FRAME_THRESHOLD = 30  # ~2 seconds

seizure_frames = 0

print("✅ Final detector running (Rule + DL). Press Q to quit.")

# Main Loop
while True:
    ret, frame = cap.read()
    if not ret:
        break

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    diff = cv2.absdiff(prev_gray, gray)

    motion_value = np.sum(diff)
    motion_signal.append(motion_value)

    rhythmic_motion = False
    dominant_freq = 0

    # FFT
    if len(motion_signal) == motion_signal.maxlen:
        signal = np.array(motion_signal)
        signal = signal - np.mean(signal)

        fft_values = np.abs(fft.fft(signal))
        dominant_freq = np.argmax(fft_values[1:50])

        if dominant_freq > RHYTHM_THRESHOLD:
            rhythmic_motion = True
            cv2.putText(
                frame, "RHYTHMIC MOTION",
                (20, 80),
                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2
            )

    
    if rhythmic_motion and motion_value > MOTION_THRESHOLD:
        seizure_frames += 1
    else:
        seizure_frames = 0

    rule_based_seizure = seizure_frames >= SEIZURE_FRAME_THRESHOLD

    
    if rule_based_seizure:
        avg_motion = np.mean(motion_signal)
        max_motion = np.max(motion_signal)
        duration = seizure_frames / 15.0  # seconds 

        dl_ok = verify_with_dl(
            avg_motion,
            max_motion,
            dominant_freq,
            duration
        )

        if dl_ok:
            cv2.putText(
                frame,
                "🚨 FINAL SEIZURE CONFIRMED",
                (20, 130),
                cv2.FONT_HERSHEY_SIMPLEX,
                1,
                (0, 0, 255),
                3
            )

    # Display
    cv2.putText(
        frame,
        f"Motion: {int(motion_value)}",
        (20, 40),
        cv2.FONT_HERSHEY_SIMPLEX,
        1,
        (0, 0, 255),
        2
    )

    cv2.imshow("Hybrid Seizure Detector", frame)

    prev_gray = gray

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
