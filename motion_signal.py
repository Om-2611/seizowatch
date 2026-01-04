import cv2
import numpy as np
from collections import deque
import numpy.fft as fft

cap = cv2.VideoCapture(0)

ret, prev_frame = cap.read()
prev_gray = cv2.cvtColor(prev_frame, cv2.COLOR_BGR2GRAY)

# Store last 100 motion values (sliding window)
motion_signal = deque(maxlen=60)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Convert to grayscale (internal processing)
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    diff = cv2.absdiff(prev_gray, gray)

    # Calculate motion
    motion_value = np.sum(diff)
    motion_signal.append(motion_value)

    # ---------- FFT-based rhythmic motion detection ----------
    if len(motion_signal) == 100:
        signal = np.array(motion_signal)

        # Remove DC component (mean)
        signal = signal - np.mean(signal)

        fft_values = np.abs(fft.fft(signal))
        dominant_freq = np.argmax(fft_values[1:50])  # ignore very low freq

        if dominant_freq > 5:
            cv2.putText(
                frame,
                "RHYTHMIC MOTION DETECTED",
                (20, 80),
                cv2.FONT_HERSHEY_SIMPLEX,
                1,
                (0, 0, 255),
                2
            )

    # ---------- Display motion value ----------
    cv2.putText(
        frame,
        f"Motion: {int(motion_value)}",
        (20, 40),
        cv2.FONT_HERSHEY_SIMPLEX,
        1,
        (0, 0, 255),
        2
    )

    cv2.imshow("Color Camera + Motion", frame)

    prev_gray = gray

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
