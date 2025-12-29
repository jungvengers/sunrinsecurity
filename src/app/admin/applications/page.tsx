import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { FileText, ArrowRight, CheckCircle } from "lucide-react";

const statusLabels: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "준비중", color: "bg-gray-500/20 text-gray-400" },
  OPEN: { label: "모집중", color: "bg-green-500/20 text-green-400" },
  CLOSED: { label: "마감", color: "bg-yellow-500/20 text-yellow-400" },
  REVIEWING: { label: "심사중", color: "bg-blue-500/20 text-blue-400" },
  ALLOCATING: { label: "배정중", color: "bg-purple-500/20 text-purple-400" },
  COMPLETED: { label: "완료", color: "bg-gray-500/20 text-gray-400" },
};

export default async function ApplicationsPage() {
  const cycles = await prisma.recruitmentCycle.findMany({
    include: {
      rounds: {
        orderBy: { roundNumber: "desc" },
        take: 1,
        include: {
          _count: { select: { applications: true } },
        },
      },
    },
    orderBy: { year: "desc" },
  });

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">
          Applications
        </p>
        <h1 className="text-2xl font-bold">지원서 관리</h1>
      </div>

      {cycles.length === 0 ? (
        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-12 text-center">
          <p className="text-[hsl(var(--muted-foreground))]">
            등록된 사이클이 없습니다.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cycles.map((cycle) => {
            const status = statusLabels[cycle.status] || statusLabels.DRAFT;
            return (
              <Link
                key={cycle.id}
                href={`/admin/applications/${cycle.id}`}
                className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-5 hover:border-[hsl(var(--muted-foreground))] transition-colors group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {cycle.status === "COMPLETED" ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <FileText className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
                    )}
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${status.color}`}
                    >
                      {status.label}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[hsl(var(--muted-foreground))] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h2 className="font-semibold mb-1">{cycle.name}</h2>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  {cycle.year}년
                </p>
                <p className="text-2xl font-bold mt-3">
                  {cycle.rounds[0]?._count.applications || 0}
                  <span className="text-sm font-normal text-[hsl(var(--muted-foreground))] ml-1">
                    명 지원
                  </span>
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
