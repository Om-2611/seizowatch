# Quick Setup: Camera Control

## ✅ Camera control has been integrated into your sidebar!

### What's New

The camera on/off button is now in the **left sidebar** with:
- 🎥 Live camera status (On/Off)
- 🔴 Visual indicators (red = off, green = on)
- 🔄 Auto-refresh every 5 seconds
- ⚡ One-click start/stop

### Setup Steps

**1. Install Python dependencies:**
```bash
pip install flask flask-cors psutil
```

**2. Start the camera API server:**
```bash
python camera_server.py
```
Keep this terminal open. You should see:
```
🚀 SeizoWatch Camera Control API
📡 Server running on http://localhost:5000
```

**3. Start the dashboard:**
```bash
cd dashboard
npm run dev
```

**4. Open browser and look at the sidebar**
- You'll see a camera control button at the bottom of the sidebar
- Click to start/stop the camera
- Status updates automatically

### Quick Start (Windows)

Just double-click `start.bat` - it starts both servers automatically!

### Usage

1. **Click the camera button** in the sidebar
2. When **stopped** (red): Click to start camera detection
3. When **running** (green): Click to stop camera detection
4. The button shows:
   - 🎥 Camera icon (when running)
   - 📷 Camera Off icon (when stopped)  
   - ⏳ Loading spinner (while starting/stopping)

### Troubleshooting

**Button shows "Camera Off" but won't start?**
- Make sure `camera_server.py` is running
- Check if port 5000 is available
- Look for errors in the camera server terminal

**Button doesn't respond?**
- Open browser console (F12) and check for errors
- Verify the API server is at http://localhost:5000
- Try refreshing the page

**Camera won't stop?**
- Check Task Manager for python processes
- Manually kill `final_seizure_detector.py` process

### Files Modified

✅ `src/components/Sidebar.jsx` - Added camera control button
✅ `src/components/Sidebar.css` - Added camera control styles  
✅ `src/pages/Dashboard.jsx` - Removed duplicate camera control
✅ `camera_server.py` - Flask API for camera control
✅ `firebase_logger.py` - Added camera status function

### How It Works

```
Sidebar Button → HTTP Request → Flask API → Python Detector
                                    ↓
                              Firebase Status Update
```

The sidebar polls the API every 5 seconds to update the camera status automatically!

Enjoy your integrated camera control! 🎉
