from firebase_logger import log_seizure_event
from datetime import datetime, timedelta
import random

print("Adding sample seizure events to Firebase...")

# Add 5 sample events with realistic data
sample_events = [
    {
        "timestamp": (datetime.now() - timedelta(hours=2)).strftime("%Y-%m-%d %H:%M:%S"),
        "duration_seconds": 4.8,
        "avg_motion": 2500000.5,
        "max_motion": 3200000.8,
        "dominant_frequency": 5.2,
        "rule_based": True,
        "dl_verified": True,
        "onnx_score": 0.92
    },
    {
        "timestamp": (datetime.now() - timedelta(hours=5)).strftime("%Y-%m-%d %H:%M:%S"),
        "duration_seconds": 3.6,
        "avg_motion": 2100000.3,
        "max_motion": 2800000.5,
        "dominant_frequency": 4.8,
        "rule_based": True,
        "dl_verified": True,
        "onnx_score": 0.87
    },
    {
        "timestamp": (datetime.now() - timedelta(days=1, hours=3)).strftime("%Y-%m-%d %H:%M:%S"),
        "duration_seconds": 5.4,
        "avg_motion": 2800000.7,
        "max_motion": 3500000.2,
        "dominant_frequency": 6.1,
        "rule_based": True,
        "dl_verified": True,
        "onnx_score": 0.95
    },
    {
        "timestamp": (datetime.now() - timedelta(days=2, hours=8)).strftime("%Y-%m-%d %H:%M:%S"),
        "duration_seconds": 4.2,
        "avg_motion": 2300000.4,
        "max_motion": 3000000.6,
        "dominant_frequency": 5.5,
        "rule_based": True,
        "dl_verified": False,
        "onnx_score": 0.45
    },
    {
        "timestamp": (datetime.now() - timedelta(days=3, hours=12)).strftime("%Y-%m-%d %H:%M:%S"),
        "duration_seconds": 6.1,
        "avg_motion": 3100000.9,
        "max_motion": 3800000.3,
        "dominant_frequency": 6.8,
        "rule_based": True,
        "dl_verified": True,
        "onnx_score": 0.98
    }
]

for i, event in enumerate(sample_events, 1):
    log_seizure_event(event)
    print(f"✅ Added event {i}/5: {event['timestamp']}")

print("\n🎉 Sample data added successfully!")
print("Open your dashboard to see the events in real-time.")
