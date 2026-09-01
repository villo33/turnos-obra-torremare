import { supabase } from "./supabase";

/* =====================================================
   OBTENER TODOS LOS TURNOS
===================================================== */

export async function obtenerTurnos() {
  const { data, error } = await supabase
    .from("obra_turnos")
    .select(`
      id,
      trabajador_id,
      fecha,
      tipo,
      created_at,
      obra_trabajadores (
        id,
        nombre,
        cargo
      )
    `)
    .order("fecha", {
      ascending: true,
    });

  if (error) {
    console.error(
      "Error obteniendo turnos:",
      error
    );

    throw error;
  }

  return data || [];
}


/* =====================================================
   CREAR TURNO
===================================================== */

export async function crearTurno(turno) {
  const { data, error } = await supabase
    .from("obra_turnos")
    .insert([
      {
        trabajador_id:
          turno.trabajador_id,

        fecha:
          turno.fecha,

        tipo:
          turno.tipo,
      },
    ])
    .select(`
      id,
      trabajador_id,
      fecha,
      tipo,
      created_at,
      obra_trabajadores (
        id,
        nombre,
        cargo
      )
    `)
    .single();

  if (error) {
    console.error(
      "Error creando turno:",
      error
    );

    throw error;
  }

  return data;
}


/* =====================================================
   ACTUALIZAR TURNO
===================================================== */

export async function actualizarTurno(
  id,
  cambios
) {
  const { data, error } = await supabase
    .from("obra_turnos")
    .update({
      tipo: cambios.tipo,
    })
    .eq("id", id)
    .select(`
      id,
      trabajador_id,
      fecha,
      tipo,
      created_at,
      obra_trabajadores (
        id,
        nombre,
        cargo
      )
    `)
    .single();

  if (error) {
    console.error(
      "Error actualizando turno:",
      error
    );

    throw error;
  }

  return data;
}


/* =====================================================
   ELIMINAR TURNO
===================================================== */

export async function eliminarTurno(id) {
  const { error } = await supabase
    .from("obra_turnos")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(
      "Error eliminando turno:",
      error
    );

    throw error;
  }

  return true;
}