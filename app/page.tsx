"use client"

import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "next-themes"
import { Moon, Sun, Zap } from "lucide-react"
import Link from "next/link"

export default function Page() {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          <span className="font-semibold">Game Changer</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          aria-label="Toggle dark mode"
        >
          {resolvedTheme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 text-center">
        <div className="flex flex-col items-center gap-4 max-w-xl">
          <Badge variant="secondary">מוכן לעבודה</Badge>
          <h1 className="text-4xl font-bold tracking-tight">
            ברוכים הבאים לפרויקט שלך
          </h1>
          <p className="text-muted-foreground text-lg">
            Supabase מחובר, Auth מוכן, ואתה יכול להתחיל לבנות.
            הוסף טבלאות, הגדר RLS policies, וצור חוויה מדהימה.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/sign-in" className={buttonVariants({ size: "lg" })}>
            התחבר
          </Link>
          <Link href="/sign-up" className={buttonVariants({ size: "lg", variant: "outline" })}>
            הירשם
          </Link>
        </div>

        <p className="text-xs text-muted-foreground">
          לחץ <kbd className="rounded border px-1 font-mono text-xs">D</kbd> להחלפת מצב כהה
        </p>
      </main>
    </div>
  )
}
