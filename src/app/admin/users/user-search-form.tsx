"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

export function UserSearchForm({
  defaultQ = "",
  defaultGrade = "",
  className = "",
}: {
  defaultQ?: string;
  defaultGrade?: string;
  className?: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(defaultQ);
  const [grade, setGrade] = useState(defaultGrade);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (grade !== "") params.set("grade", grade);
      router.push(`/admin/users${params.toString() ? `?${params.toString()}` : ""}`);
    },
    [q, grade, router]
  );

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex flex-wrap items-end gap-3 ${className}`}
    >
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-[hsl(var(--muted-foreground))]">
          검색
        </span>
        <Input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="이름, 이메일, 학번"
          className="h-10 w-56"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-[hsl(var(--muted-foreground))]">
          학년
        </span>
        <select
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          className="h-10 min-w-[6rem] rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
        >
          <option value="">전체</option>
          {[1, 2, 3].map((g) => (
            <option key={g} value={g}>
              {g}학년
            </option>
          ))}
        </select>
      </label>
      <Button type="submit" variant="secondary" className="gap-2">
        <Search className="w-4 h-4" />
        검색하기
      </Button>
    </form>
  );
}
