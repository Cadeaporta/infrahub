"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function criarAviso(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const titulo = formData.get("titulo") as string;
  const mensagem = formData.get("mensagem") as string;

  let autorNome = user?.email ?? "Anônimo";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle();
    if (profile?.full_name) autorNome = profile.full_name;
  }

  await supabase.from("avisos").insert({
    titulo,
    mensagem,
    autor_id: user?.id,
    autor_nome: autorNome,
  });

  revalidatePath("/avisos");
  revalidatePath("/dashboard");
}
