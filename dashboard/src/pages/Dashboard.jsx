import React from 'react';
import { useSeizureEvents } from '../hooks/useSeizureEvents';
import { useRealtimeMonitoring } from '../hooks/useRealtimeMonitoring';
import { Activity, Calendar, TrendingUp, AlertCircle, Radio, Award, Zap } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

export default function Dashboard() {
  const { events, loading, error } = useSeizureEvents();
  const { data: realtimeData } = useRealtimeMonitoring();

  // Calculate summary metrics
  const totalEvents = events.length;
  const lastEvent = events.length > 0 ? events[0] : null;
  const verifiedEvents = events.filter(e => e.dl_verified).length;
  const verificationRate = totalEvents > 0 ? (verifiedEvents / totalEvents) * 100 : 0;
  const avgDuration = totalEvents > 0 
    ? events.reduce((acc, e) => acc + e.duration_seconds, 0) / totalEvents 
    : 0;
  
  // Prepare chart data for last 7 days
  const chartData = React.useMemo(() => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.timestamp);
        return eventDate.toDateString() === date.toDateString();
      });
      
      last7Days.push({
        date: dateStr,
        events: dayEvents.length,
        verified: dayEvents.filter(e => e.dl_verified).length,
      });
    }
    return last7Days;
  }, [events]);
  
  // System is active if we have events in the last 5 minutes
  const isSystemActive = lastEvent && 
    (new Date() - new Date(lastEvent.timestamp)) < 5 * 60 * 1000;

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="error-state">
          <AlertCircle size={48} />
          <h2>Error Loading Data</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>SeizoWatch Dashboard</h1>
        <div className={`status-badge ${isSystemActive ? 'active' : 'inactive'}`}>
          <span className="status-dot"></span>
          {isSystemActive ? 'System Active' : 'Inactive'}
        </div>
      </div>

      {/* Real-time Monitoring Widget */}
      {realtimeData && (
        <div className="realtime-monitoring">
          <div className="realtime-header">
            <Radio size={20} className="pulse-icon" />
            <h3>Live Camera Feed</h3>
            <span className="live-badge">● LIVE</span>
          </div>
          <div className="realtime-grid">
            <div className="realtime-metric">
              <span className="realtime-label">Current Motion</span>
              <span className="realtime-value">{realtimeData.motion_value.toFixed(0)}</span>
            </div>
            <div className="realtime-metric">
              <span className="realtime-label">Frequency</span>
              <span className="realtime-value">{realtimeData.dominant_frequency.toFixed(1)} Hz</span>
            </div>
            <div className="realtime-metric">
              <span className="realtime-label">Avg Motion</span>
              <span className="realtime-value">{realtimeData.avg_motion.toFixed(0)}</span>
            </div>
            <div className="realtime-metric">
              <span className="realtime-label">Status</span>
              <span className={`realtime-status ${realtimeData.rhythmic_motion ? 'warning' : 'normal'}`}>
                {realtimeData.rhythmic_motion ? '⚠️ Rhythmic' : '✓ Normal'}
              </span>
            </div>
          </div>
          <div className="realtime-footer">
            <span className="realtime-timestamp">Last update: {realtimeData.timestamp}</span>
          </div>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#e3f2fd' }}>
            <Activity size={24} color="#1976d2" />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Events</p>
            <h2 className="stat-value">{totalEvents}</h2>
            <p className="stat-sublabel">All time</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#f3e5f5' }}>
            <TrendingUp size={24} color="#7b1fa2" />
          </div>
          <div className="stat-content">
            <p className="stat-label">DL Verified</p>
            <h2 className="stat-value">{verifiedEvents}</h2>
            <p className="stat-sublabel">{verificationRate.toFixed(1)}% verification rate</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fff3e0' }}>
            <Zap size={24} color="#f57c00" />
          </div>
          <div className="stat-content">
            <p className="stat-label">Avg Duration</p>
            <h2 className="stat-value">{avgDuration.toFixed(1)}s</h2>
            <p className="stat-sublabel">Per event</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#e8f5e9' }}>
            <Calendar size={24} color="#388e3c" />
          </div>
          <div className="stat-content">
            <p className="stat-label">Last Event</p>
            <h2 className="stat-value">
              {lastEvent ? new Date(lastEvent.timestamp).toLocaleDateString() : 'N/A'}
            </h2>
            <p className="stat-sublabel">
              {lastEvent ? new Date(lastEvent.timestamp).toLocaleTimeString() : ''}
            </p>
          </div>
        </div>
      </div>

      {/* 7-Day Trend Chart */}
      {events.length > 0 && (
        <div className="chart-container">
          <h2>7-Day Activity Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1976d2" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#1976d2" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorVerified" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4caf50" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#4caf50" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="date" 
                tick={{ fill: '#666', fontSize: 12 }}
                stroke="#999"
              />
              <YAxis 
                tick={{ fill: '#666', fontSize: 12 }}
                stroke="#999"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="events" 
                stroke="#1976d2" 
                fillOpacity={1} 
                fill="url(#colorEvents)" 
                strokeWidth={2}
                name="Total Events"
              />
              <Area 
                type="monotone" 
                dataKey="verified" 
                stroke="#4caf50" 
                fillOpacity={1} 
                fill="url(#colorVerified)" 
                strokeWidth={2}
                name="Verified Events"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="recent-events">
        <h2>Recent Events</h2>
        {events.length === 0 ? (
          <div className="empty-state">
            <AlertCircle size={48} color="#999" />
            <p>No seizure events detected yet</p>
          </div>
        ) : (
          <div className="events-preview">
            {events.slice(0, 5).map((event) => (
              <div key={event.id} className="event-preview-card">
                <div className="event-preview-header">
                  <span className="event-time">
                    {new Date(event.timestamp).toLocaleString()}
                  </span>
                  {event.dl_verified && (
                    <span className="verified-badge">
                      ✓ Verified {event.onnx_score ? `${(event.onnx_score * 100).toFixed(0)}%` : ''}
                    </span>
                  )}
                </div>
                <div className="event-preview-stats">
                  <span>Duration: {event.duration_seconds.toFixed(1)}s</span>
                  <span>Frequency: {event.dominant_frequency.toFixed(1)} Hz</span>
                  <span>Max Motion: {event.max_motion.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
