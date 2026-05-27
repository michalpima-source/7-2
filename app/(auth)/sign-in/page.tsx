import { SignInForm } from "@/components/auth/sign-in-form"

export default function SignInPage() {
  return (
    <div className="flex min-h-svh items-center justify-center p-4 bg-gradient-to-br from-background via-secondary/30 to-accent/20">
      <SignInForm />
    </div>
  )
}
