import React from "react";
import { ApiEndpoint, EndpointHistory } from "../types";
import PulseRing from "./PulseRing";
import MetricsChart from "./MetricsChart";

interface Props { endpoint: ApiEndpoint | null; endpoints: ApiEndpoint[]; history: EndpointHistory[]; onClose: () => void; }

export default function EndpointDetailsPanel({ endpoint, endpoints, history, onClose }: Props) {
  if (!endpoint) return null;
  const statusLabel: Record<string, string> = { online: " Online", offline: " Offline", slow: " Slow", error: " Error" };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 90, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "#1a1a2e", borderRadius: 14, width: 660, maxHeight: "80vh", overflowY: "auto", padding: 24, border: "1px solid #333", position: "relative" }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: "absolute", top: 10, right: 14, background: "none", border: "none", color: "#aaa", fontSize: 22, cursor: "pointer" }}></button>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
          <PulseRing status={endpoint.status} size={22} />
          <div>
            <div style={{ color: "#fff", fontSize: 19, fontWeight: 700 }}>{endpoint.name}</div>
            <div style={{ color: "#888", fontSize: 12, fontFamily: "monospace" }}>{endpoint.method} {endpoint.url}</div>
          </div>
          <div style={{ marginLeft: "auto", color: "#aaa", fontSize: 13 }}>{statusLabel[endpoint.status]}</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 18 }}>
          {[
            { label: "Response", value: `${endpoint.responseTime} ms`, color: "#38bdf8" },
            { label: "Uptime", value: `${endpoint.uptime}%`, color: "#22c55e" },
            { label: "Error Rate", value: `${endpoint.errorRate}%`, color: "#f87171" },
            { label: "Last Check", value: new Date(endpoint.lastChecked).toLocaleTimeString(), color: "#a78bfa" },
          ].map(s => (
            <div key={s.label} style={{ background: "#16162a", borderRadius: 8, padding: "10px 12px", border: "1px solid #2a2a4a" }}>
              <div style={{ color: "#666", fontSize: 11 }}>{s.label}</div>
              <div style={{ color: s.color, fontSize: 16, fontWeight: 700, marginTop: 2 }}>{s.value}</div>
            </div>
          ))}
        </div>
        {endpoint.tags && endpoint.tags.length > 0 && (
          <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
            {endpoint.tags.map(t => <span key={t} style={{ background: "#2a2a4a", color: "#aaa", padding: "2px 10px", borderRadius: 12, fontSize: 11 }}>{t}</span>)}
          </div>
        )}
        {endpoint.relatedEndpoints && endpoint.relatedEndpoints.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <span style={{ color: "#888", fontSize: 12 }}> Related: </span>
            {endpoint.relatedEndpoints.map(rid => { const rel = endpoints.find(e => e.id === rid); return rel ? <span key={rid} style={{ color: "#60a5fa", fontSize: 12, marginRight: 8 }}>{rel.name}</span> : null; })}
          </div>
        )}
        <MetricsChart endpoints={endpoints} history={history} />
      </div>
    </div>
  );
}
