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
   CREAR NOTIFICACIÓN DE HORARIO AGRUPADA
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


  if (!fechaTurno) {
    throw new Error(
      "Falta la fecha del turno."
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


  /* -----------------------------------------------------
     LLAMAR FUNCIÓN SEGURA DE SUPABASE

     La función:

     - Crea una notificación si no existe una pendiente.
     - Reutiliza la notificación pendiente.
     - Evita una notificación independiente por cada día.
  ----------------------------------------------------- */

  console.log(
    "🔔 Creando/actualizando notificación agrupada..."
  );

  console.log(
    "👤 Trabajador:",
    nombre
  );

  console.log(
    "🆔 UUID:",
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


  const {
    data,
    error,
  } = await supabase.rpc(
    "crear_notificacion_horario_agrupada",
    {
      p_trabajador_id:
        trabajadorUUID,

      p_fecha_turno:
        fechaTurno,

      p_tipo:
        tipo,

      p_nombre_trabajador:
        nombre,
    }
  );


  /* -----------------------------------------------------
     MANEJO DEL ERROR
  ----------------------------------------------------- */

  if (error) {

    console.error(
      "=========================================="
    );

    console.error(
      "❌ ERROR CREANDO NOTIFICACIÓN AGRUPADA"
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
      "📅 Fecha:",
      fechaTurno
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
    "✅ NOTIFICACIÓN AGRUPADA CREADA/ACTUALIZADA"
  );

  console.log(
    "👤 Trabajador:",
    nombre
  );

  console.log(
    "🆔 UUID:",
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
    "📦 Resultado:",
    data
  );

  console.log(
    "=========================================="
  );


  return data;
}


/* =====================================================
   MARCAR NOTIFICACIÓN COMO LEÍDA
===================================================== */

export async function marcarNotificacionLeida(
  notificacionId
) {

  /* -----------------------------------------------------
     VALIDAR ID
  ----------------------------------------------------- */

  if (!notificacionId) {

    throw new Error(
      "Falta el ID de la notificación."
    );

  }


  const id =
    String(
      notificacionId
    ).trim();


  if (!id) {

    throw new Error(
      "El ID de la notificación no es válido."
    );

  }


  console.log(
    "🔵 MARCANDO NOTIFICACIÓN COMO LEÍDA:",
    id
  );


  /* -----------------------------------------------------
     OBTENER USUARIO ACTUAL
  ----------------------------------------------------- */

  const {
    data: sesionData,
    error: errorSesion,
  } = await supabase.auth.getSession();


  if (errorSesion) {

    console.error(
      "❌ Error obteniendo sesión:",
      errorSesion
    );

    throw errorSesion;

  }


  const usuario =
    sesionData?.session?.user;


  if (!usuario) {

    throw new Error(
      "No hay una sesión autenticada."
    );

  }


  const usuarioUUID =
    String(
      usuario.id
    ).trim();


  /* -----------------------------------------------------
     ACTUALIZAR SOLAMENTE LA NOTIFICACIÓN
     DEL USUARIO ACTUAL
  ----------------------------------------------------- */

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
      id
    )

    .eq(
      "trabajador_id",
      usuarioUUID
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

    .maybeSingle();


  if (error) {

    console.error(
      "=========================================="
    );

    console.error(
      "❌ ERROR MARCANDO NOTIFICACIÓN COMO LEÍDA"
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
      "ID:",
      id
    );

    console.error(
      "Usuario:",
      usuarioUUID
    );

    console.error(
      "=========================================="
    );

    throw error;

  }


  /* -----------------------------------------------------
     COMPROBAR QUE REALMENTE SE ACTUALIZÓ
  ----------------------------------------------------- */

  if (!data) {

    console.error(
      "❌ No se encontró una notificación perteneciente al usuario."
    );

    throw new Error(
      "No se pudo marcar la notificación como leída."
    );

  }


  console.log(
    "✅ NOTIFICACIÓN MARCADA COMO LEÍDA:",
    data
  );


  return data;
}


/* =====================================================
   MARCAR TODAS COMO LEÍDAS
===================================================== */

export async function marcarTodasComoLeidas() {

  const {
    data: sesionData,
    error: errorSesion,
  } = await supabase.auth.getSession();


  if (errorSesion) {

    console.error(
      "❌ Error obteniendo sesión:",
      errorSesion
    );

    throw errorSesion;

  }


  const usuario =
    sesionData?.session?.user;


  if (!usuario) {

    throw new Error(
      "No hay una sesión autenticada."
    );

  }


  const usuarioUUID =
    String(
      usuario.id
    ).trim();


  const {
    data,
    error,
  } = await supabase

    .from("notificaciones")

    .update({
      leida: true,
    })

    .eq(
      "trabajador_id",
      usuarioUUID
    )

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
     NORMALIZAR DATOS
  ----------------------------------------------------- */

  const trabajadorIdNumerico =
    Number(trabajadorId);

  const idNotificacion =
    String(notificacionId).trim();


  if (
    !Number.isInteger(
      trabajadorIdNumerico
    ) ||
    trabajadorIdNumerico <= 0
  ) {
    throw new Error(
      "El ID numérico del trabajador no es válido."
    );
  }


  console.log(
    "=========================================="
  );

  console.log(
    "🔔 CONFIRMANDO HORARIO"
  );

  console.log(
    "🔢 Trabajador:",
    trabajadorIdNumerico
  );

  console.log(
    "🆔 Notificación:",
    idNotificacion
  );

  console.log(
    "📅 Fecha inicio:",
    fechaInicio
  );

  console.log(
    "📅 Fecha fin:",
    fechaFin
  );

  console.log(
    "=========================================="
  );


  /* -----------------------------------------------------
     OBTENER NOMBRE DEL TRABAJADOR
  ----------------------------------------------------- */

  let nombreTrabajador =
    "El trabajador";


  const {
    data: trabajador,
    error: errorTrabajador,
  } = await supabase
    .from("obra_trabajadores")
    .select("nombre")
    .eq(
      "id",
      trabajadorIdNumerico
    )
    .maybeSingle();


  if (
    !errorTrabajador &&
    trabajador?.nombre
  ) {

    nombreTrabajador =
      trabajador.nombre;
  }


  /* -----------------------------------------------------
     LLAMAR FUNCIÓN SEGURA DE SUPABASE

     Esta función:

     1. Guarda la confirmación.
     2. Crea la notificación para la administradora.
     3. Evita duplicados.
  ----------------------------------------------------- */

  const {
    data,
    error,
  } = await supabase.rpc(
    "confirmar_horario_trabajador",
    {
      p_trabajador_id:
        trabajadorIdNumerico,

      p_notificacion_id:
        idNotificacion,

      p_fecha_inicio:
        fechaInicio,

      p_fecha_fin:
        fechaFin,

      p_nombre_trabajador:
        nombreTrabajador,
    }
  );


  /* -----------------------------------------------------
     ERROR
  ----------------------------------------------------- */

  if (error) {

    console.error(
      "=========================================="
    );

    console.error(
      "❌ ERROR CONFIRMANDO HORARIO"
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
      "=========================================="
    );

    throw error;
  }


  /* -----------------------------------------------------
     RESULTADO
  ----------------------------------------------------- */

  console.log(
    "=========================================="
  );

  console.log(
    "✅ HORARIO CONFIRMADO"
  );

  console.log(
    "📨 RESPUESTA ENVIADA A LA ADMINISTRADORA"
  );

  console.log(
    "📦 Resultado:",
    data
  );

  console.log(
    "=========================================="
  );


  /* -----------------------------------------------------
     DEVOLVER CONFIRMACIÓN
  ----------------------------------------------------- */

  return data?.confirmacion || data;
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