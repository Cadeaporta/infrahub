"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function criarServidor(formData: FormData) {
  const supabase = await createClient();
  const nome = formData.get("nome") as string;
  const tipo = formData.get("tipo") as "http" | "tcp";
  const host = formData.get("host") as string;
  const porta = formData.get("porta") ? Number(formData.get("porta")) : null;
  const url = (formData.get("url") as string) || null;

  await supabase.from("servidores").insert({ nome, tipo, host, porta, url });
  revalidatePath("/servidores");
  revalidatePath("/tv");
}

export async function removerServidor(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  await supabase.from("servidores").delete().eq("id", id);
  revalidatePath("/servidores");
  revalidatePath("/tv");
}
