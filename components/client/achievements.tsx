"use client"

import { useMemo } from "react"
import type { WorkoutLog } from "@/lib/types"
import { Trophy, Flame, Zap, Star, Target, Award, Calendar } from "lucide-react"

interface Props {
  logs: WorkoutLog[]
  totalDaysPerWeek: number
}

function getWeekKey(date: Date): string {
  const d = new Date(date)
  d.setDate(d.getDate() - d.getDay())
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

function computeStreak(weekKeys: string[]): number {
  if (weekKeys.length === 0) return 0
  const sorted = [...new Set(weekKeys)].sort()
  const nowKey = getWeekKey(new Date())
  const ONE_WEEK = 7 * 24 * 60 * 60 * 1000

  let streak = 0
  let expected = nowKey
  for (let i = sorted.length - 1; i >= 0; i--) {
    const diff = Math.round(
      (new Date(expected).getTime() - new Date(sorted[i]).getTime()) / ONE_WEEK
    )
    if (diff > 1) break
    streak++
    expected = sorted[i]
  }
  return streak
}

interface Achievement {
  id: string
  icon: React.ElementType
  label: string
  sublabel: string
  unlocked: boolean
  color: string
  bg: string
}

export function Achievements({ logs, totalDaysPerWeek }: Props) {
  const { achievements, total } = useMemo<{ achievements: Achievement[]; total: number; thisMonth: number }>(() => {
    const total = logs.length

    const weekCounts: Record<string, number> = {}
    logs.forEach(l => {
      const key = getWeekKey(new Date(l.completed_at))
      weekCounts[key] = (weekCounts[key] || 0) + 1
    })

    const bestWeek = Math.max(0, ...Object.values(weekCounts))
    const streak = computeStreak(Object.keys(weekCounts))

    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)
    const thisMonth = logs.filter(l => new Date(l.completed_at) >= monthStart).length

    const achievements: Achievement[] = [
      { id: "first", icon: Target, label: "הצעד הראשון", sublabel: "אימון ראשון", unlocked: total >= 1, color: "text-blue-600", bg: "bg-blue-500/10" },
      { id: "five", icon: Star, label: "5 אימונים", sublabel: "מתחיל!", unlocked: total >= 5, color: "text-yellow-600", bg: "bg-yellow-500/10" },
      { id: "ten", icon: Award, label: "10 אימונים", sublabel: "קבוע", unlocked: total >= 10, color: "text-orange-600", bg: "bg-orange-500/10" },
      { id: "twentyfive", icon: Trophy, label: "25 אימונים", sublabel: "לוחם כושר", unlocked: total >= 25, color: "text-purple-600", bg: "bg-purple-500/10" },
      { id: "streak", icon: Flame, label: `${streak} שבועות רצוף`, sublabel: "רצף שבועי", unlocked: streak >= 2, color: "text-red-600", bg: "bg-red-500/10" },
      { id: "perfectweek", icon: Calendar, label: "שבוע מושלם", sublabel: `${bestWeek}/${totalDaysPerWeek} ימים`, unlocked: totalDaysPerWeek > 0 && bestWeek >= totalDaysPerWeek, color: "text-emerald-600", bg: "bg-emerald-500/10" },
      { id: "bestweek", icon: Zap, label: `שיא: ${bestWeek} בשבוע`, sublabel: "שבוע הזהב", unlocked: bestWeek >= 3, color: "text-cyan-600", bg: "bg-cyan-500/10" },
    ]

    return { achievements, total, thisMonth }
  }, [logs, totalDaysPerWeek])

  const unlocked = achievements.filter(a => a.unlocked)
  const nextLocked = achievements.filter(a => !a.unlocked).slice(0, 2)

  if (total === 0) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">הישגים</h2>
        <span className="text-xs text-muted-foreground">{unlocked.length}/{achievements.length} פתוחים</span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory">
        {unlocked.map(a => (
          <div
            key={a.id}
            className={`rounded-xl border ${a.bg} p-4 flex flex-col items-center gap-2 shrink-0 w-28 snap-start text-center`}
          >
            <a.icon className={`size-6 ${a.color}`} />
            <p className={`text-xs font-semibold leading-tight ${a.color}`}>{a.label}</p>
            <p className="text-xs text-muted-foreground leading-tight">{a.sublabel}</p>
          </div>
        ))}
        {nextLocked.map(a => (
          <div
            key={a.id}
            className="rounded-xl border bg-muted/20 p-4 flex flex-col items-center gap-2 shrink-0 w-28 snap-start text-center opacity-40"
          >
            <a.icon className="size-6 text-muted-foreground" />
            <p className="text-xs font-semibold text-muted-foreground leading-tight">{a.label}</p>
            <p className="text-xs text-muted-foreground leading-tight">נעול</p>
          </div>
        ))}
      </div>
    </div>
  )
}
