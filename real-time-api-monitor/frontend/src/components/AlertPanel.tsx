import React from "react";
import "./AlertPanel.css";

interface Alert {
  id: string;
  severity: string;
  message: string;
  timestamp: string;
  endpointName?: string;
  endpointId?: string;
  count?: number;
}

interface AlertPanelProps {
  alerts: Alert[];
  onClose: () => void;
  onClearAll: () => void;
  onDismissAlert: (id: string) => void;
}

export default function AlertPanel({ 
  alerts, 
  onClose, 
  onClearAll, 
  onDismissAlert 
}: AlertPanelProps) {
  
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return "🔴";
      case "warning":
        return "🟡";
      case "info":
        return "ℹ️";
      default:
        return "⚪";
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClearAll();
  };

  const handleDismiss = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onDismissAlert(id);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <div className="alert-panel-overlay" onClick={onClose}>
      <div className="alert-panel" onClick={(e) => e.stopPropagation()}>
        <div className="alert-panel-header">
          <h3>
            <span style={{ marginRight: '10px' }}>⚠️</span>
            Alerts {alerts.length > 0 && `(${alerts.length})`}
          </h3>
          <div className="alert-panel-controls">
            {alerts.length > 0 && (
              <button 
                className="clear-all-btn"
                onClick={handleClearAll}
              >
                Clear All
              </button>
            )}
            <button 
              className="close-alert-btn"
              onClick={handleClose}
            >
              ×
            </button>
          </div>
        </div>
        
        <div className="alert-list-container">
          {alerts.length === 0 ? (
            <div className="no-alerts">
              <div className="no-alerts-icon">✅</div>
              <h4>All Clear!</h4>
              <p>No active alerts at the moment.</p>
            </div>
          ) : (
            <div className="alert-list">
              {alerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={`alert-item ${alert.severity}`}
                >
                  <div className="alert-item-content">
                    <div className="alert-header">
                      <div className="alert-severity-indicator">
                        <span className="alert-icon">{getSeverityIcon(alert.severity)}</span>
                        <span className="alert-severity-text">
                          {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                        </span>
                        {alert.count && alert.count > 1 && (
                          <span className="alert-count-badge">×{alert.count}</span>
                        )}
                      </div>
                      <div className="alert-timestamp">{formatTime(alert.timestamp)}</div>
                    </div>
                    
                    <div className="alert-message">{alert.message}</div>
                    
                    {alert.endpointName && (
                      <div className="alert-endpoint">
                        <span className="endpoint-label">Endpoint:</span>
                        <span className="endpoint-name">{alert.endpointName}</span>
                      </div>
                    )}
                    
                    <div className="alert-actions">
                      <button 
                        className="dismiss-single-btn"
                        onClick={(e) => handleDismiss(e, alert.id)}
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {alerts.length > 0 && (
          <div className="alert-panel-footer">
            <div className="alert-summary">
              <div className="summary-item">
                <span className="summary-label">Critical:</span>
                <span className="summary-value critical">
                  {alerts.filter(a => a.severity === "critical").length}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Warning:</span>
                <span className="summary-value warning">
                  {alerts.filter(a => a.severity === "warning").length}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Info:</span>
                <span className="summary-value info">
                  {alerts.filter(a => a.severity === "info").length}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}