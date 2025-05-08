"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { generateSingleResponseExcel, generateAllResponsesExcel } from "@/lib/excel-utils"
import { checkAdminSession } from "./admin-actions"
import { logError } from "@/lib/debug-utils"

// Export a single form response as Excel
export async function exportResponseAsExcel(responseId: string) {
  try {
    // Check if user is admin
    const { isAdmin } = await checkAdminSession()
    if (!isAdmin) {
      throw new Error("Unauthorized")
    }

    // Get the response from the database
    const supabase = createServerSupabaseClient()
    const { data: response, error } = await supabase.from("form_responses").select().eq("id", responseId).single()

    if (error || !response) {
      throw new Error("Response not found")
    }

    // Generate Excel file
    const excelData = generateSingleResponseExcel(response)

    return {
      success: true,
      data: excelData.buffer,
      filename: excelData.filename,
      contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }
  } catch (error) {
    logError("exportResponseAsExcel", error)
    return { success: false, error: "Failed to export response" }
  }
}

// Export all form responses as Excel
export async function exportAllResponsesAsExcel() {
  try {
    // Check if user is admin
    const { isAdmin } = await checkAdminSession()
    if (!isAdmin) {
      throw new Error("Unauthorized")
    }

    // Get all responses from the database
    const supabase = createServerSupabaseClient()
    const { data: responses, error } = await supabase
      .from("form_responses")
      .select(`
        id,
        form_data,
        created_at,
        user_id,
        is_anonymous
      `)
      .order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    // Generate Excel file
    const excelData = generateAllResponsesExcel(responses || [])

    return {
      success: true,
      data: excelData.buffer,
      filename: excelData.filename,
      contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }
  } catch (error) {
    logError("exportAllResponsesAsExcel", error)
    return { success: false, error: "Failed to export responses" }
  }
}
