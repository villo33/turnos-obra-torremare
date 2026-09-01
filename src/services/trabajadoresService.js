import { supabase } from "./supabase";

export async function obtenerTrabajadores() {
  const { data, error } = await supabase
    .from("obra_trabajadores")
    .select("*")
    .order("id", { ascending: true });

  console.log("DATOS SUPABASE:", data);
  console.log("ERROR SUPABASE:", error);

  if (error) {
    throw error;
  }

  return data || [];
}