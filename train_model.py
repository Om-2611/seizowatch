import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import accuracy_score

X = np.load("X.npy")
y = np.load("y.npy")

# Normalize data
scaler = StandardScaler()
X = scaler.fit_transform(X)

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Tiny neural network
model = MLPClassifier(
    hidden_layer_sizes=(8,),
    max_iter=500,
    random_state=42
)

model.fit(X_train, y_train)

y_pred = model.predict(X_test)
print("✅ Accuracy:", accuracy_score(y_test, y_pred))

# Save model & scaler
import joblib
joblib.dump(model, "seizure_model.pkl")
joblib.dump(scaler, "scaler.pkl")
