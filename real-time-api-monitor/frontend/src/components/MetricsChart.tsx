import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { ApiEndpoint, EndpointHistory } from "../types";

interface Props { endpoints: ApiEndpoint[]; history: EndpointHistory[]; }

export default function MetricsChart({ endpoints, history }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [chartType, setChartType] = useState<"line" | "bar">("line");
  const historyData = history.find(h => h.endpointId === selectedId)?.points?.slice(-30) || [];
  const chartData = historyData.map(p => ({
    time: new Date(p.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    responseTime: p.responseTime,
    errorRate: p.errorRate,
  }));

  return (
    <div style={{ background: "#1e1e3a", borderRadius: 12, padding: 16, border: "1px solid #2a2a4a" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}> History Charts</span>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => setChartType("line")} style={{ padding: "3px 10px", border: "none", borderRadius: 5, background: chartType === "line" ? "#3b82f6" : "#2a2a4a", color: "#fff", fontSize: 11, cursor: "pointer" }}>Line</button>
          <button onClick={() => setChartType("bar")} style={{ padding: "3px 10px", border: "none", borderRadius: 5, background: chartType === "bar" ? "#3b82f6" : "#2a2a4a", color: "#fff", fontSize: 11, cursor: "pointer" }}>Bar</button>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
        {endpoints.map(ep => (
          <button key={ep.id} onClick={() => setSelectedId(ep.id)} style={{ padding: "3px 10px", border: "none", borderRadius: 14, background: selectedId === ep.id ? "#3b82f6" : "#2a2a4a", color: "#fff", fontSize: 11, cursor: "pointer" }}>{ep.name}</button>
        ))}
      </div>
      {selectedId && chartData.length > 0 ? (
        <>
          <div style={{ marginBottom: 12 }}>
            <span style={{ color: "#aaa", fontSize: 12 }}>Response Time (ms)</span>
            <ResponsiveContainer width="100%" height={150}>
              {chartType === "line" ? (
                <LineChart data={chartData}><CartesianGrid strokeDasharray="3 3" stroke="#333" /><XAxis dataKey="time" tick={{ fill: "#888", fontSize: 10 }} /><YAxis tick={{ fill: "#888", fontSize: 10 }} /><Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid #444", borderRadius: 6, color: "#fff" }} /><Line dataKey="responseTime" stroke="#38bdf8" dot={false} strokeWidth={2} /></LineChart>
              ) : (
                <BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" stroke="#333" /><XAxis dataKey="time" tick={{ fill: "#888", fontSize: 10 }} /><YAxis tick={{ fill: "#888", fontSize: 10 }} /><Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid #444", borderRadius: 6, color: "#fff" }} /><Bar dataKey="responseTime" fill="#38bdf8" /></BarChart>
              )}
            </ResponsiveContainer>
          </div>
          <div>
            <span style={{ color: "#aaa", fontSize: 12 }}>Error Rate (%)</span>
            <ResponsiveContainer width="100%" height={130}>
              {chartType === "line" ? (
                <LineChart data={chartData}><CartesianGrid strokeDasharray="3 3" stroke="#333" /><XAxis dataKey="time" tick={{ fill: "#888", fontSize: 10 }} /><YAxis tick={{ fill: "#888", fontSize: 10 }} /><Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid #444", borderRadius: 6, color: "#fff" }} /><Line dataKey="errorRate" stroke="#f87171" dot={false} strokeWidth={2} /></LineChart>
              ) : (
                <BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" stroke="#333" /><XAxis dataKey="time" tick={{ fill: "#888", fontSize: 10 }} /><YAxis tick={{ fill: "#888", fontSize: 10 }} /><Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid #444", borderRadius: 6, color: "#fff" }} /><Bar dataKey="errorRate" fill="#f87171" /></BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </>
      ) : (
        <div style={{ color: "#555", textAlign: "center", padding: "40px 0", fontSize: 14 }}>
          {endpoints.length === 0 ? "No endpoints" : "Select an endpoint above to view history"}
        </div>
      )}
    </div>
  );
}
