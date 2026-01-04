import onnxruntime as ort
import numpy as np

session = ort.InferenceSession("seizure_verifier.onnx")

# Example seizure-like input
sample = np.array([[2e6, 3e6, 6.5, 5.0]], dtype=np.float32)

output = session.run(None, {"input": sample})

print("ONNX output:", output)
