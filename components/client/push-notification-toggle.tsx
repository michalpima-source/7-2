"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Bell, BellOff, BellRing, Loader2 } from "lucide-react"
import { toast } from "sonner"

type Status = "loading" | "unsupported" | "denied" | "inactive" | "active"

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}

interface Props {
  className?: string
}

export function PushNotificationToggle({ className }: Props) {
  const [status, setStatus] = useState<Status>("loading")
  const [reminderHour, setReminderHour] = useState("08")
  const [showTimeInput, setShowTimeInput] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported")
      return
    }
    if (Notification.permission === "denied") {
      setStatus("denied")
      return
    }
    navigator.serviceWorker.register("/sw.js").then(() =>
      navigator.serviceWorker.ready.then(reg =>
        reg.pushManager.getSubscription().then(sub => {
          if (sub) {
            setSubscription(sub)
            setStatus("active")
          } else {
            setStatus("inactive")
          }
        })
      )
    )
  }, [])

  async function handleActivate() {
    if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) return
    setBusy(true)
    const reminderTime = `${reminderHour}:00`
    try {
      const permission = await Notification.requestPermission()
      if (permission !== "granted") {
        setStatus("denied")
        toast.error("הרשאת התראות נדחתה")
        return
      }

      await navigator.serviceWorker.ready
      const reg = await navigator.serviceWorker.getRegistration("/sw.js")
      if (!reg) throw new Error("Service worker not registered")

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY),
      })

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub.toJSON(), reminder_time: reminderTime }),
      })

      setSubscription(sub)
      setStatus("active")
      setShowTimeInput(false)
      toast.success(`תזכורת מוגדרת לשעה ${reminderHour}:00 🔔`)
    } catch (err) {
      console.error(err)
      toast.error("שגיאה בהפעלת התראות")
    } finally {
      setBusy(false)
    }
  }

  async function handleDeactivate() {
    if (!subscription) return
    setBusy(true)
    try {
      await subscription.unsubscribe()
      await fetch("/api/push/subscribe", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      })
      setSubscription(null)
      setStatus("inactive")
      toast.success("התראות כובו")
    } catch {
      toast.error("שגיאה בכיבוי התראות")
    } finally {
      setBusy(false)
    }
  }

  if (status === "loading") {
    return (
      <Button variant="ghost" size="icon-sm" className={className} disabled>
        <Loader2 className="size-4 animate-spin" />
      </Button>
    )
  }

  if (status === "unsupported" || status === "denied") {
    return (
      <Button variant="ghost" size="icon-sm" className={className} disabled title="התראות לא זמינות בדפדפן זה">
        <BellOff className="size-4 text-muted-foreground/50" />
      </Button>
    )
  }

  if (status === "active") {
    return (
      <Button
        variant="ghost"
        size="icon-sm"
        className={className}
        onClick={handleDeactivate}
        disabled={busy}
        title="כבה תזכורות אימון"
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : <BellRing className="size-4 text-primary" />}
      </Button>
    )
  }

  if (showTimeInput) {
    return (
      <div className="flex items-center gap-1.5">
        <select
          value={reminderHour}
          onChange={e => setReminderHour(e.target.value)}
          className="h-7 rounded border px-1.5 text-xs bg-background"
        >
          {Array.from({ length: 16 }, (_, i) => String(i + 5).padStart(2, "0")).map(h => (
            <option key={h} value={h}>{h}:00</option>
          ))}
        </select>
        <Button size="sm" className="h-7 text-xs px-2 gap-1" onClick={handleActivate} disabled={busy}>
          {busy ? <Loader2 className="size-3 animate-spin" /> : "הפעל"}
        </Button>
        <Button size="sm" variant="ghost" className="h-7 text-xs px-2" onClick={() => setShowTimeInput(false)}>
          ביטול
        </Button>
      </div>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className={className}
      onClick={() => setShowTimeInput(true)}
      title="הפעל תזכורת אימון יומית"
    >
      <Bell className="size-4" />
    </Button>
  )
}
