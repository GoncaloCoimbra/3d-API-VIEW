# 🖥️ Real-Time API Monitor

> A full-stack API health monitoring dashboard with 3D visualization, live WebSocket updates, and a production-ready alert system.

![Dashboard Preview](./docs/preview.gif)

**[Live Demo](https://your-demo-url.com)** · [Backend on Railway](https://your-backend-url.com)

---

## What it does

Monitor the health of multiple API endpoints in real time. Every 5 seconds, the backend pings each endpoint and broadcasts the result to all connected clients via WebSocket. The frontend updates instantly — no polling, no refresh.

The 3D scene gives an immediate spatial overview of your entire API fleet. Shapes encode status at a glance: a sphere is healthy, a cube is offline, an octahedron is slow, a dodecahedron has errors. Particles pulse on every update.

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, TypeScript, Three.js, Recharts |
| Backend | Node.js, Express, WebSocket (ws) |
| Styling | CSS Modules, custom glassmorphism design system |
| Export | jsPDF, CSV |
| DevOps | Docker, docker-compose |

---

## Features

- **3D Scene** — Three.js with shape-coded status, particle animations, and connection lines between related APIs
- **Live WebSocket** — bi-directional updates every 5 seconds, no polling
- **History Charts** — Recharts line/bar charts for response time and error rate per endpoint
- **Alert System** — info / warning / critical alerts with browser notifications and audio cues
- **Export** — PDF reports (jsPDF) and CSV with full history
- **Filtering** — search by name/URL, filter by tag, 3D scene updates dynamically
- **Add Endpoints** — add any URL at runtime, monitored immediately

---

## Quick Start

**With Docker (recommended)**
```bash
docker-compose up --build
# Frontend → http://localhost:3000
# Backend  → http://localhost:4000
```

**Manual**
```bash
# Backend
cd backend && npm install && npx ts-node src/server.ts

# Frontend (new terminal)
cd frontend && npm install && npm start
```

---

## Project Structure

```
real-time-api-monitor/
├── backend/
│   └── src/server.ts          # Express + WebSocket + health simulation
└── frontend/src/
    ├── components/
    │   ├── Dashboard.tsx       # Main layout and state
    │   ├── Scene3D.tsx         # Three.js 3D scene
    │   ├── MetricsChart.tsx    # Recharts history charts
    │   ├── LatencyChart.tsx    # Latency breakdown
    │   ├── AlertPanel.tsx      # Alert drawer
    │   └── AddEndpointForm.tsx # Add endpoint modal
    ├── hooks/
    │   ├── useWebSocket.ts     # WS connection + state + pulse
    │   └── useNotifications.ts # Browser notifications + audio
    ├── services/
    │   ├── api.ts              # REST helpers
    │   └── exportService.ts    # PDF + CSV generation
    └── types/index.ts          # Shared TypeScript types
```

---

## Deploy

| Service | Use for |
|---|---|
| **Vercel** | Frontend (automatic deploys from GitHub) |
| **Railway** | Backend WebSocket server |
| **Render** | Alternative for backend |

Set these env vars in your frontend host:
```
REACT_APP_BACKEND_URL=https://your-backend.railway.app
REACT_APP_WS_URL=wss://your-backend.railway.app
```

---

## Author

Built by [Gonçalo]