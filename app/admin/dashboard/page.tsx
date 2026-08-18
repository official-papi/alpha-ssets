import { redirect } from "next/navigation";

// /admin/dashboard → redirect to the actual admin root at /admin
export default function AdminDashboardRedirect() {
  redirect("/admin");
}
