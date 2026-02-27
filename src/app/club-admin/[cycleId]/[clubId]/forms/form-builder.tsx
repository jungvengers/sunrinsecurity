"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createOrUpdateForm, deleteForm } from "@/actions/form";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  GripVertical,
  Save,
  Eye,
  Edit3,
  Type,
  AlignLeft,
  List,
  CheckSquare,
  Circle,
  ChevronUp,
  ChevronDown,
  Copy,
} from "lucide-react";

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
  { value: "TEXT", label: "단답형", icon: Type, description: "짧은 텍스트 입력" },
  { value: "TEXTAREA", label: "장문형", icon: AlignLeft, description: "긴 텍스트 입력" },
  { value: "SELECT", label: "드롭다운", icon: List, description: "목록에서 하나 선택" },
  { value: "RADIO", label: "객관식", icon: Circle, description: "여러 옵션 중 하나 선택" },
  { value: "CHECKBOX", label: "체크박스", icon: CheckSquare, description: "여러 옵션 복수 선택" },
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
  const [hasSaved, setHasSaved] = useState(!!existingForm);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const router = useRouter();

  const addQuestion = (type: string) => {
    if (isReadOnly) return;
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      type,
      label: "",
      required: false,
      options: type === "SELECT" || type === "RADIO" || type === "CHECKBOX" ? ["옵션 1"] : [],
      placeholder: "",
    };
    setQuestions([...questions, newQuestion]);
    setActiveQuestionId(newQuestion.id);
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
    if (activeQuestionId === id) setActiveQuestionId(null);
  };

  const duplicateQuestion = (id: string) => {
    if (isReadOnly) return;
    const question = questions.find((q) => q.id === id);
    if (!question) return;
    const newQuestion = { ...question, id: crypto.randomUUID() };
    const index = questions.findIndex((q) => q.id === id);
    const newQuestions = [...questions];
    newQuestions.splice(index + 1, 0, newQuestion);
    setQuestions(newQuestions);
  };

  const moveQuestion = (id: string, direction: "up" | "down") => {
    if (isReadOnly) return;
    const index = questions.findIndex((q) => q.id === id);
    if (direction === "up" && index > 0) {
      const newQuestions = [...questions];
      [newQuestions[index - 1], newQuestions[index]] = [newQuestions[index], newQuestions[index - 1]];
      setQuestions(newQuestions);
    } else if (direction === "down" && index < questions.length - 1) {
      const newQuestions = [...questions];
      [newQuestions[index], newQuestions[index + 1]] = [newQuestions[index + 1], newQuestions[index]];
      setQuestions(newQuestions);
    }
  };

  const addOption = (questionId: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question) return;
    const newOptions = [...(question.options || []), `옵션 ${(question.options?.length || 0) + 1}`];
    updateQuestion(questionId, { options: newOptions });
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question) return;
    const newOptions = [...(question.options || [])];
    newOptions[optionIndex] = value;
    updateQuestion(questionId, { options: newOptions });
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question || (question.options?.length || 0) <= 1) return;
    const newOptions = question.options?.filter((_, i) => i !== optionIndex);
    updateQuestion(questionId, { options: newOptions });
  };

  const handleSave = async () => {
    if (isReadOnly) return;
    setSaving(true);
    const result = await createOrUpdateForm(roundId, clubId, questions);
    setSaving(false);
    if (result.success) {
      setHasSaved(true);
      router.refresh();
      return;
    }
    if (!result.success) {
      alert(result.error ?? "지원서 양식 저장에 실패했습니다.");
    }
  };

  const handleDelete = async () => {
    if (isReadOnly) return;
    if (existingForm && confirm("정말 삭제하시겠습니까? 모든 질문이 삭제됩니다.")) {
      const result = await deleteForm(existingForm.id);
      if (result?.success) {
        setQuestions([]);
        setHasSaved(false);
        router.refresh();
      } else {
        alert(result?.error ?? "지원서 양식 삭제에 실패했습니다.");
      }
    }
  };

  const getTypeIcon = (type: string) => {
    const typeInfo = questionTypes.find((t) => t.value === type);
    return typeInfo?.icon || Type;
  };

  if (isPreview) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">지원서 미리보기</h2>
          <Button variant="outline" onClick={() => setIsPreview(false)}>
            <Edit3 className="w-4 h-4 mr-2" />
            편집으로 돌아가기
          </Button>
        </div>

        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-8 max-w-2xl">
          {questions.length === 0 ? (
            <p className="text-center text-[hsl(var(--muted-foreground))] py-12">
              아직 질문이 없습니다.
            </p>
          ) : (
            <div className="space-y-8">
              {questions.map((question, index) => (
                <div key={question.id}>
                  <label className="block text-sm font-medium mb-2">
                    {index + 1}. {question.label || "질문 제목"}
                    {question.required && (
                      <span className="text-red-400 ml-1">*</span>
                    )}
                  </label>

                  {question.type === "TEXT" && (
                    <Input placeholder={question.placeholder || "답변을 입력하세요"} disabled />
                  )}

                  {question.type === "TEXTAREA" && (
                    <Textarea placeholder={question.placeholder || "답변을 입력하세요"} rows={4} disabled />
                  )}

                  {question.type === "SELECT" && (
                    <select
                      disabled
                      className="w-full h-10 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3"
                    >
                      <option>선택하세요</option>
                      {question.options?.map((opt, i) => (
                        <option key={i}>{opt}</option>
                      ))}
                    </select>
                  )}

                  {question.type === "RADIO" && (
                    <div className="space-y-2">
                      {question.options?.map((opt, i) => (
                        <label key={i} className="flex items-center gap-3 p-3 rounded-lg border border-[hsl(var(--border))] cursor-pointer hover:bg-[hsl(var(--secondary))]">
                          <input type="radio" disabled className="w-4 h-4" />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {question.type === "CHECKBOX" && (
                    <div className="space-y-2">
                      {question.options?.map((opt, i) => (
                        <label key={i} className="flex items-center gap-3 p-3 rounded-lg border border-[hsl(var(--border))] cursor-pointer hover:bg-[hsl(var(--secondary))]">
                          <input type="checkbox" disabled className="w-4 h-4" />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm text-[hsl(var(--muted-foreground))]">
            {questions.length}개 질문
          </span>
          {hasSaved && (
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-500/20 text-green-400">
              저장됨
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsPreview(true)}>
            <Eye className="w-4 h-4 mr-2" />
            미리보기
          </Button>
          {!isReadOnly && hasSaved && existingForm && (
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              전체 삭제
            </Button>
          )}
        </div>
      </div>

      {!isReadOnly && (
        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-4">
          <p className="text-sm text-[hsl(var(--muted-foreground))] mb-3">질문 유형 선택</p>
          <div className="flex flex-wrap gap-2">
            {questionTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.value}
                  onClick={() => addQuestion(type.value)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[hsl(var(--border))] hover:border-white/30 hover:bg-[hsl(var(--secondary))] transition-all"
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {questions.length === 0 ? (
        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] border-dashed rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--secondary))] flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-[hsl(var(--muted-foreground))]" />
          </div>
          <h3 className="font-semibold mb-2">질문을 추가하세요</h3>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {isReadOnly ? "아직 질문이 없습니다." : "위에서 질문 유형을 선택하여 추가할 수 있습니다."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((question, index) => {
            const TypeIcon = getTypeIcon(question.type);
            const isActive = activeQuestionId === question.id;

            return (
              <div
                key={question.id}
                onClick={() => !isReadOnly && setActiveQuestionId(question.id)}
                className={`bg-[hsl(var(--card))] border rounded-xl transition-all ${
                  isReadOnly ? "" : "cursor-pointer"
                } ${
                  isActive && !isReadOnly
                    ? "border-white/50 ring-1 ring-white/20"
                    : "border-[hsl(var(--border))] hover:border-[hsl(var(--muted-foreground))]"
                }`}
              >
                <div className="flex items-start gap-3 p-4">
                  {!isReadOnly && (
                    <div className="flex flex-col items-center gap-1 pt-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); moveQuestion(question.id, "up"); }}
                        disabled={index === 0}
                        className="p-1 rounded hover:bg-[hsl(var(--secondary))] disabled:opacity-30"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <GripVertical className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                      <button
                        onClick={(e) => { e.stopPropagation(); moveQuestion(question.id, "down"); }}
                        disabled={index === questions.length - 1}
                        className="p-1 rounded hover:bg-[hsl(var(--secondary))] disabled:opacity-30"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-6 h-6 rounded bg-[hsl(var(--secondary))] flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </span>
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[hsl(var(--secondary))] text-xs">
                        <TypeIcon className="w-3 h-3" />
                        {questionTypes.find((t) => t.value === question.type)?.label}
                      </div>
                      {question.required && (
                        <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-xs">필수</span>
                      )}
                    </div>

                    {isActive && !isReadOnly ? (
                      <div className="space-y-4">
                        <Input
                          value={question.label}
                          onChange={(e) => updateQuestion(question.id, { label: e.target.value })}
                          placeholder="질문 제목을 입력하세요"
                          className="text-lg font-medium"
                          autoFocus
                        />

                        {(question.type === "TEXT" || question.type === "TEXTAREA") && (
                          <Input
                            value={question.placeholder || ""}
                            onChange={(e) => updateQuestion(question.id, { placeholder: e.target.value })}
                            placeholder="플레이스홀더 (선택)"
                            className="text-sm"
                          />
                        )}

                        {(question.type === "SELECT" || question.type === "RADIO" || question.type === "CHECKBOX") && (
                          <div className="space-y-2">
                            <p className="text-xs text-[hsl(var(--muted-foreground))]">옵션</p>
                            {question.options?.map((opt, optIndex) => (
                              <div key={optIndex} className="flex items-center gap-2">
                                <span className="w-6 text-center text-sm text-[hsl(var(--muted-foreground))]">
                                  {optIndex + 1}.
                                </span>
                                <Input
                                  value={opt}
                                  onChange={(e) => updateOption(question.id, optIndex, e.target.value)}
                                  className="flex-1"
                                />
                                <button
                                  onClick={() => removeOption(question.id, optIndex)}
                                  disabled={(question.options?.length || 0) <= 1}
                                  className="p-2 rounded hover:bg-[hsl(var(--secondary))] disabled:opacity-30"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => addOption(question.id)}
                              className="text-sm text-[hsl(var(--muted-foreground))] hover:text-white flex items-center gap-2 px-2 py-1"
                            >
                              <Plus className="w-4 h-4" />
                              옵션 추가
                            </button>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-[hsl(var(--border))]">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={question.required}
                              onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
                              className="w-4 h-4"
                            />
                            <span className="text-sm">필수 응답</span>
                          </label>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); duplicateQuestion(question.id); }}
                              className="p-2 rounded hover:bg-[hsl(var(--secondary))]"
                              title="복제"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); removeQuestion(question.id); }}
                              className="p-2 rounded hover:bg-red-500/20 text-red-400"
                              title="삭제"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className={`${question.label ? "" : "text-[hsl(var(--muted-foreground))] italic"}`}>
                        {question.label || "질문 제목을 입력하세요"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!isReadOnly && (
        <Button onClick={handleSave} disabled={saving} size="lg">
          <Save className="w-4 h-4 mr-2" />
          {saving ? "저장 중..." : "저장하기"}
        </Button>
      )}
    </div>
  );
}
