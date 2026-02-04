import React from "react";
import { ApiEndpoint } from "../types";
import PulseRing from "./PulseRing";

const STATUS_BG: Record<string, string> = { online: "#1a3a2a", offline: "#3a1a1a", slow: "#3a3a1a", error: "#3a2a1a" };
const STATUS_BORDER: Record<string, string> = { online: "#22c55e", offline: "#ef4444", slow: "#eab308", error: "#f97316" };

interface Props { endpoint: ApiEndpoint; pulsing: boolean; onClick: () => void; }

export default function APINode({ endpoint, pulsing, onClick }: Props) {
  return (
    <div onClick={onClick} style={{
      background: STATUS_BG[endpoint.status] || "#2a2a3a", border: `2px solid ${STATUS_BORDER[endpoint.status] || "#555"}`,
      borderRadius: 12, padding: "12px 14px", cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s",
      boxShadow: pulsing ? `0 0 16px ${STATUS_BORDER[endpoint.status]}66` : "0 2px 8px rgba(0,0,0,0.3)",
      transform: pulsing ? "scale(1.04)" : "scale(1)", position: "relative", overflow: "hidden",
    }}>
      {endpoint.status === "offline" && <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(239,68,68,0.08) 8px, rgba(239,68,68,0.08) 16px)", animation: "wave 2s linear infinite", opacity: 0.6 }} />}
      <div style={{ display: "flex", alignItems: "center", gap: 8, position: "relative", zIndex: 1 }}>
        <PulseRing status={endpoint.status} pulsing={pulsing} />
        <div style={{ flex: 1 }}>
          <div style={{ color: "#fff", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{endpoint.name}</div>
          <div style={{ color: "#888", fontSize: 10, fontFamily: "monospace" }}>{endpoint.method}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: "#38bdf8", fontSize: 12, fontWeight: 700 }}>{endpoint.responseTime}<span style={{ fontSize: 9, color: "#666" }}>ms</span></div>
          <div style={{ color: "#22c55e", fontSize: 10 }}>{endpoint.uptime}%</div>
        </div>
      </div>
    </div>
  );
}
