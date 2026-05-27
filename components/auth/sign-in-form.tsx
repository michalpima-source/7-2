"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Zap, Mail, Lock, ArrowLeft } from "lucide-react"

export function SignInForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error("אימייל או סיסמה שגויים")
      setLoading(false)
      return
    }
    router.push("/redirect")
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="w-full max-w-sm"
    >
      {/* Logo */}
      <div className="flex flex-col items-center gap-3 mb-8">
        <div className="size-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
          <Zap className="size-7 text-primary-foreground" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">סטודיו איתי</h1>
          <p className="text-sm text-muted-foreground mt-1">ברוך הבא! כנס לחשבונך</p>
        </div>
      </div>

      {/* Card */}
      <div className="bg-card rounded-2xl border shadow-sm p-6 flex flex-col gap-5">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email" className="text-sm font-medium">אימייל</Label>
            <div className="relative">
              <Mail className="absolute end-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="pe-9"
                dir="ltr"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password" className="text-sm font-medium">סיסמה</Label>
            <div className="relative">
              <Lock className="absolute end-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="pe-9"
              />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="mt-1 h-11 text-base font-medium gap-2 w-full">
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                מתחבר...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                כניסה
                <ArrowLeft className="size-4" />
              </span>
            )}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          אין לך חשבון?{" "}
          <a href="/sign-up" className="text-primary font-medium hover:underline underline-offset-4">
            הירשם עכשיו
          </a>
        </div>
      </div>
    </motion.div>
  )
}
