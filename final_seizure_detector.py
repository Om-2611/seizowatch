import cv2
import numpy as np
from collections import deque
import numpy.fft as fft
from onnx_inference import verify_with_dl
from firebase_logger import log_seizure_event, update_realtime_monitoring, update_camera_status
from datetime import datetime
import time

# Camera Setup
cap = cv2.VideoCapture(0)
ret, prev_frame = cap.read()
prev_gray = cv2.cvtColor(prev_frame, cv2.COLOR_BGR2GRAY)

# Buffers
motion_signal = deque(maxlen=60)

# Thresholds
MOTION_THRESHOLD = 900_000  # Set to 900,000 for optimal seizure detection
RHYTHM_THRESHOLD = 4
SEIZURE_FRAME_THRESHOLD = 2  # 2 frames for very quick detection

seizure_frames = 0
last_firebase_update = 0  # Track last Firebase update time
FIREBASE_UPDATE_INTERVAL = 1.0  # Update Firebase every 1 second
seizure_logged = False

print("Seizure detector initialized. Press Q to quit.")
print("Detection workflow:")
print("  1. Motion detection")
print("  2. Rhythmic motion analysis (FFT)")
print("  3. Sustained high intensity detection")
print("  4. Deep learning verification")
print("  5. Event confirmation and logging")
print()

update_camera_status(True)
update_camera_status(True)

# Main Loop
while True:
    ret, frame = cap.read()
    if not ret:
        break

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    diff = cv2.absdiff(prev_gray, gray)

    motion_value = np.sum(diff)
    motion_signal.append(motion_value)

    # Step 1: Motion detected (always happening)
    motion_detected = motion_value > 0
    
    rhythmic_motion = False
    dominant_freq = 0

    # Step 2: Rhythmic motion detection (FFT analysis)
    if len(motion_signal) == motion_signal.maxlen:
        signal = np.array(motion_signal)
        signal = signal - np.mean(signal)

        fft_values = np.abs(fft.fft(signal))
        dominant_freq = np.argmax(fft_values[1:50])

        if dominant_freq > RHYTHM_THRESHOLD:
            rhythmic_motion = True
            cv2.putText(
                frame, "Step 2: RHYTHMIC MOTION (FFT)",
                (20, 80),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 165, 255), 2
            )

    
    # Step 3: Sustained + High intensity (Rule-based detection)
    if rhythmic_motion and motion_value > MOTION_THRESHOLD:
        seizure_frames += 1
        cv2.putText(
            frame, f"Step 3: SUSTAINED ({seizure_frames}/{SEIZURE_FRAME_THRESHOLD} frames)",
            (20, 110),
            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 165, 0), 2
        )
        
        # Show progress bar for step 3
        progress = min(seizure_frames / SEIZURE_FRAME_THRESHOLD, 1.0)
        bar_width = 300
        cv2.rectangle(frame, (20, 135), (20 + int(bar_width * progress), 150), (255, 165, 0), -1)
        cv2.rectangle(frame, (20, 135), (20 + bar_width, 150), (255, 255, 255), 2)
    else:
        seizure_frames = 0
        seizure_logged = False  # Reset flag when no seizure detected

    rule_based_seizure = seizure_frames >= SEIZURE_FRAME_THRESHOLD

    # Update Firebase with real-time monitoring data (throttled to once per second)
    current_time = time.time()
    if current_time - last_firebase_update >= FIREBASE_UPDATE_INTERVAL:
        avg_motion = np.mean(motion_signal) if len(motion_signal) > 0 else 0
        max_motion = np.max(motion_signal) if len(motion_signal) > 0 else 0
        
        update_realtime_monitoring(
            motion_value=motion_value,
            dominant_freq=dominant_freq,
            is_rhythmic=rhythmic_motion,
            avg_motion=avg_motion,
            max_motion=max_motion
        )
        last_firebase_update = current_time

    
    # Step 4-5: DL Verification → Final Confirmation
    if rule_based_seizure and not seizure_logged:
        # Generate statistics for DL model
        avg_motion = np.mean(motion_signal)
        max_motion = np.max(motion_signal)
        duration = seizure_frames / 15.0  # seconds 
        
        print(f"\n{'='*60}")
        print(f"Step 1: Motion detected")
        print(f"Step 2: Rhythmic motion detected (Freq: {dominant_freq} Hz)")
        print(f"Step 3: Sustained high intensity")
        print(f"        Duration: {duration:.2f}s")
        print(f"        Avg Motion: {avg_motion:.0f}")
        print(f"        Max Motion: {max_motion:.0f}")
        print(f"\nStep 4: DL Verification (ONNX)...")

        # Step 4: DL Verification
        dl_verified, onnx_score = verify_with_dl(
            avg_motion,
            max_motion,
            dominant_freq,
            duration
        )
        
        print(f"        ONNX Score: {onnx_score:.3f}")
        print(f"        Threshold: 0.500")
        print(f"        Verified: {'YES' if dl_verified else 'NO'}")

        if dl_verified:
            print(f"\nStep 5: SEIZURE CONFIRMED")
            print(f"Saving to Firebase database...")
            
            cv2.putText(
                frame,
                "Step 5: FINAL SEIZURE CONFIRMED",
                (20, 140),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.8,
                (0, 0, 255),
                3
            )
            
            # Save to Firebase database
            log_seizure_event({
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "duration_seconds": float(duration),
                "avg_motion": float(avg_motion),
                "max_motion": float(max_motion),
                "dominant_frequency": float(dominant_freq),
                "rule_based": True,
                "dl_verified": True,
                "onnx_score": float(onnx_score)
            })
            
            print(f"Event saved successfully")
            print(f"{'='*60}\n")
            seizure_logged = True
        else:
            print(f"\nFALSE POSITIVE - DL verification failed")
            print(f"Score {onnx_score:.3f} < 0.500 threshold")
            print(f"Not saving to database")
            print(f"{'='*60}\n")
            
            cv2.putText(
                frame,
                "FALSE POSITIVE - Not Saved",
                (20, 140),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.8,
                (0, 165, 255),
                2
            )

    # Display
    cv2.putText(
        frame,
        f"Step 1: Motion: {int(motion_value)} (Threshold: {MOTION_THRESHOLD})",
        (20, 40),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.6,
        (255, 255, 255),
        2
    )
    
    # Show if motion is high enough
    if motion_value > MOTION_THRESHOLD:
        cv2.putText(
            frame,
            "HIGH INTENSITY!",
            (20, 60),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            (0, 255, 0),
            2
        )

    cv2.imshow("SeizoWatch - Hybrid Detector", frame)

    prev_gray = gray

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Cleanup
update_camera_status(False)
cap.release()
cv2.destroyAllWindows()
