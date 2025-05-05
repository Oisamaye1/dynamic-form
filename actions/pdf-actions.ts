"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { checkAdminSession } from "@/actions/admin-actions"

// Function to check if user has access to the response
export async function hasAccessToResponse(responseId: string) {
  const supabase = createServerSupabaseClient()

  // Check if user is admin
  const { isAdmin } = await checkAdminSession()

  if (isAdmin) {
    return true
  }

  // If not admin, check if user owns the response
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return false
  }

  const { data } = await supabase.from("form_responses").select("user_id").eq("id", responseId).single()

  return data?.user_id === session.user.id
}

// Get form response data
export async function getFormResponseData(responseId: string) {
  const supabase = createServerSupabaseClient()

  // Check if user has access to this response
  const hasAccess = await hasAccessToResponse(responseId)

  if (!hasAccess) {
    throw new Error("Unauthorized")
  }

  const { data: response, error } = await supabase.from("form_responses").select().eq("id", responseId).single()

  if (error || !response) {
    throw new Error("Response not found")
  }

  return response
}
