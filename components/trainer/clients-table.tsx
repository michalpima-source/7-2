"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"
import type { ClientWithStats } from "@/lib/types"
import { GOAL_LABELS } from "@/lib/types"
import type { Goal } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { he } from "date-fns/locale"

function activityStatus(lastWorkoutAt: string | null, hasPlan: boolean) {
  if (!hasPlan) return { color: "bg-muted-foreground/40", label: "ללא תוכנית", badge: "bg-muted text-muted-foreground border-border" }
  if (!lastWorkoutAt) return { color: "bg-red-500", label: "לא התחיל", badge: "bg-red-500/10 text-red-600 border-red-500/20" }
  const days = (Date.now() - new Date(lastWorkoutAt).getTime()) / (1000 * 60 * 60 * 24)
  if (days <= 7) return { color: "bg-green-500", label: "פעיל", badge: "bg-green-500/10 text-green-700 border-green-500/20" }
  if (days <= 21) return { color: "bg-yellow-500", label: "לא פעיל", badge: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20" }
  return { color: "bg-red-500", label: "לא פעיל זמן רב", badge: "bg-red-500/10 text-red-600 border-red-500/20" }
}

function completionColor(pct: number) {
  if (pct >= 70) return "bg-green-500/10 text-green-700 border-green-500/20"
  if (pct >= 40) return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20"
  return "bg-red-500/10 text-red-700 border-red-500/20"
}

interface Props {
  clients: ClientWithStats[]
}

export function ClientsTable({ clients }: Props) {
  const sorted = [...clients].sort((a, b) => {
    const aActive = a.last_workout_at ? new Date(a.last_workout_at).getTime() : 0
    const bActive = b.last_workout_at ? new Date(b.last_workout_at).getTime() : 0
    return bActive - aActive
  })

  return (
    <div className="flex flex-col gap-3">
      {sorted.map(client => {
        const status = activityStatus(client.last_workout_at, !!client.active_plan_name)
        return (
          <Link
            key={client.id}
            href={`/clients/${client.id}`}
            className="rounded-xl border bg-card hover:bg-muted/30 transition-colors p-4 flex items-center gap-4"
          >
            <div className="relative shrink-0">
              <div className="size-10 rounded-full bg-muted flex items-center justify-center font-semibold text-sm">
                {(client.full_name || "?").slice(0, 1)}
              </div>
              <span className={`absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-background ${status.color}`} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium truncate">{client.full_name || "—"}</span>
                <Badge className={`text-xs ${status.badge}`}>{status.label}</Badge>
                {!client.client_profile?.onboarded_at && (
                  <Badge variant="outline" className="text-xs">לא השלים onboarding</Badge>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                {client.client_profile?.goal && (
                  <span>{GOAL_LABELS[client.client_profile.goal as Goal]}</span>
                )}
                {client.active_plan_name && (
                  <span className="truncate max-w-40">{client.active_plan_name}</span>
                )}
                {client.last_workout_at && (
                  <span>
                    אימון אחרון:{" "}
                    {formatDistanceToNow(new Date(client.last_workout_at), { addSuffix: true, locale: he })}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Badge className={completionColor(client.completion_pct)}>
                {client.completion_pct}% החודש
              </Badge>
              {client.phone && (
                <a
                  href={`https://wa.me/972${client.phone.replace(/^0/, "").replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                >
                  <Button variant="ghost" size="icon-sm" title="פתח WhatsApp">
                    <MessageCircle className="size-4" />
                  </Button>
                </a>
              )}
            </div>
          </Link>
        )
      })}
    </div>
  )
}
