"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Copy, Dumbbell, Calendar, User, Bot, CheckCircle2, Loader2 } from "lucide-react"
import type { PlanWithStats } from "@/lib/types"
import { format } from "date-fns"
import { toast } from "sonner"

interface Props {
  plans: PlanWithStats[]
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 28 } },
}

export function PlansLibrary({ plans }: Props) {
  const router = useRouter()
  const [duplicating, setDuplicating] = useState<string | null>(null)

  async function handleDuplicate(planId: string, e: React.MouseEvent) {
    e.stopPropagation()
    setDuplicating(planId)
    try {
      const res = await fetch(`/api/duplicate-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_id: planId }),
      })
      if (!res.ok) throw new Error("Failed")
      toast.success("התוכנית שוכפלה בהצלחה")
      router.refresh()
    } catch {
      toast.error("שגיאה בשכפול התוכנית")
    } finally {
      setDuplicating(null)
    }
  }

  if (plans.length === 0) {
    return (
      <div className="rounded-xl border p-12 text-center text-muted-foreground flex flex-col items-center gap-3">
        <Dumbbell className="size-10 opacity-30" />
        <p>אין תוכניות עדיין.</p>
      </div>
    )
  }

  return (
    <motion.div
      className="flex flex-col gap-3"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {plans.map(plan => (
        <motion.div
          key={plan.id}
          variants={item}
          whileHover={{ y: -2, transition: { duration: 0.15 } }}
          className="rounded-xl border bg-card shadow-sm hover:shadow-md transition-shadow overflow-hidden"
        >
          <div className="p-4 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium truncate">{plan.name}</span>
                {plan.is_active && (
                  <Badge className="gap-1 text-xs bg-green-500/10 text-green-700 border-green-500/20">
                    <CheckCircle2 className="size-3" />
                    פעילה
                  </Badge>
                )}
                {plan.ai_generated && (
                  <Badge variant="outline" className="gap-1 text-xs">
                    <Bot className="size-3" />
                    AI
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1">
                  <User className="size-3" />
                  {plan.client_name}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="size-3" />
                  {plan.days_count} ימים
                </span>
                <span className="flex items-center gap-1">
                  <Dumbbell className="size-3" />
                  {plan.exercises_count} תרגילים
                </span>
                <span>נוצרה {format(new Date(plan.created_at), "dd/MM/yyyy")}</span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="shrink-0 gap-1.5"
              onClick={e => handleDuplicate(plan.id, e)}
              disabled={duplicating === plan.id}
              title="שכפל תוכנית"
            >
              {duplicating === plan.id
                ? <Loader2 className="size-3.5 animate-spin" />
                : <Copy className="size-3.5" />
              }
              <span className="hidden sm:inline">שכפל</span>
            </Button>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
