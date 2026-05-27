"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CompleteWorkoutDialog } from "@/components/client/complete-workout-dialog"
import type { WorkoutDay } from "@/lib/types"
import { CheckCircle2, Circle, PlayCircle } from "lucide-react"

interface Props {
  day: WorkoutDay
  isCompleted: boolean
}

export function WorkoutDayTab({ day, isCompleted }: Props) {
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set())

  function toggleExercise(id: string) {
    setCompletedExercises(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const completedCount = completedExercises.size
  const totalCount = day.exercises.length
  const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  return (
    <div className="rounded-xl border bg-card p-4 flex flex-col gap-4">
      {/* Header row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <h3 className="font-semibold text-lg">{day.day_name}</h3>
          {!isCompleted && totalCount > 0 && (
            <span className="text-xs text-muted-foreground shrink-0">
              {completedCount}/{totalCount}
            </span>
          )}
        </div>
        {isCompleted ? (
          <Badge className="gap-1 bg-green-500/10 text-green-600 border-green-500/20 shrink-0">
            <CheckCircle2 className="size-3.5" />
            הושלם
          </Badge>
        ) : (
          <CompleteWorkoutDialog
            workoutDayId={day.id}
            dayName={day.day_name}
            completedCount={completedCount}
            totalCount={totalCount}
          />
        )}
      </div>

      {/* Progress bar */}
      {!isCompleted && totalCount > 0 && (
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      )}

      {/* Exercises */}
      <div className="flex flex-col gap-1">
        {day.exercises.map((ex, idx) => {
          const done = isCompleted || completedExercises.has(ex.id)
          return (
            <div key={ex.id}>
              {idx > 0 && <Separator className="my-2" />}
              <div
                className={`rounded-lg p-2 -mx-2 flex flex-col gap-1 transition-colors ${
                  isCompleted
                    ? ""
                    : "cursor-pointer hover:bg-muted/40 active:bg-muted/60"
                } ${done && !isCompleted ? "opacity-60" : ""}`}
                onClick={() => !isCompleted && toggleExercise(ex.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {done ? (
                      <CheckCircle2 className="size-4 text-green-500 shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="size-4 text-muted-foreground/50 shrink-0 mt-0.5" />
                    )}
                    <span className={`font-medium truncate ${done && !isCompleted ? "line-through text-muted-foreground" : ""}`}>
                      {ex.name}
                    </span>
                    <a
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(ex.name + " תרגיל הדגמה")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="הדגמה ב-YouTube"
                      className="text-muted-foreground hover:text-red-500 transition-colors shrink-0"
                      onClick={e => e.stopPropagation()}
                    >
                      <PlayCircle className="size-4" />
                    </a>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Badge variant="secondary" className="text-xs">{ex.sets} סטים</Badge>
                    <Badge variant="secondary" className="text-xs">{ex.reps} חזרות</Badge>
                  </div>
                </div>
                {ex.rest_seconds > 0 && (
                  <span className="text-xs text-muted-foreground ps-6">
                    מנוחה: {ex.rest_seconds} שניות
                  </span>
                )}
                {ex.instructions && (
                  <p className="text-sm text-muted-foreground ps-6">{ex.instructions}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
