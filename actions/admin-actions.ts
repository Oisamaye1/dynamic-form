"use server"

import { cookies } from "next/headers"
import { createServerSupabaseClient } from "@/lib/supabase"
import { logError } from "@/lib/debug-utils"

// Admin login with fixed credentials from environment variables
export async function adminLogin(email: string, password: string) {
  try {
    // Check if the provided credentials match the environment variables
    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminEmail || !adminPassword) {
      return { success: false, error: "Admin credentials not configured" }
    }

    if (email !== adminEmail || password !== adminPassword) {
      return { success: false, error: "Invalid credentials" }
    }

    // If credentials match, sign in with Supabase
    const supabase = createServerSupabaseClient()

    // First check if the admin user exists
    const { data: existingUser } = await supabase.from("admin_users").select("id").eq("email", adminEmail).single()

    // If admin doesn't exist in the admin_users table, create them
    if (!existingUser) {
      // Create a new admin user in the admin_users table
      await supabase.from("admin_users").insert({ email: adminEmail })
    }

    // Set a secure admin session cookie
    const expiresIn = 60 * 60 * 24 * 7 // 1 week
    const sessionToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

    // Store the admin session
    cookies().set("admin_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: expiresIn,
      path: "/",
    })

    // Store the admin email in another cookie for display purposes
    cookies().set("admin_email", adminEmail, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: expiresIn,
      path: "/",
    })

    return { success: true }
  } catch (error) {
    logError("adminLogin", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Admin logout
export async function adminLogout() {
  try {
    cookies().delete("admin_session")
    cookies().delete("admin_email")
    return { success: true }
  } catch (error) {
    logError("adminLogout", error)
    return { success: false, error: "An error occurred during logout" }
  }
}

// Check if user is admin
export async function checkAdminSession() {
  try {
    const sessionToken = cookies().get("admin_session")?.value
    const adminEmail = cookies().get("admin_email")?.value

    if (!sessionToken || !adminEmail) {
      return { isAdmin: false }
    }

    // Verify that the admin email matches the environment variable
    if (adminEmail !== process.env.ADMIN_EMAIL) {
      return { isAdmin: false }
    }

    return { isAdmin: true, email: adminEmail }
  } catch (error) {
    logError("checkAdminSession", error)
    return { isAdmin: false }
  }
}
