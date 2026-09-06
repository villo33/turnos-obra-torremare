import { supabase } from "./supabase";

// =====================================================
// CONVERTIR CLAVE VAPID PÚBLICA
// =====================================================

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);

  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);

  return Uint8Array.from(
    [...rawData].map((char) => char.charCodeAt(0))
  );
}


// =====================================================
// REGISTRAR SERVICE WORKER
// =====================================================

export async function registrarServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    console.warn("❌ Este navegador no soporta Service Worker");
    return null;
  }

  try {
    const registro = await navigator.serviceWorker.register("/sw.js");

    console.log("✅ Service Worker registrado:", registro);

    return registro;
  } catch (error) {
    console.error(
      "❌ Error registrando Service Worker:",
      error
    );

    return null;
  }
}


// =====================================================
// SOLICITAR PERMISO DE NOTIFICACIONES
// =====================================================

export async function solicitarPermisoNotificaciones() {
  if (!("Notification" in window)) {
    console.warn(
      "❌ Este navegador no soporta notificaciones"
    );

    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission === "denied") {
    console.warn(
      "⚠️ Las notificaciones están bloqueadas en el navegador"
    );

    return false;
  }

  const permiso = await Notification.requestPermission();

  console.log(
    "🔔 Permiso de notificaciones:",
    permiso
  );

  return permiso === "granted";
}


// =====================================================
// ACTIVAR PUSH
// =====================================================

export async function activarNotificacionesPush() {
  try {
    const {
      data: { session },
      error: sessionError
    } = await supabase.auth.getSession();

    if (sessionError) {
      throw sessionError;
    }

    if (!session?.user?.id) {
      console.warn(
        "⚠️ No hay usuario autenticado"
      );

      return null;
    }

    const userId = session.user.id;

    // -------------------------------------------------
    // Registrar Service Worker
    // -------------------------------------------------

    const registro =
      await registrarServiceWorker();

    if (!registro) {
      return null;
    }

    // -------------------------------------------------
    // Solicitar permiso
    // -------------------------------------------------

    const permiso =
      await solicitarPermisoNotificaciones();

    if (!permiso) {
      return null;
    }

    // -------------------------------------------------
    // Obtener VAPID PUBLIC KEY
    // -------------------------------------------------

    const vapidPublicKey =
      import.meta.env.VITE_VAPID_PUBLIC_KEY;

    if (!vapidPublicKey) {
      console.error(
        "❌ Falta VITE_VAPID_PUBLIC_KEY"
      );

      return null;
    }

    // -------------------------------------------------
    // Obtener Push Manager
    // -------------------------------------------------

    let subscription =
      await registro.pushManager.getSubscription();

    // -------------------------------------------------
    // Crear suscripción si no existe
    // -------------------------------------------------

    if (!subscription) {
      subscription =
        await registro.pushManager.subscribe({
          userVisibleOnly: true,

          applicationServerKey:
            urlBase64ToUint8Array(
              vapidPublicKey
            )
        });
    }

    console.log(
      "✅ Suscripción Push obtenida:",
      subscription
    );

    // -------------------------------------------------
    // Convertir suscripción
    // -------------------------------------------------

    const subscriptionJson =
      subscription.toJSON();

    const endpoint =
      subscriptionJson.endpoint;

    const p256dh =
      subscriptionJson.keys?.p256dh;

    const auth =
      subscriptionJson.keys?.auth;

    if (
      !endpoint ||
      !p256dh ||
      !auth
    ) {
      throw new Error(
        "La suscripción Push no contiene las claves necesarias."
      );
    }

    // -------------------------------------------------
    // Guardar en Supabase
    // -------------------------------------------------

    const { data, error } =
      await supabase
        .from("push_subscriptions")
        .upsert(
          {
            user_id: userId,
            endpoint,
            p256dh,
            auth,
            updated_at: new Date().toISOString()
          },
          {
            onConflict: "endpoint"
          }
        )
        .select()
        .single();

    if (error) {
      throw error;
    }

    console.log(
      "✅ Suscripción Push guardada en Supabase:",
      data
    );

    return data;

  } catch (error) {

    console.error(
      "❌ Error activando notificaciones Push:",
      error
    );

    return null;
  }
}