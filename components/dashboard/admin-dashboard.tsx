import { createServerSupabaseClient } from "@/lib/supabase"
import { formatDate } from "@/lib/utils"
import { Eye } from "lucide-react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { checkAdminSession } from "@/actions/admin-actions"
import { logError } from "@/lib/debug-utils"

export async function AdminDashboard() {
  try {
    // Check if user is admin
    const { isAdmin } = await checkAdminSession()

    if (!isAdmin) {
      throw new Error("Unauthorized")
    }

    // If user is admin, fetch all responses
    const supabase = createServerSupabaseClient()
    const { data: responses, error } = await supabase
      .from("form_responses")
      .select(`
        id,
        form_data,
        created_at,
        is_anonymous
      `)
      .order("created_at", { ascending: false })

    if (error) throw error

    if (!responses || responses.length === 0) {
      return (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No form submissions yet.</p>
        </div>
      )
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Submission Date</TableHead>
            <TableHead>Form Type</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {responses.map((response) => {
            const formType = response.form_data.purpose
              ? response.form_data.purpose === "business"
                ? "Business Inquiry"
                : response.form_data.purpose === "personal"
                  ? "Personal Project"
                  : response.form_data.purpose === "feedback"
                    ? "Feedback"
                    : response.form_data.purpose === "research"
                      ? "Research"
                      : response.form_data.purpose === "partnership"
                        ? "Partnership"
                        : "Unknown"
              : "Unknown"

            return (
              <TableRow key={response.id}>
                <TableCell>{formatDate(response.created_at)}</TableCell>
                <TableCell>{formType}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/responses/${response.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    )
  } catch (error) {
    logError("AdminDashboard", error)
    return (
      <div className="text-center py-10">
        <p className="text-red-500">You don't have permission to view this data.</p>
      </div>
    )
  }
}
