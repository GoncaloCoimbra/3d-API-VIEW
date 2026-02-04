import React, { useEffect, useRef } from "react";

const STATUS_COLOR: Record<string, string> = { online: "#22c55e", offline: "#ef4444", slow: "#eab308", error: "#f97316" };

interface Props { status: string; pulsing?: boolean; size?: number; }

export default function PulseRing({ status, pulsing = false, size = 14 }: Props) {
  const color = STATUS_COLOR[status] || "#888";
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || !pulsing) return;
    const el = ref.current;
    el.style.boxShadow = `0 0 0 0 ${color}88`;
    el.style.transition = "box-shadow 0.6s ease-out";
    requestAnimationFrame(() => { requestAnimationFrame(() => { el.style.boxShadow = `0 0 0 ${size}px transparent`; }); });
  }, [pulsing, color, size]);

  return (
    <div ref={ref} style={{ width: size, height: size, borderRadius: "50%", background: color, display: "inline-block", boxShadow: pulsing ? `0 0 8px ${color}` : "none", transition: "background 0.3s" }} />
  );
}
