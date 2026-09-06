import { supabase } from "./supabase";

/* =====================================================
   OBTENER NOTIFICACIONES
===================================================== */

export async function obtenerNotificaciones() {
  const { data, error } = await supabase
    .from("notificaciones")
    .select(`
      id,
      trabajador_id,
      tipo,
      titulo,
      mensaje,
      leida,
      fecha_turno,
      created_at
    `)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "❌ Error obteniendo notificaciones:",
      error
    );

    throw error;
  }

  return data || [];
}


/* =====================================================
   OBTENER SOLO NOTIFICACIONES DE HORARIO
===================================================== */

export async function obtenerNotificacionesHorario() {
  const { data, error } = await supabase
    .from("notificaciones")
    .select(`
      id,
      trabajador_id,
      tipo,
      titulo,
      mensaje,
      leida,
      fecha_turno,
      created_at
    `)
    .eq("tipo", "horario")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "❌ Error obteniendo notificaciones de horario:",
      error
    );

    throw error;
  }

  return data || [];
}


/* =====================================================
   OBTENER NOTIFICACIONES NO LEÍDAS
===================================================== */

export async function obtenerNotificacionesNoLeidas() {
  const { data, error } = await supabase
    .from("notificaciones")
    .select(`
      id,
      trabajador_id,
      tipo,
      titulo,
      mensaje,
      leida,
      fecha_turno,
      created_at
    `)
    .eq("leida", false)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "❌ Error obteniendo notificaciones no leídas:",
      error
    );

    throw error;
  }

  return data || [];
}


/* =====================================================
   CONTAR NOTIFICACIONES NO LEÍDAS
===================================================== */

export async function contarNotificacionesNoLeidas() {
  const { count, error } = await supabase
    .from("notificaciones")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("leida", false);

  if (error) {
    console.error(
      "❌ Error contando notificaciones:",
      error
    );

    throw error;
  }

  return count || 0;
}


/* =====================================================
   CREAR NOTIFICACIÓN DE HORARIO
===================================================== */

export async function crearNotificacionHorario({
  trabajadorId = null,
  fechaTurno = null,
  tipo = null,
  nombreTrabajador = null,
} = {}) {

  /* -----------------------------------------------------
     VALIDAR TRABAJADOR
  ----------------------------------------------------- */

  if (!trabajadorId) {
    throw new Error(
      "Falta el user_id del trabajador."
    );
  }

  const trabajadorUUID =
    String(trabajadorId).trim();

  if (!trabajadorUUID) {
    throw new Error(
      "El user_id del trabajador no es válido."
    );
  }


  /* -----------------------------------------------------
     OBTENER SESIÓN ACTUAL
  ----------------------------------------------------- */

  const {
    data: sesionData,
    error: errorSesion,
  } = await supabase.auth.getSession();

  if (errorSesion) {
    console.error(
      "❌ Error obteniendo la sesión:",
      errorSesion
    );

    throw errorSesion;
  }

  const sesion =
    sesionData?.session;

  const usuarioActual =
    sesion?.user;

  if (!usuarioActual) {
    console.error(
      "❌ No existe una sesión autenticada."
    );

    throw new Error(
      "No hay una sesión autenticada. Inicia sesión nuevamente."
    );
  }


  /* -----------------------------------------------------
     INFORMACIÓN DE AUTENTICACIÓN
  ----------------------------------------------------- */

  const usuarioUUID =
    String(usuarioActual.id).trim();

  const accessToken =
    sesion?.access_token;

  console.log(
    "=========================================="
  );

  console.log(
    "🔐 USUARIO AUTENTICADO:",
    usuarioUUID
  );

  console.log(
    "📧 EMAIL:",
    usuarioActual.email
  );

  console.log(
    "👤 ROL DE SESIÓN:",
    usuarioActual.role
  );

  console.log(
    "🎫 ACCESS TOKEN EXISTE:",
    !!accessToken
  );

  console.log(
    "🎯 UUID TRABAJADOR DESTINO:",
    trabajadorUUID
  );

  console.log(
    "=========================================="
  );


  /* -----------------------------------------------------
     COMPROBAR ADMINISTRADOR
  ----------------------------------------------------- */

  const ADMINISTRADOR_UUID =
    "41d3e21d-46b7-41ec-8b7d-cf53b6ef86fb";

  if (
    usuarioUUID !==
    ADMINISTRADOR_UUID
  ) {
    console.error(
      "❌ El usuario autenticado NO es el administrador."
    );

    console.error(
      "Usuario actual:",
      usuarioUUID
    );

    console.error(
      "Administrador esperado:",
      ADMINISTRADOR_UUID
    );

    throw new Error(
      "El usuario autenticado no corresponde al administrador."
    );
  }


  /* -----------------------------------------------------
     DATOS DEL TRABAJADOR
  ----------------------------------------------------- */

  const nombre =
    nombreTrabajador ||
    "Trabajador";

  let textoTurno =
    "turno de trabajo";

  if (tipo === "dia") {
    textoTurno =
      "turno de día";
  }

  if (tipo === "noche") {
    textoTurno =
      "turno de noche";
  }


  /* -----------------------------------------------------
     MENSAJE
  ----------------------------------------------------- */

  const mensaje = fechaTurno
    ? `${nombre}, la administradora te ha asignado un ${textoTurno} para el ${fechaTurno}.`
    : `${nombre}, la administradora ha actualizado tu horario de trabajo.`;


  /* -----------------------------------------------------
     DATOS DE LA NOTIFICACIÓN
  ----------------------------------------------------- */

  const datosNotificacion = {
    trabajador_id:
      trabajadorUUID,

    tipo:
      "horario",

    titulo:
      "Nuevo horario de trabajo",

    mensaje:
      mensaje,

    leida:
      false,

    ...(fechaTurno
      ? {
          fecha_turno:
            fechaTurno,
        }
      : {}),
  };


  console.log(
    "📨 DATOS QUE SE VAN A INSERTAR:",
    datosNotificacion
  );


  /* -----------------------------------------------------
     INSERTAR NOTIFICACIÓN
     
     IMPORTANTE:
     NO usamos .select() aquí.
     
     El administrador puede INSERTAR,
     pero la política SELECT solamente
     permite al trabajador ver su propia
     notificación.
  ----------------------------------------------------- */

  const {
    error,
  } = await supabase
    .from("notificaciones")
    .insert([
      datosNotificacion,
    ]);


  /* -----------------------------------------------------
     MANEJO DEL ERROR
  ----------------------------------------------------- */

  if (error) {

    console.error(
      "=========================================="
    );

    console.error(
      "❌ ERROR CREANDO NOTIFICACIÓN"
    );

    console.error(
      "Código:",
      error.code
    );

    console.error(
      "Mensaje:",
      error.message
    );

    console.error(
      "Detalles:",
      error.details
    );

    console.error(
      "Hint:",
      error.hint
    );

    console.error(
      "👤 Usuario autenticado:",
      usuarioUUID
    );

    console.error(
      "🎯 Trabajador destino:",
      trabajadorUUID
    );

    console.error(
      "📨 Datos enviados:",
      datosNotificacion
    );

    console.error(
      "=========================================="
    );

    throw error;
  }


  /* -----------------------------------------------------
     ÉXITO
  ----------------------------------------------------- */

  console.log(
    "=========================================="
  );

  console.log(
    "✅ NOTIFICACIÓN CREADA CORRECTAMENTE"
  );

  console.log(
    "👤 Trabajador:",
    trabajadorUUID
  );

  console.log(
    "📅 Fecha:",
    fechaTurno
  );

  console.log(
    "📌 Tipo:",
    tipo
  );

  console.log(
    "=========================================="
  );


  return {
    ...datosNotificacion,
  };
}


/* =====================================================
   MARCAR NOTIFICACIÓN COMO LEÍDA
===================================================== */

export async function marcarNotificacionLeida(
  notificacionId
) {

  if (!notificacionId) {
    throw new Error(
      "Falta el ID de la notificación."
    );
  }

  const {
    data,
    error,
  } = await supabase
    .from("notificaciones")
    .update({
      leida: true,
    })
    .eq(
      "id",
      notificacionId
    )
    .select(`
      id,
      trabajador_id,
      tipo,
      titulo,
      mensaje,
      leida,
      fecha_turno,
      created_at
    `)
    .single();

  if (error) {
    console.error(
      "❌ Error marcando notificación como leída:",
      error
    );

    throw error;
  }

  return data;
}


/* =====================================================
   MARCAR TODAS COMO LEÍDAS
===================================================== */

export async function marcarTodasComoLeidas() {

  const {
    data,
    error,
  } = await supabase
    .from("notificaciones")
    .update({
      leida: true,
    })
    .eq(
      "leida",
      false
    )
    .select(`
      id,
      trabajador_id,
      tipo,
      titulo,
      mensaje,
      leida,
      fecha_turno,
      created_at
    `);

  if (error) {
    console.error(
      "❌ Error marcando todas las notificaciones:",
      error
    );

    throw error;
  }

  return data || [];
}


/* =====================================================
   ELIMINAR NOTIFICACIÓN
===================================================== */

export async function eliminarNotificacion(
  notificacionId
) {

  if (!notificacionId) {
    throw new Error(
      "Falta el ID de la notificación."
    );
  }

  const {
    error,
  } = await supabase
    .from("notificaciones")
    .delete()
    .eq(
      "id",
      notificacionId
    );

  if (error) {
    console.error(
      "❌ Error eliminando notificación:",
      error
    );

    throw error;
  }

  return true;
}


/* =====================================================
   CONFIRMAR RECEPCIÓN DE HORARIO
===================================================== */

export async function confirmarRecepcionHorario({

  trabajadorId,

  notificacionId,

  fechaInicio,

  fechaFin,

}) {

  /* -----------------------------------------------------
     VALIDACIONES
  ----------------------------------------------------- */

  if (!trabajadorId) {
    throw new Error(
      "Falta el ID del trabajador"
    );
  }

  if (!notificacionId) {
    throw new Error(
      "Falta el ID de la notificación"
    );
  }

  if (!fechaInicio || !fechaFin) {
    throw new Error(
      "Falta la fecha del horario"
    );
  }


  /* -----------------------------------------------------
     NORMALIZAR UUID
  ----------------------------------------------------- */

  const idNotificacion =
    String(notificacionId).trim();


  /* -----------------------------------------------------
     COMPROBAR SI YA ESTÁ CONFIRMADA
  ----------------------------------------------------- */

  const {
    data: existente,
    error: errorExistente,
  } = await supabase
    .from("obra_confirmaciones_horario")
    .select(`
      id,
      trabajador_id,
      confirmado,
      confirmado_at,
      fecha_inicio,
      fecha_fin,
      notificacion_id
    `)
    .eq(
      "trabajador_id",
      trabajadorId
    )
    .eq(
      "notificacion_id",
      idNotificacion
    )
    .eq(
      "confirmado",
      true
    )
    .limit(1);

  if (errorExistente) {
    console.error(
      "❌ Error comprobando confirmación existente:",
      errorExistente
    );

    throw errorExistente;
  }

  if (
    existente &&
    existente.length > 0
  ) {

    console.log(
      "ℹ️ Esta notificación ya estaba confirmada:",
      existente[0]
    );

    return existente[0];
  }


  /* -----------------------------------------------------
     CREAR CONFIRMACIÓN
  ----------------------------------------------------- */

  const {
    data,
    error,
  } = await supabase
    .from("obra_confirmaciones_horario")
    .insert({
      trabajador_id:
        trabajadorId,

      notificacion_id:
        idNotificacion,

      confirmado:
        true,

      confirmado_at:
        new Date().toISOString(),

      fecha_inicio:
        fechaInicio,

      fecha_fin:
        fechaFin,
    })
    .select()
    .single();

  if (error) {
    console.error(
      "❌ Error confirmando recepción del horario:",
      error
    );

    throw error;
  }

  console.log(
    "✅ Horario confirmado correctamente:",
    data
  );

  return data;
}


/* =====================================================
   OBTENER CONFIRMACIONES DE UN TRABAJADOR
===================================================== */

export async function obtenerConfirmacionesTrabajador(
  trabajadorId
) {

  if (!trabajadorId) {
    return [];
  }

  const {
    data,
    error,
  } = await supabase
    .from("obra_confirmaciones_horario")
    .select(`
      id,
      trabajador_id,
      confirmado,
      confirmado_at,
      fecha_inicio,
      fecha_fin,
      notificacion_id
    `)
    .eq(
      "trabajador_id",
      trabajadorId
    )
    .eq(
      "confirmado",
      true
    )
    .order(
      "confirmado_at",
      {
        ascending: false,
      }
    );

  if (error) {
    console.error(
      "❌ Error obteniendo confirmaciones del trabajador:",
      error
    );

    throw error;
  }

  return data || [];
}


/* =====================================================
   OBTENER CONFIRMACIONES DEL HORARIO
===================================================== */

export async function obtenerConfirmacionesHorario({

  fechaInicio,

  fechaFin,

}) {

  if (!fechaInicio || !fechaFin) {
    throw new Error(
      "Se necesitan fechaInicio y fechaFin."
    );
  }

  const {
    data,
    error,
  } = await supabase
    .from("obra_confirmaciones_horario")
    .select(`
      id,
      trabajador_id,
      confirmado_at,
      confirmado,
      fecha_inicio,
      fecha_fin,
      notificacion_id
    `)
    .gte(
      "fecha_inicio",
      fechaInicio
    )
    .lte(
      "fecha_fin",
      fechaFin
    )
    .order(
      "confirmado_at",
      {
        ascending: false,
      }
    );

  if (error) {
    console.error(
      "❌ Error obteniendo confirmaciones:",
      error
    );

    throw error;
  }

  return data || [];
}


/* =====================================================
   ESCUCHAR NUEVAS NOTIFICACIONES EN TIEMPO REAL
===================================================== */

export function suscribirseANotificaciones(
  onNuevaNotificacion
) {

  if (
    typeof onNuevaNotificacion !==
    "function"
  ) {

    throw new Error(
      "Debes proporcionar una función para recibir la notificación."
    );
  }


  const canal =
    supabase
      .channel(
        "notificaciones-en-tiempo-real"
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notificaciones",
        },
        (payload) => {

          console.log(
            "🔔 Nueva notificación recibida:",
            payload.new
          );

          onNuevaNotificacion(
            payload.new
          );
        }
      )
      .subscribe((status) => {

        console.log(
          "📡 Estado canal notificaciones:",
          status
        );

      });


  return () => {

    supabase.removeChannel(
      canal
    );

  };
}