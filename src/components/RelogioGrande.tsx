"use client";

import { useEffect, useState } from "react";

export default function RelogioGrande() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="text-right">
      <div className="font-mono text-5xl font-bold tabular-nums brand-gradient-text">
        {now ? now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "--:--"}
      </div>
      <div className="text-text-dim text-lg mt-1 capitalize">
        {now
          ? now.toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "2-digit",
              month: "long",
            })
          : ""}
      </div>
    </div>
  );
}
