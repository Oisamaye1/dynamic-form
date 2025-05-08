import { getAllFormResponses } from "@/actions/form-actions"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import { ExcelDownloadButton } from "@/components/excel/excel-download-button"

export async function AdminDashboard() {
  const responses = await getAllFormResponses()

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-4">
        <ExcelDownloadButton url="/api/excel/all" variant="default" className="bg-green-600 hover:bg-green-700">
          Export All to Excel
        </ExcelDownloadButton>
      </div>

      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium">ID</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Date</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Name</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Email</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Type</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {responses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-muted-foreground">
                    No submissions yet
                  </td>
                </tr>
              ) : (
                responses.map((response) => {
                  const formData = response.form_data || {}
                  return (
                    <tr
                      key={response.id}
                      className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                    >
                      <td className="p-4 align-middle">{response.id.substring(0, 8)}...</td>
                      <td className="p-4 align-middle">{formatDate(response.created_at)}</td>
                      <td className="p-4 align-middle">{formData.name || "Anonymous"}</td>
                      <td className="p-4 align-middle">{formData.contact_info || "N/A"}</td>
                      <td className="p-4 align-middle capitalize">{formData.purpose || "N/A"}</td>
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-2">
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/admin/responses/${response.id}`}>
                              <Eye className="h-4 w-4 mr-1" /> View
                            </Link>
                          </Button>
                          <ExcelDownloadButton
                            url={`/api/excel/${response.id}`}
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-600 hover:bg-green-50"
                          >
                            Excel
                          </ExcelDownloadButton>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
