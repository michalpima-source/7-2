import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ClientShell } from "@/components/client/client-shell"

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/sign-in")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "client") redirect("/sign-in")

  return <ClientShell fullName={profile.full_name}>{children}</ClientShell>
}
