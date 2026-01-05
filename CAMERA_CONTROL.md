# Camera Control Setup Guide

## Overview
The dashboard now includes remote camera control to start/stop the seizure detector from the web interface.

## Architecture
```
React Dashboard → Flask API Server → Python Camera Detector
                      ↓
                  Firebase (status sync)
```

## Setup Instructions

### 1. Install Python Dependencies

```bash
pip install flask flask-cors psutil firebase-admin
```

Or install from requirements file:
```bash
pip install -r requirements.txt
```

### 2. Start the Camera Control Server

Open a new terminal and run:
```bash
python camera_server.py
```

You should see:
```
🚀 SeizoWatch Camera Control API
📡 Server running on http://localhost:5000
📷 Dashboard can now control the camera remotely
```

Keep this terminal running.

### 3. Start the Dashboard

In another terminal:
```bash
cd dashboard
npm run dev
```

### 4. Use Camera Control

1. Open the dashboard in your browser
2. You'll see a "Camera Control" card at the top
3. Click "Start Camera" to begin detection
4. Click "Stop Camera" to end detection

## Features

### Camera Control Panel
- **Live Status**: Shows if camera is running or stopped
- **Start/Stop Button**: Toggle camera detection
- **Auto-Refresh**: Status updates every 5 seconds
- **Error Handling**: Displays connection issues

### API Endpoints

**Base URL**: `http://localhost:5000`

#### GET `/camera/status`
Check if camera is running
```json
{
  "status": "running",
  "running": true
}
```

#### POST `/camera/start`
Start the camera detector
```json
{
  "success": true,
  "message": "Camera started successfully",
  "pid": 12345
}
```

#### POST `/camera/stop`
Stop the camera detector
```json
{
  "success": true,
  "message": "Camera stopped successfully"
}
```

## How It Works

1. **Dashboard UI** - CameraControl component in React
2. **Flask API** - camera_server.py handles start/stop requests
3. **Process Management** - Uses subprocess to launch detector
4. **Status Sync** - Updates Firebase with camera state
5. **Health Check** - Polls status every 5 seconds

## Troubleshooting

### "Cannot connect to camera server"
→ Make sure `python camera_server.py` is running on port 5000

### "Camera is already running"
→ The detector is already active. Stop it first or check Task Manager

### Port 5000 is in use
Edit `camera_server.py` and change the port:
```python
app.run(host='0.0.0.0', port=5001, debug=True)
```

Then update the API_URL in `CameraControl.jsx`:
```javascript
const API_URL = 'http://localhost:5001';
```

### Camera doesn't start
- Check if webcam is available
- Verify `final_seizure_detector.py` works standalone
- Check terminal for error messages

### CORS errors in browser
- Verify flask-cors is installed: `pip install flask-cors`
- Check browser console for specific errors

## Running Multiple Instances

To prevent conflicts:
1. Only run ONE camera_server.py instance
2. The server will detect if detector is already running
3. Multiple dashboards can connect to the same server

## Production Deployment

For production use:

1. **Use a production WSGI server**:
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 camera_server:app
```

2. **Add authentication** to the API endpoints

3. **Use environment variables** for configuration:
```python
API_PORT = os.getenv('API_PORT', 5000)
```

4. **Add HTTPS** for secure communication

## Security Notes

⚠️ **Current Setup**: No authentication (for development only)

For production:
- Add API key authentication
- Use JWT tokens
- Enable HTTPS/SSL
- Restrict CORS to specific domains
- Add rate limiting

## Testing

Test the API manually:

```bash
# Check status
curl http://localhost:5000/camera/status

# Start camera
curl -X POST http://localhost:5000/camera/start

# Stop camera
curl -X POST http://localhost:5000/camera/stop
```

## Files Created

- `camera_server.py` - Flask API server
- `dashboard/src/components/CameraControl.jsx` - UI component
- `dashboard/src/components/CameraControl.css` - Component styles
- `requirements.txt` - Python dependencies
- Updated `firebase_logger.py` - Added camera status function

## Next Steps

Optional enhancements:
- Add camera preview/live feed
- Show detector logs in dashboard
- Add camera settings (thresholds, fps)
- Email/SMS notifications on detection
- Multi-camera support
