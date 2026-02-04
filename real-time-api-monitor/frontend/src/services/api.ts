const BASE = process.env.REACT_APP_BACKEND_URL || "http://localhost:3001";
export async function fetchEndpoints() { const r = await fetch(`${BASE}/api/endpoints`); return r.json(); }
export async function fetchHistory(id: string) { const r = await fetch(`${BASE}/api/history/${id}`); return r.json(); }
export async function fetchAlerts() { const r = await fetch(`${BASE}/api/alerts`); return r.json(); }
