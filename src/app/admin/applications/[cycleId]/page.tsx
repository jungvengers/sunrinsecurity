import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ApplicationManager } from "./application-manager";

export default async function CycleApplicationsPage({
  params,
}: {
  params: Promise<{ cycleId: string }>;
}) {
  const { cycleId } = await params;

  const cycle = await prisma.recruitmentCycle.findUnique({
    where: { id: cycleId },
    include: {
      rounds: {
        orderBy: { roundNumber: "desc" },
        include: {
          roundClubConfigs: true,
        },
      },
    },
  });

  if (!cycle) {
    notFound();
  }

  const latestRound = cycle.rounds[0];
  const clubConfigs = latestRound?.roundClubConfigs || [];

  const clubs = await prisma.club.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });

  const clubsWithMaxMembers = clubs.map((club) => {
    const config = clubConfigs.find((c) => c.clubId === club.id);
    return {
      id: club.id,
      name: club.name,
      maxMembers: config?.maxMembers || 0,
    };
  });

  const applications = await prisma.application.findMany({
    where: {
      round: { cycleId },
    },
    include: {
      user: true,
      club: true,
      round: true,
      applicantRank: true,
      form: true,
    },
    orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">{cycle.name} 지원서</h1>
      <p className="text-[hsl(var(--muted-foreground))] mb-8">
        {cycle.year}년 | 총 {applications.length}건
      </p>
      <ApplicationManager
        cycleId={cycleId}
        clubs={clubsWithMaxMembers}
        applications={applications}
        cycleStatus={cycle.status}
      />
    </div>
  );
}
