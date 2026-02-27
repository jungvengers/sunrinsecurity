import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { ClubFormBuilder } from "./form-builder";
import { formatCycleName } from "@/lib/utils";

export default async function ClubAdminFormsPage({
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
      cycle: {
        include: {
          rounds: {
            orderBy: { roundNumber: "desc" },
            take: 1,
            include: {
              applicationForms: {
                where: { clubId },
              },
            },
          },
        },
      },
    },
  });

  if (!assignment && session!.user.role !== "ADMIN") {
    redirect("/club-admin");
  }

  const cycle = assignment?.cycle || await prisma.recruitmentCycle.findUnique({
    where: { id: cycleId },
    include: {
      rounds: {
        orderBy: { roundNumber: "desc" },
        take: 1,
        include: {
          applicationForms: {
            where: { clubId },
          },
        },
      },
    },
  });

  const club = assignment?.club || await prisma.club.findUnique({
    where: { id: clubId },
  });

  if (!cycle || !club) {
    notFound();
  }

  const round = cycle.rounds[0];
  if (!round) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-2">{club.name} 지원서 양식</h1>
        <p className="text-[hsl(var(--muted-foreground))]">
          아직 모집 라운드가 생성되지 않았습니다.
        </p>
      </div>
    );
  }

  const existingForm = round.applicationForms[0];
  const isReadOnly = cycle.status === "COMPLETED";

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">
          {formatCycleName(cycle.year, cycle.name)}
        </p>
        <h1 className="text-2xl font-bold">{club.name} 지원서 양식</h1>
      </div>

      {isReadOnly && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6">
          <p className="text-green-400 font-medium">
            완료된 사이클입니다. 양식을 수정할 수 없습니다.
          </p>
        </div>
      )}

      <ClubFormBuilder
        roundId={round.id}
        clubId={clubId}
        existingForm={existingForm}
        isReadOnly={isReadOnly}
      />
    </div>
  );
}
