"use client"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { WorkoutDayTab } from "@/components/client/workout-day-tab"
import type { WorkoutPlan, WorkoutLog } from "@/lib/types"

interface Props {
  plan: WorkoutPlan
  logs: WorkoutLog[]
}

export function WorkoutWeekView({ plan, logs }: Props) {
  const days = plan.workout_days

  if (days.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-12">
        לא נמצאו אימונים בתוכנית זו.
      </div>
    )
  }

  const completedDayIds = new Set(logs.map(l => l.workout_day_id))

  return (
    <Tabs defaultValue={days[0].id}>
      <TabsList className="flex flex-wrap h-auto gap-1 mb-4">
        {days.map(day => (
          <TabsTrigger key={day.id} value={day.id} className="relative">
            {day.day_name}
            {completedDayIds.has(day.id) && (
              <span className="absolute -top-1 -end-1 size-2 rounded-full bg-green-500" />
            )}
          </TabsTrigger>
        ))}
      </TabsList>
      {days.map(day => (
        <TabsContent key={day.id} value={day.id}>
          <WorkoutDayTab day={day} isCompleted={completedDayIds.has(day.id)} />
        </TabsContent>
      ))}
    </Tabs>
  )
}
