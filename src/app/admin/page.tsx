import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { FolderOpen, Users, UserCircle, FileText, ArrowRight } from "lucide-react";

export default async function AdminDashboardPage() {
  const [projectCount, clubCount, userCount, applicationCount, activeCycle] =
    await Promise.all([
      prisma.project.count(),
      prisma.club.count(),
      prisma.user.count(),
      prisma.application.count(),
      prisma.recruitmentCycle.findFirst({
        where: { status: { not: "COMPLETED" } },
        include: {
          rounds: {
            orderBy: { roundNumber: "desc" },
            take: 1,
          },
          _count: {
            select: { clubAdmins: true },
          },
        },
      }),
    ]);

  const stats = [
    { label: "프로젝트", value: projectCount, icon: FolderOpen, href: "/admin/projects" },
    { label: "동아리", value: clubCount, icon: Users, href: "/admin/clubs" },
    { label: "사용자", value: userCount, icon: UserCircle, href: "/admin/users" },
    { label: "지원서", value: applicationCount, icon: FileText, href: "/admin/applications" },
  ];

  const statusLabels: Record<string, string> = {
    DRAFT: "준비중",
    OPEN: "모집중",
    CLOSED: "마감",
    REVIEWING: "심사중",
    ALLOCATING: "배정중",
    COMPLETED: "완료",
  };

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">Overview</p>
        <h1 className="text-2xl font-bold">대시보드</h1>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-5 hover:border-[hsl(var(--muted-foreground))] transition-colors group"
          >
            <div className="flex items-start justify-between mb-3">
              <stat.icon className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
              <ArrowRight className="w-4 h-4 text-[hsl(var(--muted-foreground))] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-2xl font-bold mb-1">{stat.value}</p>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">{stat.label}</p>
          </Link>
        ))}
      </div>

      {activeCycle ? (
        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">진행 중인 사이클</h2>
            <Link
              href={`/admin/cycles/${activeCycle.id}`}
              className="text-sm text-[hsl(var(--muted-foreground))] hover:text-white transition-colors"
            >
              자세히 보기 →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">이름</p>
              <p className="font-medium">
                {activeCycle.name} ({activeCycle.year})
              </p>
            </div>
            <div>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">상태</p>
              <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-[hsl(var(--secondary))]">
                {statusLabels[activeCycle.status] || activeCycle.status}
              </span>
            </div>
            <div>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">최대 지원</p>
              <p className="font-medium">{activeCycle.maxApplications}개</p>
            </div>
            <div>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">현재 라운드</p>
              <p className="font-medium">
                {activeCycle.rounds[0]?.name || "-"}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-8 text-center">
          <p className="text-[hsl(var(--muted-foreground))] mb-4">
            진행 중인 지원 사이클이 없습니다
          </p>
          <Link
            href="/admin/cycles/new"
            className="inline-block px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            새 사이클 만들기
          </Link>
        </div>
      )}
    </div>
  );
}
