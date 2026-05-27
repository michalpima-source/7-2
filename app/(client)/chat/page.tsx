import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ChatPanel } from "@/components/client/chat-panel"
import type { ChatMessage } from "@/lib/types"

export default async function ChatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/sign-in")

  const { data: messages } = await supabase
    .from("chat_messages")
    .select("id, client_id, role, content, created_at")
    .eq("client_id", user.id)
    .order("created_at", { ascending: true })
    .limit(50)

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="p-4 border-b">
        <h1 className="text-lg font-semibold">מאמן AI</h1>
        <p className="text-sm text-muted-foreground">שאל כל שאלה על האימונים שלך</p>
      </div>
      <ChatPanel
        clientId={user.id}
        initialMessages={(messages ?? []) as ChatMessage[]}
      />
    </div>
  )
}
