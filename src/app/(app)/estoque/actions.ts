"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function movimentarItem(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const itemId = formData.get("itemId") as string;
  const tipo = formData.get("tipo") as "retirada" | "entrada";
  const quantidade = Number(formData.get("quantidade"));
  const motivo = formData.get("motivo") as string;
  const responsavel = formData.get("responsavel") as string;

  const { data: item } = await supabase
    .from("estoque")
    .select("quantidade")
    .eq("id", itemId)
    .single();

  if (!item) return;

  const novaQuantidade =
    tipo === "retirada" ? item.quantidade - quantidade : item.quantidade + quantidade;

  await supabase.from("estoque").update({ quantidade: Math.max(0, novaQuantidade) }).eq("id", itemId);

  await supabase.from("movimentacoes").insert({
    item_id: itemId,
    usuario_id: user?.id,
    tipo,
    quantidade,
    motivo,
    responsavel,
  });

  revalidatePath("/estoque");
  revalidatePath("/dashboard");
}
