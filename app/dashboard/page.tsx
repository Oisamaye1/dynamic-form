import { Suspense } from "react"
import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { LogOut } from "lucide-react"
import { AdminDashboard } from "@/components/dashboard/admin-dashboard"
import { UserResponses } from "@/components/dashboard/user-responses"

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Check if user is admin
  const isAdmin = session.user.email === "admin@example.com"

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex gap-4">
          <Button asChild variant="outline">
            <Link href="/form">New Form</Link>
          </Button>
          <form action="/auth/signout" method="post">
            <Button type="submit" variant="ghost" size="icon">
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Sign out</span>
            </Button>
          </form>
        </div>
      </div>

      <Tabs defaultValue="responses">
        <TabsList className="mb-4">
          <TabsTrigger value="responses">My Responses</TabsTrigger>
          {isAdmin && <TabsTrigger value="admin">Admin View</TabsTrigger>}
        </TabsList>
        <TabsContent value="responses">
          <Card>
            <CardHeader>
              <CardTitle>Your Form Responses</CardTitle>
              <CardDescription>View all your submitted form responses</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Loading responses...</div>}>
                <UserResponses />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
        {isAdmin && (
          <TabsContent value="admin">
            <Card>
              <CardHeader>
                <CardTitle>All Form Responses</CardTitle>
                <CardDescription>Admin view of all submitted form responses</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div>Loading responses...</div>}>
                  <AdminDashboard />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
