"use client"

import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Dumbbell, MessageCircle, LogOut, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const NAV = [
  { href: "/client/dashboard", label: "תוכנית אימון", icon: Dumbbell },
  { href: "/client/chat", label: "מאמן AI", icon: MessageCircle },
]

interface Props {
  fullName: string
  children: React.ReactNode
}

export function ClientShell({ fullName, children }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success("להתראות!")
    router.push("/sign-in")
  }

  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex items-center justify-between border-b px-4 h-16 shrink-0">
        <div className="flex items-center gap-2">
          <Zap className="size-5 text-primary" />
          <span className="font-semibold text-sm">סטודיו איתי</span>
        </div>

        <nav className="flex items-center gap-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}>
              <Button
                variant={pathname === href ? "secondary" : "ghost"}
                size="sm"
                className="gap-1.5"
              >
                <Icon className="size-4" />
                <span className="hidden sm:inline">{label}</span>
              </Button>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground hidden sm:inline">{fullName}</span>
          <Button variant="ghost" size="icon-sm" onClick={handleLogout} title="התנתק">
            <LogOut className="size-4" />
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
