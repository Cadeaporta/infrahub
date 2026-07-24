import { createClient } from "@/lib/supabase/server";
import TopBar from "@/components/TopBar";
import { criarAviso } from "./actions";

export default async function AvisosPage() {
  const supabase = await createClient();
  const { data: avisos } = await supabase
    .from("avisos")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <>
      <TopBar title="Avisos" />
      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-y-auto">
        <form
          action={criarAviso}
          className="bg-panel-2 border border-line rounded-lg p-4 h-fit space-y-3"
        >
          <h2 className="font-mono text-xs text-text-dim uppercase tracking-wider">
            Novo aviso
          </h2>
          <input
            name="titulo"
            required
            className="w-full bg-bg border border-line rounded px-3 py-2 text-sm"
            placeholder="Título"
          />
          <textarea
            name="mensagem"
            rows={3}
            className="w-full bg-bg border border-line rounded px-3 py-2 text-sm resize-none"
            placeholder="Mensagem"
          />
          <button
            type="submit"
            className="w-full bg-accent text-bg font-semibold text-sm rounded py-2"
          >
            Publicar
          </button>
        </form>

        <div className="lg:col-span-2 space-y-3">
          {(avisos ?? []).map((aviso) => (
            <div key={aviso.id} className="bg-panel-2 border border-line rounded-lg p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm">{aviso.titulo}</p>
                <span className="text-xs text-text-dim font-mono">
                  {new Date(aviso.created_at).toLocaleDateString("pt-BR")}
                </span>
              </div>
              {aviso.mensagem && (
                <p className="text-sm text-text-dim mt-1">{aviso.mensagem}</p>
              )}
              <p className="text-xs text-accent mt-2">— {aviso.autor_nome}</p>
            </div>
          ))}
          {(avisos ?? []).length === 0 && (
            <p className="text-text-dim text-sm">Nenhum aviso publicado ainda.</p>
          )}
        </div>
      </main>
    </>
  );
}
