import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "./sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <AdminSidebar user={session.user} />
      <main className="ml-64 min-h-screen p-6">{children}</main>
    </div>
  );
}
