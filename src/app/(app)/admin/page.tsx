import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import TopBar from "@/components/TopBar";
import {
  alterarRole,
  alterarStatus,
  reverterMovimentacao,
  excluirAviso,
  atualizarChamados,
} from "./actions";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: meuPerfil } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (meuPerfil?.role !== "admin") {
    return (
      <>
        <TopBar title="Admin" />
        <main className="flex-1 p-6">
          <div className="bg-panel-2 border border-line rounded-lg p-8 text-center max-w-md mx-auto mt-10">
            <p className="text-danger font-mono text-sm">Acesso restrito a admins.</p>
          </div>
        </main>
      </>
    );
  }

  const [{ data: perfis }, { data: movs }, { data: avisos }, { data: resumo }] =
    await Promise.all([
      supabase.from("profiles").select("*").order("full_name"),
      supabase
        .from("movimentacoes")
        .select("*, estoque(nome)")
        .eq("revertida", false)
        .order("created_at", { ascending: false })
        .limit(15),
      supabase.from("avisos").select("*").order("created_at", { ascending: false }),
      supabase
        .from("chamados_resumo")
        .select("*")
        .order("atualizado_em", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

  return (
    <>
      <TopBar title="Administração" />
      <main className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Usuários */}
        <section className="bg-panel-2 border border-line rounded-lg p-4">
          <h2 className="font-mono text-xs text-text-dim uppercase tracking-wider mb-3">
            Usuários
          </h2>
          <div className="space-y-2">
            {(perfis ?? []).map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between text-sm py-2 border-b border-line last:border-0"
              >
                <div>
                  <p className={p.ativo ? "text-text" : "text-text-dim line-through"}>
                    {p.full_name ?? "Sem nome"}
                  </p>
                  <p className="text-xs text-text-dim font-mono">{p.role}</p>
                </div>
                <div className="flex gap-2">
                  <form action={alterarRole}>
                    <input type="hidden" name="userId" value={p.id} />
                    <input type="hidden" name="role" value={p.role === "admin" ? "tecnico" : "admin"} />
                    <button className="text-xs font-mono px-2 py-1 rounded border border-line hover:border-accent hover:text-accent">
                      {p.role === "admin" ? "Rebaixar" : "Tornar admin"}
                    </button>
                  </form>
                  <form action={alterarStatus}>
                    <input type="hidden" name="userId" value={p.id} />
                    <input type="hidden" name="ativo" value={(!p.ativo).toString()} />
                    <button
                      className={`text-xs font-mono px-2 py-1 rounded border ${
                        p.ativo
                          ? "border-line hover:border-danger hover:text-danger"
                          : "border-line hover:border-accent hover:text-accent"
                      }`}
                    >
                      {p.ativo ? "Revogar acesso" : "Reativar"}
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editar dashboard */}
          <section className="bg-panel-2 border border-line rounded-lg p-4">
            <h2 className="font-mono text-xs text-text-dim uppercase tracking-wider mb-3">
              Editar números do dashboard
            </h2>
            <form action={atualizarChamados} className="space-y-2">
              <div>
                <label className="block text-xs text-text-dim mb-1">Chamados abertos</label>
                <input
                  name="abertos"
                  type="number"
                  defaultValue={resumo?.abertos ?? 0}
                  className="w-full bg-bg border border-line rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-text-dim mb-1">Incidentes ativos</label>
                <input
                  name="incidentes"
                  type="number"
                  defaultValue={resumo?.incidentes ?? 0}
                  className="w-full bg-bg border border-line rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-text-dim mb-1">Resolvidos hoje</label>
                <input
                  name="resolvidos_hoje"
                  type="number"
                  defaultValue={resumo?.resolvidos_hoje ?? 0}
                  className="w-full bg-bg border border-line rounded px-3 py-2 text-sm"
                />
              </div>
              <button className="w-full bg-accent text-bg font-semibold text-sm rounded py-2">
                Salvar
              </button>
            </form>
          </section>

          {/* Avisos */}
          <section className="bg-panel-2 border border-line rounded-lg p-4">
            <h2 className="font-mono text-xs text-text-dim uppercase tracking-wider mb-3">
              Gerenciar avisos
            </h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {(avisos ?? []).map((a) => (
                <div key={a.id} className="flex items-center justify-between text-sm py-1.5 border-b border-line last:border-0">
                  <span className="truncate pr-2">{a.titulo}</span>
                  <form action={excluirAviso}>
                    <input type="hidden" name="avisoId" value={a.id} />
                    <button className="text-xs font-mono px-2 py-1 rounded border border-line hover:border-danger hover:text-danger shrink-0">
                      Excluir
                    </button>
                  </form>
                </div>
              ))}
              {(avisos ?? []).length === 0 && (
                <p className="text-sm text-text-dim">Nenhum aviso.</p>
              )}
            </div>
          </section>
        </div>

        {/* Movimentações - rollback */}
        <section className="bg-panel-2 border border-line rounded-lg p-4">
          <h2 className="font-mono text-xs text-text-dim uppercase tracking-wider mb-3">
            Movimentações recentes (reverter)
          </h2>
          <div className="space-y-2">
            {(movs ?? []).map((m: any) => (
              <div
                key={m.id}
                className="flex items-center justify-between text-sm py-2 border-b border-line last:border-0"
              >
                <span className="text-text-dim">
                  {m.responsavel ?? "—"} · {m.tipo} · {m.estoque?.nome} · {m.quantidade}x
                </span>
                <form action={reverterMovimentacao}>
                  <input type="hidden" name="movId" value={m.id} />
                  <button className="text-xs font-mono px-2 py-1 rounded border border-line hover:border-warn hover:text-warn">
                    Reverter
                  </button>
                </form>
              </div>
            ))}
            {(movs ?? []).length === 0 && (
              <p className="text-sm text-text-dim">Nenhuma movimentação recente.</p>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
