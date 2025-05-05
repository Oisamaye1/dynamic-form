import { redirect } from "next/navigation"
import { checkAdminSession } from "@/actions/admin-actions"

export default async function AdminPage() {
  const { isAdmin } = await checkAdminSession()

  if (isAdmin) {
    redirect("/admin/dashboard")
  } else {
    redirect("/admin/login")
  }
}
