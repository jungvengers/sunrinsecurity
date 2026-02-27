import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ApplyForm } from "./apply-form";
import { PreviewForms } from "./preview-forms";
import { ApplicationHistory } from "./application-history";
import { formatCycleName } from "@/lib/utils";
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  LogIn,
  AlertCircle,
  Eye,
} from "lucide-react";

export default async function ApplyPage() {
  const session = await auth();

  if (!session) {
    return (
      <>
        <section className="relative pt-32 pb-20 px-6 -mt-16 overflow-hidden min-h-screen flex items-center">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--secondary))] via-[hsl(var(--background))] to-[hsl(var(--background))]" />
          </div>
          <div className="max-w-md mx-auto text-center relative z-10">
            <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-10">
              <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--secondary))] flex items-center justify-center mx-auto mb-6">
                <LogIn className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold mb-3">로그인이 필요합니다</h1>
              <p className="text-[hsl(var(--muted-foreground))] mb-8">
                동아리에 지원하려면 먼저 로그인해주세요.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-xl font-semibold hover:opacity-90 transition-opacity"
              >
                로그인하기
              </Link>
            </div>
          </div>
        </section>
      </>
    );
  }

  if (session.user.role === "TEACHER") {
    return (
      <>
        <section className="relative pt-32 pb-20 px-6 -mt-16 overflow-hidden min-h-screen flex items-center">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--secondary))] via-[hsl(var(--background))] to-[hsl(var(--background))]" />
          </div>
          <div className="max-w-md mx-auto text-center relative z-10">
            <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-10">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <h1 className="text-2xl font-bold mb-3">지원 불가</h1>
              <p className="text-[hsl(var(--muted-foreground))]">
                선생님 계정은 동아리 지원이 불가능합니다.
              </p>
            </div>
          </div>
        </section>
      </>
    );
  }

  // 현재 시간 기준으로 활성 사이클 찾기
  const now = new Date();

  const activeCycle = await prisma.recruitmentCycle.findFirst({
    where: {
      OR: [
        { viewStartDate: { lte: now } },
        { status: { in: ["OPEN", "CLOSED", "REVIEWING", "ALLOCATING", "COMPLETED"] } },
      ],
    },
    include: {
      rounds: {
        orderBy: { roundNumber: "desc" },
        take: 1,
        include: {
          applicationForms: {
            where: { isActive: true },
            include: { club: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const activeRound = activeCycle?.rounds[0];

  if (!activeCycle || !activeRound) {
    return (
      <>
        <section className="relative pt-32 pb-20 px-6 -mt-16 overflow-hidden min-h-screen flex items-center">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--secondary))] via-[hsl(var(--background))] to-[hsl(var(--background))]" />
          </div>
          <div className="max-w-md mx-auto text-center relative z-10">
            <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-10">
              <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--secondary))] flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-8 h-8 text-[hsl(var(--muted-foreground))]" />
              </div>
              <h1 className="text-2xl font-bold mb-3">모집 기간이 아닙니다</h1>
              <p className="text-[hsl(var(--muted-foreground))] mb-8">
                현재 진행 중인 동아리 모집이 없습니다.
              </p>
              <Link
                href="/club"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[hsl(var(--secondary))] rounded-xl font-medium hover:bg-[hsl(var(--muted))] transition-colors"
              >
                동아리 둘러보기
              </Link>
            </div>
          </div>
        </section>
      </>
    );
  }

  // 날짜 기반 상태 체크
  const viewStartDate = activeCycle.viewStartDate;
  const applyStartDate = activeCycle.applyStartDate;
  const applyEndDate = activeCycle.applyEndDate;

  const isBeforeView = viewStartDate && now < viewStartDate;
  const isPreview =
    viewStartDate &&
    applyStartDate &&
    now >= viewStartDate &&
    now < applyStartDate;
  const isOpenByDate =
    applyStartDate &&
    applyEndDate &&
    now >= applyStartDate &&
    now <= applyEndDate;
  const isClosedByDate = !!(applyEndDate && now > applyEndDate);
  const isClosedByStatus = ["CLOSED", "REVIEWING", "ALLOCATING", "COMPLETED"].includes(
    activeCycle.status
  );
  const isClosed = isClosedByDate || isClosedByStatus;

  // 공개 전
  if (isBeforeView) {
    return (
      <>
        <section className="relative pt-32 pb-20 px-6 -mt-16 overflow-hidden min-h-screen flex items-center">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--secondary))] via-[hsl(var(--background))] to-[hsl(var(--background))]" />
          </div>
          <div className="max-w-md mx-auto text-center relative z-10">
            <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-10">
              <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--secondary))] flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-8 h-8 text-[hsl(var(--muted-foreground))]" />
              </div>
              <h1 className="text-2xl font-bold mb-3">모집 준비 중</h1>
              <p className="text-[hsl(var(--muted-foreground))] mb-4">
                {activeCycle.name}
              </p>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mb-8">
                공개일: {new Date(viewStartDate).toLocaleDateString("ko-KR")}
              </p>
              <Link
                href="/club"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[hsl(var(--secondary))] rounded-xl font-medium hover:bg-[hsl(var(--muted))] transition-colors"
              >
                동아리 둘러보기
              </Link>
            </div>
          </div>
        </section>
      </>
    );
  }

  // 미리보기 또는 지원 가능
  const canApply = !!isOpenByDate && !isClosedByStatus;

  const existingApplications = await prisma.application.findMany({
    where: {
      userId: session.user.id,
      roundId: activeRound.id,
    },
    include: { club: true, form: true },
    orderBy: { priority: "asc" },
  });

  // 미리보기 상태일 때
  const cycle = activeCycle;

  return (
    <>
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-6 -mt-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--secondary))] via-[hsl(var(--background))] to-[hsl(var(--background))]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent" />
        </div>

        <div className="max-w-3xl mx-auto relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <p className="text-sm text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
              Apply
            </p>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">동아리 지원</h1>

          <div className="flex flex-wrap items-center gap-4 text-[hsl(var(--muted-foreground))]">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))]">
              <Calendar className="w-4 h-4" />
              {formatCycleName(cycle.year, cycle.name)}
            </span>
            {cycle.applyEndDate && (
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))]">
                <Clock className="w-4 h-4" />
                마감: {new Date(cycle.applyEndDate).toLocaleString("ko-KR")}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Application Status */}
      <section className="px-6 pb-20">
        <div className="max-w-3xl mx-auto space-y-6">
          {isClosed && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-red-400" />
                <div>
                  <h3 className="font-semibold text-red-300">모집이 마감되었습니다</h3>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    지원 내역은 아래에서 계속 확인할 수 있습니다.
                  </p>
                </div>
              </div>
            </div>
          )}

          {existingApplications.length > 0 && (
            <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-[hsl(var(--border))] bg-[hsl(var(--secondary))]/50">
                <h2 className="font-semibold text-lg">지원 현황</h2>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                  {existingApplications.length} / {cycle.maxApplications} 지원
                  완료
                </p>
              </div>
              <div className="p-4">
                <ApplicationHistory
                  applications={existingApplications}
                  canCancel={canApply}
                />
              </div>
            </div>
          )}

          {isPreview ? (
            <div className="space-y-6">
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                    <Eye className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-yellow-400">
                      미리보기 기간
                    </h3>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                      지원 시작:{" "}
                      {cycle.applyStartDate &&
                        new Date(cycle.applyStartDate).toLocaleString("ko-KR")}
                    </p>
                  </div>
                </div>
              </div>

              <PreviewForms
                forms={activeRound.applicationForms.map((form) => ({
                  id: form.id,
                  club: { id: form.club.id, name: form.club.name },
                  questions: form.questions as unknown as Array<{
                    id: string;
                    type: string;
                    label: string;
                    required: boolean;
                    options?: string[];
                    placeholder?: string;
                  }>,
                }))}
              />
            </div>
          ) : canApply && existingApplications.length < cycle.maxApplications ? (
            <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-[hsl(var(--border))] bg-[hsl(var(--secondary))]/50">
                <h2 className="font-semibold text-lg">새 지원서 작성</h2>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                  원하는 동아리를 선택하고 지원서를 작성하세요
                </p>
              </div>
              <div className="p-6">
                <ApplyForm
                  round={{
                    id: activeRound.id,
                    cycle: { maxApplications: cycle.maxApplications },
                  }}
                  forms={activeRound.applicationForms.map((f) => ({
                    ...f,
                    questions: f.questions as unknown as Array<{
                      id: string;
                      type: string;
                      label: string;
                      required: boolean;
                      options?: string[];
                      placeholder?: string;
                    }>,
                  }))}
                  existingApplications={existingApplications}
                  maxApplications={cycle.maxApplications}
                  user={{
                    id: session.user.id,
                    name: session.user.name || "",
                    studentId: session.user.studentId || "",
                    grade: session.user.grade || 0,
                    classNum: session.user.classNum || 0,
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">지원 완료</h3>
              <p className="text-[hsl(var(--muted-foreground))]">
                최대 {cycle.maxApplications}개 동아리에 지원했습니다
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
