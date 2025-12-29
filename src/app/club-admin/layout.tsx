import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Users, FileText, Home, LogOut } from "lucide-react";

export default async function ClubAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const clubAdminAssignments = await prisma.clubAdmin.findMany({
    where: { userId: session.user.id },
    include: {
      club: true,
      cycle: true,
    },
  });

  if (clubAdminAssignments.length === 0 && session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <aside className="fixed left-0 top-0 h-screen w-64 bg-[hsl(var(--card))] border-r border-[hsl(var(--border))] flex flex-col">
        <div className="p-6 border-b border-[hsl(var(--border))]">
          <Link href="/club-admin" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[hsl(var(--secondary))] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold">동아리 관리</h1>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Club Admin
              </p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link
            href="/club-admin"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[hsl(var(--secondary))] transition-colors"
          >
            <Home className="w-4 h-4" />
            대시보드
          </Link>
          {clubAdminAssignments.map((assignment) => (
            <div key={assignment.id} className="mt-4">
              <p className="px-4 py-2 text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                {assignment.cycle.name} - {assignment.club.name}
              </p>
              <Link
                href={`/club-admin/${assignment.cycleId}/${assignment.clubId}/forms`}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[hsl(var(--secondary))] transition-colors"
              >
                <FileText className="w-4 h-4" />
                지원서 양식
              </Link>
              <Link
                href={`/club-admin/${assignment.cycleId}/${assignment.clubId}/applications`}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[hsl(var(--secondary))] transition-colors"
              >
                <Users className="w-4 h-4" />
                지원서 관리
              </Link>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-[hsl(var(--border))]">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 rounded-full bg-[hsl(var(--secondary))] flex items-center justify-center text-sm font-medium">
              {session.user.name?.[0] || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{session.user.name}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">
                {session.user.email}
              </p>
            </div>
          </div>
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[hsl(var(--secondary))] transition-colors mt-2"
          >
            <LogOut className="w-4 h-4" />
            나가기
          </Link>
        </div>
      </aside>

      <main className="ml-64 min-h-screen p-6">{children}</main>
    </div>
  );
}
