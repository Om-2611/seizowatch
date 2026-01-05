# SeizoWatch

SeizoWatch is a real-time, video-based seizure-like activity monitoring system designed as an assistive alert tool.  
It analyzes live camera input to detect sustained, rhythmic, high-intensity motion patterns and provides real-time alerts and event logging through a web dashboard.

This system is not a medical diagnostic device.  
It is intended only for assistive monitoring and early alerting.

---

## Key Features

- Real-time camera-based motion analysis  
- Rhythmic motion pattern detection  
- Multi-stage verification to reduce false alerts  
- Fast, CPU-friendly backend processing  
- Cloud-based event logging  
- Real-time web dashboard  
- Live alert status for monitoring  
- Privacy-friendly (local processing, cloud logging only)

---

## System Overview

Camera Feed
↓
Motion Signal Analysis
↓
Rhythmic Pattern Detection
↓
Sustained Activity Verification
↓
Final Event Confirmation
↓
Firebase Realtime Database
↓
React Web Dashboard

### Backend (Python)
- Captures live video from a fixed camera  
- Computes frame-to-frame motion signals  
- Detects repetitive rhythmic motion patterns  
- Applies sustained-duration and intensity checks  
- Confirms events through a verification stage  
- Pushes structured event data to Firebase  
- Updates real-time alert status  

### Cloud Layer (Firebase Realtime Database)
- Stores confirmed seizure-like events  
- Maintains a real-time alert state  
- Acts as a bridge between backend and dashboard  

### Frontend (React.js)
- Real-time dashboard  
- Event history and summaries  
- Live alert indicator  
- Analytics-ready structure  
- Premium dark UI design  

---

## Project Structure

seizowatch/
│
├── final_seizure_detector.py # Backend entry point
├── onnx_inference.py # Lightweight verification module
├── firebase_logger.py # Firebase logging and alerts
├── firebase_key.json # Service account key (private)
│
├── dashboard/ # React frontend
│ ├── src/
│ ├── package.json
│ └── ...
│
├── train_model.py # Offline training (optional)
├── convert_to_onnx.py # Model conversion utility
├── generate_data.py # Synthetic data generator
└── README.md

Video Drive Link - https://drive.google.com/drive/folders/125rSvj0FguWiuEFrU0g5G4aTWvwfTadB?usp=sharing
Port forwarding link: https://9f5zd9v5-3002.inc1.devtunnels.ms/

---

## Getting Started

### Backend Setup

Install dependencies:
```bash
pip install opencv-python numpy onnxruntime firebase-admin

Frontend Setup
cd dashboard
npm install
npm run dev


