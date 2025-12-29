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
  if (!session || session.user.role !== "ADMIN") {
    return { success: false, error: "권한이 없습니다." };
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

  const round = await prisma.recruitmentRound.findUnique({
    where: { id: roundId },
  });

  revalidatePath(`/admin/cycles/${round?.cycleId}/rounds/${roundId}/forms`);
  return { success: true };
}

export async function deleteForm(id: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return { success: false, error: "권한이 없습니다." };
  }

  const form = await prisma.applicationForm.delete({
    where: { id },
    include: { round: true },
  });

  revalidatePath(
    `/admin/cycles/${form.round.cycleId}/rounds/${form.roundId}/forms`
  );
}
