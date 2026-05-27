import { SignUpForm } from "@/components/auth/sign-up-form"

export default function SignUpPage() {
  return (
    <div className="flex min-h-svh items-center justify-center p-4 bg-gradient-to-br from-background via-secondary/30 to-accent/20">
      <SignUpForm />
    </div>
  )
}
