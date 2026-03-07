"use client";

import { Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { toEndOfMinute } from "@/lib/utils";
import { cn } from "@/lib/utils";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MS_PER_HOUR = 60 * 60 * 1000;
const MS_PER_MINUTE = 60 * 1000;
const MS_PER_SECOND = 1000;
const MS_10_MINUTES = 10 * MS_PER_MINUTE;

function getTimeLeft(endMs: number): number {
  return Math.max(0, endMs - Date.now());
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "마감";
  const days = Math.floor(ms / MS_PER_DAY);
  const hours = Math.floor((ms % MS_PER_DAY) / MS_PER_HOUR);
  const minutes = Math.floor((ms % MS_PER_HOUR) / MS_PER_MINUTE);
  const seconds = Math.floor((ms % MS_PER_MINUTE) / MS_PER_SECOND);
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}일`);
  parts.push(
    [hours, minutes, seconds]
      .map((n) => String(n).padStart(2, "0"))
      .join(":")
  );
  return parts.join(" ") + " 남음";
}

interface DeadlineCountdownProps {
  /** ISO string of applyEndDate from DB */
  applyEndDateIso: string;
  className?: string;
}

export function DeadlineCountdown({
  applyEndDateIso,
  className,
}: DeadlineCountdownProps) {
  const endDate = toEndOfMinute(new Date(applyEndDateIso));
  const endMs = endDate.getTime();

  const [timeLeftMs, setTimeLeftMs] = useState(() => getTimeLeft(endMs));
  const isUrgent = timeLeftMs > 0 && timeLeftMs <= MS_PER_DAY;
  const isCritical = timeLeftMs > 0 && timeLeftMs <= MS_10_MINUTES;
  const isPast = timeLeftMs <= 0;

  useEffect(() => {
    const tick = () => setTimeLeftMs(getTimeLeft(endMs));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endMs]);

  const displayDate = endDate.toLocaleString("ko-KR");

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors",
        isCritical &&
          "bg-red-500/15 border-red-500/40 text-red-600 dark:text-red-400",
        isUrgent &&
          !isCritical &&
          "bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400",
        !isUrgent &&
          !isPast &&
          "bg-[hsl(var(--card))] border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]",
        isPast &&
          "bg-[hsl(var(--card))] border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]",
        className
      )}
    >
      <Clock
        className={cn(
          "w-4 h-4 shrink-0",
          isCritical && "text-red-500 dark:text-red-400",
          isUrgent && !isCritical && "text-amber-500 dark:text-amber-400"
        )}
      />
      {isUrgent ? (
        <span className="font-medium tabular-nums">
          {formatCountdown(timeLeftMs)}
        </span>
      ) : (
        <span>마감: {displayDate}</span>
      )}
    </span>
  );
}
