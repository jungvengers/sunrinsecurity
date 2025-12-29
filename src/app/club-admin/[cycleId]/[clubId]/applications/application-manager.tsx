"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  updateApplicationRank,
  updateApplicationStatus,
} from "@/actions/ranking";
import { useState } from "react";
import { Check, X, ChevronDown, ChevronUp } from "lucide-react";

interface User {
  id: string;
  name: string | null;
  email: string;
  studentId: string | null;
  grade: number | null;
  classNum: number | null;
  number: number | null;
}

interface ApplicantRank {
  rank: number | null;
  note: string | null;
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

export function ClubApplicationManager({
  applications,
  isReadOnly,
}: {
  applications: Application[];
  isReadOnly: boolean;
}) {
  if (applications.length === 0) {
    return (
      <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-12 text-center">
        <p className="text-[hsl(var(--muted-foreground))]">
          아직 지원자가 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl overflow-hidden">
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
          {applications.map((app) => (
            <ApplicationRow
              key={app.id}
              application={app}
              isReadOnly={isReadOnly}
            />
          ))}
        </tbody>
      </table>
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
    if (isReadOnly) return;
    await updateApplicationStatus(application.id, status);
  };

  const answers = application.answers as Record<string, string>;
  const questions = (application.form?.questions as Array<{
    id: string;
    label: string;
  }>) || [];

  return (
    <>
      <tr className="border-b border-[hsl(var(--border))]">
        <td className="p-4">
          <div>
            <p className="font-medium">{application.user.name}</p>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              {application.user.grade}학년 {application.user.classNum}반{" "}
              {application.user.number}번
            </p>
          </div>
        </td>
        <td className="p-4">{application.priority}지망</td>
        <td className="p-4">
          <Input
            type="number"
            value={rank}
            onChange={(e) => setRank(e.target.value)}
            onBlur={handleRankChange}
            className="w-20"
            placeholder="-"
            disabled={saving || isReadOnly}
          />
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
              </>
            )}
          </div>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-[hsl(var(--secondary))]">
          <td colSpan={5} className="p-6">
            <div className="space-y-4">
              <h4 className="font-medium">지원서 내용</h4>
              {questions.map((q) => (
                <div key={q.id}>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">
                    {q.label}
                  </p>
                  <p className="bg-[hsl(var(--background))] rounded-lg p-3">
                    {answers[`answer_${q.id}`] || "-"}
                  </p>
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
