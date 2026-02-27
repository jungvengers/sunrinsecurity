"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  updateApplicationRank,
  updateApplicationStatus,
  allocateMembers,
} from "@/actions/ranking";
import { useState } from "react";
import { Check, X, Play, ChevronDown, ChevronUp } from "lucide-react";

interface User {
  id: string;
  name: string | null;
  email: string;
  studentId: string | null;
  grade: number | null;
  classNum: number | null;
}

interface ClubWithMembers {
  id: string;
  name: string;
  maxMembers: number;
}

interface ApplicationClub {
  id: string;
  name: string;
}

interface ApplicantRank {
  rank: number | null;
  note: string | null;
}

interface Round {
  id: string;
}

interface Form {
  questions: unknown;
}

interface Application {
  id: string;
  userId: string;
  clubId: string;
  priority: number;
  status: string;
  answers: unknown;
  user: User;
  club: ApplicationClub;
  round: Round;
  applicantRank: ApplicantRank | null;
  form: Form;
}

const statusLabels: Record<string, string> = {
  PENDING: "대기",
  ACCEPTED: "합격",
  REJECTED: "불합격",
  ALLOCATED: "배정됨",
};

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/20 text-yellow-400",
  ACCEPTED: "bg-green-500/20 text-green-400",
  REJECTED: "bg-red-500/20 text-red-400",
  ALLOCATED: "bg-blue-500/20 text-blue-400",
};

export function ApplicationManager({
  cycleId,
  clubs,
  applications,
  cycleStatus,
  canChangeStatus,
}: {
  cycleId: string;
  clubs: ClubWithMembers[];
  applications: Application[];
  cycleStatus: string;
  canChangeStatus: boolean;
}) {
  const [selectedClubId, setSelectedClubId] = useState<string>(
    clubs[0]?.id || ""
  );
  const [allocating, setAllocating] = useState(false);

  const isReadOnly = cycleStatus === "COMPLETED";
  const hasAllocated = applications.some((app) => app.status === "ALLOCATED");

  const filteredApps = applications.filter(
    (app) => app.clubId === selectedClubId
  );

  const clubStats = clubs.map((club) => {
    const clubApps = applications.filter((a) => a.clubId === club.id);
    const accepted = clubApps.filter((a) => a.status === "ACCEPTED").length;
    const allocated = clubApps.filter((a) => a.status === "ALLOCATED").length;
    return { ...club, total: clubApps.length, accepted, allocated };
  });

  const handleAllocate = async () => {
    if (!confirm("배분을 시작하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      return;
    }
    setAllocating(true);
    const result = await allocateMembers(cycleId);
    setAllocating(false);
    if (result.success) {
      alert(`${result.allocated}명이 배정되었습니다.`);
    } else {
      alert(result.error);
    }
  };

  return (
    <div className="space-y-6">
      {isReadOnly && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
          <p className="text-green-400 font-medium">
            완료된 사이클입니다. 지원서를 수정할 수 없습니다.
          </p>
        </div>
      )}

      {!canChangeStatus && !isReadOnly && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
          <p className="text-yellow-300 font-medium">
            지원 마감 이후에만 합격/불합격 상태를 변경할 수 있습니다.
          </p>
        </div>
      )}

      {hasAllocated && !isReadOnly && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <p className="text-blue-400 font-medium">
            배정이 완료되었습니다. 지원서를 수정할 수 없습니다.
          </p>
        </div>
      )}

      {!isReadOnly &&
        !hasAllocated &&
        (cycleStatus === "REVIEWING" || cycleStatus === "ALLOCATING") && (
          <div className="bg-[hsl(var(--card))] rounded-xl p-4 flex items-center justify-between">
            <div>
              <h2 className="font-semibold">배분 실행</h2>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                합격 처리된 지원자들을 지망순위에 따라 자동 배분합니다.
              </p>
            </div>
            <Button onClick={handleAllocate} disabled={allocating}>
              <Play className="w-4 h-4 mr-2" />
              {allocating ? "배분 중..." : "배분 시작"}
            </Button>
          </div>
        )}

      <div className="flex gap-3 flex-wrap">
        {clubStats.map((club) => (
          <button
            key={club.id}
            onClick={() => setSelectedClubId(club.id)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedClubId === club.id
                ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                : "bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--accent))]"
            }`}
          >
            {club.name}
            <span className="ml-2 text-sm opacity-70">
              지원 {club.total} · 배정 {club.allocated}/{club.maxMembers}
            </span>
          </button>
        ))}
      </div>

      {filteredApps.length === 0 ? (
        <div className="bg-[hsl(var(--card))] rounded-xl p-8 text-center text-[hsl(var(--muted-foreground))]">
          해당 동아리 지원자가 없습니다.
        </div>
      ) : (
        <div className="bg-[hsl(var(--card))] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                <th className="text-left p-4 font-medium">지원자</th>
                <th className="text-left p-4 font-medium">지망</th>
                <th className="text-left p-4 font-medium">순위</th>
                <th className="text-left p-4 font-medium">상태</th>
                <th className="text-right p-4 font-medium">작업</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.map((app) => (
                <ApplicationRow
                  key={app.id}
                  application={app}
                  isReadOnly={isReadOnly || hasAllocated}
                  canChangeStatus={canChangeStatus}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ApplicationRow({
  application,
  isReadOnly,
  canChangeStatus,
}: {
  application: Application;
  isReadOnly: boolean;
  canChangeStatus: boolean;
}) {
  const [rank, setRank] = useState<string>(
    application.applicantRank?.rank?.toString() || ""
  );
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleRankChange = async () => {
    if (isReadOnly) return;
    setSaving(true);
    await updateApplicationRank(
      application.id,
      rank ? parseInt(rank) : null,
      ""
    );
    setSaving(false);
  };

  const handleStatus = async (status: "ACCEPTED" | "REJECTED") => {
    if (isReadOnly || !canChangeStatus) return;
    await updateApplicationStatus(application.id, status);
  };

  const answers = (application.answers || {}) as Record<string, unknown>;
  const questions =
    (application.form?.questions as Array<{ id: string; label: string }>) || [];

  const renderAnswer = (questionId: string) => {
    const value = answers[questionId] ?? answers[`answer_${questionId}`];
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    if (typeof value === "string") {
      return value;
    }
    return "-";
  };

  const fallbackAnswers = Object.entries(answers)
    .filter(([key]) => key.startsWith("answer_"))
    .filter(([key]) => !questions.some((question) => `answer_${question.id}` === key));

  return (
    <>
      <tr className="border-b border-[hsl(var(--border))]">
        <td className="p-4">
          <div>
            <p className="font-medium">{application.user.name}</p>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              {application.user.grade}학년 {application.user.classNum}반
            </p>
          </div>
        </td>
        <td className="p-4">{application.priority}지망</td>
        <td className="p-4">
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={rank}
              onChange={(e) => setRank(e.target.value)}
              onBlur={handleRankChange}
              className="w-20"
              placeholder="-"
              disabled={saving || isReadOnly}
            />
          </div>
        </td>
        <td className="p-4">
          <span
            className={`px-2 py-1 rounded text-sm ${
              statusColors[application.status]
            }`}
          >
            {statusLabels[application.status]}
          </span>
        </td>
        <td className="p-4">
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
            {!isReadOnly && (
              <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleStatus("ACCEPTED")}
                disabled={!canChangeStatus}
                className={
                  application.status === "ACCEPTED" ? "bg-green-500/20" : ""
                }
              >
                <Check className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleStatus("REJECTED")}
                disabled={!canChangeStatus}
                className={
                  application.status === "REJECTED" ? "bg-red-500/20" : ""
                }
              >
                <X className="w-4 h-4" />
              </Button>
              </>
            )}
          </div>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-[hsl(var(--secondary))] border-b border-[hsl(var(--border))]">
          <td colSpan={5} className="p-6">
            <div className="space-y-4">
              <h4 className="font-medium">지원서 내용</h4>
              {questions.map((q) => (
                <div key={q.id}>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">
                    {q.label}
                  </p>
                  <p className="bg-[hsl(var(--background))] rounded-lg p-3">
                    {renderAnswer(q.id)}
                  </p>
                </div>
              ))}
              {fallbackAnswers.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-[hsl(var(--border))]">
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">기타 답변</p>
                  {fallbackAnswers.map(([key, value]) => (
                    <div key={key}>
                      <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">{key}</p>
                      <p className="bg-[hsl(var(--background))] rounded-lg p-3">
                        {Array.isArray(value)
                          ? value.join(", ")
                          : typeof value === "string"
                            ? value
                            : "-"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
