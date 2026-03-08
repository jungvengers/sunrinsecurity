import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { UserSearchForm } from "./user-search-form";

const roleLabel: Record<string, string> = {
  ADMIN: "관리자",
  TEACHER: "선생님",
  STUDENT: "학생",
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; grade?: string }>;
}) {
  const { q, grade } = await searchParams;

  const where: Prisma.UserWhereInput = {};
  if (q?.trim()) {
    const term = q.trim();
    where.OR = [
      { name: { contains: term, mode: "insensitive" } },
      { email: { contains: term, mode: "insensitive" } },
      { studentId: { contains: term, mode: "insensitive" } },
    ];
  }
  if (grade !== undefined && grade !== "" && !Number.isNaN(Number(grade))) {
    where.grade = Number(grade);
  }

  const users = await prisma.user.findMany({
    where,
    orderBy: [{ role: "asc" }, { name: "asc" }],
    include: {
      _count: {
        select: {
          applications: true,
          clubAdmins: true,
        },
      },
    },
  });

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">Users</p>
        <h1 className="text-2xl font-bold">사용자</h1>
      </div>

      <UserSearchForm
        key={`${q ?? ""}-${grade ?? ""}`}
        defaultQ={q}
        defaultGrade={grade ?? ""}
        className="mb-6"
      />

      <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[hsl(var(--border))]">
              <th className="text-left p-4 text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                이름
              </th>
              <th className="text-left p-4 text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                이메일
              </th>
              <th className="text-left p-4 text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                역할
              </th>
              <th className="text-left p-4 text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                지원 횟수
              </th>
              <th className="text-left p-4 text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                관리자 지정
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-[hsl(var(--border))] last:border-0">
                <td className="p-4 font-medium">{user.name || "-"}</td>
                <td className="p-4 text-[hsl(var(--muted-foreground))]">{user.email}</td>
                <td className="p-4">{roleLabel[user.role] || user.role}</td>
                <td className="p-4">{user._count.applications}</td>
                <td className="p-4">{user._count.clubAdmins}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
