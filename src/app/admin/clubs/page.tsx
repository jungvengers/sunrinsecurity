import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus } from "lucide-react";
import { ClubList } from "./club-list";

export default async function ClubsPage() {
  const clubs = await prisma.club.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">
            Clubs
          </p>
          <h1 className="text-2xl font-bold">동아리</h1>
        </div>
        <Link
          href="/admin/clubs/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          새 동아리
        </Link>
      </div>

      {clubs.length === 0 ? (
        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-12 text-center">
          <p className="text-[hsl(var(--muted-foreground))]">
            아직 등록된 동아리가 없습니다.
          </p>
        </div>
      ) : (
        <ClubList clubs={clubs} />
      )}
    </div>
  );
}
