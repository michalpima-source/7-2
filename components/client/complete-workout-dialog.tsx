"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { CheckCircle2, Trophy } from "lucide-react"

interface Props {
  workoutDayId: string
  dayName: string
  completedCount: number
  totalCount: number
}

export function CompleteWorkoutDialog({ workoutDayId, dayName, completedCount, totalCount }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [loading, setLoading] = useState(false)

  const allDone = totalCount > 0 && completedCount >= totalCount

  async function handleComplete() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from("workout_logs").insert({
      client_id: user.id,
      workout_day_id: workoutDayId,
      feedback: feedback || null,
    })

    if (error) {
      toast.error("שגיאה בשמירת האימון")
      setLoading(false)
      return
    }

    toast.success(allDone ? "מושלם! השלמת את כל התרגילים! 🏆" : "כל הכבוד! האימון נרשם 💪")
    setOpen(false)
    setFeedback("")
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            size="sm"
            variant={allDone ? "default" : "outline"}
            className={allDone ? "gap-1.5 bg-green-600 hover:bg-green-700" : "gap-1.5"}
          >
            {allDone ? (
              <>
                <Trophy className="size-3.5" />
                סיימתי הכל!
              </>
            ) : completedCount > 0 ? (
              <>
                <CheckCircle2 className="size-3.5" />
                סיימתי ({completedCount}/{totalCount})
              </>
            ) : (
              "סיימתי אימון ✓"
            )}
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>סיום אימון — {dayName}</DialogTitle>
        </DialogHeader>

        {totalCount > 0 && (
          <div className="flex flex-col gap-2 py-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">תרגילים שהושלמו</span>
              <span className={`font-semibold ${allDone ? "text-green-600" : ""}`}>
                {completedCount}/{totalCount}
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${allDone ? "bg-green-500" : "bg-primary"}`}
                style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
              />
            </div>
            {allDone && (
              <p className="text-sm text-green-600 font-medium flex items-center gap-1.5">
                <Trophy className="size-4" />
                השלמת את כל התרגילים — מדהים!
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col gap-2 py-1">
          <Label htmlFor="feedback">איך היה האימון? (אופציונלי)</Label>
          <Textarea
            id="feedback"
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            placeholder="כתוב איך הרגשת, מה היה קשה, מה הצליח..."
            rows={3}
          />
        </div>
        <DialogFooter>
          <Button
            onClick={handleComplete}
            disabled={loading}
            className={allDone ? "bg-green-600 hover:bg-green-700" : ""}
          >
            {loading ? "שומר..." : "שמור אימון"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
