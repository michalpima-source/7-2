import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CompletionChart } from "@/components/trainer/completion-chart"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { MessageCircle, Dumbbell, Calendar, TrendingUp, Clock } from "lucide-react"
import { GOAL_LABELS, LEVEL_LABELS } from "@/lib/types"
import type { Goal, FitnessLevel, WorkoutLog } from "@/lib/types"
import { format, formatDistanceToNow } from "date-fns"
import { he } from "date-fns/locale"

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/sign-in")

  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const [
    { data: profile },
    { data: clientProfile },
    { data: activePlan },
    { data: logs },
    { data: chatMessages },
    completionResult,
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", id).single(),
    supabase.from("client_profiles").select("*").eq("id", id).single(),
    supabase
      .from("workout_plans")
      .select("id, name, workout_days(id, day_name, day_order)")
      .eq("client_id", id)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from("workout_logs")
      .select("id, client_id, workout_day_id, completed_at, feedback")
      .eq("client_id", id)
      .order("completed_at", { ascending: false })
      .limit(90),
    supabase
      .from("chat_messages")
      .select("id, client_id, role, content, created_at")
      .eq("client_id", id)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase.rpc("get_client_completion", {
      p_client_id: id,
      p_month_start: monthStart.toISOString().split("T")[0],
    }),
  ])

  if (!profile) notFound()

  const completionPct = (completionResult.data as number) ?? 0
  const totalWorkouts = logs?.length ?? 0
  const thisMonthWorkouts = logs?.filter(l => new Date(l.completed_at) >= monthStart).length ?? 0
  const lastWorkout = logs?.[0]?.completed_at ?? null
  const daysSinceLast = lastWorkout
    ? Math.floor((Date.now() - new Date(lastWorkout).getTime()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-full bg-muted flex items-center justify-center font-bold text-lg">
            {(profile.full_name || "?").slice(0, 1)}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{profile.full_name}</h1>
            <p className="text-muted-foreground text-sm">{profile.phone ?? "אין טלפון"}</p>
          </div>
        </div>
        {profile.phone && (
          <a
            href={`https://wa.me/972${profile.phone.replace(/^0/, "").replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm" className="gap-1.5">
              <MessageCircle className="size-4" />
              WhatsApp
            </Button>
          </a>
        )}
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border bg-card p-4 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
            <Dumbbell className="size-3.5" />
            סה״כ אימונים
          </div>
          <p className="text-2xl font-bold">{totalWorkouts}</p>
        </div>
        <div className="rounded-xl border bg-card p-4 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
            <Calendar className="size-3.5" />
            החודש
          </div>
          <p className="text-2xl font-bold">{thisMonthWorkouts}</p>
        </div>
        <div className="rounded-xl border bg-card p-4 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
            <TrendingUp className="size-3.5" />
            השלמה החודש
          </div>
          <p className="text-2xl font-bold">{completionPct}%</p>
        </div>
        <div className="rounded-xl border bg-card p-4 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
            <Clock className="size-3.5" />
            אימון אחרון
          </div>
          <p className="text-2xl font-bold">
            {daysSinceLast === null ? "—" : daysSinceLast === 0 ? "היום" : `${daysSinceLast}י׳`}
          </p>
        </div>
      </div>

      {/* Client profile info */}
      <div className="rounded-xl border p-4 flex flex-wrap gap-3">
        {clientProfile?.goal && (
          <Badge variant="secondary">{GOAL_LABELS[clientProfile.goal as Goal]}</Badge>
        )}
        {clientProfile?.fitness_level && (
          <Badge variant="secondary">{LEVEL_LABELS[clientProfile.fitness_level as FitnessLevel]}</Badge>
        )}
        {activePlan && (
          <Badge variant="outline">תוכנית: {activePlan.name}</Badge>
        )}
        {clientProfile?.available_days && clientProfile.available_days.length > 0 && (
          <Badge variant="outline">{clientProfile.available_days.length} ימי אימון בשבוע</Badge>
        )}
        {clientProfile?.limitations && (
          <p className="w-full text-sm text-muted-foreground">מגבלות: {clientProfile.limitations}</p>
        )}
        {!clientProfile?.onboarded_at && (
          <p className="w-full text-sm text-yellow-600">לקוח טרם השלים onboarding</p>
        )}
      </div>

      {/* Progress chart */}
      {logs && logs.length > 0 && activePlan?.workout_days && (
        <div>
          <h2 className="text-lg font-semibold mb-3">התקדמות שבועית</h2>
          <CompletionChart
            logs={logs as WorkoutLog[]}
            totalDaysPerWeek={activePlan.workout_days.length}
          />
        </div>
      )}

      {/* Workout log */}
      {logs && logs.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">יומן אימונים</h2>
          <div className="rounded-xl border divide-y overflow-hidden">
            {logs.slice(0, 15).map(log => (
              <div key={log.id} className="px-4 py-3 flex justify-between items-start gap-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">
                    {format(new Date(log.completed_at), "EEEE, dd/MM/yyyy", { locale: he })}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(log.completed_at), { addSuffix: true, locale: he })}
                  </span>
                </div>
                {log.feedback && (
                  <p className="text-sm text-muted-foreground flex-1 text-left">{log.feedback}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {logs && logs.length === 0 && (
        <div className="rounded-xl border p-6 text-center text-muted-foreground text-sm">
          הלקוח טרם ביצע אימונים
        </div>
      )}

      <Separator />

      {/* Chat history */}
      {chatMessages && chatMessages.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">היסטוריית צ&apos;אט</h2>
          <div className="flex flex-col gap-2 max-h-96 overflow-y-auto rounded-xl border p-4">
            {[...chatMessages].reverse().map(msg => (
              <div
                key={msg.id}
                className={`text-sm rounded-lg px-3 py-2 max-w-[85%] ${
                  msg.role === "user"
                    ? "bg-primary/10 self-end"
                    : "bg-muted self-start"
                }`}
              >
                <p className="text-xs text-muted-foreground mb-1">
                  {msg.role === "user" ? "לקוח" : "AI"} ·{" "}
                  {format(new Date(msg.created_at), "dd/MM HH:mm")}
                </p>
                {msg.content}
              </div>
            ))}
          </div>
        </div>
      )}

      {chatMessages && chatMessages.length === 0 && (
        <div className="rounded-xl border p-6 text-center text-muted-foreground text-sm">
          אין היסטוריית צ&apos;אט
        </div>
      )}
    </div>
  )
}
