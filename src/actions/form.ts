"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
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

    await writeAuditLog({
      actorId: session.user.id,
      actorRole: session.user.role,
      action: "application-form.update",
      targetType: "ApplicationForm",
      targetId: existing.id,
      metadata: { roundId, clubId },
    });
  } else {
    const created = await prisma.applicationForm.create({
      data: {
        roundId,
        clubId,
        questions,
        isActive: true,
      },
    });

    await writeAuditLog({
      actorId: session.user.id,
      actorRole: session.user.role,
      action: "application-form.create",
      targetType: "ApplicationForm",
      targetId: created.id,
      metadata: { roundId, clubId },
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

  await writeAuditLog({
    actorId: session.user.id,
    actorRole: session.user.role,
    action: "application-form.delete",
    targetType: "ApplicationForm",
    targetId: id,
    metadata: { roundId: form.roundId, clubId: form.clubId },
  });

  revalidatePath(
    `/admin/cycles/${form.round.cycleId}/rounds/${form.roundId}/forms`
  );
  revalidatePath(`/club-admin/${form.round.cycleId}/${form.clubId}/forms`);
  return { success: true };
}
