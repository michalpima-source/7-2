import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { OnboardingForm } from "@/components/client/onboarding-form"

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/sign-in")

  const { data: clientProfile } = await supabase
    .from("client_profiles")
    .select("onboarded_at")
    .eq("id", user.id)
    .single()

  if (clientProfile?.onboarded_at) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <OnboardingForm />
    </div>
  )
}
