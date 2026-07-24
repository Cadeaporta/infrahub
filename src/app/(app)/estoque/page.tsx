import { createClient } from "@/lib/supabase/server";
import TopBar from "@/components/TopBar";
import EstoqueItem from "@/components/EstoqueItem";

export default async function EstoquePage() {
  const supabase = await createClient();
  const { data: itens } = await supabase
    .from("estoque")
    .select("*")
    .order("nome", { ascending: true });

  return (
    <>
      <TopBar title="Estoque" />
      <main className="flex-1 p-6 overflow-y-auto">
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
