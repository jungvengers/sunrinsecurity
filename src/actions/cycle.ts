"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { CycleStatus, RoundStatus } from "@prisma/client";

export async function createCycle(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("권한이 없습니다.");
  }

  const year = parseInt(formData.get("year") as string);
  const name = formData.get("name") as string;
  const maxApplications =
    parseInt(formData.get("maxApplications") as string) || 3;
  const viewStartDate = formData.get("viewStartDate") as string;
  const applyStartDate = formData.get("applyStartDate") as string;
  const applyEndDate = formData.get("applyEndDate") as string;

  // 활성 사이클이 있는지 확인 (DRAFT, COMPLETED 제외)
  const activeCycle = await prisma.recruitmentCycle.findFirst({
    where: {
      status: {
        notIn: ["DRAFT", "COMPLETED"],
      },
    },
  });

  if (activeCycle) {
    throw new Error(
      "이미 진행 중인 사이클이 있습니다. 기존 사이클을 완료한 후 새 사이클을 생성하세요."
    );
  }

  const cycle = await prisma.recruitmentCycle.create({
    data: {
      year,
      name,
      maxApplications,
      viewStartDate: viewStartDate ? new Date(viewStartDate) : null,
      applyStartDate: applyStartDate ? new Date(applyStartDate) : null,
      applyEndDate: applyEndDate ? new Date(applyEndDate) : null,
      status: "DRAFT",
    },
  });

  // 기본 라운드 생성
  await prisma.recruitmentRound.create({
    data: {
      cycleId: cycle.id,
      roundNumber: 1,
      name: "1차 모집",
      startDate: applyStartDate ? new Date(applyStartDate) : null,
      endDate: applyEndDate ? new Date(applyEndDate) : null,
      status: "DRAFT",
    },
  });

  revalidatePath("/admin/cycles");
  redirect(`/admin/cycles/${cycle.id}`);
}

export async function updateCycle(
  id: string,
  formData: FormData
): Promise<void> {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("권한이 없습니다.");
  }

  const name = formData.get("name") as string;
  const maxApplications =
    parseInt(formData.get("maxApplications") as string) || 3;
  const status = formData.get("status") as CycleStatus | undefined;
  const viewStartDate = formData.get("viewStartDate") as string;
  const applyStartDate = formData.get("applyStartDate") as string;
  const applyEndDate = formData.get("applyEndDate") as string;

  const updateData: {
    name: string;
    maxApplications: number;
    viewStartDate?: Date | null;
    applyStartDate?: Date | null;
    applyEndDate?: Date | null;
    status?: CycleStatus;
  } = {
    name,
    maxApplications,
  };

  if (viewStartDate !== undefined) {
    updateData.viewStartDate = viewStartDate ? new Date(viewStartDate) : null;
  }
  if (applyStartDate !== undefined) {
    updateData.applyStartDate = applyStartDate
      ? new Date(applyStartDate)
      : null;
  }
  if (applyEndDate !== undefined) {
    updateData.applyEndDate = applyEndDate ? new Date(applyEndDate) : null;
  }
  if (status) {
    updateData.status = status;
  }

  await prisma.recruitmentCycle.update({
    where: { id },
    data: updateData,
  });

  revalidatePath("/admin/cycles");
  revalidatePath(`/admin/cycles/${id}`);
}

export async function deleteCycle(id: string): Promise<void> {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("권한이 없습니다.");
  }

  await prisma.recruitmentCycle.delete({
    where: { id },
  });

  revalidatePath("/admin/cycles");
}

export async function createRound(
  cycleId: string,
  formData: FormData
): Promise<void> {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("권한이 없습니다.");
  }

  const name = formData.get("name") as string;
  const startDate = formData.get("startDate") as string;
  const endDate = formData.get("endDate") as string;

  const lastRound = await prisma.recruitmentRound.findFirst({
    where: { cycleId },
    orderBy: { roundNumber: "desc" },
  });

  const roundNumber = (lastRound?.roundNumber || 0) + 1;

  await prisma.recruitmentRound.create({
    data: {
      cycleId,
      roundNumber,
      name: name || `${roundNumber}차 모집`,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      status: "DRAFT",
    },
  });

  revalidatePath(`/admin/cycles/${cycleId}`);
}

export async function updateRound(
  id: string,
  formData: FormData
): Promise<void> {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("권한이 없습니다.");
  }

  const name = formData.get("name") as string;
  const startDate = formData.get("startDate") as string;
  const endDate = formData.get("endDate") as string;
  const status = formData.get("status") as RoundStatus;

  const round = await prisma.recruitmentRound.update({
    where: { id },
    data: {
      name,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      status,
    },
  });

  revalidatePath(`/admin/cycles/${round.cycleId}`);
  revalidatePath("/apply");
}

export async function deleteRound(id: string): Promise<void> {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("권한이 없습니다.");
  }

  const round = await prisma.recruitmentRound.delete({
    where: { id },
  });

  revalidatePath(`/admin/cycles/${round.cycleId}`);
}

export async function addClubAdmin(cycleId: string, formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return { success: false, error: "권한이 없습니다." };
  }

  const userEmail = formData.get("userEmail") as string;
  const clubId = formData.get("clubId") as string;

  const user = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!user) {
    return { success: false, error: "사용자를 찾을 수 없습니다." };
  }

  const existing = await prisma.clubAdmin.findFirst({
    where: { userId: user.id, clubId, cycleId },
  });

  if (existing) {
    return { success: false, error: "이미 등록된 관리자입니다." };
  }

  await prisma.clubAdmin.create({
    data: {
      userId: user.id,
      clubId,
      cycleId,
    },
  });

  revalidatePath(`/admin/cycles/${cycleId}`);
  return { success: true };
}

export async function removeClubAdmin(
  id: string,
  cycleId: string
): Promise<void> {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("권한이 없습니다.");
  }

  await prisma.clubAdmin.delete({
    where: { id },
  });

  revalidatePath(`/admin/cycles/${cycleId}`);
}

export async function updateRoundClubConfig(
  roundId: string,
  configs: { clubId: string; maxMembers: number; isActive: boolean }[]
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return { success: false, error: "권한이 없습니다." };
  }

  const round = await prisma.recruitmentRound.findUnique({
    where: { id: roundId },
  });

  if (!round) {
    return { success: false, error: "라운드를 찾을 수 없습니다." };
  }

  await prisma.roundClubConfig.deleteMany({
    where: { roundId },
  });

  for (const config of configs) {
    if (config.isActive) {
      await prisma.roundClubConfig.create({
        data: {
          roundId,
          clubId: config.clubId,
          maxMembers: config.maxMembers,
          isActive: true,
        },
      });
    }
  }

  revalidatePath(`/admin/cycles/${round.cycleId}`);
  return { success: true };
}

export async function completeCycle(cycleId: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return { success: false, error: "권한이 없습니다." };
  }

  await prisma.recruitmentCycle.update({
    where: { id: cycleId },
    data: { status: "COMPLETED" },
  });

  await prisma.recruitmentRound.updateMany({
    where: { cycleId },
    data: { status: "COMPLETED" },
  });

  revalidatePath(`/admin/cycles/${cycleId}`);
  revalidatePath("/admin/cycles");
  return { success: true };
}
