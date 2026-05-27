import { createClient } from "@/lib/supabase/server"
import { ClientsTable } from "@/components/trainer/clients-table"
import type { ClientWithStats } from "@/lib/types"

export default async function TrainerClientsPage() {
  const supabase = await createClient()

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, role, phone, created_at")
    .eq("role", "client")
    .order("created_at", { ascending: false })

  if (!profiles || profiles.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        אין לקוחות עדיין.
      </div>
    )
  }

  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const { data: clientProfiles } = await supabase
    .from("client_profiles")
    .select("id, goal, fitness_level, available_days, limitations, onboarded_at")
    .in("id", profiles.map(p => p.id))

  const { data: activePlans } = await supabase
    .from("workout_plans")
    .select("client_id, name")
    .in("client_id", profiles.map(p => p.id))
    .eq("is_active", true)

  const completionResults = await Promise.all(
    profiles.map(p =>
      supabase.rpc("get_client_completion", {
        p_client_id: p.id,
        p_month_start: monthStart.toISOString().split("T")[0],
      })
    )
  )

  const clients: ClientWithStats[] = profiles.map((p, i) => ({
    ...p,
    client_profile: clientProfiles?.find(cp => cp.id === p.id) ?? null,
    completion_pct: (completionResults[i].data as number) ?? 0,
    active_plan_name: activePlans?.find(pl => pl.client_id === p.id)?.name ?? null,
  }))

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">לקוחות</h1>
      <ClientsTable clients={clients} />
    </div>
  )
}
