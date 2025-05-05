import { getUserFormResponses } from "@/actions/form-actions"
import { formatDate } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import Link from "next/link"

export async function UserResponses() {
  const responses = await getUserFormResponses()

  if (!responses || responses.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">You haven't submitted any forms yet.</p>
        <Button asChild className="mt-4">
          <Link href="/form">Start a New Form</Link>
        </Button>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Submission Date</TableHead>
          <TableHead>Form Type</TableHead>
          <TableHead>Status</TableHead>
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
              <TableCell>
                <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                  Completed
                </span>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/responses/${response.id}`}>
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
}
