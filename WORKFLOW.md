# SeizoWatch Detection Workflow

## Complete Detection Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                    SEIZURE DETECTION WORKFLOW                   │
└─────────────────────────────────────────────────────────────────┘

Step 1: MOTION DETECTION
────────────────────────────────────────────────
Camera captures video frame
   ↓
Calculate frame difference (motion value)
   ↓
Analyze motion signal with FFT
   ↓
Detect rhythmic motion (frequency analysis)
   ↓
Check if: rhythmic_motion AND motion_value > threshold
   ↓
If YES for ~2 seconds → Seizure Sign Detected ✓
If NO → Continue monitoring


Step 2: GENERATE STATISTICS
────────────────────────────────────────────────
When seizure sign detected:
   ↓
Calculate metrics from motion buffer:
   • Duration (seconds)
   • Average motion value
   • Maximum motion value  
   • Dominant frequency (Hz)
   ↓
Statistics Generated ✓


Step 3: DL MODEL VERIFICATION
────────────────────────────────────────────────
Pass statistics to ONNX Deep Learning model:
   ↓
Input: [avg_motion, max_motion, frequency, duration]
   ↓
Model outputs: confidence score (0.0 - 1.0)
   ↓
If score > 0.5 → DL Verified ✓
If score ≤ 0.5 → False Positive ✗


Step 4: DATABASE UPDATE
────────────────────────────────────────────────
If DL Verified = YES:
   ↓
Save event to Firebase:
   • seizure_events/{auto_id}
      - timestamp
      - duration_seconds
      - avg_motion
      - max_motion
      - dominant_frequency
      - rule_based: true
      - dl_verified: true
      - onnx_score
   ↓
Event Saved to Database ✓
Dashboard Updates Automatically ✓

If DL Verified = NO:
   ↓
Do NOT save to database
Display "False Positive" on screen
Continue monitoring
```

## Real-Time Monitoring vs Events

### Real-Time Monitoring (updates every second)
- **Path**: `realtime_monitoring/`
- **Purpose**: Live camera feed data for dashboard
- **Contains**: Current motion, frequency, status
- **Not permanent**: Overwrites each second

### Seizure Events (saved once when confirmed)
- **Path**: `seizure_events/{id}`  
- **Purpose**: Permanent record of confirmed seizures
- **Contains**: Complete seizure statistics
- **Permanent**: Never deleted, historical record

## Output Messages

When running `final_seizure_detector.py`, you'll see:

```
✅ Final detector running (Rule + DL). Press Q to quit.
📋 Workflow: Motion Detection → Statistics → DL Verification → Database

[Normal monitoring - no output]

🔍 Seizure sign detected! Generating statistics...
   Duration: 2.1s, Avg Motion: 2500000, Max: 3200000, Freq: 5 Hz
   
🤖 Verifying with Deep Learning model...
   DL Score: 0.92 | Verified: True
   
✅ SEIZURE CONFIRMED by DL! Saving to database...
💾 Event saved to Firebase database
   ✓ Event saved to Firebase: seizure_events/
```

Or if false positive:

```
🔍 Seizure sign detected! Generating statistics...
   Duration: 1.8s, Avg Motion: 1800000, Max: 2200000, Freq: 3 Hz
   
🤖 Verifying with Deep Learning model...
   DL Score: 0.32 | Verified: False
   
❌ Not a seizure - DL score too low (0.32)
```

## Key Points

✅ **Only DL-verified events** are saved to the database
✅ **Statistics are generated** before DL verification  
✅ **DL model acts as final gatekeeper** to prevent false positives
✅ **Real-time monitoring** runs independently for live dashboard
✅ **No duplicate logging** - each event saved only once

## Testing the Workflow

1. Start the detector:
   ```bash
   python final_seizure_detector.py
   ```

2. Watch the console output to see the workflow steps

3. Check Firebase Console:
   - `realtime_monitoring/` updates every second
   - `seizure_events/` only gets new entries when DL confirms

4. View dashboard:
   - Live feed shows real-time motion data
   - Events page shows only confirmed seizures
   - Analytics page analyzes confirmed events only

## Thresholds

You can adjust detection sensitivity:

```python
MOTION_THRESHOLD = 1_500_000      # Motion intensity threshold
RHYTHM_THRESHOLD = 4              # Minimum frequency for rhythmic motion  
SEIZURE_FRAME_THRESHOLD = 30      # Frames (~2 sec) to confirm pattern
```

DL model threshold (in onnx_inference.py):
```python
decision = onnx_score > 0.5       # 50% confidence threshold
```
