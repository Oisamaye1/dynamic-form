"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { logError } from "@/lib/debug-utils"

// Save form progress (requires authentication)
export async function saveFormProgress(
  currentQuestionId: string,
  questionHistory: string[],
  answers: Record<string, string>,
) {
  const supabase = createServerSupabaseClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("User not authenticated")
  }

  // Check if the user already has a progress record
  const { data: existingProgress } = await supabase.from("form_progress").select().eq("user_id", user.id).single()

  if (existingProgress) {
    // Update existing progress
    const { error } = await supabase
      .from("form_progress")
      .update({
        current_question_id: currentQuestionId,
        question_history: questionHistory,
        answers: answers,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingProgress.id)

    if (error) throw error
    return { id: existingProgress.id }
  } else {
    // Create new progress
    const { data, error } = await supabase
      .from("form_progress")
      .insert({
        user_id: user.id,
        current_question_id: currentQuestionId,
        question_history: questionHistory,
        answers: answers,
      })
      .select()

    if (error) throw error
    return { id: data[0].id }
  }
}

// Load form progress (requires authentication)
export async function loadFormProgress() {
  const supabase = createServerSupabaseClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("User not authenticated")
  }

  const { data, error } = await supabase.from("form_progress").select().eq("user_id", user.id).single()

  if (error && error.code !== "PGRST116") {
    // PGRST116 is the error code for no rows returned
    throw error
  }

  return data
}

// Submit form (works for anonymous users)
export async function submitForm(formData: Record<string, string>) {
  try {
    const supabase = createServerSupabaseClient()

    // Insert the form response as anonymous
    const { error: insertError } = await supabase.from("form_responses").insert({
      user_id: null, // Always null since we don't have authentication
      form_data: formData,
      is_anonymous: true, // Always anonymous
    })

    if (insertError) throw insertError

    revalidatePath("/admin/dashboard")
    return { success: true }
  } catch (error) {
    logError("submitForm", error)
    return { success: false, error: "Failed to submit form" }
  }
}

// Get form responses for the current user (requires authentication)
export async function getUserFormResponses() {
  const supabase = createServerSupabaseClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("User not authenticated")
  }

  const { data, error } = await supabase
    .from("form_responses")
    .select()
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}

// Import this from admin-actions.ts
import { checkAdminSession } from "@/actions/admin-actions"

// Get all form responses (admin only)
export async function getAllFormResponses() {
  try {
    const supabase = createServerSupabaseClient()

    // Check if user is admin
    const { isAdmin } = await checkAdminSession()

    if (!isAdmin) {
      throw new Error("Unauthorized")
    }

    const { data, error } = await supabase
      .from("form_responses")
      .select(`
        id,
        form_data,
        created_at,
        user_id,
        is_anonymous
      `)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data
  } catch (error) {
    logError("getAllFormResponses", error)
    return []
  }
}
