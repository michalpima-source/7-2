import { createAdminClient } from "@/lib/supabase/server"
import { initWebPush, webpush } from "@/lib/push"

export const runtime = "nodejs"

export async function GET(req: Request) {
  const auth = req.headers.get("authorization")
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 })
  }

  initWebPush()

  const now = new Date()
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`

  const admin = await createAdminClient()
  const { data: subs } = await admin
    .from("push_subscriptions")
    .select("endpoint, keys, reminder_time")
    .eq("reminder_time", currentTime)

  if (!subs || subs.length === 0) {
    return Response.json({ sent: 0 })
  }

  const results = await Promise.allSettled(
    subs.map(sub =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: sub.keys as { p256dh: string; auth: string } },
        JSON.stringify({
          title: "סטודיו איתי 💪",
          body: "זמן לאימון! פתח את האפליקציה ובצע את התוכנית שלך",
          url: "/dashboard",
        })
      )
    )
  )

  const sent = results.filter(r => r.status === "fulfilled").length
  return Response.json({ sent, total: subs.length })
}
