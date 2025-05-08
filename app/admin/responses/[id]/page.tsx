import { redirect } from "next/navigation"
import { formatDate } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { checkAdminSession } from "@/actions/admin-actions"
import { createServerSupabaseClient } from "@/lib/supabase"
import { formatFormData } from "@/lib/form-utils"
import { logError } from "@/lib/debug-utils"
import { ExcelDownloadButton } from "@/components/excel/excel-download-button"

export default async function AdminResponseDetailPage({ params }: { params: { id: string } }) {
  try {
    // Check if user is admin
    const { isAdmin } = await checkAdminSession()

    if (!isAdmin) {
      redirect("/admin/login")
    }

    // Get the response
    const supabase = createServerSupabaseClient()
    const { data: response, error } = await supabase.from("form_responses").select().eq("id", params.id).single()

    if (error || !response) {
      return (
        <div className="container mx-auto py-10">
          <h1 className="text-3xl font-bold mb-8">Response Not Found</h1>
          <Button asChild>
            <Link href="/admin/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      )
    }

    // Format the form data with full questions
    const sections = formatFormData(response.form_data || {})

    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center gap-4 mb-8">
          <Button asChild variant="outline">
            <Link href="/admin/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Response Details</h1>
          <div className="ml-auto">
            <ExcelDownloadButton
              url={`/api/excel/${params.id}`}
              variant="default"
              className="bg-green-600 hover:bg-green-700"
            >
              Export to Excel
            </ExcelDownloadButton>
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Submission Information</CardTitle>
            <CardDescription>
              Submitted on {formatDate(response.created_at)}
              {" (Anonymous submission)"}
            </CardDescription>
          </CardHeader>
        </Card>

        {Object.entries(sections).map(([sectionName, items]) => (
          <Card key={sectionName} className="mb-8">
            <CardHeader>
              <CardTitle className="capitalize">{sectionName.replace("_", " ")}</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="divide-y divide-gray-200">
                {items.map((item, index) => (
                  <div key={index} className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">{item.question}</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{item.answer}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  } catch (error) {
    logError("AdminResponseDetailPage", error)
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-8">Error Loading Response</h1>
        <p className="text-red-500 mb-4">An error occurred while loading this response.</p>
        <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-xs mt-4">
          {error instanceof Error ? error.message : "Unknown error"}
        </pre>
        <div className="mt-6">
          <Button asChild>
            <Link href="/admin/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    )
  }
}
