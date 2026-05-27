"use client"

import { useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import type { WorkoutLog } from "@/lib/types"

interface Props {
  logs: WorkoutLog[]
  totalDaysPerWeek: number
}

function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
  return d
}

function formatWeek(date: Date): string {
  return `${date.getDate()}/${date.getMonth() + 1}`
}

export function CompletionChart({ logs, totalDaysPerWeek }: Props) {
  const data = useMemo(() => {
    const weeks: Date[] = []
    const now = new Date()
    for (let i = 7; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i * 7)
      weeks.push(getWeekStart(d))
    }

    return weeks.map(weekStart => {
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 7)
      const completed = logs.filter(l => {
        const d = new Date(l.completed_at)
        return d >= weekStart && d < weekEnd
      }).length
      return {
        week: formatWeek(weekStart),
        completed,
        total: totalDaysPerWeek,
      }
    })
  }, [logs, totalDaysPerWeek])

  return (
    <div className="rounded-xl border p-4">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <XAxis dataKey="week" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value) => [`${value} אימונים`, "הושלמו"]}
            labelFormatter={label => `שבוע ${label}`}
          />
          <Bar dataKey="completed" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={
                  entry.total === 0
                    ? "hsl(var(--muted))"
                    : entry.completed / entry.total >= 0.7
                    ? "hsl(142 76% 36%)"
                    : entry.completed / entry.total >= 0.4
                    ? "hsl(48 96% 53%)"
                    : "hsl(var(--primary))"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
