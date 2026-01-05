import React, { useState, useMemo } from 'react';
import { useSeizureEvents } from '../hooks/useSeizureEvents';
import { Clock, Activity, Zap, CheckCircle, AlertCircle, Download, Search, Filter } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import './Events.css';

export default function Events() {
  const { events, loading, error } = useSeizureEvents();
  const [filter, setFilter] = useState('all'); // 'all', 'verified', 'rule-based'
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('all'); // 'all', 'today', 'week', 'month'

  const filteredEvents = useMemo(() => {
    let filtered = events;

    // Filter by type
    if (filter === 'verified') {
      filtered = filtered.filter(e => e.dl_verified);
    } else if (filter === 'rule-based') {
      filtered = filtered.filter(e => e.rule_based);
    }

    // Filter by date range
    if (dateRange !== 'all') {
      const now = new Date();
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.timestamp);
        const diffTime = now - eventDate;
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        
        if (dateRange === 'today') return diffDays < 1;
        if (dateRange === 'week') return diffDays < 7;
        if (dateRange === 'month') return diffDays < 30;
        return true;
      });
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(event => {
        const searchLower = searchTerm.toLowerCase();
        return (
          event.timestamp.toLowerCase().includes(searchLower) ||
          event.duration_seconds.toString().includes(searchLower) ||
          event.dominant_frequency.toString().includes(searchLower)
        );
      });
    }

    return filtered;
  }, [events, filter, dateRange, searchTerm]);

  if (loading) {
    return (
      <div className="events-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="events-page">
        <div className="error-state">
          <AlertCircle size={48} />
          <h2>Error Loading Events</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Add header
    doc.setFontSize(20);
    doc.setTextColor(26, 26, 26);
    doc.text('SeizoWatch - Seizure Events Report', 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(102, 102, 102);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`Total Events: ${filteredEvents.length}`, 14, 36);
    
    // Prepare table data
    const tableData = filteredEvents.map(event => [
      new Date(event.timestamp).toLocaleString(),
      `${event.duration_seconds.toFixed(1)}s`,
      `${event.dominant_frequency.toFixed(1)} Hz`,
      event.avg_motion.toFixed(2),
      event.max_motion.toFixed(2),
      event.dl_verified ? `✓ ${(event.onnx_score * 100).toFixed(0)}%` : '✗',
    ]);
    
    // Add table
    autoTable(doc, {
      startY: 42,
      head: [['Timestamp', 'Duration', 'Frequency', 'Avg Motion', 'Max Motion', 'DL Verified']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [25, 118, 210],
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [50, 50, 50],
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { top: 42 },
    });
    
    // Add summary at bottom
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.setTextColor(26, 26, 26);
    doc.text('Summary Statistics:', 14, finalY);
    
    const verifiedCount = filteredEvents.filter(e => e.dl_verified).length;
    const avgDuration = filteredEvents.reduce((acc, e) => acc + e.duration_seconds, 0) / filteredEvents.length;
    const avgFreq = filteredEvents.reduce((acc, e) => acc + e.dominant_frequency, 0) / filteredEvents.length;
    
    doc.setFontSize(9);
    doc.setTextColor(102, 102, 102);
    doc.text(`• DL Verified Events: ${verifiedCount} (${((verifiedCount/filteredEvents.length)*100).toFixed(1)}%)`, 14, finalY + 6);
    doc.text(`• Average Duration: ${avgDuration.toFixed(1)}s`, 14, finalY + 12);
    doc.text(`• Average Frequency: ${avgFreq.toFixed(1)} Hz`, 14, finalY + 18);
    
    // Save PDF
    doc.save(`seizowatch-events-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="events-page">
      <div className="events-header">
        <div className="header-content">
          <h1>Seizure Events</h1>
          <p className="events-subtitle">{filteredEvents.length} events found</p>
        </div>
        <button className="export-btn" onClick={exportToPDF} disabled={filteredEvents.length === 0}>
          <Download size={18} />
          Export to PDF
        </button>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by timestamp, duration, or frequency..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <Filter size={18} />
          <div className="filter-buttons">
            <button 
              className={filter === 'all' ? 'active' : ''} 
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={filter === 'verified' ? 'active' : ''} 
              onClick={() => setFilter('verified')}
            >
              DL Verified
            </button>
            <button 
              className={filter === 'rule-based' ? 'active' : ''} 
              onClick={() => setFilter('rule-based')}
            >
              Rule-Based
            </button>
          </div>
        </div>

        <div className="filter-group">
          <Clock size={18} />
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="date-filter"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="empty-state">
          <AlertCircle size={48} color="#999" />
          <p>No events found</p>
        </div>
      ) : (
        <div className="events-grid">
          {filteredEvents.map((event) => (
            <div key={event.id} className="event-card">
              <div className="event-card-header">
                <div className="event-timestamp">
                  <Clock size={16} />
                  <span>{new Date(event.timestamp).toLocaleString()}</span>
                </div>
                <div className="event-badges">
                  {event.dl_verified && (
                    <span className="badge verified">
                      <CheckCircle size={14} /> Verified {event.onnx_score ? `(${(event.onnx_score * 100).toFixed(0)}%)` : ''}
                    </span>
                  )}
                  {event.rule_based && (
                    <span className="badge rule-based">
                      Rule-Based
                    </span>
                  )}
                </div>
              </div>

              <div className="event-metrics">
                <div className="metric">
                  <div className="metric-icon">
                    <Clock size={20} color="#1976d2" />
                  </div>
                  <div>
                    <p className="metric-label">Duration</p>
                    <p className="metric-value">{event.duration_seconds.toFixed(1)}s</p>
                  </div>
                </div>

                <div className="metric">
                  <div className="metric-icon">
                    <Zap size={20} color="#f57c00" />
                  </div>
                  <div>
                    <p className="metric-label">Frequency</p>
                    <p className="metric-value">{event.dominant_frequency.toFixed(1)} Hz</p>
                  </div>
                </div>

                <div className="metric">
                  <div className="metric-icon">
                    <Activity size={20} color="#388e3c" />
                  </div>
                  <div>
                    <p className="metric-label">Avg Motion</p>
                    <p className="metric-value">{event.avg_motion.toFixed(2)}</p>
                  </div>
                </div>

                <div className="metric">
                  <div className="metric-icon">
                    <Activity size={20} color="#d32f2f" />
                  </div>
                  <div>
                    <p className="metric-label">Max Motion</p>
                    <p className="metric-value">{event.max_motion.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
