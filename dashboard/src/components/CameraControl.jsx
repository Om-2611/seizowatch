import React, { useState, useEffect } from 'react';
import { Camera, CameraOff, Loader } from 'lucide-react';
import './CameraControl.css';

const API_URL = 'http://localhost:5000';

export default function CameraControl() {
  const [cameraRunning, setCameraRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check camera status on mount
  useEffect(() => {
    checkCameraStatus();
    // Poll status every 5 seconds
    const interval = setInterval(checkCameraStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const checkCameraStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/camera/status`);
      if (response.ok) {
        const data = await response.json();
        setCameraRunning(data.running);
        setError(null);
      }
    } catch (err) {
      console.error('Failed to check camera status:', err);
      // Don't set error for status checks, only for actions
    }
  };

  const startCamera = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/camera/start`, {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setCameraRunning(true);
        // Check status after a short delay
        setTimeout(checkCameraStatus, 1000);
      } else {
        setError(data.message || 'Failed to start camera');
      }
    } catch (err) {
      setError('Cannot connect to camera server. Is it running?');
      console.error('Start camera error:', err);
    } finally {
      setLoading(false);
    }
  };

  const stopCamera = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/camera/stop`, {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setCameraRunning(false);
        setTimeout(checkCameraStatus, 1000);
      } else {
        setError(data.message || 'Failed to stop camera');
      }
    } catch (err) {
      setError('Cannot connect to camera server');
      console.error('Stop camera error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="camera-control">
      <div className="camera-control-header">
        <div className="camera-icon">
          {cameraRunning ? (
            <Camera size={24} color="#28a745" />
          ) : (
            <CameraOff size={24} color="#dc3545" />
          )}
        </div>
        <div className="camera-info">
          <h3>Camera Control</h3>
          <p className={`camera-status ${cameraRunning ? 'running' : 'stopped'}`}>
            {cameraRunning ? '● Live' : '● Stopped'}
          </p>
        </div>
      </div>

      {error && (
        <div className="camera-error">
          <p>{error}</p>
        </div>
      )}

      <div className="camera-actions">
        <button
          className={`camera-btn ${cameraRunning ? 'btn-stop' : 'btn-start'}`}
          onClick={cameraRunning ? stopCamera : startCamera}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader size={18} className="spinning" />
              <span>{cameraRunning ? 'Stopping...' : 'Starting...'}</span>
            </>
          ) : cameraRunning ? (
            <>
              <CameraOff size={18} />
              <span>Stop Camera</span>
            </>
          ) : (
            <>
              <Camera size={18} />
              <span>Start Camera</span>
            </>
          )}
        </button>
      </div>

      <div className="camera-hint">
        <p>
          {cameraRunning
            ? 'Camera is actively monitoring for seizure events'
            : 'Start camera to begin real-time seizure detection'}
        </p>
      </div>
    </div>
  );
}
