"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function criarEquipamento(formData: FormData) {
  const supabase = await createClient();

  const patrimonio = (formData.get("patrimonio") as string) || null;
  const nome = formData.get("nome") as string;
  const usuario = (formData.get("usuario") as string) || null;
  const ip = (formData.get("ip") as string) || null;
  const mac = (formData.get("mac") as string) || null;
  const sistema = (formData.get("sistema") as string) || null;
  const status = (formData.get("status") as string) || "ativo";

  await supabase.from("equipamentos").insert({
    patrimonio,
    nome,
    usuario,
    ip,
    mac,
    sistema,
    status,
  });

  revalidatePath("/equipamentos");
}
