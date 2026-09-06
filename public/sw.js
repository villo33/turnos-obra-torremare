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

  const nombre =
    nombreTrabajador ||
    "Trabajador";

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


/* =====================================================
   CONVERTIR CLAVE VAPID
===================================================== */

function urlBase64ToUint8Array(
  base64String
) {

  const padding =
    "=".repeat(
      (4 - (base64String.length % 4)) % 4
    );

  const base64 =
    (
      base64String + padding
    )
      .replace(/-/g, "+")
      .replace(/_/g, "/");

  const rawData =
    window.atob(base64);

  return Uint8Array.from(
    [...rawData].map(
      (char) =>
        char.charCodeAt(0)
    )
  );
}


/* =====================================================
   REGISTRAR SUSCRIPCIÓN PUSH DEL TELÉFONO
===================================================== */

export async function registrarSuscripcionPush() {

  try {

    console.log(
      "📲 Iniciando registro de notificaciones Push..."
    );

    /* ---------------------------------------------
       COMPROBAR SOPORTE
    --------------------------------------------- */

    if (
      typeof window === "undefined"
    ) {
      console.warn(
        "⚠️ No existe window."
      );

      return null;
    }

    if (
      !("Notification" in window)
    ) {
      console.warn(
        "⚠️ Este navegador no soporta notificaciones."
      );

      return null;
    }

    if (
      !("serviceWorker" in navigator)
    ) {
      console.warn(
        "⚠️ Este navegador no soporta Service Worker."
      );

      return null;
    }

    if (
      !("PushManager" in window)
    ) {
      console.warn(
        "⚠️ Este navegador no soporta Push API."
      );

      return null;
    }


    /* ---------------------------------------------
       OBTENER SESIÓN
    --------------------------------------------- */

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

    const sesion =
      sesionData?.session;

    const usuario =
      sesion?.user;

    if (!usuario) {
      console.warn(
        "⚠️ No hay usuario autenticado. No se registra Push."
      );

      return null;
    }

    const usuarioId =
      String(usuario.id).trim();


    /* ---------------------------------------------
       CLAVE PÚBLICA VAPID
    --------------------------------------------- */

    const vapidPublicKey =
      import.meta.env.VITE_VAPID_PUBLIC_KEY;

    if (!vapidPublicKey) {

      console.error(
        "❌ Falta VITE_VAPID_PUBLIC_KEY."
      );

      console.error(
        "Debes configurar la clave pública VAPID en el archivo .env."
      );

      return null;
    }


    /* ---------------------------------------------
       PEDIR PERMISO
    --------------------------------------------- */

    let permiso =
      Notification.permission;

    console.log(
      "🔔 Permiso actual:",
      permiso
    );

    if (
      permiso === "default"
    ) {

      permiso =
        await Notification.requestPermission();

      console.log(
        "🔔 Nuevo permiso:",
        permiso
      );
    }

    if (
      permiso !== "granted"
    ) {

      console.warn(
        "⚠️ El usuario no permitió las notificaciones."
      );

      return null;
    }


    /* ---------------------------------------------
       REGISTRAR SERVICE WORKER
    --------------------------------------------- */

    const registro =
      await navigator.serviceWorker.register(
        "/sw.js"
      );

    console.log(
      "✅ Service Worker registrado:",
      registro
    );


    await navigator.serviceWorker.ready;

    console.log(
      "✅ Service Worker listo."
    );


    /* ---------------------------------------------
       BUSCAR SUSCRIPCIÓN EXISTENTE
    --------------------------------------------- */

    let subscription =
      await registro.pushManager.getSubscription();


    /* ---------------------------------------------
       CREAR SUSCRIPCIÓN SI NO EXISTE
    --------------------------------------------- */

    if (!subscription) {

      console.log(
        "📲 Creando nueva suscripción Push..."
      );

      subscription =
        await registro.pushManager.subscribe({

          userVisibleOnly: true,

          applicationServerKey:
            urlBase64ToUint8Array(
              vapidPublicKey
            ),

        });

      console.log(
        "✅ Suscripción Push creada."
      );

    } else {

      console.log(
        "✅ Ya existe una suscripción Push."
      );
    }


    /* ---------------------------------------------
       OBTENER DATOS DE LA SUSCRIPCIÓN
    --------------------------------------------- */

    const subscriptionJSON =
      subscription.toJSON();

    const endpoint =
      subscription.endpoint;

    const p256dh =
      subscriptionJSON?.keys?.p256dh;

    const auth =
      subscriptionJSON?.keys?.auth;


    if (
      !endpoint ||
      !p256dh ||
      !auth
    ) {

      console.error(
        "❌ La suscripción Push no contiene todos los datos necesarios."
      );

      return null;
    }


    console.log(
      "📡 Endpoint Push:",
      endpoint
    );


    /* ---------------------------------------------
       COMPROBAR SI YA EXISTE EN SUPABASE
    --------------------------------------------- */

    const {
      data: existente,
      error: errorExistente,
    } = await supabase
      .from("push_subscriptions")
      .select(
        "id, user_id, endpoint"
      )
      .eq(
        "endpoint",
        endpoint
      )
      .maybeSingle();


    if (errorExistente) {

      console.error(
        "❌ Error buscando suscripción existente:",
        errorExistente
      );

      throw errorExistente;
    }


    /* ---------------------------------------------
       SI EXISTE PARA ESTE USUARIO
    --------------------------------------------- */

    if (
      existente &&
      existente.user_id === usuarioId
    ) {

      const {
        error: errorUpdate,
      } = await supabase
        .from("push_subscriptions")
        .update({
          p256dh,
          auth,
          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          existente.id
        )
        .eq(
          "user_id",
          usuarioId
        );

      if (errorUpdate) {

        console.error(
          "❌ Error actualizando suscripción Push:",
          errorUpdate
        );

        throw errorUpdate;
      }

      console.log(
        "✅ Suscripción Push actualizada."
      );

      return subscription;
    }


    /* ---------------------------------------------
       SI EXISTE PERO PERTENECE A OTRO USUARIO
    --------------------------------------------- */

    if (
      existente &&
      existente.user_id !== usuarioId
    ) {

      console.warn(
        "⚠️ El endpoint Push ya pertenece a otro usuario."
      );

      return subscription;
    }


    /* ---------------------------------------------
       INSERTAR NUEVA SUSCRIPCIÓN
    --------------------------------------------- */

    const {
      error: errorInsert,
    } = await supabase
      .from("push_subscriptions")
      .insert({

        user_id:
          usuarioId,

        endpoint:
          endpoint,

        p256dh:
          p256dh,

        auth:
          auth,

      });


    if (errorInsert) {

      console.error(
        "❌ Error guardando suscripción Push en Supabase:",
        errorInsert
      );

      throw errorInsert;
    }


    console.log(
      "=========================================="
    );

    console.log(
      "🎉 SUSCRIPCIÓN PUSH GUARDADA"
    );

    console.log(
      "👤 Usuario:",
      usuarioId
    );

    console.log(
      "📲 Endpoint:",
      endpoint
    );

    console.log(
      "=========================================="
    );

    return subscription;

  } catch (error) {

    console.error(
      "=========================================="
    );

    console.error(
      "❌ ERROR REGISTRANDO NOTIFICACIONES PUSH"
    );

    console.error(
      error
    );

    console.error(
      "=========================================="
    );

    return null;
  }
}