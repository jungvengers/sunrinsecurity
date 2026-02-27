"use client";

import { useMemo, useState } from "react";

interface Question {
  id: string;
  type: string;
  label: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
}

interface PreviewForm {
  id: string;
  club: {
    id: string;
    name: string;
  };
  questions: Question[];
}

export function PreviewForms({ forms }: { forms: PreviewForm[] }) {
  const [selectedClubId, setSelectedClubId] = useState(forms[0]?.club.id ?? "");

  const selectedForm = useMemo(
    () => forms.find((form) => form.club.id === selectedClubId) ?? forms[0],
    [forms, selectedClubId]
  );

  if (!selectedForm) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2">동아리 선택</p>
        <div className="flex flex-wrap gap-2">
          {forms.map((form) => (
            <button
              key={form.id}
              type="button"
              onClick={() => setSelectedClubId(form.club.id)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                selectedClubId === form.club.id
                  ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                  : "bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--accent))]"
              }`}
            >
              {form.club.name}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-[hsl(var(--border))] bg-[hsl(var(--secondary))]/50">
          <h2 className="font-semibold text-lg">{selectedForm.club.name} 지원서</h2>
        </div>
        <div className="p-6 space-y-6">
          {selectedForm.questions.map((question) => (
            <div key={question.id} className="space-y-2">
              <label className="block text-sm font-medium">
                {question.label}
                {question.required && (
                  <span className="text-[hsl(var(--destructive))] ml-1">*</span>
                )}
              </label>
              {question.type === "TEXT" && (
                <input
                  type="text"
                  disabled
                  placeholder={question.placeholder || ""}
                  className="w-full h-10 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-3 text-sm opacity-60"
                />
              )}
              {question.type === "TEXTAREA" && (
                <textarea
                  disabled
                  placeholder={question.placeholder || ""}
                  rows={4}
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-3 py-2 text-sm opacity-60"
                />
              )}
              {question.type === "SELECT" && (
                <select
                  disabled
                  className="w-full h-10 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-3 text-sm opacity-60"
                >
                  <option>선택하세요</option>
                  {question.options?.map((opt) => (
                    <option key={opt}>{opt}</option>
                  ))}
                </select>
              )}
              {question.type === "RADIO" && (
                <div className="space-y-2 opacity-60">
                  {question.options?.map((opt) => (
                    <label key={opt} className="flex items-center gap-2">
                      <input type="radio" disabled className="w-4 h-4" />
                      <span className="text-sm">{opt}</span>
                    </label>
                  ))}
                </div>
              )}
              {question.type === "CHECKBOX" && (
                <div className="space-y-2 opacity-60">
                  {question.options?.map((opt) => (
                    <label key={opt} className="flex items-center gap-2">
                      <input type="checkbox" disabled className="w-4 h-4" />
                      <span className="text-sm">{opt}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
