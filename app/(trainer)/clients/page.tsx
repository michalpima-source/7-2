import { createClient } from "@/lib/supabase/server"
import { ClientsTable } from "@/components/trainer/clients-table"
import type { ClientWithStats } from "@/lib/types"
import { Users } from "lucide-react"

export default async function TrainerClientsPage() {
  const supabase = await createClient()

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, role, phone, created_at")
    .eq("role", "client")
    .order("created_at", { ascending: false })

  if (!profiles || profiles.length === 0) {
    return (
      <div className="p-6 flex flex-col items-center justify-center gap-3 text-center text-muted-foreground min-h-64">
        <Users className="size-10 opacity-30" />
        <p>אין לקוחות עדיין.</p>
      </div>
    )
  }

  const ids = profiles.map(p => p.id)
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { data: clientProfiles },
    { data: activePlans },
    { data: lastWorkouts },
  ] = await Promise.all([
    supabase.from("client_profiles").select("id, goal, fitness_level, available_days, limitations, onboarded_at").in("id", ids),
    supabase.from("workout_plans").select("client_id, name").in("client_id", ids).eq("is_active", true),
    supabase.from("workout_logs")
      .select("client_id, completed_at")
      .in("client_id", ids)
      .order("completed_at", { ascending: false }),
  ])

  const completionResults = await Promise.all(
    profiles.map(p =>
      supabase.rpc("get_client_completion", {
        p_client_id: p.id,
        p_month_start: monthStart.toISOString().split("T")[0],
      })
    )
  )

  const lastWorkoutMap: Record<string, string> = {}
  lastWorkouts?.forEach(log => {
    if (!lastWorkoutMap[log.client_id]) {
      lastWorkoutMap[log.client_id] = log.completed_at
    }
  })

  const clients: ClientWithStats[] = profiles.map((p, i) => ({
    ...p,
    client_profile: clientProfiles?.find(cp => cp.id === p.id) ?? null,
    completion_pct: (completionResults[i].data as number) ?? 0,
    active_plan_name: activePlans?.find(pl => pl.client_id === p.id)?.name ?? null,
    last_workout_at: lastWorkoutMap[p.id] ?? null,
  }))

  const active = clients.filter(c => c.last_workout_at && c.last_workout_at >= weekAgo)
  const inactive = clients.filter(c => !c.last_workout_at || c.last_workout_at < weekAgo)

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">לקוחות</h1>
        <div className="flex gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-green-500 inline-block" />
            {active.length} פעילים
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-muted-foreground inline-block" />
            {inactive.length} לא פעילים
          </span>
        </div>
      </div>

      <ClientsTable clients={clients} />
    </div>
  )
}
