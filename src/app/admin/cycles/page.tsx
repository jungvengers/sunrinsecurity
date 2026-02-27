import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Calendar, Users } from "lucide-react";
import { deleteCycle } from "@/actions/cycle";
import { DeleteButton } from "@/components/delete-button";
import { formatCycleName } from "@/lib/utils";

const statusLabels: Record<string, string> = {
  DRAFT: "준비중",
  OPEN: "모집중",
  CLOSED: "마감",
  REVIEWING: "심사중",
  ALLOCATING: "배정중",
  COMPLETED: "완료",
};

export default async function CyclesPage() {
  const cycles = await prisma.recruitmentCycle.findMany({
    include: {
      rounds: {
        orderBy: { roundNumber: "asc" },
        include: {
          _count: { select: { applications: true } },
        },
      },
      _count: { select: { clubAdmins: true } },
    },
    orderBy: { year: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">
            Recruitment Cycles
          </p>
          <h1 className="text-2xl font-bold">지원 사이클</h1>
        </div>
        <Link
          href="/admin/cycles/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />새 사이클
        </Link>
      </div>

      {cycles.length === 0 ? (
        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-12 text-center">
          <p className="text-[hsl(var(--muted-foreground))]">
            아직 등록된 사이클이 없습니다.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {cycles.map((cycle) => (
            <div
              key={cycle.id}
              className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-5 hover:border-white/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <Link href={`/admin/cycles/${cycle.id}`} className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-lg font-semibold hover:underline">
                      {formatCycleName(cycle.year, cycle.name)}
                    </h2>
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-[hsl(var(--secondary))]">
                      {statusLabels[cycle.status] || cycle.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-[hsl(var(--muted-foreground))]">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {cycle.year}학년도
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      관리자 {cycle._count.clubAdmins}명
                    </span>
                    <span>최대 지원 {cycle.maxApplications}개</span>
                    <span>
                      지원서{" "}
                      {cycle.rounds.reduce(
                        (sum, r) => sum + r._count.applications,
                        0
                      )}
                      개
                    </span>
                  </div>
                </Link>
                <DeleteButton
                  onDelete={deleteCycle.bind(null, cycle.id)}
                  confirmMessage={`"${cycle.name}" 사이클을 삭제하시겠습니까? 모든 지원서가 함께 삭제됩니다.`}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
