# Real-Time API Monitor

A full-stack real-time API health monitoring dashboard with 3D visualization, live WebSocket updates, historical charts, alert system, and export capabilities.

## Features

- **3D Scene** - Three.js with particles, connection lines between related APIs, shape-coded status (sphere=online, cube=offline, octahedron=slow, dodecahedron=error)
- **Pulse Animations** - Visual pulse on every health-check update + wave animation on offline endpoints
- **History Charts** - Recharts line/bar charts for response time and error rate per endpoint
- **Alert System** - Real-time alerts (info/warning/critical) with browser notifications and audio beeps
- **Export** - PDF reports (jsPDF) and CSV export with full history
- **Metrics Dashboard** - Summary stats, selectable endpoint details panel
- **WebSocket** - Live bi-directional updates every 5 seconds

## Quick Start

### Backend
```bash
cd backend
npm install
npx ts-node src/server.ts
```

### Frontend
```bash
cd ../frontend
npm install
npm start
```

## Architecture
```
real-time-api-monitor/
  backend/src/server.ts          - Express + WebSocket + health simulation
  frontend/src/
    components/
      Dashboard.tsx              - Main layout
      Scene3D.tsx                - Three.js 3D scene
      APINode.tsx                - Grid card
      MetricsChart.tsx           - Recharts history
      EndpointDetailsPanel.tsx   - Detail modal
      AlertPanel.tsx             - Alert drawer
      PulseRing.tsx              - Status indicator
      ExportButton.tsx           - PDF/CSV export
    hooks/
      useWebSocket.ts            - WS + state + pulse
      useNotifications.ts        - Browser notifs + audio
    services/
      api.ts                     - REST helpers
      exportService.ts           - PDF + CSV generation
    types/index.ts               - TypeScript types
```

## Docker
```bash
docker-compose up --build
```

## Deploy
- **Render**: Backend as Web Service, Frontend as Static Site
- **Vercel**: Frontend only, host backend on Render/Railway
- Set REACT_APP_BACKEND_URL and REACT_APP_WS_URL env vars
