import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { ClubApplicationManager } from "./application-manager";
import { formatCycleName } from "@/lib/utils";

export default async function ClubAdminApplicationsPage({
  params,
}: {
  params: Promise<{ cycleId: string; clubId: string }>;
}) {
  const session = await auth();
  const { cycleId, clubId } = await params;

  const assignment = await prisma.clubAdmin.findFirst({
    where: {
      userId: session!.user.id,
      cycleId,
      clubId,
    },
    include: {
      club: true,
      cycle: true,
    },
  });

  if (!assignment && session!.user.role !== "ADMIN") {
    redirect("/club-admin");
  }

  const cycle = assignment?.cycle || await prisma.recruitmentCycle.findUnique({
    where: { id: cycleId },
  });

  const club = assignment?.club || await prisma.club.findUnique({
    where: { id: clubId },
  });

  if (!cycle || !club) {
    notFound();
  }

  const applications = await prisma.application.findMany({
    where: {
      round: { cycleId },
      clubId,
    },
    include: {
      user: true,
      applicantRank: true,
      form: true,
    },
    orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
  });

  const isReadOnly = cycle.status === "COMPLETED";
  const hasAllocated = applications.some((app) => app.status === "ALLOCATED");
  const canChangeStatus =
    !!cycle.applyEndDate && new Date() >= new Date(cycle.applyEndDate);

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">
          {formatCycleName(cycle.year, cycle.name)}
        </p>
        <h1 className="text-2xl font-bold">{club.name} 지원서 관리</h1>
        <p className="text-[hsl(var(--muted-foreground))] mt-1">
          총 {applications.length}명 지원
        </p>
      </div>

      {isReadOnly && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6">
          <p className="text-green-400 font-medium">
            완료된 사이클입니다. 지원서를 수정할 수 없습니다.
          </p>
        </div>
      )}

      {hasAllocated && !isReadOnly && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
          <p className="text-blue-400 font-medium">
            배정이 완료되었습니다. 지원서를 수정할 수 없습니다.
          </p>
        </div>
      )}

      <ClubApplicationManager
        applications={applications}
        isReadOnly={isReadOnly || hasAllocated}
        canChangeStatus={canChangeStatus}
      />
    </div>
  );
}
