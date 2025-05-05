import { adminLogout } from "@/actions/admin-actions"
import { NextResponse } from "next/server"

export async function POST() {
  await adminLogout()
  return NextResponse.redirect(new URL("/admin/login", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"))
}
