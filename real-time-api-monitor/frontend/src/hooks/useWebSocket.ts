import { useState, useEffect, useRef, useCallback } from "react";
import { ApiEndpoint, EndpointHistory, Alert } from "../types";

export function useWebSocket(url: string) {
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([]);
  const [history, setHistory] = useState<EndpointHistory[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [connected, setConnected] = useState(false);
  const [pulsingIds, setPulsingIds] = useState<Set<string>>(new Set());
  const wsRef = useRef<WebSocket | null>(null);

  const pulse = useCallback((id: string) => {
    setPulsingIds(prev => new Set(prev).add(id));
    setTimeout(() => setPulsingIds(prev => { const n = new Set(prev); n.delete(id); return n; }), 1200);
  }, []);

  useEffect(() => {
    const connect = () => {
      try {
        const ws = new WebSocket(url);
        wsRef.current = ws;
        ws.onopen = () => setConnected(true);
        ws.onclose = () => { setConnected(false); setTimeout(connect, 3000); };
        ws.onerror = () => ws.close();
        ws.onmessage = (e) => {
          try {
            const msg = JSON.parse(e.data);
            switch (msg.type) {
              case "update":
                setEndpoints((prev) => {
                  const updated = msg.payload as ApiEndpoint[];
                  updated.forEach(ep => {
                    const old = prev.find(p => p.id === ep.id);
                    if (!old || old.status !== ep.status || old.responseTime !== ep.responseTime) pulse(ep.id);
                  });
                  return updated;
                });
                break;
              case "history":
                setHistory(msg.payload as EndpointHistory[]);
                break;
              case "alert":
                setAlerts(prev => [msg.payload as Alert, ...prev].slice(0, 50));
                break;
            }
          } catch {}
        };
      } catch { setTimeout(connect, 3000); }
    };
    connect();
    return () => wsRef.current?.close();
  }, [url, pulse]);

  return { endpoints, history, alerts, connected, pulsingIds };
}
