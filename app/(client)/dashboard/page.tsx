import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { WorkoutWeekView } from "@/components/client/workout-week-view"
import { Achievements } from "@/components/client/achievements"
import type { WorkoutPlan, WorkoutLog } from "@/lib/types"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/sign-in")

  const { data: plan } = await supabase
    .from("workout_plans")
    .select(`
      id, client_id, name, is_active, ai_generated, created_at,
      workout_days (
        id, plan_id, day_name, day_order,
        exercises (
          id, workout_day_id, name, sets, reps, rest_seconds, instructions, exercise_order
        )
      )
    `)
    .eq("client_id", user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (!plan) {
    redirect("/onboarding")
  }

  const sortedPlan = {
    ...plan,
    workout_days: [...plan.workout_days]
      .sort((a, b) => a.day_order - b.day_order)
      .map(day => ({
        ...day,
        exercises: [...day.exercises].sort((a, b) => a.exercise_order - b.exercise_order),
      })),
  } as WorkoutPlan

  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)

  const [{ data: weekLogs }, { data: allLogs }] = await Promise.all([
    supabase
      .from("workout_logs")
      .select("id, client_id, workout_day_id, completed_at, feedback")
      .eq("client_id", user.id)
      .gte("completed_at", weekAgo.toISOString()),
    supabase
      .from("workout_logs")
      .select("id, client_id, workout_day_id, completed_at, feedback")
      .eq("client_id", user.id)
      .order("completed_at", { ascending: false })
      .limit(120),
  ])

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">{plan.name}</h1>
        <p className="text-muted-foreground text-sm mt-1">התוכנית השבועית שלך</p>
      </div>

      <WorkoutWeekView plan={sortedPlan} logs={(weekLogs ?? []) as WorkoutLog[]} />

      <Achievements
        logs={(allLogs ?? []) as WorkoutLog[]}
        totalDaysPerWeek={sortedPlan.workout_days.length}
      />
    </div>
  )
}
