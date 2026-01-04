import onnxruntime as ort
import numpy as np

# Load ONNX model once
session = ort.InferenceSession(
    "seizure_verifier.onnx",
    providers=["CPUExecutionProvider"]
)

def verify_with_dl(avg_motion, max_motion, dominant_freq, duration):
    features = np.array(
        [[avg_motion, max_motion, dominant_freq, duration]],
        dtype=np.float32
    )

    output = session.run(None, {"input": features})
    prob = output[0][0]

    return prob > 0.5  # YES / NO
