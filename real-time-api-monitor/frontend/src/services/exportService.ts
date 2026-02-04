import { ApiEndpoint, EndpointHistory } from "../types";

function download(blob: Blob, name: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function exportCSV(endpoints: ApiEndpoint[], history: EndpointHistory[]) {
  const rows: string[] = [];
  rows.push("ID,Name,URL,Method,Status,ResponseTime(ms),Uptime(%),ErrorRate(%),LastChecked");
  endpoints.forEach(ep => {
    rows.push([ep.id, ep.name, ep.url, ep.method, ep.status, ep.responseTime, ep.uptime, ep.errorRate, ep.lastChecked].join(","));
  });
  rows.push("");
  rows.push("--- HISTORY ---");
  rows.push("EndpointID,Timestamp,ResponseTime(ms),Status,ErrorRate(%)");
  history.forEach(h => { h.points.forEach(p => { rows.push([h.endpointId, p.timestamp, p.responseTime, p.status, p.errorRate].join(",")); }); });
  download(new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" }), "api-monitor-report.csv");
}

export async function exportPDF(endpoints: ApiEndpoint[]) {
  const { default: jsPDF } = await import("jspdf");
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text("API Monitor - Report", 10, 15);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 10, 25);
  let y = 35;
  const headers = ["Name", "Status", "Resp (ms)", "Uptime %", "Err %"];
  const colW = [55, 25, 30, 28, 22];
  doc.setFillColor(30, 30, 50);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  let x = 10;
  headers.forEach((h, i) => { doc.rect(x, y, colW[i], 8, "F"); doc.text(h, x + 2, y + 5.5); x += colW[i]; });
  y += 10;
  doc.setTextColor(0, 0, 0);
  endpoints.forEach((ep, idx) => {
    if (y > 270) { doc.addPage(); y = 15; }
    if (idx % 2 === 0) { doc.setFillColor(240, 242, 248); doc.rect(10, y, 160, 7, "F"); }
    const statusColors: Record<string, [number,number,number]> = { online:[34,197,94], offline:[239,68,68], slow:[234,179,8], error:[239,68,68] };
    const c = statusColors[ep.status] || [100,100,100];
    doc.setTextColor(c[0], c[1], c[2]);
    const vals = [ep.name, ep.status, String(ep.responseTime), ep.uptime + "%", ep.errorRate + "%"];
    x = 10;
    vals.forEach((v, i) => { doc.text(v, x + 2, y + 5); x += colW[i]; });
    doc.setTextColor(0, 0, 0);
    y += 8;
  });
  doc.save("api-monitor-report.pdf");
}

