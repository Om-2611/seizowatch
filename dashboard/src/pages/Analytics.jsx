import React, { useMemo } from 'react';
import { useSeizureEvents } from '../hooks/useSeizureEvents';
import { TrendingUp, Clock, Zap, Calendar, AlertCircle, Download, Activity, Award } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import './Analytics.css';

export default function Analytics() {
  const { events, loading, error } = useSeizureEvents();

  // Calculate analytics metrics
  const analytics = useMemo(() => {
    if (events.length === 0) return null;

    // Events per day calculation
    const eventsByDate = {};
    events.forEach(event => {
      const date = new Date(event.timestamp).toLocaleDateString();
      eventsByDate[date] = (eventsByDate[date] || 0) + 1;
    });
    
    const totalDays = Object.keys(eventsByDate).length;
    const eventsPerDay = (events.length / Math.max(totalDays, 1)).toFixed(2);

    // Average duration
    const totalDuration = events.reduce((sum, e) => sum + e.duration_seconds, 0);
    const avgDuration = (totalDuration / events.length).toFixed(2);

    // Peak dominant frequency
    const peakFrequency = Math.max(...events.map(e => e.dominant_frequency)).toFixed(2);

    // Average motion metrics
    const totalAvgMotion = events.reduce((sum, e) => sum + e.avg_motion, 0);
    const avgMotion = (totalAvgMotion / events.length).toFixed(2);

    const totalMaxMotion = events.reduce((sum, e) => sum + e.max_motion, 0);
    const avgMaxMotion = (totalMaxMotion / events.length).toFixed(2);

    // Verification stats
    const dlVerifiedCount = events.filter(e => e.dl_verified).length;
    const ruleBasedCount = events.filter(e => e.rule_based).length;
    const verificationRate = ((dlVerifiedCount / events.length) * 100).toFixed(1);

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentEvents = events.filter(e => new Date(e.timestamp) >= sevenDaysAgo);

    // Daily breakdown for the last 7 days
    const dailyBreakdown = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString();
      const count = eventsByDate[dateStr] || 0;
      dailyBreakdown.push({
        date: dateStr,
        count,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' })
      });
    }

    return {
      eventsPerDay,
      avgDuration,
      peakFrequency,
      avgMotion,
      avgMaxMotion,
      dlVerifiedCount,
      ruleBasedCount,
      verificationRate,
      recentEvents: recentEvents.length,
      totalEvents: events.length,
      dailyBreakdown,
      eventsByDate
    };
  }, [events]);

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-page">
        <div className="error-state">
          <AlertCircle size={48} />
          <h2>Error Loading Analytics</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="analytics-page">
        <div className="empty-state">
          <AlertCircle size={48} color="#999" />
          <p>No data available for analytics</p>
        </div>
      </div>
    );
  }

  const exportAnalyticsPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(26, 26, 26);
    doc.text('SeizoWatch - Analytics Report', 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(102, 102, 102);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
    
    // Key Metrics
    doc.setFontSize(14);
    doc.setTextColor(26, 26, 26);
    doc.text('Key Metrics', 14, 42);
    
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    let y = 50;
    doc.text(`\u2022 Events Per Day: ${analytics.eventsPerDay}`, 14, y);
    doc.text(`\u2022 Average Duration: ${analytics.avgDuration}s`, 14, y + 6);
    doc.text(`\u2022 Peak Frequency: ${analytics.peakFrequency} Hz`, 14, y + 12);
    doc.text(`\u2022 Verification Rate: ${analytics.verificationRate}%`, 14, y + 18);
    doc.text(`\u2022 Total Events: ${analytics.totalEvents}`, 14, y + 24);
    doc.text(`\u2022 DL Verified: ${analytics.dlVerifiedCount}`, 14, y + 30);
    doc.text(`\u2022 Recent Events (7 days): ${analytics.recentEvents}`, 14, y + 36);
    
    // Daily Breakdown Table
    doc.setFontSize(14);
    doc.setTextColor(26, 26, 26);
    doc.text('7-Day Activity Breakdown', 14, y + 48);
    
    const tableData = analytics.dailyBreakdown.map(day => [
      day.date,
      day.dayName,
      day.count.toString()
    ]);
    
    autoTable(doc, {
      startY: y + 54,
      head: [['Date', 'Day', 'Events']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [25, 118, 210],
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [50, 50, 50],
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });
    
    doc.save(`seizowatch-analytics-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Prepare chart data
  const pieData = [
    { name: 'DL Verified', value: analytics.dlVerifiedCount, color: '#4caf50' },
    { name: 'Not Verified', value: analytics.totalEvents - analytics.dlVerifiedCount, color: '#ff9800' },
  ];

  const barChartData = analytics.dailyBreakdown.map(day => ({
    name: day.dayName,
    events: day.count,
    date: day.date
  }));

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <div className="header-content">
          <h1>Analytics</h1>
          <p className="analytics-subtitle">Comprehensive seizure event analysis</p>
        </div>
        <button className="export-btn" onClick={exportAnalyticsPDF}>
          <Download size={18} />
          Export Report
        </button>
      </div>

      <div className="metrics-grid">
        <div className="metric-card primary">
          <div className="metric-card-icon">
            <Calendar size={28} />
          </div>
          <div className="metric-card-content">
            <p className="metric-card-label">Events Per Day</p>
            <h2 className="metric-card-value">{analytics.eventsPerDay}</h2>
            <p className="metric-card-subtext">Average across all days</p>
          </div>
        </div>

        <div className="metric-card primary">
          <div className="metric-card-icon">
            <Clock size={28} />
          </div>
          <div className="metric-card-content">
            <p className="metric-card-label">Avg Duration</p>
            <h2 className="metric-card-value">{analytics.avgDuration}s</h2>
            <p className="metric-card-subtext">Per event</p>
          </div>
        </div>

        <div className="metric-card primary">
          <div className="metric-card-icon">
            <Zap size={28} />
          </div>
          <div className="metric-card-content">
            <p className="metric-card-label">Peak Frequency</p>
            <h2 className="metric-card-value">{analytics.peakFrequency} Hz</h2>
            <p className="metric-card-subtext">Dominant frequency</p>
          </div>
        </div>

        <div className="metric-card primary">
          <div className="metric-card-icon">
            <TrendingUp size={28} />
          </div>
          <div className="metric-card-content">
            <p className="metric-card-label">Verification Rate</p>
            <h2 className="metric-card-value">{analytics.verificationRate}%</h2>
            <p className="metric-card-subtext">{analytics.dlVerifiedCount} verified</p>
          </div>
        </div>
      </div>

      <div className="analytics-row">
        {/* Bar Chart */}
        <div className="analytics-card chart-card">
          <h3>7-Day Activity Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="name" 
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
                labelFormatter={(label, payload) => {
                  return payload[0]?.payload?.date || label;
                }}
              />
              <Bar 
                dataKey="events" 
                fill="#1976d2" 
                radius={[8, 8, 0, 0]}
                name="Events"
              />
            </BarChart>
          </ResponsiveContainer>
          <div className="chart-footer">
            <span className="chart-info">Total events in last 7 days: {analytics.recentEvents}</span>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="analytics-card chart-card">
          <h3>Verification Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="chart-footer">
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#4caf50' }}></span>
              <span>DL Verified: {analytics.dlVerifiedCount}</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#ff9800' }}></span>
              <span>Not Verified: {analytics.totalEvents - analytics.dlVerifiedCount}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="analytics-row">
        <div className="analytics-card">
          <h3>Motion Statistics</h3>
          <div className="stats-list">
            <div className="stat-row">
              <span className="stat-row-label">Average Motion</span>
              <span className="stat-row-value">{analytics.avgMotion}</span>
            </div>
            <div className="stat-row">
              <span className="stat-row-label">Average Max Motion</span>
              <span className="stat-row-value">{analytics.avgMaxMotion}</span>
            </div>
            <div className="stat-row">
              <span className="stat-row-label">Total Events</span>
              <span className="stat-row-value">{analytics.totalEvents}</span>
            </div>
            <div className="stat-row">
              <span className="stat-row-label">Rule-Based Detections</span>
              <span className="stat-row-value">{analytics.ruleBasedCount}</span>
            </div>
            <div className="stat-row">
              <span className="stat-row-label">DL Verified Events</span>
              <span className="stat-row-value">{analytics.dlVerifiedCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
