"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { deleteClub } from "@/actions/club";
import { useState } from "react";

interface Club {
  id: string;
  name: string;
  order: number;
  isActive: boolean;
}

export function ClubList({ clubs }: { clubs: Club[] }) {
  const [deleteTarget, setDeleteTarget] = useState<Club | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    await deleteClub(deleteTarget.id);
    setDeleteTarget(null);
    setIsDeleting(false);
  };

  return (
    <>
      <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[hsl(var(--border))]">
              <th className="text-left p-4 text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                순서
              </th>
              <th className="text-left p-4 text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                이름
              </th>
              <th className="text-left p-4 text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                상태
              </th>
              <th className="text-right p-4 text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                작업
              </th>
            </tr>
          </thead>
          <tbody>
            {clubs.map((club) => (
              <tr
                key={club.id}
                className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--secondary))] transition-colors"
              >
                <td className="p-4 text-[hsl(var(--muted-foreground))]">
                  {club.order}
                </td>
                <td className="p-4 font-medium">{club.name}</td>
                <td className="p-4">
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      club.isActive
                        ? "bg-[hsl(var(--secondary))]"
                        : "bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))]"
                    }`}
                  >
                    {club.isActive ? "활성" : "비활성"}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/admin/clubs/${club.id}`}
                      className="p-2 rounded-lg hover:bg-[hsl(var(--secondary))] transition-colors"
                    >
                      <Pencil className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(club)}
                      className="p-2 rounded-lg hover:bg-[hsl(var(--secondary))] transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 삭제 확인 모달 */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDeleteTarget(null)}
          />
          <div className="relative bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold mb-2">동아리 삭제</h3>
            <p className="text-[hsl(var(--muted-foreground))] mb-6">
              <span className="font-medium text-white">{deleteTarget.name}</span>
              을(를) 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="px-4 py-2 bg-[hsl(var(--secondary))] rounded-lg text-sm font-medium hover:bg-[hsl(var(--secondary))]/80 transition-colors disabled:opacity-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? "삭제 중..." : "삭제"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
