"use client";

import { useEffect, useState } from "react";

export default function Clock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Render nothing until mounted to avoid hydration mismatch.
  if (!now) return <div className="h-10" aria-hidden />;

  const time = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const date = now.toLocaleDateString([], {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  return (
    <div className="text-right leading-tight">
      <div className="font-mono text-2xl font-semibold tabular-nums tracking-tight">
        {time}
      </div>
      <div className="text-xs text-white/70">{date}</div>
    </div>
  );
}
