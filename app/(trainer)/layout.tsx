import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TrainerShell } from "@/components/trainer/trainer-shell"

export default async function TrainerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/sign-in")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "trainer") redirect("/sign-in")

  return <TrainerShell fullName={profile.full_name}>{children}</TrainerShell>
}
