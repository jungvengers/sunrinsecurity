"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  updateApplicationRank,
  updateApplicationStatus,
  allocateMembers,
} from "@/actions/ranking";
import { useState } from "react";
import { Check, X, Play } from "lucide-react";

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
}: {
  cycleId: string;
  clubs: ClubWithMembers[];
  applications: Application[];
  cycleStatus: string;
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
}: {
  application: Application;
  isReadOnly: boolean;
}) {
  const [rank, setRank] = useState<string>(
    application.applicantRank?.rank?.toString() || ""
  );
  const [saving, setSaving] = useState(false);

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
    if (isReadOnly) return;
    await updateApplicationStatus(application.id, status);
  };

  return (
    <tr className="border-b border-[hsl(var(--border))] last:border-0">
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
        {isReadOnly ? (
          <span className="text-sm text-[hsl(var(--muted-foreground))]">-</span>
        ) : (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleStatus("ACCEPTED")}
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
              className={
                application.status === "REJECTED" ? "bg-red-500/20" : ""
              }
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </td>
    </tr>
  );
}
