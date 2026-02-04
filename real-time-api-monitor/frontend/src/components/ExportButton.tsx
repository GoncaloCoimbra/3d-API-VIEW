import React, { useState } from "react";
import { ApiEndpoint, EndpointHistory } from "../types";
import { exportCSV, exportPDF } from "../services/exportService";

interface Props { endpoints: ApiEndpoint[]; history: EndpointHistory[]; }

export default function ExportButton({ endpoints, history }: Props) {
  const [open, setOpen] = useState(false);
  const handle = async (fmt: "pdf" | "csv") => {
    if (fmt === "csv") exportCSV(endpoints, history);
    else await exportPDF(endpoints);
    setOpen(false);
  };
  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setOpen(!open)} style={{ padding: "6px 14px", background: "#3b82f6", border: "none", borderRadius: 7, color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 13 }}> Export {open ? "" : ""}</button>
      {open && (
        <div style={{ position: "absolute", top: "100%", left: 0, marginTop: 4, background: "#1e1e3a", border: "1px solid #444", borderRadius: 8, minWidth: 150, zIndex: 50, overflow: "hidden" }}>
          <button onClick={() => handle("pdf")} style={{ display: "block", width: "100%", padding: "8px 14px", background: "none", border: "none", color: "#fff", cursor: "pointer", textAlign: "left", fontSize: 13 }}> PDF Report</button>
          <button onClick={() => handle("csv")} style={{ display: "block", width: "100%", padding: "8px 14px", background: "none", border: "none", color: "#fff", cursor: "pointer", textAlign: "left", fontSize: 13 }}> CSV Export</button>
        </div>
      )}
    </div>
  );
}
