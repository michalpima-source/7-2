import { generateText } from "ai"
import { gateway } from "@ai-sdk/gateway"
import { createAdminClient } from "@/lib/supabase/server"
import { createClient } from "@/lib/supabase/server"
import type { Goal, FitnessLevel } from "@/lib/types"
import { GOAL_LABELS, LEVEL_LABELS } from "@/lib/types"

export const maxDuration = 60

interface GeneratedExercise {
  name: string
  sets: number
  reps: string
  rest_seconds: number
  instructions: string
  exercise_order: number
}

interface GeneratedDay {
  day_name: string
  day_order: number
  exercises: GeneratedExercise[]
}

interface GeneratedPlan {
  plan_name: string
  days: GeneratedDay[]
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response("Unauthorized", { status: 401 })

  const body = await req.json() as {
    goal: Goal
    fitness_level: FitnessLevel
    available_days: string[]
    limitations: string
    name: string
  }

  const { goal, fitness_level, available_days, limitations, name } = body

  const systemPrompt = `אתה מאמן כושר מקצועי. עליך להחזיר תוכנית אימון שבועית בפורמט JSON בלבד, ללא הסבר, ללא markdown.

הפורמט המדויק הנדרש:
{
  "plan_name": "שם תוכנית בעברית",
  "days": [
    {
      "day_name": "שם היום בעברית (לדוגמה: יום ראשון)",
      "day_order": 1,
      "exercises": [
        {
          "name": "שם התרגיל בעברית",
          "sets": 3,
          "reps": "10-12",
          "rest_seconds": 60,
          "instructions": "הוראות ביצוע קצרות בעברית",
          "exercise_order": 1
        }
      ]
    }
  ]
}

כללים:
- כלול רק ימי אימון (לא ימי מנוחה)
- 3-6 תרגילים לכל יום
- התאם עצימות לרמת הכושר
- רק JSON — אין markdown, אין הסברים`

  const userPrompt = `צור תוכנית אימון שבועית עבור:
שם: ${name}
מטרה: ${GOAL_LABELS[goal]}
רמת כושר: ${LEVEL_LABELS[fitness_level]}
ימים פנויים לאימון: ${available_days.join(", ")}
מגבלות גופניות: ${limitations || "אין"}

החזר JSON בלבד.`

  let parsed: GeneratedPlan
  try {
    const { text } = await generateText({
      model: gateway("anthropic/claude-sonnet-4-6"),
      system: systemPrompt,
      prompt: userPrompt,
    })
    parsed = JSON.parse(text) as GeneratedPlan
  } catch (err) {
    console.error("[generate-plan] AI error:", err)
    return new Response("Failed to generate plan", { status: 500 })
  }

  const admin = await createAdminClient()

  const { data: plan, error: planError } = await admin
    .from("workout_plans")
    .insert({ client_id: user.id, name: parsed.plan_name, is_active: true, ai_generated: true })
    .select("id")
    .single()

  if (planError || !plan) {
    console.error("[generate-plan] DB error (workout_plans):", planError)
    return new Response("Failed to save plan", { status: 500 })
  }

  for (const day of parsed.days) {
    const { data: wd, error: wdError } = await admin
      .from("workout_days")
      .insert({ plan_id: plan.id, day_name: day.day_name, day_order: day.day_order })
      .select("id")
      .single()

    if (wdError || !wd) continue

    const exercises = day.exercises.map(ex => ({
      workout_day_id: wd.id,
      name: ex.name,
      sets: ex.sets,
      reps: ex.reps,
      rest_seconds: ex.rest_seconds ?? 60,
      instructions: ex.instructions ?? null,
      exercise_order: ex.exercise_order,
    }))

    await admin.from("exercises").insert(exercises)
  }

  await admin
    .from("client_profiles")
    .upsert({
      id: user.id,
      goal,
      fitness_level,
      available_days,
      limitations: limitations || null,
      onboarded_at: new Date().toISOString(),
    })

  return Response.json({ success: true, plan_id: plan.id })
}
