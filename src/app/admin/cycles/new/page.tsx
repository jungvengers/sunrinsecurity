import { Input } from "@/components/ui/input";
import { createCycle } from "@/actions/cycle";
import Link from "next/link";
import { ArrowLeft, Calendar, Eye, Play, Square } from "lucide-react";

export default function NewCyclePage() {
  const currentYear = new Date().getFullYear();

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/cycles"
          className="inline-flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))] hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          사이클 목록
        </Link>
        <h1 className="text-2xl font-bold">새 지원 사이클</h1>
      </div>

      <form action={createCycle} className="max-w-xl space-y-6">
        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-5 space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm text-[hsl(var(--muted-foreground))] mb-2">
                년도 *
              </label>
              <Input name="year" type="number" defaultValue={currentYear} required />
            </div>

            <div>
              <label className="block text-sm text-[hsl(var(--muted-foreground))] mb-2">
                최대 지원 가능 수
              </label>
              <Input name="maxApplications" type="number" defaultValue={3} />
            </div>
          </div>

          <div>
            <label className="block text-sm text-[hsl(var(--muted-foreground))] mb-2">
              이름 *
            </label>
            <Input
              name="name"
              defaultValue={`${currentYear}년 동아리 모집`}
              required
            />
          </div>
        </div>

        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-5 space-y-5">
          <h3 className="font-semibold flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            일정 설정
          </h3>

          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-[hsl(var(--secondary))] rounded-lg">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Eye className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">
                  공개일
                </label>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mb-2">
                  이 날짜부터 지원자들이 지원서 양식을 볼 수 있습니다
                </p>
                <Input
                  name="viewStartDate"
                  type="datetime-local"
                  className="max-w-xs"
                />
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-[hsl(var(--secondary))] rounded-lg">
              <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <Play className="w-4 h-4 text-green-400" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">
                  지원 시작일
                </label>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mb-2">
                  이 날짜부터 실제 지원서 제출이 가능합니다
                </p>
                <Input
                  name="applyStartDate"
                  type="datetime-local"
                  className="max-w-xs"
                />
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-[hsl(var(--secondary))] rounded-lg">
              <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <Square className="w-4 h-4 text-red-400" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">
                  지원 마감일
                </label>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mb-2">
                  이 날짜에 지원이 마감됩니다
                </p>
                <Input
                  name="applyEndDate"
                  type="datetime-local"
                  className="max-w-xs"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            생성
          </button>
          <Link
            href="/admin/cycles"
            className="px-4 py-2 bg-[hsl(var(--secondary))] rounded-lg text-sm font-medium hover:bg-[hsl(var(--secondary))]/80 transition-colors"
          >
            취소
          </Link>
        </div>
      </form>
    </div>
  );
}
