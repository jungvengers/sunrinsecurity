"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateApplicationRank(
  applicationId: string,
  rank: number | null,
  note: string
) {
  const session = await auth();
  if (!session) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { round: true },
  });

  if (!application) {
    return { success: false, error: "지원서를 찾을 수 없습니다." };
  }

  const isClubAdmin = await prisma.clubAdmin.findFirst({
    where: {
      userId: session.user.id,
      clubId: application.clubId,
      cycleId: application.round.cycleId,
    },
  });

  if (session.user.role !== "ADMIN" && !isClubAdmin) {
    return { success: false, error: "권한이 없습니다." };
  }

  const existing = await prisma.applicantRank.findUnique({
    where: { applicationId },
  });

  if (existing) {
    await prisma.applicantRank.update({
      where: { applicationId },
      data: {
        rank,
        note,
        rankedById: session.user.id,
      },
    });
  } else {
    await prisma.applicantRank.create({
      data: {
        applicationId,
        clubId: application.clubId,
        rank,
        note,
        rankedById: session.user.id,
      },
    });
  }

  revalidatePath(`/admin/applications/${application.round.cycleId}`);
  return { success: true };
}

export async function updateApplicationStatus(
  applicationId: string,
  status: "PENDING" | "ACCEPTED" | "REJECTED"
) {
  const session = await auth();
  if (!session) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { round: true },
  });

  if (!application) {
    return { success: false, error: "지원서를 찾을 수 없습니다." };
  }

  const isClubAdmin = await prisma.clubAdmin.findFirst({
    where: {
      userId: session.user.id,
      clubId: application.clubId,
      cycleId: application.round.cycleId,
    },
  });

  if (session.user.role !== "ADMIN" && !isClubAdmin) {
    return { success: false, error: "권한이 없습니다." };
  }

  await prisma.application.update({
    where: { id: applicationId },
    data: { status },
  });

  revalidatePath(`/admin/applications/${application.round.cycleId}`);
  return { success: true };
}

export async function allocateMembers(cycleId: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return { success: false, error: "권한이 없습니다." };
  }

  const cycle = await prisma.recruitmentCycle.findUnique({
    where: { id: cycleId },
    include: {
      rounds: {
        orderBy: { roundNumber: "desc" },
        take: 1,
        include: {
          roundClubConfigs: true,
        },
      },
    },
  });

  if (!cycle || cycle.rounds.length === 0) {
    return { success: false, error: "배분 가능한 라운드가 없습니다." };
  }

  const round = cycle.rounds[0];
  const roundId = round.id;

  const clubConfigs = round.roundClubConfigs.reduce((acc, config) => {
    acc[config.clubId] = config.maxMembers;
    return acc;
  }, {} as Record<string, number>);

  const applications = await prisma.application.findMany({
    where: {
      roundId,
      status: "ACCEPTED",
    },
    include: {
      user: true,
      club: true,
      applicantRank: true,
    },
  });

  const clubMemberCount: Record<string, number> = {};
  const allocatedUsers = new Set<string>();
  const allocations: { id: string; clubId: string }[] = [];

  const userApplications = new Map<string, typeof applications>();
  for (const app of applications) {
    const list = userApplications.get(app.userId) || [];
    list.push(app);
    userApplications.set(app.userId, list);
  }

  for (const [, apps] of userApplications) {
    apps.sort((a, b) => a.priority - b.priority);
  }

  const clubApplications = new Map<string, typeof applications>();
  for (const app of applications) {
    const list = clubApplications.get(app.clubId) || [];
    list.push(app);
    clubApplications.set(app.clubId, list);
  }

  for (const [clubId, apps] of clubApplications) {
    apps.sort((a, b) => {
      const rankA = a.applicantRank?.rank ?? 9999;
      const rankB = b.applicantRank?.rank ?? 9999;
      if (rankA !== rankB) return rankA - rankB;
      return a.priority - b.priority;
    });
  }

  let changed = true;
  while (changed) {
    changed = false;

    for (const [userId, apps] of userApplications) {
      if (allocatedUsers.has(userId)) continue;

      for (const app of apps) {
        const maxMembers = clubConfigs[app.clubId];
        if (maxMembers === undefined) continue;

        const currentCount = clubMemberCount[app.clubId] || 0;
        if (currentCount >= maxMembers) continue;

        const clubApps = clubApplications.get(app.clubId) || [];
        const eligibleApps = clubApps.filter(
          (a) => !allocatedUsers.has(a.userId) || a.userId === userId
        );
        const cutoffIndex = Math.min(
          maxMembers - currentCount,
          eligibleApps.length
        );
        const isWithinCutoff = eligibleApps
          .slice(0, cutoffIndex)
          .some((a) => a.id === app.id);

        if (isWithinCutoff) {
          allocations.push({ id: app.id, clubId: app.clubId });
          allocatedUsers.add(userId);
          clubMemberCount[app.clubId] = currentCount + 1;
          changed = true;
          break;
        }
      }
    }
  }

  for (const allocation of allocations) {
    await prisma.application.update({
      where: { id: allocation.id },
      data: { status: "ALLOCATED" },
    });
  }

  const rejectedApps = applications.filter(
    (app) =>
      !allocations.some((a) => a.id === app.id) &&
      allocatedUsers.has(app.userId)
  );

  for (const app of rejectedApps) {
    await prisma.application.update({
      where: { id: app.id },
      data: { status: "REJECTED" },
    });
  }

  const unallocatedApps = applications.filter(
    (app) =>
      !allocations.some((a) => a.id === app.id) &&
      !allocatedUsers.has(app.userId)
  );

  for (const app of unallocatedApps) {
    await prisma.application.update({
      where: { id: app.id },
      data: { status: "REJECTED" },
    });
  }

  revalidatePath(`/admin/applications/${cycleId}`);
  return { success: true, allocated: allocations.length };
}
