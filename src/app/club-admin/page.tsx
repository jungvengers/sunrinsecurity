import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { FileText, Users, ArrowRight } from "lucide-react";

export default async function ClubAdminDashboard() {
  const session = await auth();

  const assignments = await prisma.clubAdmin.findMany({
    where: { userId: session!.user.id },
    include: {
      club: true,
      cycle: {
        include: {
          rounds: {
            orderBy: { roundNumber: "desc" },
            take: 1,
            include: {
              applications: {
                where: { clubId: { not: undefined } },
              },
              applicationForms: true,
            },
          },
        },
      },
    },
  });

  const statusLabels: Record<string, { label: string; color: string }> = {
    DRAFT: { label: "준비중", color: "bg-gray-500/20 text-gray-400" },
    OPEN: { label: "모집중", color: "bg-green-500/20 text-green-400" },
    CLOSED: { label: "마감", color: "bg-yellow-500/20 text-yellow-400" },
    REVIEWING: { label: "심사중", color: "bg-blue-500/20 text-blue-400" },
    ALLOCATING: { label: "배정중", color: "bg-purple-500/20 text-purple-400" },
    COMPLETED: { label: "완료", color: "bg-gray-500/20 text-gray-400" },
  };

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">
          Club Admin Dashboard
        </p>
        <h1 className="text-2xl font-bold">동아리 관리 대시보드</h1>
      </div>

      {assignments.length === 0 ? (
        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-12 text-center">
          <p className="text-[hsl(var(--muted-foreground))]">
            배정된 동아리가 없습니다.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {assignments.map((assignment) => {
            const round = assignment.cycle.rounds[0];
            const applications = round?.applications.filter(
              (app) => app.clubId === assignment.clubId
            ) || [];
            const hasForm = round?.applicationForms.some(
              (form) => form.clubId === assignment.clubId
            );
            const status = statusLabels[assignment.cycle.status] || statusLabels.DRAFT;

            return (
              <div
                key={assignment.id}
                className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold">{assignment.club.name}</h2>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                      {assignment.cycle.year}년 {assignment.cycle.name}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${status.color}`}>
                    {status.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-[hsl(var(--secondary))] rounded-lg p-4">
                    <p className="text-2xl font-bold">{applications.length}</p>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                      지원자
                    </p>
                  </div>
                  <div className="bg-[hsl(var(--secondary))] rounded-lg p-4">
                    <p className="text-2xl font-bold">
                      {hasForm ? "완료" : "미작성"}
                    </p>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                      지원서 양식
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Link
                    href={`/club-admin/${assignment.cycleId}/${assignment.clubId}/forms`}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[hsl(var(--secondary))] rounded-lg text-sm font-medium hover:bg-[hsl(var(--secondary))]/80 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    지원서 양식
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href={`/club-admin/${assignment.cycleId}/${assignment.clubId}/applications`}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white text-black rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    <Users className="w-4 h-4" />
                    지원서 관리
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
