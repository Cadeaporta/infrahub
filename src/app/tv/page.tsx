import { createClient } from "@/lib/supabase/server";
import AutoRefresh from "@/components/AutoRefresh";
import RelogioGrande from "@/components/RelogioGrande";
import { AlertTriangle, Ticket, Boxes, Megaphone } from "lucide-react";

export default async function TvPage() {
  const supabase = await createClient();
  const hojeISO = new Date().toISOString().slice(0, 10);

  const [{ data: resumo }, { data: estoque }, { data: avisos }, { data: plantaoHoje }] =
    await Promise.all([
      supabase
        .from("chamados_resumo")
        .select("*")
        .order("atualizado_em", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase.from("estoque").select("*").order("quantidade", { ascending: true }),
      supabase.from("avisos").select("*").order("created_at", { ascending: false }).limit(3),
      supabase.from("plantoes").select("*").eq("data", hojeISO).maybeSingle(),
    ]);

  const itensEmFalta = (estoque ?? []).filter((i) => i.quantidade <= i.minimo);

  const stats = [
    { label: "Chamados abertos", value: resumo?.abertos ?? 0, icon: Ticket, tone: "text-accent" },
    { label: "Incidentes ativos", value: resumo?.incidentes ?? 0, icon: AlertTriangle, tone: "text-danger" },
    { label: "Itens em falta", value: itensEmFalta.length, icon: Boxes, tone: "text-warn" },
    { label: "Avisos ativos", value: avisos?.length ?? 0, icon: Megaphone, tone: "text-accent-2" },
  ];

  return (
    <div className="min-h-screen bg-bg text-text p-10 flex flex-col gap-8">
      <AutoRefresh seconds={30} />

      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="w-4 h-4 rounded-full brand-gradient status-pulse" />
          <div>
            <h1 className="font-mono text-4xl font-bold tracking-tight">InfraHub</h1>
            <p className="text-text-dim text-sm mt-1">Vera Cruz · Braga IT</p>
          </div>
        </div>
        <RelogioGrande />
      </header>

      <section className="grid grid-cols-4 gap-6">
        {stats.map(({ label, value, icon: Icon, tone }) => (
          <div
            key={label}
            className="bg-panel-2 border border-line rounded-2xl p-6 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-text-dim text-lg">{label}</span>
              <Icon size={28} className={tone} />
            </div>
            <span className="font-mono text-6xl font-bold">{value}</span>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-3 gap-6 flex-1">
        {/* Plantão de hoje */}
        <div className="bg-panel-2 border border-line rounded-2xl p-6 flex flex-col">
          <h2 className="font-mono text-sm text-text-dim uppercase tracking-wider mb-4">
            Plantão de hoje
          </h2>
          {plantaoHoje ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <span className="font-mono text-4xl font-bold brand-gradient-text">
                {plantaoHoje.nome}
              </span>
              <span className="text-text-dim text-lg mt-2">
                {new Date().getDay() === 0 || new Date().getDay() === 6 ? "6h – 6h" : "19h – 7h"}
              </span>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-text-dim text-lg">
              Ninguém escalado ainda
            </div>
          )}
        </div>

        {/* Estoque crítico */}
        <div className="bg-panel-2 border border-line rounded-2xl p-6">
          <h2 className="font-mono text-sm text-text-dim uppercase tracking-wider mb-4">
            Estoque crítico
          </h2>
          <div className="space-y-3">
            {itensEmFalta.slice(0, 6).map((item) => (
              <div key={item.id} className="flex items-center justify-between text-lg">
                <span>{item.nome}</span>
                <span className="font-mono text-danger font-bold">{item.quantidade} ⚠</span>
              </div>
            ))}
            {itensEmFalta.length === 0 && (
              <p className="text-text-dim text-lg">Tudo dentro do mínimo. 👍</p>
            )}
          </div>
        </div>

        {/* Avisos */}
        <div className="bg-panel-2 border border-line rounded-2xl p-6">
          <h2 className="font-mono text-sm text-text-dim uppercase tracking-wider mb-4">
            Avisos
          </h2>
          <div className="space-y-4">
            {(avisos ?? []).map((a) => (
              <div key={a.id}>
                <p className="text-lg font-medium">{a.titulo}</p>
                {a.mensagem && <p className="text-text-dim text-sm mt-0.5">{a.mensagem}</p>}
              </div>
            ))}
            {(avisos ?? []).length === 0 && (
              <p className="text-text-dim text-lg">Sem avisos no momento.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
