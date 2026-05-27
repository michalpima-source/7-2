"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SendHorizontal } from "lucide-react"
import type { ChatMessage } from "@/lib/types"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

interface Props {
  clientId: string
  initialMessages: ChatMessage[]
}

export function ChatPanel({ clientId, initialMessages }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const [messages, setMessages] = useState<Message[]>(
    initialMessages.map(m => ({ id: m.id, role: m.role, content: m.content }))
  )
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: input.trim() }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInput("")
    setIsLoading(true)

    const assistantId = crypto.randomUUID()
    setMessages(prev => [...prev, { id: assistantId, role: "assistant", content: "" }])

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({
            id: m.id,
            role: m.role,
            parts: [{ type: "text", text: m.content }],
          })),
          clientId,
        }),
      })

      if (!res.ok || !res.body) throw new Error("Network error")

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantId ? { ...m, content: m.content + chunk } : m
          )
        )
      }
    } catch {
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId ? { ...m, content: "שגיאה בקבלת תשובה. נסה שוב." } : m
        )
      )
    } finally {
      setIsLoading(false)
    }
  }, [input, messages, isLoading, clientId])

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center text-muted-foreground">
            <div className="text-4xl">💪</div>
            <p className="text-sm max-w-xs">
              שאל אותי כל שאלה על האימונים שלך — טכניקה, חלופות, תזונה ועוד
            </p>
          </div>
        )}
        {messages.map(msg => (
          <div
            key={msg.id}
            className={cn(
              "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap",
              msg.role === "user"
                ? "bg-primary text-primary-foreground self-end rounded-br-sm"
                : "bg-muted self-start rounded-bl-sm"
            )}
          >
            {msg.content || (msg.role === "assistant" && isLoading ? "מקליד..." : "")}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} className="flex gap-2 p-4 border-t">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="שאל שאלה..."
          disabled={isLoading}
          className="flex-1"
        />
        <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
          <SendHorizontal className="size-4" />
        </Button>
      </form>
    </div>
  )
}
