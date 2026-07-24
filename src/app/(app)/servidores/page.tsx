import { createClient } from "@/lib/supabase/server";
import TopBar from "@/components/TopBar";
import { criarServidor, removerServidor } from "./actions";

export default async function ServidoresPage() {
  const supabase = await createClient();
  const desde = new Date();
  desde.setHours(desde.getHours() - 24);

  const [{ data: servidores }, { data: checks }] = await Promise.all([
    supabase.from("servidores").select("*").order("nome"),
    supabase
      .from("checks_servidor")
      .select("*")
      .gte("checked_at", desde.toISOString())
      .order("checked_at", { ascending: false }),
  ]);

  const checksPorServidor = new Map<string, typeof checks>();
  for (const c of checks ?? []) {
    const lista = checksPorServidor.get(c.servidor_id) ?? [];
    lista.push(c);
    checksPorServidor.set(c.servidor_id, lista);
  }

  return (
    <>
      <TopBar title="Servidores" />
      <main className="flex-1 p-6 space-y-6 overflow-y-auto">
        <p className="text-sm text-text-dim">
          Verificação HTTP/TCP feita por um agente rodando dentro da rede. O check real
          não roda no site — ele só exibe o que o agente reporta.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(servidores ?? []).map((s) => {
            const historico = checksPorServidor.get(s.id) ?? [];
            const ultimo = historico[0];
            const online = ultimo?.online ?? null;
            const uptime =
              historico.length > 0
                ? Math.round(
                    (historico.filter((c) => c.online).length / historico.length) * 100
                  )
                : null;

            return (
              <div key={s.id} className="bg-panel-2 border border-line rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">{s.nome}</p>
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      online === null
                        ? "bg-text-dim"
                        : online
                        ? "bg-accent status-pulse"
                        : "bg-danger status-pulse"
                    }`}
                  />
                </div>
                <p className="text-xs text-text-dim font-mono mb-3">
                  {s.host}
                  {s.porta ? `:${s.porta}` : ""} · {s.tipo.toUpperCase()}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-text-dim">Status</p>
                    <p className={online ? "text-accent" : online === false ? "text-danger" : "text-text-dim"}>
                      {online === null ? "sem dados" : online ? "online" : "offline"}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-dim">Uptime 24h</p>
                    <p>{uptime === null ? "—" : `${uptime}%`}</p>
                  </div>
                  <div>
                    <p className="text-text-dim">Resposta</p>
                    <p>{ultimo?.tempo_resposta_ms ? `${ultimo.tempo_resposta_ms}ms` : "—"}</p>
                  </div>
                  <div>
                    <p className="text-text-dim">SSL</p>
                    <p>
                      {ultimo?.ssl_dias_restantes != null
                        ? `${ultimo.ssl_dias_restantes}d`
                        : "—"}
                    </p>
                  </div>
                </div>

                <form action={removerServidor} className="mt-3">
                  <input type="hidden" name="id" value={s.id} />
                  <button className="text-xs font-mono px-2 py-1 rounded border border-line hover:border-danger hover:text-danger">
                    Remover
                  </button>
                </form>
              </div>
            );
          })}
          {(servidores ?? []).length === 0 && (
            <p className="text-text-dim text-sm">Nenhum servidor cadastrado ainda.</p>
          )}
        </div>

        <details className="bg-panel-2 border border-line rounded-lg p-4">
          <summary className="font-mono text-xs text-text-dim uppercase tracking-wider cursor-pointer select-none">
            + Novo servidor
          </summary>
          <form action={criarServidor} className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-4">
            <input
              name="nome"
              required
              placeholder="Nome (ex: AD, Tasy, Guacamole)"
              className="sm:col-span-2 bg-bg border border-line rounded px-3 py-2 text-sm"
            />
            <select
              name="tipo"
              defaultValue="tcp"
              className="bg-bg border border-line rounded px-3 py-2 text-sm text-text-dim"
            >
              <option value="tcp">TCP (porta)</option>
              <option value="http">HTTP/HTTPS</option>
            </select>
            <input
              name="porta"
              type="number"
              placeholder="Porta (ex: 443, 3389)"
              className="bg-bg border border-line rounded px-3 py-2 text-sm"
            />
            <input
              name="host"
              required
              placeholder="Host ou IP (ex: 10.20.0.5)"
              className="sm:col-span-2 bg-bg border border-line rounded px-3 py-2 text-sm"
            />
            <input
              name="url"
              placeholder="URL completa (só se HTTP, ex: https://tasy.hospital.local)"
              className="sm:col-span-2 bg-bg border border-line rounded px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="sm:col-span-4 bg-accent text-bg font-semibold text-sm rounded py-2"
            >
              Criar servidor
            </button>
          </form>
        </details>
      </main>
    </>
  );
}
