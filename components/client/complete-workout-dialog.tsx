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

interface Props {
  workoutDayId: string
  dayName: string
}

export function CompleteWorkoutDialog({ workoutDayId, dayName }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [loading, setLoading] = useState(false)

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

    toast.success("כל הכבוד! האימון נרשם 💪")
    setOpen(false)
    setFeedback("")
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm">
            סיימתי אימון ✓
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>סיום אימון — {dayName}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2 py-2">
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
          <Button onClick={handleComplete} disabled={loading}>
            {loading ? "שומר..." : "שמור אימון"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
