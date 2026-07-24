import { createClient } from "@/lib/supabase/server";
import TopBar from "@/components/TopBar";
import PlantaoDia from "@/components/PlantaoDia";
import { definirEscala } from "./actions";
import Link from "next/link";

const DIAS_SEMANA_HEADER = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const ESCALA_ORDEM: { key: string; label: string }[] = [
  { key: "segunda", label: "Segunda" },
  { key: "terca", label: "Terça" },
  { key: "quarta", label: "Quarta" },
  { key: "quinta", label: "Quinta" },
  { key: "sexta", label: "Sexta" },
];

export default async function PlantaoPage({
  searchParams,
}: {
  searchParams: Promise<{ ano?: string; mes?: string }>;
}) {
  const params = await searchParams;
  const hoje = new Date();
  const ano = Number(params.ano) || hoje.getFullYear();
  const mes = Number(params.mes) || hoje.getMonth() + 1; // 1-12

  const primeiroDia = new Date(ano, mes - 1, 1);
  const ultimoDia = new Date(ano, mes, 0);
  const totalDias = ultimoDia.getDate();
  const offsetInicio = primeiroDia.getDay(); // 0=domingo

  const inicioISO = primeiroDia.toISOString().slice(0, 10);
  const fimISO = ultimoDia.toISOString().slice(0, 10);

  const supabase = await createClient();
  const [{ data: plantoes }, { data: escala }] = await Promise.all([
    supabase.from("plantoes").select("*").gte("data", inicioISO).lte("data", fimISO),
    supabase.from("escala_semana").select("*"),
  ]);

  const plantaoPorDia = new Map((plantoes ?? []).map((p) => [p.data, p.nome]));

  const mesAnterior = mes === 1 ? { ano: ano - 1, mes: 12 } : { ano, mes: mes - 1 };
  const mesSeguinte = mes === 12 ? { ano: ano + 1, mes: 1 } : { ano, mes: mes + 1 };
  const nomeMes = primeiroDia.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  const escalaMap = new Map((escala ?? []).map((e) => [e.dia_semana, e]));

  return (
    <>
      <TopBar title="Plantão" />
      <main className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Escala da semana */}
        <section className="bg-panel-2 border border-line rounded-lg p-4">
          <h2 className="font-mono text-xs text-text-dim uppercase tracking-wider mb-3">
            Escala da semana (horário comercial)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-text-dim border-b border-line font-mono text-xs uppercase">
                  <th className="py-2 pr-4">Dia</th>
                  <th className="py-2 pr-4">Nome</th>
                  <th className="py-2 pr-4">Entrada</th>
                  <th className="py-2 pr-4">Saída</th>
                  <th className="py-2 pr-4"></th>
                </tr>
              </thead>
              <tbody>
                {ESCALA_ORDEM.map(({ key, label }) => {
                  const e = escalaMap.get(key);
                  return (
                    <tr key={key} className="border-b border-line last:border-0">
                      <td className="py-2 pr-4 font-mono text-text-dim">{label}</td>
                      <form action={definirEscala} className="contents">
                        <input type="hidden" name="diaSemana" value={key} />
                        <td className="py-2 pr-4">
                          <input
                            name="nome"
                            defaultValue={e?.nome ?? ""}
                            placeholder="—"
                            className="bg-bg border border-line rounded px-2 py-1 text-sm w-32"
                          />
                        </td>
                        <td className="py-2 pr-4">
                          <select
                            name="entrada"
                            defaultValue={e?.entrada ?? 8}
                            className="bg-bg border border-line rounded px-2 py-1 text-sm"
                          >
                            {[7, 8, 9, 10].map((h) => (
                              <option key={h} value={h}>
                                {h}:00
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 pr-4">
                          <select
                            name="saida"
                            defaultValue={e?.saida ?? 17}
                            className="bg-bg border border-line rounded px-2 py-1 text-sm"
                          >
                            {[16, 17, 18, 19].map((h) => (
                              <option key={h} value={h}>
                                {h}:00
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 pr-4">
                          <button className="text-xs font-mono px-2 py-1 rounded border border-line hover:border-accent hover:text-accent">
                            Salvar
                          </button>
                        </td>
                      </form>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Calendário de plantão */}
        <section className="bg-panel-2 border border-line rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-mono text-xs text-text-dim uppercase tracking-wider">
              Plantão · {nomeMes}
            </h2>
            <div className="flex gap-2 font-mono text-xs">
              <Link
                href={`/plantao?ano=${mesAnterior.ano}&mes=${mesAnterior.mes}`}
                className="px-2 py-1 rounded border border-line hover:border-accent hover:text-accent"
              >
                ← Anterior
              </Link>
              <Link
                href={`/plantao?ano=${mesSeguinte.ano}&mes=${mesSeguinte.mes}`}
                className="px-2 py-1 rounded border border-line hover:border-accent hover:text-accent"
              >
                Próximo →
              </Link>
            </div>
          </div>

          <p className="text-xs text-text-dim mb-3">
            Semana: 19h–7h · Sáb e Dom: 6h–6h
          </p>

          <div className="grid grid-cols-7 gap-2">
            {DIAS_SEMANA_HEADER.map((d) => (
              <div key={d} className="text-center text-xs text-text-dim font-mono pb-1">
                {d}
              </div>
            ))}

            {Array.from({ length: offsetInicio }).map((_, i) => (
              <div key={`vazio-${i}`} />
            ))}

            {Array.from({ length: totalDias }).map((_, i) => {
              const diaNumero = i + 1;
              const data = new Date(ano, mes - 1, diaNumero);
              const diaSemanaNum = data.getDay();
              const fimDeSemana = diaSemanaNum === 0 || diaSemanaNum === 6;
              const dataISO = data.toISOString().slice(0, 10);
              const horario = fimDeSemana ? "6h–6h" : "19h–7h";

              return (
                <PlantaoDia
                  key={dataISO}
                  dataISO={dataISO}
                  diaNumero={diaNumero}
                  horario={horario}
                  fimDeSemana={fimDeSemana}
                  nomeAtual={plantaoPorDia.get(dataISO) ?? null}
                />
              );
            })}
          </div>
        </section>
      </main>
    </>
  );
}
