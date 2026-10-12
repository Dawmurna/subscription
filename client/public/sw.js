self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "Subscription reminder";
  const body = data.body || "You have a subscription due soon.";

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: data.icon || "/favicon.svg",
      data: {
        url: data.url || "/dashboard",
      },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ("focus" in client) return client.focus();
        }
        if (clients.openWindow) return clients.openWindow(targetUrl);
        return null;
      })
  );
});
