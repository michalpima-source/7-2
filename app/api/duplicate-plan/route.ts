import { createClient, createAdminClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response("Unauthorized", { status: 401 })

  const { plan_id } = await req.json() as { plan_id: string }

  const { data: sourcePlan } = await supabase
    .from("workout_plans")
    .select(`id, client_id, name, ai_generated, workout_days(id, day_name, day_order, exercises(name, sets, reps, rest_seconds, instructions, exercise_order))`)
    .eq("id", plan_id)
    .single()

  if (!sourcePlan) return new Response("Not found", { status: 404 })

  const admin = await createAdminClient()

  const { data: newPlan, error: planError } = await admin
    .from("workout_plans")
    .insert({
      client_id: sourcePlan.client_id,
      name: `${sourcePlan.name} (עותק)`,
      is_active: false,
      ai_generated: sourcePlan.ai_generated,
    })
    .select("id")
    .single()

  if (planError || !newPlan) return new Response("Failed to duplicate", { status: 500 })

  type SourceDay = { id: string; day_name: string; day_order: number; exercises: Array<{ name: string; sets: number; reps: string; rest_seconds: number; instructions: string | null; exercise_order: number }> }

  await Promise.all(
    (sourcePlan.workout_days as SourceDay[]).map(async day => {
      const { data: newDay } = await admin
        .from("workout_days")
        .insert({ plan_id: newPlan.id, day_name: day.day_name, day_order: day.day_order })
        .select("id")
        .single()

      if (!newDay || !day.exercises?.length) return

      await admin.from("exercises").insert(
        day.exercises.map(ex => ({
          workout_day_id: newDay.id,
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          rest_seconds: ex.rest_seconds,
          instructions: ex.instructions,
          exercise_order: ex.exercise_order,
        }))
      )
    })
  )

  return Response.json({ success: true, plan_id: newPlan.id })
}
