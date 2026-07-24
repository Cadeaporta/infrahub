import { createClient } from "@/lib/supabase/server";
import TopBar from "@/components/TopBar";
import { AlertTriangle, Ticket, Boxes, Megaphone } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();

  const [{ data: resumo }, { data: estoqueBaixo }, { data: avisos }, { data: movs }] =
    await Promise.all([
      supabase
        .from("chamados_resumo")
        .select("*")
        .order("atualizado_em", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase.from("estoque").select("*").order("quantidade", { ascending: true }),
      supabase.from("avisos").select("*").order("created_at", { ascending: false }).limit(4),
      supabase
        .from("movimentacoes")
        .select("*, estoque(nome)")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  const itensEmFalta = (estoqueBaixo ?? []).filter((i) => i.quantidade <= i.minimo);
  const totalEquipamentos = 146; // placeholder até módulo de equipamentos ter dados reais

  const stats = [
    { label: "Chamados abertos", value: resumo?.abertos ?? 0, icon: Ticket, tone: "text-accent" },
    { label: "Incidentes ativos", value: resumo?.incidentes ?? 0, icon: AlertTriangle, tone: "text-danger" },
    { label: "Itens em falta", value: itensEmFalta.length, icon: Boxes, tone: "text-warn" },
    { label: "Avisos ativos", value: avisos?.length ?? 0, icon: Megaphone, tone: "text-accent" },
  ];

  return (
    <>
      <TopBar title="Dashboard" />
      <main className="flex-1 p-6 space-y-6 overflow-y-auto">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent status-pulse" />
          <span className="text-sm text-text-dim font-mono">Hospital Online</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon, tone }) => (
            <div
              key={label}
              className="bg-panel-2 border border-line rounded-lg p-4 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-dim">{label}</span>
                <Icon size={16} className={tone} />
              </div>
              <span className="font-mono text-3xl font-bold">{value}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-panel-2 border border-line rounded-lg p-4">
            <h2 className="font-mono text-xs text-text-dim uppercase tracking-wider mb-3">
              Estoque crítico
            </h2>
            <div className="space-y-2">
              {(estoqueBaixo ?? []).slice(0, 6).map((item) => {
                const baixo = item.quantidade <= item.minimo;
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-sm py-1.5 border-b border-line last:border-0"
                  >
                    <span className="text-text">{item.nome}</span>
                    <span
                      className={`font-mono ${baixo ? "text-danger" : "text-text-dim"}`}
                    >
                      {item.quantidade} {baixo && "⚠"}
                    </span>
                  </div>
                );
              })}
              {(estoqueBaixo ?? []).length === 0 && (
                <p className="text-sm text-text-dim">Nenhum item cadastrado ainda.</p>
              )}
            </div>
          </div>

          <div className="bg-panel-2 border border-line rounded-lg p-4">
            <h2 className="font-mono text-xs text-text-dim uppercase tracking-wider mb-3">
              Últimos avisos
            </h2>
            <div className="space-y-3">
              {(avisos ?? []).map((aviso) => (
                <div key={aviso.id} className="text-sm">
                  <p className="text-text">{aviso.titulo}</p>
                  <p className="text-text-dim text-xs mt-0.5">
                    {aviso.mensagem} · {aviso.autor_nome}
                  </p>
                </div>
              ))}
              {(avisos ?? []).length === 0 && (
                <p className="text-sm text-text-dim">Sem avisos no momento.</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-panel-2 border border-line rounded-lg p-4">
          <h2 className="font-mono text-xs text-text-dim uppercase tracking-wider mb-3">
            Últimas movimentações
          </h2>
          <div className="space-y-2">
            {(movs ?? []).map((m: any) => (
              <div
                key={m.id}
                className="flex items-center justify-between text-sm py-1.5 border-b border-line last:border-0"
              >
                <span className="text-text-dim">
                  {m.responsavel ?? "—"} · {m.tipo} · {m.estoque?.nome}
                </span>
                <span className="font-mono text-text-dim">{m.quantidade}x</span>
              </div>
            ))}
            {(movs ?? []).length === 0 && (
              <p className="text-sm text-text-dim">Nenhuma movimentação registrada ainda.</p>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
