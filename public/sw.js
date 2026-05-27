self.addEventListener("push", event => {
  const data = event.data?.json() ?? {
    title: "סטודיו איתי",
    body: "זמן להתאמן! 💪",
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      tag: "workout-reminder",
      renotify: true,
      data: { url: data.url ?? "/dashboard" },
    })
  )
})

self.addEventListener("notificationclick", event => {
  event.notification.close()
  const url = event.notification.data?.url ?? "/dashboard"
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if (client.url.includes(url) && "focus" in client) return client.focus()
      }
      if (clients.openWindow) return clients.openWindow(url)
    })
  )
})
