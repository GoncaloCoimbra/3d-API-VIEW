import { useState, useEffect } from 'react';

interface Alert {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'success';
  timestamp: number;
  count: number;
}

interface AlertDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: Alert[];
  onClearAll: () => void;
  onRemoveAlert: (id: string) => void;
}

export const AlertDrawer: React.FC<AlertDrawerProps> = ({ isOpen, onClose, alerts, onClearAll, onRemoveAlert }) => {
  if (!isOpen) return null;

  const getAlertIcon = (type: string) => {
    if (type === 'error') return '';
    if (type === 'warning') return '';
    return '';
  };

  const getAlertColor = (type: string) => {
    if (type === 'error') return '#ef4444';
    if (type === 'warning') return '#f59e0b';
    return '#10b981';
  };

  return (
    <>
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
          zIndex: 9998
        }}
        onClick={onClose}
      />
      
      <div style={{
        position: 'fixed',
        right: 0,
        top: 0,
        width: '400px',
        height: '100vh',
        background: '#1a1a1a',
        borderLeft: '2px solid #ef4444',
        boxShadow: '-5px 0 30px rgba(0,0,0,0.8)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideInRight 0.3s ease-out'
      }}>
        <style>{`
          @keyframes slideInRight {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
        `}</style>

        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #333',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ color: '#fff', margin: 0, fontSize: '20px' }}>
            Alerts ({alerts.length})
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              fontSize: '28px',
              cursor: 'pointer',
              padding: '0',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
              zIndex: 10000
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#333'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            
          </button>
        </div>

        {/* Clear All Button */}
        {alerts.length > 0 && (
          <div style={{ padding: '15px', borderBottom: '1px solid #333' }}>
            <button
              onClick={onClearAll}
              style={{
                width: '100%',
                padding: '12px',
                background: '#ef4444',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
               Clear All Alerts
            </button>
          </div>
        )}

        {/* Alerts List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
          {alerts.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#666'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}></div>
              <div style={{ fontSize: '16px', fontWeight: 'bold' }}>No alerts</div>
              <div style={{ fontSize: '14px', marginTop: '8px' }}>All systems operational</div>
            </div>
          ) : (
            alerts.map(alert => (
              <div
                key={alert.id}
                style={{
                  background: '#2a2a2a',
                  padding: '15px',
                  borderRadius: '8px',
                  marginBottom: '10px',
                  borderLeft: `4px solid ${getAlertColor(alert.type)}`,
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '16px', marginRight: '8px' }}>{getAlertIcon(alert.type)}</span>
                      <span style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>
                        {alert.message}
                      </span>
                      {alert.count > 1 && (
                        <span style={{
                          marginLeft: '8px',
                          background: getAlertColor(alert.type),
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {alert.count}x
                        </span>
                      )}
                    </div>
                    <div style={{ color: '#888', fontSize: '12px' }}>
                      {new Date(alert.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveAlert(alert.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '20px',
                      cursor: 'pointer',
                      padding: '4px',
                      marginLeft: '8px',
                      zIndex: 10000
                    }}
                    title="Remove alert"
                  >
                    
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};
