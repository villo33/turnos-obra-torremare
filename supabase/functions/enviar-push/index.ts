import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import webpush from "npm:web-push";

const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY");
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY");
const VAPID_EMAIL =
  Deno.env.get("VAPID_EMAIL") || "mailto:admin@torremare.com";

if (!VAPID_PUBLIC_KEY) {
  throw new Error("Falta VAPID_PUBLIC_KEY");
}

if (!VAPID_PRIVATE_KEY) {
  throw new Error("Falta VAPID_PRIVATE_KEY");
}

webpush.setVapidDetails(
  VAPID_EMAIL,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

console.log("🚀 Función enviar-push iniciada");

export default {
  fetch: withSupabase(
    { auth: ["publishable", "secret"] },
    async (req, ctx) => {
      try {
        if (req.method !== "POST") {
          return Response.json(
            {
              success: false,
              error: "Método no permitido",
            },
            { status: 405 }
          );
        }

        const body = await req.json();

        const {
          user_id,
          title,
          message,
          url,
        } = body;

        if (!user_id) {
          return Response.json(
            {
              success: false,
              error: "Falta user_id",
            },
            { status: 400 }
          );
        }

        console.log("📲 Buscando suscripciones para:", user_id);

        const { data: subscriptions, error } =
          await ctx.supabaseAdmin
            .from("push_subscriptions")
            .select("id, endpoint, p256dh, auth")
            .eq("user_id", user_id);

        if (error) {
          console.error(
            "❌ Error buscando suscripciones:",
            error
          );

          return Response.json(
            {
              success: false,
              error: error.message,
            },
            { status: 500 }
          );
        }

        if (!subscriptions || subscriptions.length === 0) {
          return Response.json({
            success: false,
            sent: 0,
            message:
              "El usuario no tiene suscripciones Push registradas",
          });
        }

        const payload = JSON.stringify({
          title: title || "Torre Mare",
          body:
            message ||
            "Tienes una nueva notificación.",
          url: url || "/",
        });

        let enviados = 0;
        let errores = 0;

        for (const subscriptionData of subscriptions) {
          try {
            const subscription = {
              endpoint: subscriptionData.endpoint,
              keys: {
                p256dh: subscriptionData.p256dh,
                auth: subscriptionData.auth,
              },
            };

            await webpush.sendNotification(
              subscription,
              payload
            );

            enviados++;

            console.log(
              "✅ Push enviado:",
              subscriptionData.id
            );
          } catch (pushError) {
            errores++;

            console.error(
              "❌ Error enviando Push:",
              pushError
            );

            const errorCode =
              typeof pushError === "object" &&
              pushError !== null &&
              "statusCode" in pushError
                ? pushError.statusCode
                : null;

            if (
              errorCode === 404 ||
              errorCode === 410
            ) {
              await ctx.supabaseAdmin
                .from("push_subscriptions")
                .delete()
                .eq("id", subscriptionData.id);
            }
          }
        }

        return Response.json({
          success: enviados > 0,
          sent: enviados,
          errors: errores,
          total: subscriptions.length,
          message:
            enviados > 0
              ? "Notificación enviada correctamente"
              : "No se pudo enviar la notificación",
        });
      } catch (error) {
        console.error(
          "❌ Error general enviando Push:",
          error
        );

        return Response.json(
          {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : String(error),
          },
          { status: 500 }
        );
      }
    }
  ),
};
