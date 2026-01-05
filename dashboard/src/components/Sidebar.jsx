import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Activity, BarChart3, Menu, X, Camera, CameraOff, Loader } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const [cameraRunning, setCameraRunning] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const API_URL = 'http://localhost:5000';

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/events', icon: Activity, label: 'Events' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' }
  ];

  // Check camera status
  useEffect(() => {
    checkCameraStatus();
    const interval = setInterval(checkCameraStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const checkCameraStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/camera/status`);
      if (response.ok) {
        const data = await response.json();
        setCameraRunning(data.running);
      }
    } catch (err) {
      // Server not available
    }
  };

  const toggleCamera = async () => {
    setCameraLoading(true);
    try {
      const endpoint = cameraRunning ? '/camera/stop' : '/camera/start';
      const response = await fetch(`${API_URL}${endpoint}`, { method: 'POST' });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCameraRunning(!cameraRunning);
          setTimeout(checkCameraStatus, 1000);
        }
      }
    } catch (err) {
      console.error('Camera control error:', err);
    } finally {
      setCameraLoading(false);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <motion.div
          className="sidebar-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={toggleSidebar}
        />
      )}

      <motion.aside
        className={`sidebar ${isOpen ? 'open' : 'closed'}`}
        initial={false}
        animate={{ width: isOpen ? 280 : 80 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <div className="sidebar-header">
          <motion.div
            className="logo-container"
            animate={{ justifyContent: isOpen ? 'space-between' : 'center' }}
          >
            {isOpen && (
              <motion.h1
                className="logo-text gradient-text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                SeizoWatch
              </motion.h1>
            )}
            <button className="toggle-btn" onClick={toggleSidebar}>
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </motion.div>
        </div>

        <nav className="nav-menu">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''}`
              }
            >
              <item.icon className="nav-icon" size={22} />
              {isOpen && (
                <motion.span
                  className="nav-label"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {item.label}
                </motion.span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Camera Control Section */}
        <div className="camera-control-section">
          <button 
            className={`camera-control-btn ${cameraRunning ? 'camera-active' : 'camera-inactive'}`}
            onClick={toggleCamera}
            disabled={cameraLoading}
            title={cameraRunning ? 'Stop Camera' : 'Start Camera'}
          >
            {cameraLoading ? (
              <Loader className="camera-icon spinning" size={22} />
            ) : cameraRunning ? (
              <Camera className="camera-icon" size={22} />
            ) : (
              <CameraOff className="camera-icon" size={22} />
            )}
            {isOpen && (
              <motion.div
                className="camera-info"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <span className="camera-label">
                  {cameraLoading ? 'Loading...' : cameraRunning ? 'Camera On' : 'Camera Off'}
                </span>
                <span className={`camera-status-text ${cameraRunning ? 'running' : 'stopped'}`}>
                  {cameraRunning ? '● Live' : '● Stopped'}
                </span>
              </motion.div>
            )}
          </button>
        </div>

        <div className="sidebar-footer">
          <div className="status-indicator">
            <div className="status-dot pulse-glow"></div>
            {isOpen && <span className="status-text">System Active</span>}
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
