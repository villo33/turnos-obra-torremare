self.addEventListener("push", function (event) {
  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch (error) {
    data = {
      title: "Torre Mare",
      body: event.data
        ? event.data.text()
        : "Tienes una nueva notificación."
    };
  }

  const title = data.title || "Torre Mare";

  const options = {
    body: data.body || "Tienes una nueva actualización.",
    icon: "/logo192.png",
    badge: "/logo192.png",
    vibrate: [200, 100, 200],
    data: {
      url: data.url || "/"
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({
      type: "window",
      includeUncontrolled: true
    }).then(function (clientList) {
      for (const client of clientList) {
        if ("focus" in client) {
          client.navigate(
            event.notification.data.url
          );

          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(
          event.notification.data.url
        );
      }
    })
  );
});
