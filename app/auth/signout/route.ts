import { createServerSupabaseClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function POST() {
  const supabase = createServerSupabaseClient()
  await supabase.auth.signOut()
  return NextResponse.redirect(new URL("/login", "https://v0-dynamic-multi-level-form.vercel.app"))
}
