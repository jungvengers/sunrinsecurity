"use client";

import { Trash2 } from "lucide-react";
import { useState, useTransition } from "react";

interface DeleteButtonProps {
  onDelete: () => Promise<void>;
  confirmMessage?: string;
  className?: string;
}

export function DeleteButton({
  onDelete,
  confirmMessage = "정말 삭제하시겠습니까?",
  className,
}: DeleteButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    if (!confirm(confirmMessage)) return;
    startTransition(async () => {
      await onDelete();
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={className || "p-2 rounded-lg hover:bg-[hsl(var(--secondary))] transition-colors disabled:opacity-50"}
    >
      <Trash2 className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
    </button>
  );
}
