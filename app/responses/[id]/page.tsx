import { createServerSupabaseClient } from "@/lib/supabase"
import { redirect } from "next/navigation"
import { formatDate } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { formatFormData } from "@/lib/form-utils"

export default async function ResponseDetailPage({ params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      redirect("/login")
    }

    // Get the response
    const { data: response, error } = await supabase.from("form_responses").select().eq("id", params.id).single()

    if (error || !response) {
      return (
        <div className="container mx-auto py-10">
          <h1 className="text-3xl font-bold mb-8">Response Not Found</h1>
          <Button asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      )
    }

    // Check if the user is authorized to view this response
    const isAuthorized = response.user_id === session.user.id

    // Check if user is admin based on email
    const isAdmin = session.user.email === process.env.ADMIN_EMAIL

    if (!isAuthorized && !isAdmin) {
      return (
        <div className="container mx-auto py-10">
          <h1 className="text-3xl font-bold mb-8">Unauthorized</h1>
          <p className="text-red-500 mb-4">You don't have permission to view this response.</p>
          <Button asChild>
            <Link href="/dashboard">
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
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Response Details</h1>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Submission Information</CardTitle>
            <CardDescription>
              Submitted on {formatDate(response.created_at)}
              {response.is_anonymous && " (Anonymous submission)"}
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
    console.error("Error in response detail page:", error)
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-8">Error Loading Response</h1>
        <p className="text-red-500 mb-4">An error occurred while loading this response.</p>
        <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-xs mt-4">
          {error instanceof Error ? error.message : "Unknown error"}
        </pre>
        <div className="mt-6">
          <Button asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    )
  }
}
