import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL("/sign-in", process.env.NEXT_PUBLIC_APP_URL!))
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role === "trainer") {
    return NextResponse.redirect(new URL("/trainer/clients", process.env.NEXT_PUBLIC_APP_URL!))
  }

  const { data: clientProfile } = await supabase
    .from("client_profiles")
    .select("onboarded_at")
    .eq("id", user.id)
    .single()

  if (clientProfile?.onboarded_at) {
    return NextResponse.redirect(new URL("/client/dashboard", process.env.NEXT_PUBLIC_APP_URL!))
  }

  return NextResponse.redirect(new URL("/client/onboarding", process.env.NEXT_PUBLIC_APP_URL!))
}
