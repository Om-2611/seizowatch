import joblib
import numpy as np
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType
from sklearn.pipeline import Pipeline

# Load trained model and scaler
model = joblib.load("seizure_model.pkl")
scaler = joblib.load("scaler.pkl")

# Create pipeline (scaler + model)
pipeline = Pipeline([
    ("scaler", scaler),
    ("classifier", model)
])

# Define input type (4 features)
initial_type = [("input", FloatTensorType([None, 4]))]

# Convert to ONNX
onnx_model = convert_sklearn(
    pipeline,
    initial_types=initial_type,
    target_opset=12
)

# Save ONNX model
with open("seizure_verifier.onnx", "wb") as f:
    f.write(onnx_model.SerializeToString())

print("✅ ONNX model saved as seizure_verifier.onnx")
