from flask import Flask, jsonify
from flask_cors import CORS
import subprocess
import psutil
import os
from firebase_logger import update_camera_status

app = Flask(__name__)
CORS(app)  # Allow requests from React dashboard

# Store the camera process
camera_process = None

def is_camera_running():
    """Check if the camera detector is running"""
    global camera_process
    if camera_process and camera_process.poll() is None:
        return True
    
    # Check if any Python process is running the detector
    for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
        try:
            if 'python' in proc.info['name'].lower():
                cmdline = proc.info['cmdline']
                if cmdline and 'final_seizure_detector.py' in ' '.join(cmdline):
                    return True
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass
    return False

@app.route('/camera/status', methods=['GET'])
def get_camera_status():
    """Get current camera status"""
    running = is_camera_running()
    return jsonify({
        'status': 'running' if running else 'stopped',
        'running': running
    })

@app.route('/camera/start', methods=['POST'])
def start_camera():
    """Start the camera detector"""
    global camera_process
    
    if is_camera_running():
        return jsonify({
            'success': False,
            'message': 'Camera is already running'
        }), 400
    
    try:
        # Start the detector as a subprocess
        camera_process = subprocess.Popen(
            ['python', 'final_seizure_detector.py'],
            cwd=os.path.dirname(os.path.abspath(__file__))
        )
        
        # Update Firebase status
        update_camera_status(True)
        
        return jsonify({
            'success': True,
            'message': 'Camera started successfully',
            'pid': camera_process.pid
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to start camera: {str(e)}'
        }), 500

@app.route('/camera/stop', methods=['POST'])
def stop_camera():
    """Stop the camera detector"""
    global camera_process
    
    if not is_camera_running():
        return jsonify({
            'success': False,
            'message': 'Camera is not running'
        }), 400
    
    try:
        # Kill the process
        if camera_process:
            camera_process.terminate()
            camera_process.wait(timeout=5)
        
        # Also kill any orphaned processes
        for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
            try:
                if 'python' in proc.info['name'].lower():
                    cmdline = proc.info['cmdline']
                    if cmdline and 'final_seizure_detector.py' in ' '.join(cmdline):
                        proc.terminate()
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass
        
        camera_process = None
        
        # Update Firebase status
        update_camera_status(False)
        
        return jsonify({
            'success': True,
            'message': 'Camera stopped successfully'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to stop camera: {str(e)}'
        }), 500

if __name__ == '__main__':
    print("SeizoWatch Camera Control API")
    print("Server running on http://localhost:5000")
    print("Dashboard camera control enabled")
    app.run(host='0.0.0.0', port=5000, debug=True)
