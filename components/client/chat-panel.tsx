"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SendHorizontal, Zap } from "lucide-react"
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

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-1">
      {[0, 1, 2].map(i => (
        <motion.span
          key={i}
          className="size-1.5 rounded-full bg-muted-foreground/50 block"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18 }}
        />
      ))}
    </div>
  )
}

export function ChatPanel({ clientId, initialMessages }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [messages, setMessages] = useState<Message[]>(
    initialMessages.map(m => ({ id: m.id, role: m.role, content: m.content }))
  )
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  const sendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: input.trim() }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInput("")
    setIsLoading(true)

    const assistantId = crypto.randomUUID()

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

      setMessages(prev => [...prev, { id: assistantId, role: "assistant", content: "" }])
      setIsLoading(false)

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
      setIsLoading(false)
      setMessages(prev => [...prev, { id: assistantId, role: "assistant", content: "שגיאה בקבלת תשובה. נסה שוב." }])
    }
  }, [input, messages, isLoading, clientId])

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center h-full gap-3 text-center text-muted-foreground"
          >
            <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Zap className="size-7 text-primary" />
            </div>
            <p className="text-sm max-w-xs">
              שאל אותי כל שאלה על האימונים שלך — טכניקה, חלופות, תזונה ועוד
            </p>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className={cn(
                "flex gap-2 items-end",
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              {msg.role === "assistant" && (
                <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mb-0.5">
                  <Zap className="size-3.5 text-primary" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[78%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap leading-relaxed",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted rounded-bl-sm"
                )}
              >
                {msg.content || "​"}
              </div>
            </motion.div>
          ))}

          {isLoading && (
            <motion.div
              key="typing"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="flex gap-2 items-end"
            >
              <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Zap className="size-3.5 text-primary" />
              </div>
              <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
                <TypingDots />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} className="flex gap-2 p-4 border-t">
        <Input
          ref={inputRef}
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
