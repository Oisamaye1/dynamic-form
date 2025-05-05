import { AuthForm } from "@/components/auth/auth-form"
import { createServerSupabaseClient } from "@/lib/supabase"
import { redirect } from "next/navigation"

export default async function LoginPage() {
  const supabase = createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen py-10">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">Dynamic Form</h1>
        <p className="text-center text-muted-foreground mb-8">Sign in to access your form and view your submissions</p>
        <AuthForm />
      </div>
    </div>
  )
}
