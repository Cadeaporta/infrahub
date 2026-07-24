"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function definirPlantonista(formData: FormData) {
  const supabase = await createClient();
  const data = formData.get("data") as string;
  const nome = (formData.get("nome") as string).trim();

  if (!nome) {
    await supabase.from("plantoes").delete().eq("data", data);
  } else {
    await supabase.from("plantoes").upsert({ data, nome }, { onConflict: "data" });
  }

  revalidatePath("/plantao");
}

export async function adicionarMembroEscala(formData: FormData) {
  const supabase = await createClient();
  const nome = (formData.get("nome") as string).trim();
  const entrada = Number(formData.get("entrada"));
  if (!nome) return;
  await supabase.from("escala_equipe").insert({ nome, entrada });
  revalidatePath("/plantao");
}

export async function editarMembroEscala(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const nome = (formData.get("nome") as string).trim();
  const entrada = Number(formData.get("entrada"));
  await supabase.from("escala_equipe").update({ nome, entrada }).eq("id", id);
  revalidatePath("/plantao");
}

export async function removerMembroEscala(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  await supabase.from("escala_equipe").delete().eq("id", id);
  revalidatePath("/plantao");
}
