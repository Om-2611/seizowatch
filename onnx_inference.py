import onnxruntime as ort
import numpy as np

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

    # output is usually [[probability]]
    onnx_score = float(output[0][0])
    decision = onnx_score > 0.5

    return decision, onnx_score
