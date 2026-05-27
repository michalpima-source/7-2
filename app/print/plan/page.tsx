import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PrintTrigger } from "@/components/client/print-trigger"
import { format } from "date-fns"
import { he } from "date-fns/locale"

export default async function PrintPlanPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/sign-in")

  const [{ data: plan }, { data: profile }] = await Promise.all([
    supabase
      .from("workout_plans")
      .select(`
        id, name, created_at,
        workout_days (
          id, day_name, day_order,
          exercises (
            id, name, sets, reps, rest_seconds, instructions, exercise_order
          )
        )
      `)
      .eq("client_id", user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .single(),
    supabase.from("profiles").select("full_name").eq("id", user.id).single(),
  ])

  if (!plan) redirect("/dashboard")

  const days = [...plan.workout_days]
    .sort((a, b) => a.day_order - b.day_order)
    .map(d => ({
      ...d,
      exercises: [...d.exercises].sort((a, b) => a.exercise_order - b.exercise_order),
    }))

  return (
    <div className="min-h-screen bg-white p-8 max-w-3xl mx-auto" dir="rtl">
      <PrintTrigger />

      {/* Document header */}
      <div className="mb-8 border-b pb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{plan.name}</h1>
            <p className="text-gray-500 mt-1">
              {profile?.full_name} · נוצרה {format(new Date(plan.created_at), "dd בMMMM yyyy", { locale: he })}
            </p>
          </div>
          <div className="text-sm text-gray-400 text-left">
            <p>סטודיו איתי</p>
            <p>{format(new Date(), "dd/MM/yyyy")}</p>
          </div>
        </div>
      </div>

      {/* Plan summary */}
      <div className="grid grid-cols-3 gap-4 mb-8 text-center">
        <div className="rounded-lg border bg-gray-50 p-4">
          <p className="text-2xl font-bold text-gray-900">{days.length}</p>
          <p className="text-sm text-gray-500 mt-1">ימי אימון</p>
        </div>
        <div className="rounded-lg border bg-gray-50 p-4">
          <p className="text-2xl font-bold text-gray-900">
            {days.reduce((sum, d) => sum + d.exercises.length, 0)}
          </p>
          <p className="text-sm text-gray-500 mt-1">תרגילים</p>
        </div>
        <div className="rounded-lg border bg-gray-50 p-4">
          <p className="text-2xl font-bold text-gray-900">
            {days.reduce((sum, d) => sum + d.exercises.reduce((s, e) => s + e.sets, 0), 0)}
          </p>
          <p className="text-sm text-gray-500 mt-1">סטים סה״כ</p>
        </div>
      </div>

      {/* Workout days */}
      <div className="flex flex-col gap-6">
        {days.map(day => (
          <div key={day.id} className="break-inside-avoid">
            <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="inline-block size-2 rounded-full bg-gray-800" />
              {day.day_name}
            </h2>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-right px-3 py-2 font-semibold text-gray-700 border border-gray-200 w-1/2">תרגיל</th>
                  <th className="text-center px-3 py-2 font-semibold text-gray-700 border border-gray-200">סטים</th>
                  <th className="text-center px-3 py-2 font-semibold text-gray-700 border border-gray-200">חזרות</th>
                  <th className="text-center px-3 py-2 font-semibold text-gray-700 border border-gray-200">מנוחה</th>
                </tr>
              </thead>
              <tbody>
                {day.exercises.map((ex, i) => (
                  <tr key={ex.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                    <td className="px-3 py-2.5 border border-gray-200">
                      <div>
                        <p className="font-medium text-gray-900">{ex.name}</p>
                        {ex.instructions && (
                          <p className="text-xs text-gray-400 mt-0.5">{ex.instructions}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 border border-gray-200 text-center text-gray-700">{ex.sets}</td>
                    <td className="px-3 py-2.5 border border-gray-200 text-center text-gray-700">{ex.reps}</td>
                    <td className="px-3 py-2.5 border border-gray-200 text-center text-gray-500 text-xs">
                      {ex.rest_seconds > 0 ? `${ex.rest_seconds}s` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-10 pt-6 border-t text-center text-xs text-gray-400 print:block">
        <p>סטודיו איתי · מופעל ע״י Claude AI · {format(new Date(), "dd/MM/yyyy")}</p>
      </div>

      <style>{`
        @media print {
          @page { margin: 1.5cm; size: A4 portrait; }
          body { font-size: 11pt; }
        }
      `}</style>
    </div>
  )
}
