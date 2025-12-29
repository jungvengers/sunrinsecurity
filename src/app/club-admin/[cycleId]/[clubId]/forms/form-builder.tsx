"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createOrUpdateForm, deleteForm } from "@/actions/form";
import { useState } from "react";
import { Plus, Trash2, GripVertical, Save } from "lucide-react";

interface Question {
  id: string;
  type: string;
  label: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
}

interface Form {
  id: string;
  clubId: string;
  questions: unknown;
}

const questionTypes = [
  { value: "TEXT", label: "단답형" },
  { value: "TEXTAREA", label: "장문형" },
  { value: "SELECT", label: "드롭다운" },
  { value: "RADIO", label: "객관식" },
  { value: "CHECKBOX", label: "체크박스" },
];

export function ClubFormBuilder({
  roundId,
  clubId,
  existingForm,
  isReadOnly,
}: {
  roundId: string;
  clubId: string;
  existingForm?: Form;
  isReadOnly: boolean;
}) {
  const [questions, setQuestions] = useState<Question[]>(
    (existingForm?.questions as Question[]) || []
  );
  const [saving, setSaving] = useState(false);

  const addQuestion = () => {
    if (isReadOnly) return;
    setQuestions([
      ...questions,
      {
        id: crypto.randomUUID(),
        type: "TEXT",
        label: "",
        required: false,
        options: [],
        placeholder: "",
      },
    ]);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    if (isReadOnly) return;
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );
  };

  const removeQuestion = (id: string) => {
    if (isReadOnly) return;
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const handleSave = async () => {
    if (isReadOnly) return;
    setSaving(true);
    await createOrUpdateForm(roundId, clubId, questions);
    setSaving(false);
  };

  const handleDelete = async () => {
    if (isReadOnly) return;
    if (existingForm && confirm("정말 삭제하시겠습니까?")) {
      await deleteForm(existingForm.id);
      setQuestions([]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">지원서 질문</h2>
          {!isReadOnly && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={addQuestion}>
                <Plus className="w-4 h-4 mr-2" />
                질문 추가
              </Button>
              {existingForm && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  삭제
                </Button>
              )}
            </div>
          )}
        </div>

        {questions.length === 0 ? (
          <div className="text-center py-12 text-[hsl(var(--muted-foreground))]">
            <p>아직 질문이 없습니다.</p>
            {!isReadOnly && (
              <p className="text-sm">
                위의 &quot;질문 추가&quot; 버튼을 눌러 질문을 추가하세요.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((question) => (
              <div
                key={question.id}
                className="bg-[hsl(var(--secondary))] rounded-lg p-4"
              >
                <div className="flex items-start gap-4">
                  {!isReadOnly && (
                    <div className="pt-2 text-[hsl(var(--muted-foreground))] cursor-move">
                      <GripVertical className="w-5 h-5" />
                    </div>
                  )}
                  <div className="flex-1 space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm mb-1">질문</label>
                        <Input
                          value={question.label}
                          onChange={(e) =>
                            updateQuestion(question.id, {
                              label: e.target.value,
                            })
                          }
                          placeholder="질문을 입력하세요"
                          disabled={isReadOnly}
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-1">유형</label>
                        <select
                          value={question.type}
                          onChange={(e) =>
                            updateQuestion(question.id, {
                              type: e.target.value,
                            })
                          }
                          disabled={isReadOnly}
                          className="w-full h-10 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 disabled:opacity-50"
                        >
                          {questionTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {(question.type === "SELECT" ||
                      question.type === "RADIO" ||
                      question.type === "CHECKBOX") && (
                      <div>
                        <label className="block text-sm mb-1">
                          옵션 (쉼표로 구분)
                        </label>
                        <Input
                          value={question.options?.join(", ") || ""}
                          onChange={(e) =>
                            updateQuestion(question.id, {
                              options: e.target.value
                                .split(",")
                                .map((s) => s.trim())
                                .filter(Boolean),
                            })
                          }
                          placeholder="옵션1, 옵션2, 옵션3"
                          disabled={isReadOnly}
                        />
                      </div>
                    )}

                    {(question.type === "TEXT" ||
                      question.type === "TEXTAREA") && (
                      <div>
                        <label className="block text-sm mb-1">플레이스홀더</label>
                        <Input
                          value={question.placeholder || ""}
                          onChange={(e) =>
                            updateQuestion(question.id, {
                              placeholder: e.target.value,
                            })
                          }
                          placeholder="입력 힌트"
                          disabled={isReadOnly}
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={question.required}
                        onChange={(e) =>
                          updateQuestion(question.id, {
                            required: e.target.checked,
                          })
                        }
                        disabled={isReadOnly}
                        className="w-4 h-4"
                        id={`required-${question.id}`}
                      />
                      <label
                        htmlFor={`required-${question.id}`}
                        className="text-sm"
                      >
                        필수 응답
                      </label>
                    </div>
                  </div>
                  {!isReadOnly && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeQuestion(question.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!isReadOnly && (
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? "저장 중..." : "저장"}
        </Button>
      )}
    </div>
  );
}
