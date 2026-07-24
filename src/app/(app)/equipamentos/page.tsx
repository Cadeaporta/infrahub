import { createClient } from "@/lib/supabase/server";
import TopBar from "@/components/TopBar";
import { criarEquipamento } from "./actions";

export default async function EquipamentosPage() {
  const supabase = await createClient();
  const { data: equipamentos } = await supabase
    .from("equipamentos")
    .select("*")
    .order("nome", { ascending: true });

  return (
    <>
      <TopBar title="Equipamentos" />
      <main className="flex-1 p-6 space-y-6 overflow-y-auto">
        <details className="bg-panel-2 border border-line rounded-lg p-4">
          <summary className="font-mono text-xs text-text-dim uppercase tracking-wider cursor-pointer select-none">
            + Novo equipamento
          </summary>
          <form action={criarEquipamento} className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
            <input name="nome" required placeholder="Nome (ex: PC-AMB-014)" className="bg-bg border border-line rounded px-3 py-2 text-sm" />
            <input name="patrimonio" placeholder="Patrimônio" className="bg-bg border border-line rounded px-3 py-2 text-sm" />
            <input name="usuario" placeholder="Usuário" className="bg-bg border border-line rounded px-3 py-2 text-sm" />
            <input name="ip" placeholder="IP" className="bg-bg border border-line rounded px-3 py-2 text-sm" />
            <input name="mac" placeholder="MAC" className="bg-bg border border-line rounded px-3 py-2 text-sm" />
            <input name="sistema" placeholder="Sistema (ex: Windows 11)" className="bg-bg border border-line rounded px-3 py-2 text-sm" />
            <select name="status" defaultValue="ativo" className="bg-bg border border-line rounded px-3 py-2 text-sm text-text-dim">
              <option value="ativo">Ativo</option>
              <option value="manutencao">Manutenção</option>
              <option value="inativo">Inativo</option>
            </select>
            <button type="submit" className="sm:col-span-3 bg-accent text-bg font-semibold text-sm rounded py-2">
              Criar equipamento
            </button>
          </form>
        </details>

        {(equipamentos ?? []).length === 0 ? (
          <div className="bg-panel-2 border border-line rounded-lg p-8 text-center">
            <p className="text-text-dim text-sm">
              Nenhum equipamento cadastrado ainda. Use o formulário acima pra começar.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-left text-text-dim border-b border-line font-mono text-xs uppercase">
                  <th className="py-2 pr-4">Patrimônio</th>
                  <th className="py-2 pr-4">Nome</th>
                  <th className="py-2 pr-4">Usuário</th>
                  <th className="py-2 pr-4">IP</th>
                  <th className="py-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {equipamentos!.map((eq) => (
                  <tr key={eq.id} className="border-b border-line last:border-0">
                    <td className="py-2 pr-4 font-mono text-text-dim">{eq.patrimonio}</td>
                    <td className="py-2 pr-4">{eq.nome}</td>
                    <td className="py-2 pr-4">{eq.usuario ?? "—"}</td>
                    <td className="py-2 pr-4 font-mono text-text-dim">{eq.ip ?? "—"}</td>
                    <td className="py-2 pr-4">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          eq.status === "ativo"
                            ? "bg-accent-dim/20 text-accent"
                            : "bg-danger/20 text-danger"
                        }`}
                      >
                        {eq.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}
