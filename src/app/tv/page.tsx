import { createClient } from "@/lib/supabase/server";
import AutoRefresh from "@/components/AutoRefresh";
import RelogioGrande from "@/components/RelogioGrande";

export default async function TvPage() {
  const supabase = await createClient();
  const hojeISO = new Date().toISOString().slice(0, 10);
  const agora = new Date();
  const horaAtual = agora.getHours() + agora.getMinutes() / 60;
  const ehFimDeSemana = agora.getDay() === 0 || agora.getDay() === 6;

  const [{ data: plantaoHoje }, { data: equipe }] = await Promise.all([
    supabase.from("plantoes").select("*").eq("data", hojeISO).maybeSingle(),
    supabase.from("escala_equipe").select("*").order("entrada").order("nome"),
  ]);

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

      <section className="grid grid-cols-2 gap-6 flex-1">
        {/* Escala da equipe */}
        <div className="bg-panel-2 border border-line rounded-2xl p-8 flex flex-col">
          <h2 className="font-mono text-lg text-text-dim uppercase tracking-wider mb-6">
            Horário de trabalho
          </h2>
          <div className="flex-1 flex flex-col justify-center gap-5">
            {(equipe ?? []).map((m) => {
              const presente =
                !ehFimDeSemana && horaAtual >= m.entrada && horaAtual < m.entrada + 9;
              return (
                <div
                  key={m.id}
                  className="flex items-center justify-between border-b border-line pb-4 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        presente ? "bg-accent status-pulse" : "bg-text-dim"
                      }`}
                    />
                    <span className="text-2xl">{m.nome}</span>
                  </div>
                  <span className="font-mono text-xl text-text-dim">
                    {m.entrada}:00 – {m.entrada + 9}:00
                  </span>
                </div>
              );
            })}
            {(equipe ?? []).length === 0 && (
              <p className="text-text-dim text-lg text-center">Ninguém cadastrado ainda.</p>
            )}
          </div>
        </div>

        {/* Plantão de hoje */}
        <div className="bg-panel-2 border border-line rounded-2xl p-8 flex flex-col">
          <h2 className="font-mono text-lg text-text-dim uppercase tracking-wider mb-6">
            Plantão de hoje
          </h2>
          {plantaoHoje ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <span className="font-mono text-6xl font-bold brand-gradient-text">
                {plantaoHoje.nome}
              </span>
              <span className="text-text-dim text-2xl mt-4">
                {ehFimDeSemana ? "6h – 6h" : "19h – 7h"}
              </span>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-text-dim text-xl">
              Ninguém escalado ainda
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
