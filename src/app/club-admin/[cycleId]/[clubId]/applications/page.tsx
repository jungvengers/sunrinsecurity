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

  const uniqueApplicantCount = new Set(applications.map((a) => a.userId)).size;

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">
          {formatCycleName(cycle.year, cycle.name)}
        </p>
        <h1 className="text-2xl font-bold">{club.name} 지원서 관리</h1>
        <p className="text-[hsl(var(--muted-foreground))] mt-1">
          총 {uniqueApplicantCount}명 지원
        </p>
      </div>

      <div className="space-y-6">
        {isReadOnly && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
            <p className="text-green-400 font-medium">
              최종 확정된 사이클로, 현재는 지원서 및 상태를 수정할 수 없습니다.
              <br />&apos;배정됨&apos; 상태로 변경된 인원이 최종 합격자입니다.
              <br />
              <span className="font-bold text-red-300">※ 별도의 합격자 발표 기간 이전에는 해당 정보가 외부로 유출되지 않도록 각별히 유의해 주시기 바랍니다.</span>
            </p>
          </div>
        )}

        {!canChangeStatus && !isReadOnly && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
            <p className="text-yellow-300 font-medium">
              지원 마감 이후에만 합격/불합격 상태를 변경할 수 있습니다.
            </p>
          </div>
        )}

        {hasAllocated && !isReadOnly && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <p className="text-blue-400 font-medium">
              배정이 완료되었습니다. 지원서 및 상태를 수정할 수 없습니다.
              <br />&apos;배정됨&apos; 상태로 변경된 인원이 최종 합격자입니다.
              <br />
              <span className="font-bold text-red-300">※ 별도의 합격자 발표 기간 이전에는 해당 정보가 외부로 유출되지 않도록 각별히 유의해 주시기 바랍니다.</span>
            </p>
          </div>
        )}

        {canChangeStatus && !isReadOnly && (
          <div className="bg-red-500/10 border border-blue-500/20 rounded-xl p-4 space-y-3">
            <h3 className="text-red-400 font-bold text-lg">⚠️ 주의사항</h3>
            <div className="text-white-400/90 font-medium text-sm space-y-2">
              <p>
                <span className="font-bold underline text-amber-300">
                  모든 내부 평가가 완료된 이후에{" "}
                </span>
                최종 상태 변경(합격/불합격) 및 순위 입력을 진행해주시기 바랍니다.
              </p>
              <p>
                합격자는 학과에서 안내한 최대 선발 인원(예: 15명 이내) 범위 내에서{" "}
                <span className="font-bold text-yellow-300">1번부터 순차적으로</span> 순위를 입력해주시기 바랍니다.
              </p>
              <br />
              <p>
                1. 합격자의 경우 순위 입력 후{" "}
                <span className="font-bold underline text-amber-300">&apos;합격&apos;으로 상태를 변경</span>
                해야 합니다.
                <br />
                <span className="text-amber-200/90">
                  ※ 순위만 입력하고 상태를 변경하지 않을 경우, 동아리 배정에 반영되지 않으며{" "}
                  <span className="font-bold underline text-red-300">불합격 처리</span>됩니다.
                </span>
              </p>
              <p>
                2. 학과에서 지정한 기간 내에 합격 상태 변경 및 순위 입력을 반드시 모두 완료해주시기 바랍니다.
                <br />
                <span className="text-amber-200/90">
                  ※ 기간 이후에 상태 변경 시 배정에 반영되지 않습니다.
                </span>
              </p>
              <p>
                3. 동아리 관리자가 수행한 모든 작업은{" "}
                <span className="font-bold underline text-amber-300">로그로 기록</span>
                되므로, 신중하게 처리해주시기 바랍니다.
              </p>
              <br />
                그 외 문의 사항은 학과 담당 선생님께 문의해주시기 바랍니다.
            </div>
          </div>
        )}

        <ClubApplicationManager
          applications={applications}
          isReadOnly={isReadOnly || hasAllocated}
          canChangeStatus={canChangeStatus}
        />
      </div>
    </div>
  );
}
