import cv2
import numpy as np
from collections import deque
import numpy.fft as fft

# ---- Camera Setup ----
cap = cv2.VideoCapture(0)

ret, prev_frame = cap.read()
if not ret:
    print("❌ Failed to read camera")
    exit()

prev_gray = cv2.cvtColor(prev_frame, cv2.COLOR_BGR2GRAY)

# ---- Motion Signal Buffer ----
motion_signal = deque(maxlen=100)

# ---- Seizure Detection Parameters ----
seizure_frames = 0
SEIZURE_FRAME_THRESHOLD = 60      # ~4 seconds (depends on FPS)
MOTION_THRESHOLD = 1_500_000
RHYTHM_THRESHOLD = 5

print("✅ Camera running. Press Q to quit.")

# ---- Main Loop ----
while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Internal grayscale processing
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    diff = cv2.absdiff(prev_gray, gray)

    # Motion value
    motion_value = np.sum(diff)
    motion_signal.append(motion_value)

    rhythmic_motion = False

    # ---- FFT Analysis ----
    if len(motion_signal) == 100:
        signal = np.array(motion_signal)
        signal = signal - np.mean(signal)  # remove DC component

        fft_values = np.abs(fft.fft(signal))
        dominant_freq = np.argmax(fft_values[1:50])

        if dominant_freq > RHYTHM_THRESHOLD:
            rhythmic_motion = True
            cv2.putText(
                frame,
                "RHYTHMIC MOTION",
                (20, 80),
                cv2.FONT_HERSHEY_SIMPLEX,
                1,
                (0, 0, 255),
                2
            )

    # ---- Final Seizure Logic ----
    if rhythmic_motion and motion_value > MOTION_THRESHOLD:
        seizure_frames += 1
    else:
        seizure_frames = 0

    if seizure_frames >= SEIZURE_FRAME_THRESHOLD:
        cv2.putText(
            frame,
            "🚨 SEIZURE-LIKE ACTIVITY DETECTED",
            (20, 120),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 0, 255),
            3
        )

    # ---- Display ----
    cv2.putText(
        frame,
        f"Motion: {int(motion_value)}",
        (20, 40),
        cv2.FONT_HERSHEY_SIMPLEX,
        1,
        (0, 0, 255),
        2
    )

    cv2.imshow("Seizure Detection Monitor", frame)

    prev_gray = gray

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
