"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { GOAL_LABELS, LEVEL_LABELS, DAYS_OF_WEEK, type Goal, type FitnessLevel } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"

const STEPS = ["מטרה", "רמת כושר", "ימים פנויים", "מגבלות"] as const

export function OnboardingForm() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [goal, setGoal] = useState<Goal | "">("")
  const [fitnessLevel, setFitnessLevel] = useState<FitnessLevel | "">("")
  const [availableDays, setAvailableDays] = useState<string[]>([])
  const [limitations, setLimitations] = useState("")
  const [loading, setLoading] = useState(false)

  function toggleDay(day: string) {
    setAvailableDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
  }

  async function handleSubmit() {
    if (!goal || !fitnessLevel || availableDays.length === 0) {
      toast.error("יש למלא את כל השדות הנדרשים")
      return
    }
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user!.id).single()

    try {
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal,
          fitness_level: fitnessLevel,
          available_days: availableDays,
          limitations,
          name: profile?.full_name ?? "",
        }),
      })
      if (!res.ok) throw new Error("Failed")
      toast.success("התוכנית שלך נוצרה בהצלחה! 🎉")
      router.push("/client/dashboard")
    } catch {
      toast.error("שגיאה ביצירת התוכנית, נסה שוב")
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-lg p-6">
      <div className="mb-6">
        <div className="flex gap-1 mb-4">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-muted"}`}
            />
          ))}
        </div>
        <Badge variant="secondary" className="mb-2">{`שלב ${step + 1} מתוך ${STEPS.length}`}</Badge>
        <h2 className="text-xl font-bold">
          {step === 0 && "מה המטרה שלך?"}
          {step === 1 && "מה רמת הכושר שלך?"}
          {step === 2 && "באילו ימים אתה פנוי לאימון?"}
          {step === 3 && "האם יש לך מגבלות גופניות?"}
        </h2>
      </div>

      {step === 0 && (
        <div className="flex flex-col gap-3">
          {(Object.keys(GOAL_LABELS) as Goal[]).map(g => (
            <button
              key={g}
              type="button"
              onClick={() => setGoal(g)}
              className={`rounded-lg border p-4 text-right transition-colors hover:bg-muted ${goal === g ? "border-primary bg-primary/5 font-medium" : "border-border"}`}
            >
              {GOAL_LABELS[g]}
            </button>
          ))}
        </div>
      )}

      {step === 1 && (
        <div className="flex flex-col gap-3">
          {(Object.keys(LEVEL_LABELS) as FitnessLevel[]).map(l => (
            <button
              key={l}
              type="button"
              onClick={() => setFitnessLevel(l)}
              className={`rounded-lg border p-4 text-right transition-colors hover:bg-muted ${fitnessLevel === l ? "border-primary bg-primary/5 font-medium" : "border-border"}`}
            >
              {LEVEL_LABELS[l]}
            </button>
          ))}
        </div>
      )}

      {step === 2 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {DAYS_OF_WEEK.map(day => (
            <button
              key={day}
              type="button"
              onClick={() => toggleDay(day)}
              className={`rounded-lg border p-3 text-sm transition-colors hover:bg-muted ${availableDays.includes(day) ? "border-primary bg-primary/5 font-medium" : "border-border"}`}
            >
              {day}
            </button>
          ))}
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="limitations">מגבלות גופניות (אופציונלי)</Label>
          <Textarea
            id="limitations"
            value={limitations}
            onChange={e => setLimitations(e.target.value)}
            placeholder="לדוגמה: כאב בברך ימין, בעיות גב תחתון..."
            rows={4}
          />
          <p className="text-xs text-muted-foreground">אם אין מגבלות, השאר ריק</p>
        </div>
      )}

      <div className="flex justify-between mt-6 gap-3">
        {step > 0 ? (
          <Button variant="outline" onClick={() => setStep(s => s - 1)}>
            חזרה
          </Button>
        ) : (
          <div />
        )}
        {step < STEPS.length - 1 ? (
          <Button
            onClick={() => setStep(s => s + 1)}
            disabled={
              (step === 0 && !goal) ||
              (step === 1 && !fitnessLevel) ||
              (step === 2 && availableDays.length === 0)
            }
          >
            המשך
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "יוצר תוכנית... 🤖" : "צור תוכנית אימון"}
          </Button>
        )}
      </div>
    </Card>
  )
}
