import { createClient } from "@/lib/supabase/server"
import { PlansLibrary } from "@/components/trainer/plans-library"
import type { PlanWithStats } from "@/lib/types"
import { LayoutList } from "lucide-react"

export default async function TrainerPlansPage() {
  const supabase = await createClient()

  const { data: plans } = await supabase
    .from("workout_plans")
    .select(`
      id, name, client_id, is_active, ai_generated, created_at,
      workout_days (
        id,
        exercises ( id )
      )
    `)
    .order("created_at", { ascending: false })

  if (!plans || plans.length === 0) {
    return (
      <div className="p-6 flex flex-col items-center justify-center gap-3 text-center text-muted-foreground min-h-64">
        <LayoutList className="size-10 opacity-30" />
        <p>אין תוכניות עדיין.</p>
      </div>
    )
  }

  const clientIds = [...new Set(plans.map(p => p.client_id))]
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", clientIds)

  const profileMap: Record<string, string> = {}
  profiles?.forEach(p => { profileMap[p.id] = p.full_name })

  const plansWithStats: PlanWithStats[] = plans.map(p => ({
    id: p.id,
    name: p.name,
    client_id: p.client_id,
    client_name: profileMap[p.client_id] ?? "לא ידוע",
    is_active: p.is_active,
    ai_generated: p.ai_generated,
    created_at: p.created_at,
    days_count: p.workout_days?.length ?? 0,
    exercises_count: p.workout_days?.reduce(
      (sum: number, d: { exercises: { id: string }[] }) => sum + (d.exercises?.length ?? 0),
      0
    ) ?? 0,
  }))

  const activePlans = plansWithStats.filter(p => p.is_active)
  const archivedPlans = plansWithStats.filter(p => !p.is_active)

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">תוכניות אימון</h1>
        <div className="flex gap-3 text-sm text-muted-foreground">
          <span>{activePlans.length} פעילות</span>
          {archivedPlans.length > 0 && <span>{archivedPlans.length} ארכיון</span>}
        </div>
      </div>

      {activePlans.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">תוכניות פעילות</h2>
          <PlansLibrary plans={activePlans} />
        </div>
      )}

      {archivedPlans.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">ארכיון</h2>
          <PlansLibrary plans={archivedPlans} />
        </div>
      )}
    </div>
  )
}
