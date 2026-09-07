/* =====================================================
   TORRE MARE - SERVICE WORKER
   NOTIFICACIONES PUSH
===================================================== */

self.addEventListener("install", (event) => {
  console.log("✅ Service Worker instalado");

  self.skipWaiting();
});


self.addEventListener("activate", (event) => {
  console.log("✅ Service Worker activado");

  event.waitUntil(
    self.clients.claim()
  );
});


/* =====================================================
   RECIBIR NOTIFICACIÓN PUSH
===================================================== */

self.addEventListener("push", (event) => {

  console.log("📨 PUSH RECIBIDO");

  let data = {};

  try {

    data = event.data
      ? event.data.json()
      : {};

  } catch (error) {

    console.error(
      "❌ Error leyendo datos del Push:",
      error
    );

    data = {
      title: "Torre Mare",
      body: event.data
        ? event.data.text()
        : "Tienes una nueva notificación."
    };

  }


  const title =
    data.title ||
    "Torre Mare";


  const options = {

    body:
      data.body ||
      "Tienes una nueva actualización.",

    icon:
      "/logo192.png",

    badge:
      "/logo192.png",

    vibrate: [
      200,
      100,
      200
    ],

    data: {

      url:
        data.url ||
        "/"

    }

  };


  event.waitUntil(

    self.registration.showNotification(
      title,
      options
    )

  );

});


/* =====================================================
   CLICK EN LA NOTIFICACIÓN
===================================================== */

self.addEventListener(
  "notificationclick",
  (event) => {

    console.log(
      "👆 Notificación pulsada"
    );

    event.notification.close();


    const url =
      event.notification?.data?.url ||
      "/";


    event.waitUntil(

      self.clients
        .matchAll({

          type: "window",

          includeUncontrolled: true

        })

        .then((clientList) => {

          for (
            const client of clientList
          ) {

            if (
              "focus" in client
            ) {

              client.navigate(url);

              return client.focus();

            }

          }


          if (
            self.clients.openWindow
          ) {

            return self.clients.openWindow(
              url
            );

          }

        })

    );

  }
);