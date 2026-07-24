"use client";

import { useState } from "react";
import { definirPlantonista } from "@/app/(app)/plantao/actions";

export default function PlantaoDia({
  dataISO,
  diaNumero,
  horario,
  fimDeSemana,
  nomeAtual,
}: {
  dataISO: string;
  diaNumero: number;
  horario: string;
  fimDeSemana: boolean;
  nomeAtual: string | null;
}) {
  const [editando, setEditando] = useState(false);

  return (
    <div
      className={`border rounded-lg p-2 min-h-[84px] flex flex-col justify-between ${
        fimDeSemana ? "border-accent-2/40 bg-accent-2/5" : "border-line bg-panel-2"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-text-dim">{diaNumero}</span>
        <span className="text-[10px] text-text-dim font-mono">{horario}</span>
      </div>

      {editando ? (
        <form
          action={async (fd) => {
            await definirPlantonista(fd);
            setEditando(false);
          }}
          className="mt-1"
        >
          <input type="hidden" name="data" value={dataISO} />
          <input
            name="nome"
            autoFocus
            defaultValue={nomeAtual ?? ""}
            onBlur={(e) => e.currentTarget.form?.requestSubmit()}
            placeholder="Nome"
            className="w-full bg-bg border border-line rounded px-1.5 py-1 text-xs"
          />
        </form>
      ) : (
        <button
          onClick={() => setEditando(true)}
          className="text-left text-xs mt-1 truncate hover:text-accent"
        >
          {nomeAtual ?? <span className="text-text-dim">—</span>}
        </button>
      )}
    </div>
  );
}
