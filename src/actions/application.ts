"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitApplication(formData: FormData) {
  const session = await auth();

  if (!session) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  if (session.user.role === "TEACHER") {
    return { success: false, error: "선생님 계정은 지원이 불가능합니다." };
  }

  const roundId = formData.get("roundId") as string;
  const clubId = formData.get("clubId") as string;
  const formId = formData.get("formId") as string;
  const priority = parseInt(formData.get("priority") as string);

  if (!roundId || !clubId || !formId || !priority) {
    return { success: false, error: "필수 정보가 누락되었습니다." };
  }

  const round = await prisma.recruitmentRound.findUnique({
    where: { id: roundId },
    include: { cycle: true },
  });

  if (!round) {
    return { success: false, error: "모집 라운드를 찾을 수 없습니다." };
  }

  const now = new Date();
  const applyStartDate = round.cycle.applyStartDate;
  const applyEndDate = round.cycle.applyEndDate;

  if (!applyStartDate || !applyEndDate) {
    return { success: false, error: "지원 기간이 설정되지 않았습니다." };
  }

  if (now < applyStartDate) {
    return { success: false, error: "아직 지원 기간이 시작되지 않았습니다." };
  }

  if (now > applyEndDate) {
    return { success: false, error: "지원 기간이 마감되었습니다." };
  }

  const existingCount = await prisma.application.count({
    where: {
      userId: session.user.id,
      roundId,
    },
  });

  if (existingCount >= round.cycle.maxApplications) {
    return { success: false, error: "최대 지원 가능 개수를 초과했습니다." };
  }

  const existingForClub = await prisma.application.findFirst({
    where: {
      userId: session.user.id,
      clubId,
      roundId,
    },
  });

  if (existingForClub) {
    return { success: false, error: "이미 해당 동아리에 지원했습니다." };
  }

  const form = await prisma.applicationForm.findUnique({
    where: { id: formId },
  });

  if (!form) {
    return { success: false, error: "지원서 양식을 찾을 수 없습니다." };
  }

  interface Question {
    id: string;
    required: boolean;
  }

  const questions = form.questions as unknown as Question[];
  const answers: Record<string, string | string[]> = {};

  for (const question of questions) {
    const answer = formData.getAll(`answer_${question.id}`);
    if (
      question.required &&
      (!answer || answer.length === 0 || answer[0] === "")
    ) {
      return { success: false, error: "필수 질문에 답변해주세요." };
    }
    answers[question.id] =
      answer.length === 1 ? (answer[0] as string) : (answer as string[]);
  }

  try {
    await prisma.application.create({
      data: {
        userId: session.user.id,
        clubId,
        roundId,
        formId,
        priority,
        answers,
        status: "PENDING",
      },
    });

    revalidatePath("/apply");
    return { success: true };
  } catch (error) {
    console.error("Application submission error:", error);
    return { success: false, error: "지원서 제출 중 오류가 발생했습니다." };
  }
}
