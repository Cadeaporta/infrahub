import { createClient } from "@/lib/supabase/server";
import TopBar from "@/components/TopBar";

export default async function EquipamentosPage() {
  const supabase = await createClient();
  const { data: equipamentos } = await supabase
    .from("equipamentos")
    .select("*")
    .order("nome", { ascending: true });

  return (
    <>
      <TopBar title="Equipamentos" />
      <main className="flex-1 p-6 overflow-y-auto">
        {(equipamentos ?? []).length === 0 ? (
          <div className="bg-panel-2 border border-line rounded-lg p-8 text-center">
            <p className="text-text-dim text-sm">
              Nenhum equipamento cadastrado ainda. Cadastre PCs, notebooks e monitores
              com patrimônio, usuário, IP e histórico de manutenção.
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
