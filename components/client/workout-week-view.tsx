"use client"

import { motion } from "framer-motion"
import { WorkoutDayTab } from "@/components/client/workout-day-tab"
import type { WorkoutPlan, WorkoutLog } from "@/lib/types"
import { CheckCircle2 } from "lucide-react"

interface Props {
  plan: WorkoutPlan
  logs: WorkoutLog[]
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 28 } },
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
    <motion.div
      className="flex flex-col gap-3"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {days.map(day => {
        const isCompleted = completedDayIds.has(day.id)
        return (
          <motion.div key={day.id} variants={item} whileHover={{ y: -2, transition: { duration: 0.15 } }}>
            <div className={`relative rounded-xl border overflow-hidden shadow-sm ${isCompleted ? "bg-green-500/5" : "bg-card"}`}>
              {isCompleted && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/8 to-transparent pointer-events-none" />
                  <div className="absolute top-3 start-3 flex items-center gap-1.5 text-xs font-medium text-green-600">
                    <CheckCircle2 className="size-3.5" />
                    הושלם השבוע
                  </div>
                </>
              )}
              <div className={isCompleted ? "pt-7" : ""}>
                <WorkoutDayTab day={day} isCompleted={isCompleted} />
              </div>
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
