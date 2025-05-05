import { redirect } from "next/navigation"
import { checkAdminSession } from "@/actions/admin-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogOut } from "lucide-react"
import { AdminDashboard } from "@/components/dashboard/admin-dashboard"
import { Suspense } from "react"

export default async function AdminDashboardPage() {
  const { isAdmin, email } = await checkAdminSession()

  if (!isAdmin) {
    redirect("/admin/login")
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Logged in as {email}</p>
        </div>
        <div className="flex gap-4">
          <form action="/admin/signout" method="post">
            <Button type="submit" variant="outline" className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </form>
        </div>
      </div>

      <Tabs defaultValue="submissions">
        <TabsList className="mb-4">
          <TabsTrigger value="submissions">Form Submissions</TabsTrigger>
        </TabsList>
        <TabsContent value="submissions">
          <Card>
            <CardHeader>
              <CardTitle>All Form Submissions</CardTitle>
              <CardDescription>View and manage all form submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Loading submissions...</div>}>
                <AdminDashboard />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
