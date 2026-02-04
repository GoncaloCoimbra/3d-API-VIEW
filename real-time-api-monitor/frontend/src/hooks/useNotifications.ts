import { useEffect, useRef } from "react";
import { Alert } from "../types";

export function useNotifications(alerts: Alert[]) {
  const prevCount = useRef(0);

  useEffect(() => {
    if (alerts.length > prevCount.current && prevCount.current > 0) {
      const latest = alerts[0];
      if (Notification.permission === "granted") {
        new Notification(`[${latest.severity.toUpperCase()}] ${latest.endpointName}`, {
          body: latest.message,
          icon: "/logo192.png",
        });
      }
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const freqs: Record<string, number[]> = { critical: [880, 660, 440], warning: [660, 880], info: [440, 660] };
        (freqs[latest.severity] || [440]).forEach((f, i) => {
          const osc = ctx.createOscillator();
          osc.type = "sine";
          osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.15);
          osc.connect(ctx.destination);
          osc.start(ctx.currentTime + i * 0.15);
          osc.stop(ctx.currentTime + i * 0.15 + 0.12);
        });
      } catch {}
    }
    prevCount.current = alerts.length;
  }, [alerts]);

  useEffect(() => {
    if (Notification.permission === "default") Notification.requestPermission();
  }, []);
}
