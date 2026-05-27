"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Users, LogOut, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface Props {
  fullName: string
  children: React.ReactNode
}

export function TrainerShell({ fullName, children }: Props) {
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
          <span className="font-semibold text-sm">סטודיו איתי — מאמן</span>
        </div>

        <nav className="flex items-center gap-1">
          <Link href="/trainer/clients">
            <Button
              variant={pathname.startsWith("/trainer/clients") ? "secondary" : "ghost"}
              size="sm"
              className="gap-1.5"
            >
              <Users className="size-4" />
              <span className="hidden sm:inline">לקוחות</span>
            </Button>
          </Link>
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
