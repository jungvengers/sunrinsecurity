"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createOrUpdateForm(
  roundId: string,
  clubId: string,
  questions: object[]
) {
  const session = await auth();
  if (!session) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  const round = await prisma.recruitmentRound.findUnique({
    where: { id: roundId },
    select: { cycleId: true },
  });

  if (!round) {
    return { success: false, error: "라운드를 찾을 수 없습니다." };
  }

  if (session.user.role !== "ADMIN") {
    const assignment = await prisma.clubAdmin.findFirst({
      where: {
        userId: session.user.id,
        clubId,
        cycleId: round.cycleId,
      },
      select: { id: true },
    });

    if (!assignment) {
      return { success: false, error: "권한이 없습니다." };
    }
  }

  if (!Array.isArray(questions)) {
    return { success: false, error: "질문 형식이 올바르지 않습니다." };
  }

  const existing = await prisma.applicationForm.findFirst({
    where: { roundId, clubId },
  });

  if (existing) {
    await prisma.applicationForm.update({
      where: { id: existing.id },
      data: { questions },
    });
  } else {
    await prisma.applicationForm.create({
      data: {
        roundId,
        clubId,
        questions,
        isActive: true,
      },
    });
  }

  revalidatePath(`/admin/cycles/${round?.cycleId}/rounds/${roundId}/forms`);
  revalidatePath(`/club-admin/${round.cycleId}/${clubId}/forms`);
  return { success: true };
}

export async function deleteForm(id: string) {
  const session = await auth();
  if (!session) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  const form = await prisma.applicationForm.findUnique({
    where: { id },
    include: { round: true },
  });

  if (!form) {
    return { success: false, error: "지원서 양식을 찾을 수 없습니다." };
  }

  if (session.user.role !== "ADMIN") {
    const assignment = await prisma.clubAdmin.findFirst({
      where: {
        userId: session.user.id,
        clubId: form.clubId,
        cycleId: form.round.cycleId,
      },
      select: { id: true },
    });

    if (!assignment) {
      return { success: false, error: "권한이 없습니다." };
    }
  }

  await prisma.applicationForm.delete({
    where: { id },
  });

  revalidatePath(
    `/admin/cycles/${form.round.cycleId}/rounds/${form.roundId}/forms`
  );
  revalidatePath(`/club-admin/${form.round.cycleId}/${form.clubId}/forms`);
  return { success: true };
}
