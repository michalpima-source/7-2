"use client"

import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CompleteWorkoutDialog } from "@/components/client/complete-workout-dialog"
import type { WorkoutDay } from "@/lib/types"
import { CheckCircle2 } from "lucide-react"

interface Props {
  day: WorkoutDay
  isCompleted: boolean
}

export function WorkoutDayTab({ day, isCompleted }: Props) {
  return (
    <div className="rounded-xl border bg-card p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">{day.day_name}</h3>
        {isCompleted ? (
          <Badge className="gap-1 bg-green-500/10 text-green-600 border-green-500/20">
            <CheckCircle2 className="size-3.5" />
            הושלם
          </Badge>
        ) : (
          <CompleteWorkoutDialog workoutDayId={day.id} dayName={day.day_name} />
        )}
      </div>

      <div className="flex flex-col gap-3">
        {day.exercises.map((ex, idx) => (
          <div key={ex.id}>
            {idx > 0 && <Separator className="mb-3" />}
            <div className="flex flex-col gap-1">
              <div className="flex items-start justify-between gap-2">
                <span className="font-medium">{ex.name}</span>
                <div className="flex gap-1.5 shrink-0">
                  <Badge variant="secondary">{ex.sets} סטים</Badge>
                  <Badge variant="secondary">{ex.reps} חזרות</Badge>
                </div>
              </div>
              {ex.rest_seconds > 0 && (
                <span className="text-xs text-muted-foreground">
                  מנוחה: {ex.rest_seconds} שניות
                </span>
              )}
              {ex.instructions && (
                <p className="text-sm text-muted-foreground mt-1">{ex.instructions}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
