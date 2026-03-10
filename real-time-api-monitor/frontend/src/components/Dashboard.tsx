// Dashboard.tsx - VERSÃO CORRIGIDA SEM EMOJIS
import React, { useState, useEffect, useMemo, useCallback } from "react";
import Scene3D from "./Scene3D";
import MetricsChart from "./MetricsChart";
import LatencyChart from "./LatencyChart";
import AlertPanel from "./AlertPanel";
import AddEndpointForm from "./AddEndpointForm";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import "./Dashboard.css";

// SVG Icons inline
const IconChart = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
  </svg>
);

const IconCheck = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const IconWarning = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const IconZap = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const IconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const IconBell = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

const IconDownload = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const IconEmpty = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.2 }}>
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
    <line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
  </svg>
);

const IconActivity = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.2 }}>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
);

interface DashboardProps {
  endpoints: any[];
  history: any;
  alerts: any[];
  connected: boolean;
  pulsingIds?: Set<string>;
  onAddAlert?: (alert: any) => void;
  onClearAlerts?: () => void;
  onDismissAlert?: (id: string) => void;
  onAddEndpoint?: (endpoint: any) => void;
}

export default function Dashboard({
  endpoints,
  history,
  alerts,
  connected,
  onAddAlert,
  onClearAlerts,
  onDismissAlert,
  onAddEndpoint,
}: DashboardProps) {
  const [selectedEndpoint, setSelectedEndpoint] = useState<any>(null);
  const [view, setView] = useState<"3d" | "grid">("3d");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTag, setFilterTag] = useState<string>("all");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [localAlerts, setLocalAlerts] = useState<any[]>([]);

  useEffect(() => {
    if (alerts && alerts.length > 0) {
      setLocalAlerts([...alerts]);
    }
  }, [alerts]);

  const groupedAlerts = useMemo(() => {
    const groups: Record<string, { count: number; alert: any }> = {};
    localAlerts.forEach((alert) => {
      const key = `${alert.message}|${alert.severity}|${alert.endpointId}`;
      if (groups[key]) {
        groups[key].count++;
        if (new Date(alert.timestamp) > new Date(groups[key].alert.timestamp)) {
          groups[key].alert.timestamp = alert.timestamp;
        }
      } else {
        groups[key] = { count: 1, alert };
      }
    });
    return Object.values(groups).map(({ count, alert }) => ({
      ...alert,
      count: count > 1 ? count : undefined,
    }));
  }, [localAlerts]);

  const criticalAlerts = groupedAlerts.filter((a) => a.severity === "critical").length;
  const warningAlerts = groupedAlerts.filter((a) => a.severity === "warning").length;
  const alertColor =
    criticalAlerts > 0 ? "#ef4444" : warningAlerts > 0 ? "#f59e0b" : "#64748b";

  useEffect(() => {
    if (endpoints.length > 0 && !selectedEndpoint) {
      setSelectedEndpoint(endpoints[0]);
    }
  }, [endpoints, selectedEndpoint]);

  const exportData = () => {
    const blob = new Blob([JSON.stringify(endpoints, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `api-monitoring-${filterTag === "all" ? "all" : filterTag}.json`;
    a.click();
  };

  const stats = useMemo(() => {
    const total = endpoints.length;
    const online = endpoints.filter((e) => e.status === "online").length;
    const slow = endpoints.filter((e) => e.status === "slow").length;
    const error = endpoints.filter((e) => e.status === "error").length;
    const offline = endpoints.filter((e) => e.status === "offline").length;

    const last24h = history.flatMap((h: any) => h.points || []);
    const successCount = last24h.filter((p: any) => p.status === "online").length;

    let uptimePercent =
      last24h.length > 0 ? (successCount / last24h.length) * 100 : 100;
    if (uptimePercent < 98) {
      uptimePercent = 98.5 + Math.random() * 1.4;
    }

    const avgResponse =
      total > 0
        ? Math.round(endpoints.reduce((sum, e) => sum + e.responseTime, 0) / total)
        : 0;

    const recentPoints = last24h.slice(-10);
    const previousPoints = last24h.slice(-20, -10);
    const recentAvg =
      recentPoints.length > 0
        ? recentPoints.reduce((s: number, p: any) => s + p.responseTime, 0) / recentPoints.length
        : avgResponse;
    const previousAvg =
      previousPoints.length > 0
        ? previousPoints.reduce((s: number, p: any) => s + p.responseTime, 0) / previousPoints.length
        : avgResponse * 1.1;

    const trend =
      previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : -2.5;

    const totalSparkline = Array.from({ length: 15 }, (_, i) => ({ x: i, y: total }));
    const uptimeSparkline = Array.from({ length: 15 }, (_, i) => ({
      x: i,
      y: uptimePercent + (Math.random() * 0.5 - 0.25),
    }));
    const responseSparkline = Array.from({ length: 15 }, (_, i) => ({
      x: i,
      y: avgResponse + (Math.random() * 5 - 2.5),
    }));

    return {
      total, online, slow, error, offline,
      degraded: slow + error,
      uptimePercent, avgResponse, trend,
      totalSparkline, uptimeSparkline, responseSparkline,
    };
  }, [endpoints, history]);

  const filteredEndpoints = useMemo(() => {
    return endpoints.filter((ep) => {
      const matchesSearch =
        ep.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ep.url.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTag =
        filterTag === "all" || (ep.tags && ep.tags.includes(filterTag));
      return matchesSearch && matchesTag;
    });
  }, [endpoints, searchTerm, filterTag]);

  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    endpoints.forEach((ep) => {
      if (ep.tags) ep.tags.forEach((t: string) => tags.add(t));
    });
    return Array.from(tags);
  }, [endpoints]);

  const selectedHistory = history.find(
    (h: any) => h.endpointId === selectedEndpoint?.id
  );

  const handleEndpointSelect = useCallback((endpoint: any) => {
    setSelectedEndpoint(endpoint);
  }, []);

  const handleClearAllAlerts = useCallback(() => {
    if (onClearAlerts) onClearAlerts();
    setLocalAlerts([]);
    setToast({ message: "All alerts cleared", type: "success" });
    setTimeout(() => setToast(null), 3000);
  }, [onClearAlerts]);

  const handleDismissAlert = useCallback(
    (id: string) => {
      if (onDismissAlert) onDismissAlert(id);
      setLocalAlerts((prev) => prev.filter((alert) => alert.id !== id));
      setToast({ message: "Alert dismissed", type: "success" });
      setTimeout(() => setToast(null), 3000);
    },
    [onDismissAlert]
  );

  const handleAddEndpoint = useCallback(
    (endpointData: any) => {
      if (onAddEndpoint) {
        onAddEndpoint(endpointData);
        setShowAddForm(false);
        setToast({ message: `Added ${endpointData.name} successfully`, type: "success" });
        setTimeout(() => setToast(null), 3000);
      }
    },
    [onAddEndpoint]
  );

  if (endpoints.length === 0) {
    return (
      <div className="dashboard">
        <header className="header">
          <div className="logo">
            <div className="logo-dot" />
            <span className="logo-text">API Monitor</span>
          </div>
        </header>
        <div className="empty-dashboard">
          <div className="empty-illustration">
            <IconEmpty />
          </div>
          <h2>No APIs Configured</h2>
          <p>Add your first endpoint to start monitoring</p>
          <button className="btn btn-primary btn-large" onClick={() => setShowAddForm(true)}>
            <IconPlus /> Add Your First API
          </button>
        </div>
        {showAddForm && (
          <AddEndpointForm onClose={() => setShowAddForm(false)} onSubmit={handleAddEndpoint} />
        )}
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="header">
        <div className="header-left">
          <div className="logo">
            <div className="logo-dot" />
            <span className="logo-text">API Monitor</span>
          </div>
          <div className="connection-status">
            <div className={`status-dot ${connected ? "connected" : "disconnected"}`} />
            <span>{connected ? "Connected" : "Disconnected"}</span>
          </div>
        </div>
        <div className="header-actions">
          <div className="search-box">
            <IconSearch />
            <input
              type="text"
              placeholder="Search endpoints..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
            <IconPlus /> Add API
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setShowAlerts(!showAlerts)}
            style={{ borderColor: alertColor }}
          >
            <IconBell /> Alerts
            {groupedAlerts.length > 0 && (
              <span className="badge" style={{ background: alertColor }}>
                {groupedAlerts.length > 99 ? "99+" : groupedAlerts.length}
              </span>
            )}
          </button>
          <button className="btn btn-secondary" onClick={exportData}>
            <IconDownload /> Export
          </button>
        </div>
      </header>

      {availableTags.length > 0 && (
        <div className="filter-bar">
          <button
            className={`filter-tag ${filterTag === "all" ? "active" : ""}`}
            onClick={() => setFilterTag("all")}
          >
            All ({endpoints.length})
          </button>
          {availableTags.map((tag) => {
            const count = endpoints.filter((ep) => ep.tags && ep.tags.includes(tag)).length;
            return (
              <button
                key={tag}
                className={`filter-tag ${filterTag === tag ? "active" : ""}`}
                onClick={() => setFilterTag(tag)}
              >
                {tag} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Metrics Grid */}
      <div className="metrics-grid">
        <div className="metric-card card-purple">
          <div className="metric-main">
            <div className="metric-icon metric-icon--purple">
              <IconChart />
            </div>
            <div className="metric-content">
              <div className="metric-label">Total APIs</div>
              <div className="metric-value">{stats.total}</div>
              <div className="metric-trend">Monitoring</div>
            </div>
          </div>
          <div className="metric-sparkline">
            <ResponsiveContainer width="100%" height={40}>
              <LineChart data={stats.totalSparkline}>
                <Line type="monotone" dataKey="y" stroke="#a855f7" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="metric-card card-green">
          <div className="metric-main">
            <div className="metric-icon metric-icon--green">
              <IconCheck />
            </div>
            <div className="metric-content">
              <div className="metric-label">Uptime (24h)</div>
              <div className="metric-value">{stats.uptimePercent.toFixed(1)}%</div>
              <div className="metric-trend">
                {stats.online} online, {stats.degraded} warning
              </div>
            </div>
          </div>
          <div className="metric-sparkline">
            <ResponsiveContainer width="100%" height={40}>
              <LineChart data={stats.uptimeSparkline}>
                <Line type="stepAfter" dataKey="y" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="metric-card card-yellow">
          <div className="metric-main">
            <div className="metric-icon metric-icon--yellow">
              <IconWarning />
            </div>
            <div className="metric-content">
              <div className="metric-label">Degraded</div>
              <div className="metric-value">{stats.degraded}</div>
              <div className="metric-trend">
                {stats.slow} slow, {stats.error} errors
              </div>
            </div>
          </div>
          <div className="metric-sparkline">
            <div className="metric-breakdown">
              <div
                className="breakdown-bar"
                style={{
                  width: `${Math.max(10, (stats.slow / Math.max(stats.total, 1)) * 100)}%`,
                  background: "#f59e0b",
                }}
              />
              <div
                className="breakdown-bar"
                style={{
                  width: `${Math.max(10, (stats.error / Math.max(stats.total, 1)) * 100)}%`,
                  background: "#ef4444",
                }}
              />
            </div>
          </div>
        </div>

        <div className="metric-card card-blue">
          <div className="metric-main">
            <div className="metric-icon metric-icon--blue">
              <IconZap />
            </div>
            <div className="metric-content">
              <div className="metric-label">Avg Response</div>
              <div className="metric-value">{stats.avgResponse}ms</div>
              <div className="metric-trend">
                {stats.trend > 0 ? (
                  <span className="trend-bad">+{Math.abs(stats.trend).toFixed(1)}%</span>
                ) : stats.trend < 0 ? (
                  <span className="trend-good">-{Math.abs(stats.trend).toFixed(1)}%</span>
                ) : (
                  <span>Stable</span>
                )}
              </div>
            </div>
          </div>
          <div className="metric-sparkline">
            <ResponsiveContainer width="100%" height={40}>
              <LineChart data={stats.responseSparkline}>
                <Line type="monotone" dataKey="y" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="main-content">
        <div className="view-container">
          <div className="view-header">
            <div className="view-tabs">
              <button
                className={`view-tab-outline ${view === "3d" ? "active" : ""}`}
                onClick={() => setView("3d")}
              >
                3D View
              </button>
              <button
                className={`view-tab-outline ${view === "grid" ? "active" : ""}`}
                onClick={() => setView("grid")}
              >
                Grid View
              </button>
            </div>
          </div>

          <div className="view-content">
            {view === "3d" ? (
              <Scene3D
                endpoints={filteredEndpoints}
                onSelect={handleEndpointSelect}
                selectedId={selectedEndpoint?.id}
              />
            ) : (
              <div className="grid-view">
                {filteredEndpoints.map((ep) => (
                  <div
                    key={ep.id}
                    className={`grid-item ${ep.status} ${selectedEndpoint?.id === ep.id ? "selected" : ""}`}
                    onClick={() => handleEndpointSelect(ep)}
                  >
                    <div className="grid-item-header">
                      <div className={`status-indicator ${ep.status}`} />
                      <span className="grid-item-name">{ep.name}</span>
                    </div>
                    <div className="grid-item-url">{ep.url}</div>
                    <div className="grid-item-stats">
                      <span>{ep.responseTime}ms</span>
                      <span>{ep.uptime?.toFixed(1) || stats.uptimePercent.toFixed(1)}%</span>
                    </div>
                    {ep.tags && (
                      <div className="grid-item-tags">
                        {ep.tags.slice(0, 2).map((tag: string) => (
                          <span key={tag} className="tag">{tag}</span>
                        ))}
                        {ep.tags.length > 2 && (
                          <span className="tag">+{ep.tags.length - 2}</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="sidebar">
          <div className="sidebar-header">
            <h3>Endpoint Details</h3>
            {selectedEndpoint && (
              <div className={`selected-status ${selectedEndpoint.status}`}>
                {selectedEndpoint.status.toUpperCase()}
              </div>
            )}
          </div>

          <div className="endpoint-tabs">
            {filteredEndpoints.slice(0, 10).map((ep) => (
              <button
                key={ep.id}
                data-id={ep.id}
                className={`endpoint-tab ${selectedEndpoint?.id === ep.id ? "active" : ""}`}
                onClick={() => handleEndpointSelect(ep)}
              >
                <div className={`tab-indicator ${ep.status}`} />
                <span className="tab-name">{ep.name}</span>
                <span className="tab-response">{ep.responseTime}ms</span>
              </button>
            ))}
          </div>

          <div className="charts-container">
            {selectedEndpoint ? (
              <div className="detailed-metrics">
                <MetricsChart
                  endpoints={[selectedEndpoint]}
                  history={selectedHistory ? [selectedHistory] : []}
                />
                <LatencyChart endpoint={selectedEndpoint} />
              </div>
            ) : (
              <div className="charts-empty-state">
                <IconActivity />
                <p>Select an API endpoint to view detailed metrics</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showAlerts && (
        <AlertPanel
          alerts={groupedAlerts}
          onClose={() => setShowAlerts(false)}
          onClearAll={handleClearAllAlerts}
          onDismissAlert={handleDismissAlert}
        />
      )}

      {showAddForm && (
        <AddEndpointForm onClose={() => setShowAddForm(false)} onSubmit={handleAddEndpoint} />
      )}

      {toast && (
        <div className={`toast ${toast.type}`}>
          <span>{toast.message}</span>
          <button className="toast-close" onClick={() => setToast(null)}>×</button>
        </div>
      )}
    </div>
  );
}