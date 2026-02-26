"use client";

import { Input } from "@/components/ui/input";
import {
  updateCycle,
  addClubAdmin,
  removeClubAdmin,
  updateRoundClubConfig,
  completeCycle,
} from "@/actions/cycle";
import { allocateMembers } from "@/actions/ranking";
import {
  Trash2,
  UserPlus,
  FileText,
  Settings,
  Calendar,
  Eye,
  Play,
  Square,
  CheckCircle,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

function toLocalDatetimeValue(date: Date | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

interface Club {
  id: string;
  name: string;
}

interface User {
  id: string;
  name: string | null;
  email: string;
}

interface ApplicationForm {
  id: string;
  clubId: string;
  club: Club;
}

interface RoundClubConfig {
  id: string;
  clubId: string;
  maxMembers: number;
  isActive: boolean;
  club: Club;
}

interface Round {
  id: string;
  roundNumber: number;
  name: string;
  status: string;
  startDate: Date | null;
  endDate: Date | null;
  applicationForms: ApplicationForm[];
  roundClubConfigs: RoundClubConfig[];
  _count: { applications: number };
}

interface ClubAdmin {
  id: string;
  user: User;
  club: Club;
}

interface Cycle {
  id: string;
  year: number;
  name: string;
  status: string;
  maxApplications: number;
  viewStartDate: Date | null;
  applyStartDate: Date | null;
  applyEndDate: Date | null;
  rounds: Round[];
  clubAdmins: ClubAdmin[];
}

const statusLabels: Record<string, string> = {
  DRAFT: "준비중",
  OPEN: "모집중",
  CLOSED: "마감",
  REVIEWING: "심사중",
  ALLOCATING: "배정중",
  COMPLETED: "완료",
};

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-500/20 text-gray-400",
  OPEN: "bg-green-500/20 text-green-400",
  CLOSED: "bg-yellow-500/20 text-yellow-400",
  REVIEWING: "bg-blue-500/20 text-blue-400",
  ALLOCATING: "bg-purple-500/20 text-purple-400",
  COMPLETED: "bg-white/20 text-white",
};

export function CycleDetail({ cycle, clubs }: { cycle: Cycle; clubs: Club[] }) {
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminClubId, setAdminClubId] = useState("");
  const [error, setError] = useState("");
  const [editingRoundId, setEditingRoundId] = useState<string | null>(null);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("userEmail", adminEmail);
    formData.append("clubId", adminClubId);

    const result = await addClubAdmin(cycle.id, formData);
    if (result?.error) {
      setError(result.error);
    } else {
      setShowAddAdmin(false);
      setAdminEmail("");
      setAdminClubId("");
      setError("");
    }
  };

  const now = new Date();
  const viewStartDate = cycle.viewStartDate
    ? new Date(cycle.viewStartDate)
    : null;
  const applyStartDate = cycle.applyStartDate
    ? new Date(cycle.applyStartDate)
    : null;
  const applyEndDate = cycle.applyEndDate ? new Date(cycle.applyEndDate) : null;

  const getCurrentStatus = () => {
    if (!viewStartDate || !applyStartDate || !applyEndDate) {
      return { label: "날짜 미설정", color: "bg-gray-500/20 text-gray-400" };
    }
    if (now < viewStartDate) {
      return { label: "준비중", color: "bg-gray-500/20 text-gray-400" };
    }
    if (now < applyStartDate) {
      return {
        label: "미리보기 (지원 불가)",
        color: "bg-blue-500/20 text-blue-400",
      };
    }
    if (now < applyEndDate) {
      return { label: "모집중", color: "bg-green-500/20 text-green-400" };
    }
    return { label: "모집 마감", color: "bg-yellow-500/20 text-yellow-400" };
  };

  const currentStatus = getCurrentStatus();

  return (
    <div className="space-y-6">
      <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">사이클 상태</h2>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${currentStatus.color}`}
          >
            {currentStatus.label}
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
            <span className="text-[hsl(var(--muted-foreground))]">공개일:</span>
            <span>
              {viewStartDate ? viewStartDate.toLocaleString("ko-KR") : "미설정"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
            <span className="text-[hsl(var(--muted-foreground))]">
              지원 시작:
            </span>
            <span>
              {applyStartDate
                ? applyStartDate.toLocaleString("ko-KR")
                : "미설정"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
            <span className="text-[hsl(var(--muted-foreground))]">
              지원 마감:
            </span>
            <span>
              {applyEndDate ? applyEndDate.toLocaleString("ko-KR") : "미설정"}
            </span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-[hsl(var(--border))] flex flex-wrap gap-3">
          <Link
            href={`/admin/applications/${cycle.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[hsl(var(--secondary))] rounded-lg text-sm font-medium hover:bg-[hsl(var(--secondary))]/80 transition-colors"
          >
            <FileText className="w-4 h-4" />
            지원서 관리 및 심사
          </Link>
          {currentStatus.label === "모집 마감" &&
            cycle.status !== "COMPLETED" && <CycleActions cycleId={cycle.id} />}
          {cycle.status === "COMPLETED" && (
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium">
              <CheckCircle className="w-4 h-4" />
              사이클 완료됨
            </span>
          )}
        </div>
      </div>

      {cycle.status === "COMPLETED" ? (
        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-5">
          <h2 className="font-semibold mb-4">기본 설정</h2>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            완료된 사이클은 수정할 수 없습니다.
          </p>
        </div>
      ) : (
        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-5">
          <h2 className="font-semibold mb-4">기본 설정</h2>
          <form action={updateCycle.bind(null, cycle.id)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[hsl(var(--muted-foreground))] mb-1.5">
                  이름
                </label>
                <Input name="name" defaultValue={cycle.name} />
              </div>
              <div>
                <label className="block text-xs text-[hsl(var(--muted-foreground))] mb-1.5">
                  최대 지원 수
                </label>
                <Input
                  name="maxApplications"
                  type="number"
                  defaultValue={cycle.maxApplications}
                />
              </div>
            </div>

            <div className="border-t border-[hsl(var(--border))] pt-5">
              <h3 className="font-medium flex items-center gap-2 mb-4">
                <Calendar className="w-4 h-4" />
                일정 설정
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-3 bg-[hsl(var(--secondary))] rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-4 h-4 text-blue-400" />
                    <label className="text-sm font-medium">공개일</label>
                  </div>
                  <Input
                    name="viewStartDate"
                    type="datetime-local"
                    defaultValue={toLocalDatetimeValue(cycle.viewStartDate)}
                  />
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                    지원서 양식 공개
                  </p>
                </div>
                <div className="p-3 bg-[hsl(var(--secondary))] rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Play className="w-4 h-4 text-green-400" />
                    <label className="text-sm font-medium">지원 시작일</label>
                  </div>
                  <Input
                    name="applyStartDate"
                    type="datetime-local"
                    defaultValue={toLocalDatetimeValue(cycle.applyStartDate)}
                  />
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                    지원서 제출 시작
                  </p>
                </div>
                <div className="p-3 bg-[hsl(var(--secondary))] rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Square className="w-4 h-4 text-red-400" />
                    <label className="text-sm font-medium">지원 마감일</label>
                  </div>
                  <Input
                    name="applyEndDate"
                    type="datetime-local"
                    defaultValue={toLocalDatetimeValue(cycle.applyEndDate)}
                  />
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                    지원 마감
                  </p>
                </div>
              </div>
            </div>

            <input type="hidden" name="status" value={cycle.status} />
            <button
              type="submit"
              className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              설정 저장
            </button>
          </form>
        </div>
      )}

      {cycle.status !== "COMPLETED" && (
        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-5">
          <h2 className="font-semibold mb-4">지원서 양식</h2>

          {cycle.rounds.length === 0 ? (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              지원서 양식을 설정해주세요.
            </p>
          ) : (
            <div className="space-y-3">
              {cycle.rounds.slice(0, 1).map((round) => (
                <RoundCard
                  key={round.id}
                  round={round}
                  cycleId={cycle.id}
                  cycle={{
                    viewStartDate: cycle.viewStartDate,
                    applyStartDate: cycle.applyStartDate,
                    applyEndDate: cycle.applyEndDate,
                  }}
                  clubs={clubs}
                  isEditing={editingRoundId === round.id}
                  onToggleEdit={() =>
                    setEditingRoundId(
                      editingRoundId === round.id ? null : round.id
                    )
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}

      {cycle.status !== "COMPLETED" && (
        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">동아리 관리자</h2>
            <button
              onClick={() => setShowAddAdmin(!showAddAdmin)}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-[hsl(var(--secondary))] rounded-lg text-sm font-medium hover:bg-[hsl(var(--secondary))]/80 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              관리자 추가
            </button>
          </div>

          {showAddAdmin && (
            <form
              onSubmit={handleAddAdmin}
              className="bg-[hsl(var(--secondary))] rounded-lg p-4 mb-4"
            >
              <div className="grid md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-[hsl(var(--muted-foreground))] mb-1">
                    사용자 이메일
                  </label>
                  <Input
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="user@sunrint.hs.kr"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-[hsl(var(--muted-foreground))] mb-1">
                    동아리
                  </label>
                  <select
                    value={adminClubId}
                    onChange={(e) => setAdminClubId(e.target.value)}
                    className="w-full h-10 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 text-sm"
                    required
                  >
                    <option value="">선택하세요</option>
                    {clubs.map((club) => (
                      <option key={club.id} value={club.id}>
                        {club.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    추가
                  </button>
                </div>
              </div>
              {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </form>
          )}

          {cycle.clubAdmins.length === 0 ? (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              등록된 관리자가 없습니다.
            </p>
          ) : (
            <div className="space-y-2">
              {cycle.clubAdmins.map((admin) => (
                <div
                  key={admin.id}
                  className="flex items-center justify-between bg-[hsl(var(--secondary))] rounded-lg p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-medium">
                      {admin.user.name?.charAt(0) || "?"}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{admin.user.name}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        {admin.user.email}
                      </p>
                    </div>
                    <span className="ml-2 px-2 py-0.5 bg-white/10 rounded text-xs">
                      {admin.club.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      if (
                        !confirm(
                          `"${admin.user.name}" 관리자를 삭제하시겠습니까?`
                        )
                      )
                        return;
                      await removeClubAdmin(admin.id, cycle.id);
                    }}
                    className="p-2 rounded-lg hover:bg-[hsl(var(--background))] transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CycleActions({ cycleId }: { cycleId: string }) {
  const [loading, setLoading] = useState(false);

  const handleAllocate = async () => {
    if (
      !confirm(
        "배분을 실행하시겠습니까? 합격 처리된 지원자들이 지망 순위와 평가 순위에 따라 배정됩니다."
      )
    )
      return;
    setLoading(true);
    const result = await allocateMembers(cycleId);
    setLoading(false);
    if (result.success) {
      alert(`${result.allocated}명이 배정되었습니다.`);
    } else {
      alert(result.error);
    }
  };

  const handleComplete = async () => {
    if (!confirm("사이클을 완료하시겠습니까? 이 작업은 되돌릴 수 없습니다."))
      return;
    setLoading(true);
    const result = await completeCycle(cycleId);
    setLoading(false);
    if (!result.success) {
      alert(result.error);
    }
  };

  return (
    <>
      <button
        onClick={handleAllocate}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
      >
        <Play className="w-4 h-4" />
        {loading ? "처리 중..." : "배분 실행"}
      </button>
      <button
        onClick={handleComplete}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
      >
        <CheckCircle className="w-4 h-4" />
        사이클 종료
      </button>
    </>
  );
}

function RoundCard({
  round,
  cycleId,
  cycle,
  clubs,
  isEditing,
  onToggleEdit,
}: {
  round: Round;
  cycleId: string;
  cycle: {
    viewStartDate: Date | null;
    applyStartDate: Date | null;
    applyEndDate: Date | null;
  };
  clubs: Club[];
  isEditing: boolean;
  onToggleEdit: () => void;
}) {
  const [clubConfigs, setClubConfigs] = useState<
    { clubId: string; maxMembers: number; isActive: boolean }[]
  >(
    clubs.map((club) => {
      const existing = round.roundClubConfigs.find((c) => c.clubId === club.id);
      return {
        clubId: club.id,
        maxMembers: existing?.maxMembers || 20,
        isActive: !!existing,
      };
    })
  );
  const [saving, setSaving] = useState(false);

  const handleSaveConfigs = async () => {
    setSaving(true);
    const result = await updateRoundClubConfig(round.id, clubConfigs);
    setSaving(false);
    if (!result.success) {
      alert(result.error ?? "동아리 설정 저장에 실패했습니다.");
      return;
    }
    onToggleEdit();
  };

  const activeCount = round.roundClubConfigs.length;

  const now = new Date();
  const viewStartDate = cycle.viewStartDate
    ? new Date(cycle.viewStartDate)
    : null;
  const applyStartDate = cycle.applyStartDate
    ? new Date(cycle.applyStartDate)
    : null;
  const applyEndDate = cycle.applyEndDate ? new Date(cycle.applyEndDate) : null;

  const getCurrentStatus = () => {
    if (!viewStartDate || !applyStartDate || !applyEndDate) {
      return { label: "준비중", color: "bg-gray-500/20 text-gray-400" };
    }
    if (now < viewStartDate) {
      return { label: "준비중", color: "bg-gray-500/20 text-gray-400" };
    }
    if (now < applyStartDate) {
      return { label: "미리보기", color: "bg-blue-500/20 text-blue-400" };
    }
    if (now < applyEndDate) {
      return { label: "모집중", color: "bg-green-500/20 text-green-400" };
    }
    return { label: "마감", color: "bg-yellow-500/20 text-yellow-400" };
  };

  const currentStatus = getCurrentStatus();

  return (
    <div className="bg-[hsl(var(--secondary))] rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span
            className={`px-2 py-0.5 rounded text-xs font-medium ${currentStatus.color}`}
          >
            {currentStatus.label}
          </span>
          <span className="text-xs text-[hsl(var(--muted-foreground))]">
            지원자 {round._count.applications}명
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          type="button"
          onClick={onToggleEdit}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-[hsl(var(--background))] rounded-lg text-sm font-medium hover:bg-[hsl(var(--background))]/80 transition-colors"
        >
          <Settings className="w-3.5 h-3.5" />
          참여 동아리 ({activeCount})
        </button>
        <Link
          href={`/admin/cycles/${cycleId}/rounds/${round.id}/forms`}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-[hsl(var(--background))] rounded-lg text-sm font-medium hover:bg-[hsl(var(--background))]/80 transition-colors"
        >
          <FileText className="w-3.5 h-3.5" />
          지원서 양식 ({round.applicationForms.length})
        </Link>
      </div>

      {isEditing && (
        <div className="mt-4 pt-4 border-t border-[hsl(var(--border))]">
          <h4 className="text-sm font-medium mb-3">참여 동아리 및 최대 인원</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {clubs.map((club) => {
              const config = clubConfigs.find((c) => c.clubId === club.id);
              return (
                <div
                  key={club.id}
                  className={`p-3 rounded-lg border transition-colors ${
                    config?.isActive
                      ? "border-white/30 bg-white/5"
                      : "border-[hsl(var(--border))] bg-[hsl(var(--background))]"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={config?.isActive || false}
                      onChange={(e) => {
                        setClubConfigs((prev) =>
                          prev.map((c) =>
                            c.clubId === club.id
                              ? { ...c, isActive: e.target.checked }
                              : c
                          )
                        );
                      }}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm font-medium">{club.name}</span>
                  </div>
                  {config?.isActive && (
                    <div>
                      <label className="block text-xs text-[hsl(var(--muted-foreground))] mb-1">
                        최대 인원
                      </label>
                      <Input
                        type="number"
                        value={config.maxMembers}
                        onChange={(e) => {
                          setClubConfigs((prev) =>
                            prev.map((c) =>
                              c.clubId === club.id
                                ? {
                                    ...c,
                                    maxMembers: parseInt(e.target.value) || 0,
                                  }
                                : c
                            )
                          );
                        }}
                        min={1}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={handleSaveConfigs}
              disabled={saving}
              className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? "저장 중..." : "동아리 설정 저장"}
            </button>
            <button
              type="button"
              onClick={onToggleEdit}
              className="px-4 py-2 bg-[hsl(var(--background))] rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
