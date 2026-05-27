import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CompletionChart } from "@/components/trainer/completion-chart"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"
import { GOAL_LABELS, LEVEL_LABELS } from "@/lib/types"
import type { Goal, FitnessLevel, WorkoutLog, ChatMessage } from "@/lib/types"
import { format } from "date-fns"

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/sign-in")

  const [
    { data: profile },
    { data: clientProfile },
    { data: activePlan },
    { data: logs },
    { data: chatMessages },
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
  ])

  if (!profile) notFound()

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{profile.full_name}</h1>
          <p className="text-muted-foreground text-sm mt-1">{profile.phone ?? "אין טלפון"}</p>
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

      {/* Client info */}
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
        {clientProfile?.limitations && (
          <p className="w-full text-sm text-muted-foreground">מגבלות: {clientProfile.limitations}</p>
        )}
      </div>

      {/* Progress chart */}
      {logs && logs.length > 0 && activePlan?.workout_days && (
        <div>
          <h2 className="text-lg font-semibold mb-3">התקדמות</h2>
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
            {logs.slice(0, 10).map(log => (
              <div key={log.id} className="px-4 py-3 flex justify-between items-start gap-3">
                <div className="text-sm">
                  {format(new Date(log.completed_at), "dd/MM/yyyy HH:mm")}
                </div>
                {log.feedback && (
                  <p className="text-sm text-muted-foreground flex-1">{log.feedback}</p>
                )}
              </div>
            ))}
          </div>
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
    </div>
  )
}
