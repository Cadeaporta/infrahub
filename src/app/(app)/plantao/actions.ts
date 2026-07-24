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

export async function definirEscala(formData: FormData) {
  const supabase = await createClient();
  const semanaInicio = formData.get("semanaInicio") as string;
  const nome = (formData.get("nome") as string) || null;
  const entrada = Number(formData.get("entrada"));
  const saida = Number(formData.get("saida"));

  await supabase
    .from("escala_semana")
    .upsert(
      { semana_inicio: semanaInicio, nome, entrada, saida, updated_at: new Date().toISOString() },
      { onConflict: "semana_inicio" }
    );

  revalidatePath("/plantao");
}
