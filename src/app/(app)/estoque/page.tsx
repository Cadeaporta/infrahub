import { createClient } from "@/lib/supabase/server";
import TopBar from "@/components/TopBar";
import EstoqueItem from "@/components/EstoqueItem";
import { criarItem } from "./actions";

export default async function EstoquePage() {
  const supabase = await createClient();
  const [{ data: itens }, { data: categorias }] = await Promise.all([
    supabase.from("estoque").select("*").order("nome", { ascending: true }),
    supabase.from("categorias_estoque").select("*").order("nome", { ascending: true }),
  ]);

  return (
    <>
      <TopBar title="Estoque" />
      <main className="flex-1 p-6 space-y-6 overflow-y-auto">
        <details className="bg-panel-2 border border-line rounded-lg p-4">
          <summary className="font-mono text-xs text-text-dim uppercase tracking-wider cursor-pointer select-none">
            + Novo item
          </summary>
          <form action={criarItem} className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-4">
            <input
              name="nome"
              required
              placeholder="Nome do item"
              className="sm:col-span-2 bg-bg border border-line rounded px-3 py-2 text-sm"
            />
            <select
              name="categoriaId"
              className="bg-bg border border-line rounded px-3 py-2 text-sm text-text-dim"
            >
              <option value="">Sem categoria</option>
              {(categorias ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <input
                name="quantidade"
                type="number"
                min={0}
                defaultValue={0}
                required
                placeholder="Qtd."
                className="bg-bg border border-line rounded px-3 py-2 text-sm"
              />
              <input
                name="minimo"
                type="number"
                min={0}
                defaultValue={1}
                required
                placeholder="Mínimo"
                className="bg-bg border border-line rounded px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              className="sm:col-span-4 bg-accent text-bg font-semibold text-sm rounded py-2"
            >
              Criar item
            </button>
          </form>
        </details>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(itens ?? []).map((item) => (
            <EstoqueItem key={item.id} item={item} />
          ))}
        </div>
        {(itens ?? []).length === 0 && (
          <p className="text-text-dim text-sm">Nenhum item no estoque ainda.</p>
        )}
      </main>
    </>
  );
}
