"use client";

import { useState } from "react";
import { movimentarItem } from "@/app/(app)/estoque/actions";

type Item = {
  id: string;
  nome: string;
  quantidade: number;
  minimo: number;
};

export default function EstoqueItem({ item }: { item: Item }) {
  const [open, setOpen] = useState<"retirada" | "entrada" | null>(null);
  const baixo = item.quantidade <= item.minimo;

  return (
    <div className="bg-panel-2 border border-line rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{item.nome}</p>
          <p className="text-xs text-text-dim mt-0.5">Mínimo: {item.minimo}</p>
        </div>
        <span
          className={`font-mono text-2xl font-bold ${baixo ? "text-danger" : "text-accent"}`}
        >
          {item.quantidade}
        </span>
      </div>

      <div className="flex gap-2 mt-3">
        <button
          onClick={() => setOpen(open === "retirada" ? null : "retirada")}
          className="flex-1 text-xs font-mono py-1.5 rounded border border-line hover:border-danger hover:text-danger transition-colors"
        >
          Retirar
        </button>
        <button
          onClick={() => setOpen(open === "entrada" ? null : "entrada")}
          className="flex-1 text-xs font-mono py-1.5 rounded border border-line hover:border-accent hover:text-accent transition-colors"
        >
          Adicionar
        </button>
      </div>

      {open && (
        <form
          action={async (fd) => {
            await movimentarItem(fd);
            setOpen(null);
          }}
          className="mt-3 space-y-2 border-t border-line pt-3"
        >
          <input type="hidden" name="itemId" value={item.id} />
          <input type="hidden" name="tipo" value={open} />
          <input
            name="quantidade"
            type="number"
            min={1}
            defaultValue={1}
            required
            className="w-full bg-bg border border-line rounded px-2 py-1.5 text-sm"
            placeholder="Quantidade"
          />
          <input
            name="responsavel"
            required
            className="w-full bg-bg border border-line rounded px-2 py-1.5 text-sm"
            placeholder="Responsável"
          />
          <input
            name="motivo"
            className="w-full bg-bg border border-line rounded px-2 py-1.5 text-sm"
            placeholder="Motivo (opcional)"
          />
          <button
            type="submit"
            className={`w-full text-xs font-mono font-semibold py-1.5 rounded ${
              open === "retirada" ? "bg-danger text-bg" : "bg-accent text-bg"
            }`}
          >
            Confirmar {open}
          </button>
        </form>
      )}
    </div>
  );
}
