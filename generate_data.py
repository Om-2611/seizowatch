import numpy as np

np.random.seed(42)

data = []
labels = []

# Normal motion
for _ in range(500):
    avg_motion = np.random.uniform(1e5, 6e5)
    max_motion = np.random.uniform(3e5, 9e5)
    dominant_freq = np.random.uniform(0, 3)
    duration = np.random.uniform(1, 3)

    data.append([avg_motion, max_motion, dominant_freq, duration])
    labels.append(0)

# Seizure-like motion
for _ in range(500):
    avg_motion = np.random.uniform(1.2e6, 2.5e6)
    max_motion = np.random.uniform(2e6, 4e6)
    dominant_freq = np.random.uniform(4, 10)
    duration = np.random.uniform(3, 7)

    data.append([avg_motion, max_motion, dominant_freq, duration])
    labels.append(1)

X = np.array(data)
y = np.array(labels)

np.save("X.npy", X)
np.save("y.npy", y)

print("✅ Synthetic dataset created")
