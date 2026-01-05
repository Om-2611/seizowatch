from firebase_logger import log_seizure_event

log_seizure_event({
    "timestamp": "TEST",
    "final_decision": True,
    "onnx_score": 0.99
})

print("Firebase test successful")
