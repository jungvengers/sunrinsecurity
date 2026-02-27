"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cancelApplication } from "@/actions/application";

interface HistoryApplication {
  id: string;
  priority: number;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "ALLOCATED";
  club: {
    name: string;
  };
  answers: unknown;
  form: {
    questions: unknown;
  };
}

const statusLabel: Record<HistoryApplication["status"], string> = {
  PENDING: "심사 중",
  ACCEPTED: "합격",
  REJECTED: "불합격",
  ALLOCATED: "배정됨",
};

const statusClass: Record<HistoryApplication["status"], string> = {
  PENDING: "text-yellow-400 bg-yellow-400/10",
  ACCEPTED: "text-green-400 bg-green-400/10",
  REJECTED: "text-red-400 bg-red-400/10",
  ALLOCATED: "text-blue-400 bg-blue-400/10",
};

function normalizeAnswerValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  if (typeof value === "string") {
    return value;
  }
  return "-";
}

export function ApplicationHistory({
  applications,
  canCancel,
}: {
  applications: HistoryApplication[];
  canCancel: boolean;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      {applications.map((app) => {
        const questions = (app.form.questions as Array<{ id: string; label: string }>) || [];
        const answers = (app.answers || {}) as Record<string, unknown>;
        const expanded = expandedId === app.id;

        return (
          <div
            key={app.id}
            className="bg-[hsl(var(--secondary))] rounded-xl border border-[hsl(var(--border))]"
          >
            <div className="p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-center text-sm font-bold">
                  {app.priority}
                </span>
                <div>
                  <p className="font-medium">{app.club.name}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    {app.priority}지망
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${statusClass[app.status]}`}
                >
                  {statusLabel[app.status]}
                </span>
                {canCancel && app.status === "PENDING" && (
                  <button
                    type="button"
                    disabled={cancelingId === app.id}
                    onClick={async () => {
                      if (!confirm("지원을 취소하시겠습니까?")) return;
                      setCancelingId(app.id);
                      const result = await cancelApplication(app.id);
                      setCancelingId(null);
                      if (!result.success) {
                        alert(result.error ?? "지원 취소에 실패했습니다.");
                        return;
                      }
                      window.location.reload();
                    }}
                    className="px-2 py-1 text-xs rounded-md bg-red-500/15 text-red-300 hover:bg-red-500/25 disabled:opacity-50"
                  >
                    {cancelingId === app.id ? "취소 중..." : "지원 취소"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setExpandedId(expanded ? null : app.id)}
                  className="p-1.5 rounded-md hover:bg-[hsl(var(--muted))]"
                >
                  {expanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {expanded && (
              <div className="px-4 pb-4 space-y-3">
                {questions.map((question) => {
                  const value =
                    answers[question.id] ?? answers[`answer_${question.id}`] ?? "-";
                  return (
                    <div key={question.id}>
                      <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">
                        {question.label}
                      </p>
                      <p className="text-sm rounded-lg bg-[hsl(var(--background))] px-3 py-2">
                        {normalizeAnswerValue(value)}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
