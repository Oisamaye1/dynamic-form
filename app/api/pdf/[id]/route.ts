import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { formatFormData } from "@/lib/form-utils"
import { logError } from "@/lib/debug-utils"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const responseId = params.id

    // Get the response data
    const supabase = createServerSupabaseClient()

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Get the response
    const { data: response, error } = await supabase.from("form_responses").select().eq("id", responseId).single()

    if (error || !response) {
      return new NextResponse("Response not found", { status: 404 })
    }

    // Check if user is authorized to view this response
    const isAuthorized = response.user_id === session.user.id || session.user.email === process.env.ADMIN_EMAIL

    if (!isAuthorized) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Format the form data
    const sections = formatFormData(response.form_data || {})

    // Return the data as JSON
    return NextResponse.json({
      response,
      sections,
    })
  } catch (error: any) {
    logError("PDF API Route", error)
    return new NextResponse("Error getting response data", { status: 500 })
  }
}
