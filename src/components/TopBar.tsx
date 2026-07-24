"use client";

import { useEffect, useState } from "react";

export default function TopBar({ title }: { title: string }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="h-14 shrink-0 border-b border-line flex items-center justify-between px-6 bg-bg">
      <h1 className="font-mono text-sm text-text-dim tracking-widest uppercase">
        {title}
      </h1>
      <div className="font-mono text-sm text-text-dim tabular-nums">
        {now
          ? now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
          : "--:--"}
      </div>
    </header>
  );
}
