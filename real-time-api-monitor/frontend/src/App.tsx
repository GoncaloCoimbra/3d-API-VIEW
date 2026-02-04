import React from "react";
import Dashboard from "./components/Dashboard";
import { useWebSocket } from "./hooks/useWebSocket";
import { useNotifications } from "./hooks/useNotifications";

const WS_URL = process.env.REACT_APP_WS_URL || "ws://localhost:3001/ws";

function App() {
  const { endpoints, history, alerts, connected, pulsingIds } = useWebSocket(WS_URL);
  useNotifications(alerts);
  return <Dashboard endpoints={endpoints} history={history} alerts={alerts} connected={connected} pulsingIds={pulsingIds} />;
}

export default App;
