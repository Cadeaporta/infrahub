import { createClient } from "@/lib/supabase/server";
import AutoRefresh from "@/components/AutoRefresh";
import RelogioGrande from "@/components/RelogioGrande";
import { Boxes, Megaphone, Users, Monitor as MonitorIcon } from "lucide-react";

export default async function TvPage() {
  const supabase = await createClient();
  const hojeISO = new Date().toISOString().slice(0, 10);
  const agora = new Date();
  const horaAtual = agora.getHours() + agora.getMinutes() / 60;
  const desde24h = new Date();
  desde24h.setHours(desde24h.getHours() - 24);

  const [
    { data: estoque },
    { data: avisos },
    { data: plantaoHoje },
    { data: equipe },
    { count: totalEquipamentos },
    { data: servidores },
    { data: checks },
  ] = await Promise.all([
    supabase.from("estoque").select("*").order("quantidade", { ascending: true }),
    supabase.from("avisos").select("*").order("created_at", { ascending: false }).limit(3),
    supabase.from("plantoes").select("*").eq("data", hojeISO).maybeSingle(),
    supabase.from("escala_equipe").select("*"),
    supabase.from("equipamentos").select("id", { count: "exact", head: true }),
    supabase.from("servidores").select("*").order("nome"),
    supabase
      .from("checks_servidor")
      .select("*")
      .gte("checked_at", desde24h.toISOString())
      .order("checked_at", { ascending: false }),
  ]);

  const itensEmFalta = (estoque ?? []).filter((i) => i.quantidade <= i.minimo);
  const ehFimDeSemana = agora.getDay() === 0 || agora.getDay() === 6;
  const equipePresente = ehFimDeSemana
    ? []
    : (equipe ?? []).filter((m) => horaAtual >= m.entrada && horaAtual < m.entrada + 9);

  const checksPorServidor = new Map<string, typeof checks>();
  for (const c of checks ?? []) {
    const lista = checksPorServidor.get(c.servidor_id) ?? [];
    lista.push(c);
    checksPorServidor.set(c.servidor_id, lista);
  }

  const stats = [
    { label: "Itens em falta", value: itensEmFalta.length, icon: Boxes, tone: "text-warn" },
    { label: "Avisos ativos", value: avisos?.length ?? 0, icon: Megaphone, tone: "text-accent-2" },
    { label: "Equipe no expediente", value: equipePresente.length, icon: Users, tone: "text-accent" },
    { label: "Equipamentos cadastrados", value: totalEquipamentos ?? 0, icon: MonitorIcon, tone: "text-accent-2" },
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

      <section className="grid grid-cols-3 gap-6">
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
                {ehFimDeSemana ? "6h – 6h" : "19h – 7h"}
              </span>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-text-dim text-lg">
              Ninguém escalado ainda
            </div>
          )}
        </div>

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

      {(servidores ?? []).length > 0 && (
        <section className="bg-panel-2 border border-line rounded-2xl p-6">
          <h2 className="font-mono text-sm text-text-dim uppercase tracking-wider mb-4">
            Servidores
          </h2>
          <div className="grid grid-cols-4 gap-4">
            {(servidores ?? []).map((s) => {
              const historico = checksPorServidor.get(s.id) ?? [];
              const ultimo = historico[0];
              const online = ultimo?.online ?? null;
              return (
                <div key={s.id} className="flex items-center gap-3">
                  <span
                    className={`w-3 h-3 rounded-full shrink-0 ${
                      online === null
                        ? "bg-text-dim"
                        : online
                        ? "bg-accent status-pulse"
                        : "bg-danger status-pulse"
                    }`}
                  />
                  <div className="min-w-0">
                    <p className="text-lg truncate">{s.nome}</p>
                    <p className="text-text-dim text-sm">
                      {ultimo?.tempo_resposta_ms ? `${ultimo.tempo_resposta_ms}ms` : "sem dados"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
