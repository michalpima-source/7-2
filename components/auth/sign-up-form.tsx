"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"

export function SignUpForm() {
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) {
      toast.error("הסיסמה חייבת להכיל לפחות 6 תווים")
      return
    }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (error) {
      toast.error("שגיאה בהרשמה: " + error.message)
      setLoading(false)
      return
    }
    toast.success("נרשמת בהצלחה!")
    router.push("/client/onboarding")
  }

  return (
    <Card className="w-full max-w-sm p-6">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold">הרשמה</h1>
        <p className="text-sm text-muted-foreground mt-1">סטודיו איתי</p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fullName">שם מלא</Label>
          <Input
            id="fullName"
            type="text"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            required
            placeholder="ישראל ישראלי"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">אימייל</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="you@example.com"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">סיסמה</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            placeholder="לפחות 6 תווים"
          />
        </div>
        <Button type="submit" disabled={loading} className="mt-2">
          {loading ? "נרשם..." : "הירשם"}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        כבר יש לך חשבון?{" "}
        <a href="/sign-in" className="text-primary underline underline-offset-4">
          התחבר
        </a>
      </p>
    </Card>
  )
}
