"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

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
  const priority = Number(formData.get("priority"));
  const applicantPhone = String(formData.get("applicantPhone") || "").trim();

  if (!roundId || !clubId || !formId) {
    return { success: false, error: "필수 정보가 누락되었습니다." };
  }

  if (!Number.isInteger(priority) || priority < 1) {
    return { success: false, error: "지망 순위가 올바르지 않습니다." };
  }

  if (!applicantPhone) {
    return { success: false, error: "전화번호를 입력해주세요." };
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

  if (priority > round.cycle.maxApplications) {
    return { success: false, error: "지망 순위가 허용 범위를 초과했습니다." };
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

  const existingPriority = await prisma.application.findFirst({
    where: {
      userId: session.user.id,
      roundId,
      priority,
    },
  });

  if (existingPriority) {
    return { success: false, error: "이미 해당 지망 순위로 지원했습니다." };
  }

  const form = await prisma.applicationForm.findFirst({
    where: {
      id: formId,
      roundId,
      clubId,
      isActive: true,
    },
  });

  if (!form) {
    return {
      success: false,
      error: "지원서 양식이 유효하지 않거나 비활성화되었습니다.",
    };
  }

  const roundClub = await prisma.roundClubConfig.findUnique({
    where: {
      roundId_clubId: {
        roundId,
        clubId,
      },
    },
  });

  if (!roundClub || !roundClub.isActive) {
    return { success: false, error: "해당 동아리는 현재 모집 대상이 아닙니다." };
  }

  interface Question {
    id: string;
    required: boolean;
  }

  const questions = Array.isArray(form.questions)
    ? (form.questions as unknown as Question[])
    : [];
  const answers: Record<string, string | string[]> = {};

  answers.phone = applicantPhone;
  answers.answer_phone = applicantPhone;

  for (const question of questions) {
    const rawAnswers = formData
      .getAll(`answer_${question.id}`)
      .map((value) => String(value).trim())
      .filter((value) => value.length > 0);

    if (question.required && rawAnswers.length === 0) {
      return { success: false, error: "필수 질문에 답변해주세요." };
    }

    if (rawAnswers.length === 1) {
      answers[question.id] = rawAnswers[0];
      answers[`answer_${question.id}`] = rawAnswers[0];
    } else if (rawAnswers.length > 1) {
      answers[question.id] = rawAnswers;
      answers[`answer_${question.id}`] = rawAnswers;
    }
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

    await writeAuditLog({
      actorId: session.user.id,
      actorRole: session.user.role,
      action: "application.submit",
      targetType: "Application",
      metadata: {
        roundId,
        clubId,
        priority,
      },
    });

    revalidatePath("/apply");
    return { success: true };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { success: false, error: "중복 지원이 감지되었습니다." };
    }
    console.error("Application submission error:", error);
    return { success: false, error: "지원서 제출 중 오류가 발생했습니다." };
  }
}

export async function cancelApplication(applicationId: string) {
  const session = await auth();
  if (!session) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      round: {
        include: {
          cycle: true,
        },
      },
    },
  });

  if (!application) {
    return { success: false, error: "지원서를 찾을 수 없습니다." };
  }

  if (application.userId !== session.user.id) {
    return { success: false, error: "본인 지원서만 취소할 수 있습니다." };
  }

  const now = new Date();
  const applyEndDate = application.round.cycle.applyEndDate;
  if (!applyEndDate || now > applyEndDate) {
    return { success: false, error: "지원 마감 이후에는 취소할 수 없습니다." };
  }

  await prisma.application.delete({ where: { id: applicationId } });

  await writeAuditLog({
    actorId: session.user.id,
    actorRole: session.user.role,
    action: "application.cancel",
    targetType: "Application",
    targetId: applicationId,
    metadata: {
      roundId: application.roundId,
      clubId: application.clubId,
    },
  });

  revalidatePath("/apply");
  revalidatePath(`/admin/applications/${application.round.cycleId}`);
  revalidatePath(
    `/club-admin/${application.round.cycleId}/${application.clubId}/applications`
  );

  return { success: true };
}
