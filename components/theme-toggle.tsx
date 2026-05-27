"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className={className}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      title="החלף מצב כהה/בהיר"
    >
      <Sun className="size-4 scale-100 dark:scale-0 transition-transform duration-200" />
      <Moon className="size-4 scale-0 dark:scale-100 transition-transform duration-200 absolute" />
    </Button>
  )
}
