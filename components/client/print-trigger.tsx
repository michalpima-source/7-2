"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Printer, X } from "lucide-react"

export function PrintTrigger() {
  useEffect(() => {
    const t = setTimeout(() => window.print(), 600)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="flex items-center justify-between mb-8 print:hidden">
      <p className="text-sm text-muted-foreground">תצוגה לפני הדפסה — הדפדפן יפתח את חלון ההדפסה אוטומטית</p>
      <div className="flex gap-2">
        <Button size="sm" className="gap-1.5" onClick={() => window.print()}>
          <Printer className="size-4" />
          הדפס / שמור PDF
        </Button>
        <Button size="sm" variant="ghost" className="gap-1.5" onClick={() => window.close()}>
          <X className="size-4" />
          סגור
        </Button>
      </div>
    </div>
  )
}
