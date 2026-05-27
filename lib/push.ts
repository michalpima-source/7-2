import webpush from "web-push"

let initialised = false

export function initWebPush() {
  if (initialised) return
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) return
  webpush.setVapidDetails(
    process.env.VAPID_EMAIL ?? "mailto:admin@example.com",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  )
  initialised = true
}

export { webpush }
