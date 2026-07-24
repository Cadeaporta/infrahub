"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") throw new Error("Apenas admins podem fazer isso.");
  return supabase;
}

export async function alterarRole(formData: FormData) {
  const supabase = await requireAdmin();
  const userId = formData.get("userId") as string;
  const novaRole = formData.get("role") as "admin" | "tecnico";
  await supabase.from("profiles").update({ role: novaRole }).eq("id", userId);
  revalidatePath("/admin");
}

export async function alterarStatus(formData: FormData) {
  const supabase = await requireAdmin();
  const userId = formData.get("userId") as string;
  const ativo = formData.get("ativo") === "true";
  await supabase.from("profiles").update({ ativo }).eq("id", userId);
  revalidatePath("/admin");
}

export async function reverterMovimentacao(formData: FormData) {
  const supabase = await requireAdmin();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const movId = formData.get("movId") as string;

  const { data: mov } = await supabase
    .from("movimentacoes")
    .select("*")
    .eq("id", movId)
    .single();

  if (!mov || mov.revertida) return;

  const { data: item } = await supabase
    .from("estoque")
    .select("quantidade")
    .eq("id", mov.item_id)
    .single();

  if (!item) return;

  // Desfaz o efeito original: retirada devolve, entrada remove
  const quantidadeCorrigida =
    mov.tipo === "retirada" ? item.quantidade + mov.quantidade : item.quantidade - mov.quantidade;

  await supabase
    .from("estoque")
    .update({ quantidade: Math.max(0, quantidadeCorrigida) })
    .eq("id", mov.item_id);

  await supabase
    .from("movimentacoes")
    .update({ revertida: true, revertida_por: user?.id, revertida_em: new Date().toISOString() })
    .eq("id", movId);

  revalidatePath("/admin");
  revalidatePath("/estoque");
  revalidatePath("/dashboard");
}

export async function excluirAviso(formData: FormData) {
  const supabase = await requireAdmin();
  const avisoId = formData.get("avisoId") as string;
  await supabase.from("avisos").delete().eq("id", avisoId);
  revalidatePath("/admin");
  revalidatePath("/avisos");
  revalidatePath("/dashboard");
}

export async function atualizarChamados(formData: FormData) {
  const supabase = await requireAdmin();
  const abertos = Number(formData.get("abertos"));
  const incidentes = Number(formData.get("incidentes"));
  const resolvidos_hoje = Number(formData.get("resolvidos_hoje"));

  const { data: existente } = await supabase
    .from("chamados_resumo")
    .select("id")
    .order("atualizado_em", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existente) {
    await supabase
      .from("chamados_resumo")
      .update({ abertos, incidentes, resolvidos_hoje, atualizado_em: new Date().toISOString() })
      .eq("id", existente.id);
  } else {
    await supabase.from("chamados_resumo").insert({ abertos, incidentes, resolvidos_hoje });
  }

  revalidatePath("/admin");
  revalidatePath("/dashboard");
}
