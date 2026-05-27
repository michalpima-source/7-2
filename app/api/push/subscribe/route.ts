import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response("Unauthorized", { status: 401 })

  const { subscription, reminder_time } = await req.json() as {
    subscription: { endpoint: string; keys: { p256dh: string; auth: string } }
    reminder_time: string
  }

  const { error } = await supabase
    .from("push_subscriptions")
    .upsert({
      client_id: user.id,
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      reminder_time: reminder_time ?? "08:00",
    }, { onConflict: "client_id,endpoint" })

  if (error) return new Response("DB error", { status: 500 })
  return Response.json({ ok: true })
}

export async function DELETE(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response("Unauthorized", { status: 401 })

  const { endpoint } = await req.json() as { endpoint: string }

  await supabase
    .from("push_subscriptions")
    .delete()
    .eq("client_id", user.id)
    .eq("endpoint", endpoint)

  return Response.json({ ok: true })
}
