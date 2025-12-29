"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { submitApplication } from "@/actions/application";
import { useActionState } from "react";

interface Question {
  id: string;
  type: string;
  label: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
}

interface ApplicationForm {
  id: string;
  clubId: string;
  questions: Question[];
  club: {
    id: string;
    name: string;
  };
}

interface ExistingApplication {
  clubId: string;
  priority: number;
}

interface ApplyFormProps {
  round: {
    id: string;
    cycle: { maxApplications: number };
  };
  forms: ApplicationForm[];
  existingApplications: ExistingApplication[];
  maxApplications: number;
  user: {
    id: string;
    name: string;
    studentId: string;
    grade: number;
    classNum: number;
  };
}

type ActionState = {
  success: boolean;
  error?: string;
} | null;

export function ApplyForm({
  round,
  forms,
  existingApplications,
  maxApplications,
  user,
}: ApplyFormProps) {
  const availableForms = forms.filter(
    (form) => !existingApplications.some((app) => app.clubId === form.clubId)
  );

  const [selectedClubId, setSelectedClubId] = useState<string>(
    availableForms[0]?.clubId || ""
  );
  const [priority, setPriority] = useState<number>(
    existingApplications.length + 1
  );

  const selectedForm = availableForms.find((f) => f.clubId === selectedClubId);

  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    async (_prevState, formData) => {
      formData.append("roundId", round.id);
      formData.append("clubId", selectedClubId);
      formData.append("formId", selectedForm?.id || "");
      formData.append("priority", priority.toString());
      return submitApplication(formData);
    },
    null
  );

  if (availableForms.length === 0) {
    return (
      <p className="text-[hsl(var(--muted-foreground))]">
        지원 가능한 동아리가 없습니다.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">새 지원서 작성</h2>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              지원 동아리
            </label>
            <div className="flex flex-wrap gap-3">
              {availableForms.map((form) => (
                <button
                  key={form.clubId}
                  type="button"
                  onClick={() => setSelectedClubId(form.clubId)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedClubId === form.clubId
                      ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                      : "bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--accent))]"
                  }`}
                >
                  {form.club.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">지망 순위</label>
            <div className="flex gap-3">
              {Array.from(
                { length: maxApplications - existingApplications.length },
                (_, i) => {
                  const p = existingApplications.length + i + 1;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`w-12 h-12 rounded-lg transition-colors ${
                        priority === p
                          ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                          : "bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--accent))]"
                      }`}
                    >
                      {p}
                    </button>
                  );
                }
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedForm && (
        <form action={formAction} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">이름</label>
              <Input value={user.name} disabled />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">학번</label>
              <Input value={user.studentId || ""} disabled />
            </div>
          </div>

          {(selectedForm.questions as Question[]).map((question) => (
            <div key={question.id}>
              <label className="block text-sm font-medium mb-2">
                {question.label}
                {question.required && (
                  <span className="text-[hsl(var(--destructive))] ml-1">*</span>
                )}
              </label>

              {question.type === "TEXT" && (
                <Input
                  name={`answer_${question.id}`}
                  placeholder={question.placeholder}
                  required={question.required}
                />
              )}

              {question.type === "TEXTAREA" && (
                <Textarea
                  name={`answer_${question.id}`}
                  placeholder={question.placeholder}
                  required={question.required}
                  rows={5}
                />
              )}

              {question.type === "SELECT" && (
                <select
                  name={`answer_${question.id}`}
                  required={question.required}
                  className="w-full h-10 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3"
                >
                  <option value="">선택하세요</option>
                  {question.options?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              )}

              {question.type === "RADIO" && (
                <div className="space-y-2">
                  {question.options?.map((option) => (
                    <label
                      key={option}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name={`answer_${question.id}`}
                        value={option}
                        required={question.required}
                        className="w-4 h-4"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              )}

              {question.type === "CHECKBOX" && (
                <div className="space-y-2">
                  {question.options?.map((option) => (
                    <label
                      key={option}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        name={`answer_${question.id}`}
                        value={option}
                        className="w-4 h-4"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}

          {state?.error && (
            <p className="text-[hsl(var(--destructive))] text-sm">
              {state.error}
            </p>
          )}

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "제출 중..." : "지원서 제출"}
          </Button>
        </form>
      )}
    </div>
  );
}
