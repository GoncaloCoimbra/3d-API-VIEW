import express from "express";
import cors from "cors";
import { v4 as uuid } from "uuid";
import WebSocket from "ws";
import http from "http";

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
app.use(cors());
app.use(express.json());

interface Endpoint {
  id: string; name: string; url: string; method: string;
  status: string; responseTime: number; lastChecked: string;
  uptime: number; errorRate: number;
  tags?: string[]; relatedEndpoints?: string[];
}
interface HistoryPoint { timestamp: string; responseTime: number; status: string; errorRate: number; }
interface Alert { id: string; endpointId: string; endpointName: string; type: string; severity: string; message: string; timestamp: string; read: boolean; }

let endpoints: Endpoint[] = [
  { id:"ep1", name:"User Auth API", url:"https://api.example.com/auth", method:"POST", status:"online", responseTime:120, lastChecked:new Date().toISOString(), uptime:99.5, errorRate:0.2, tags:["auth","security"], relatedEndpoints:["ep2","ep3"] },
  { id:"ep2", name:"User Profile", url:"https://api.example.com/profile", method:"GET", status:"online", responseTime:85, lastChecked:new Date().toISOString(), uptime:98.2, errorRate:1.1, tags:["users"], relatedEndpoints:["ep1"] },
  { id:"ep3", name:"Token Refresh", url:"https://api.example.com/refresh", method:"POST", status:"slow", responseTime:890, lastChecked:new Date().toISOString(), uptime:95.0, errorRate:3.5, tags:["auth","security"], relatedEndpoints:["ep1"] },
  { id:"ep4", name:"Product Catalog", url:"https://api.example.com/products", method:"GET", status:"online", responseTime:200, lastChecked:new Date().toISOString(), uptime:99.8, errorRate:0.0, tags:["catalog"], relatedEndpoints:["ep5"] },
  { id:"ep5", name:"Product Details", url:"https://api.example.com/products/:id", method:"GET", status:"online", responseTime:150, lastChecked:new Date().toISOString(), uptime:99.1, errorRate:0.5, tags:["catalog"], relatedEndpoints:["ep4","ep6"] },
  { id:"ep6", name:"Inventory Check", url:"https://api.example.com/inventory", method:"GET", status:"error", responseTime:2100, lastChecked:new Date().toISOString(), uptime:88.0, errorRate:12.5, tags:["inventory"], relatedEndpoints:["ep5"] },
  { id:"ep7", name:"Payment Gateway", url:"https://api.example.com/payments", method:"POST", status:"online", responseTime:340, lastChecked:new Date().toISOString(), uptime:99.9, errorRate:0.1, tags:["payments","critical"], relatedEndpoints:["ep8"] },
  { id:"ep8", name:"Order Service", url:"https://api.example.com/orders", method:"POST", status:"offline", responseTime:0, lastChecked:new Date().toISOString(), uptime:72.0, errorRate:28.0, tags:["orders","critical"], relatedEndpoints:["ep7","ep9"] },
  { id:"ep9", name:"Notification Svc", url:"https://api.example.com/notify", method:"POST", status:"online", responseTime:95, lastChecked:new Date().toISOString(), uptime:97.5, errorRate:2.0, tags:["notifications"], relatedEndpoints:["ep8"] },
];

const history: Record<string, HistoryPoint[]> = {};
const alerts: Alert[] = [];

// Seed history
endpoints.forEach(ep => {
  history[ep.id] = [];
  for (let i = 29; i >= 0; i--) {
    history[ep.id].push({
      timestamp: new Date(Date.now() - i * 10000).toISOString(),
      responseTime: Math.max(10, ep.responseTime + Math.floor((Math.random() - 0.5) * 60)),
      status: ep.status,
      errorRate: Math.max(0, ep.errorRate + (Math.random() - 0.5) * 2),
    });
  }
});

function broadcast(msg: object) {
  const data = JSON.stringify(msg);
  wss.clients.forEach(c => {
    if (c.readyState === WebSocket.OPEN) c.send(data);
  });
}

// Simulate health checks every 5s
setInterval(() => {
  endpoints.forEach(ep => {
    const r = Math.random();
    if (r < 0.02 && ep.status === "online") ep.status = "offline";
    else if (r < 0.05 && ep.status === "offline") ep.status = "online";
    else if (r < 0.03 && ep.status === "online") ep.status = "slow";
    else if (r < 0.04 && ep.status === "slow") ep.status = "online";

    ep.responseTime = ep.status === "offline" ? 0 : Math.max(10, ep.responseTime + Math.floor((Math.random() - 0.5) * 80));
    ep.errorRate = Math.max(0, Math.min(100, ep.errorRate + (Math.random() - 0.5) * 3));
    ep.uptime = Math.max(0, Math.min(100, ep.uptime + (Math.random() - 0.5) * 0.5));
    ep.lastChecked = new Date().toISOString();

    if (!history[ep.id]) history[ep.id] = [];
    history[ep.id].push({
      timestamp: ep.lastChecked,
      responseTime: ep.responseTime,
      status: ep.status,
      errorRate: ep.errorRate
    });
    if (history[ep.id].length > 200) history[ep.id].shift();

    // Generate alerts
    if (ep.status === "offline") {
      alerts.unshift({ id: uuid(), endpointId: ep.id, endpointName: ep.name, type: "endpoint_down", severity: "critical", message: ep.name + " is DOWN", timestamp: ep.lastChecked, read: false });
    } else if (ep.responseTime > 1000) {
      alerts.unshift({ id: uuid(), endpointId: ep.id, endpointName: ep.name, type: "slow_response", severity: "warning", message: ep.name + " slow: " + ep.responseTime + "ms", timestamp: ep.lastChecked, read: false });
    } else if (ep.errorRate > 10) {
      alerts.unshift({ id: uuid(), endpointId: ep.id, endpointName: ep.name, type: "high_error_rate", severity: "warning", message: ep.name + " error rate: " + ep.errorRate.toFixed(1) + "%", timestamp: ep.lastChecked, read: false });
    }
    if (alerts.length > 100) alerts.length = 100;
  });

  broadcast({ type: "update", payload: endpoints });
  broadcast({
    type: "history",
    payload: Object.entries(history).map(([id, pts]) => ({
      endpointId: id,
      points: pts.slice(-30)
    }))
  });
  if (alerts.length > 0) broadcast({ type: "alert", payload: alerts[0] });
}, 5000);

// REST routes
app.get("/api/endpoints", (_req, res) => res.json(endpoints));

app.post("/api/endpoints", (req, res) => {
  const ep: Endpoint = {
    id: uuid(),
    name: req.body.name,
    url: req.body.url,
    method: req.body.method || "GET",
    status: "online",
    responseTime: 0,
    lastChecked: new Date().toISOString(),
    uptime: 100,
    errorRate: 0
  };
  endpoints.push(ep);
  history[ep.id] = [];
  res.status(201).json(ep);
});

app.get("/api/history/:id", (req, res) => {
  res.json(history[req.params.id] || []);
});

app.get("/api/alerts", (_req, res) => res.json(alerts));

// WebSocket
wss.on("connection", (ws) => {
  ws.send(JSON.stringify({ type: "update", payload: endpoints }));
  ws.send(JSON.stringify({
    type: "history",
    payload: Object.entries(history).map(([id, pts]) => ({
      endpointId: id,
      points: pts.slice(-30)
    }))
  }));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log("[SERVER] Running on port " + PORT);
});
