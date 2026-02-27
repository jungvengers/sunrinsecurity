import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CycleDetail } from "./cycle-detail";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { formatCycleName } from "@/lib/utils";

export default async function CycleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [cycle, clubs] = await Promise.all([
    prisma.recruitmentCycle.findUnique({
      where: { id },
      include: {
        rounds: {
          include: {
            applicationForms: {
              include: { club: true },
            },
            roundClubConfigs: {
              include: { club: true },
            },
            _count: { select: { applications: true } },
          },
          orderBy: { roundNumber: "asc" },
        },
        clubAdmins: {
          include: {
            user: true,
            club: true,
          },
        },
      },
    }),
    prisma.club.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    }),
  ]);

  if (!cycle) {
    notFound();
  }

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
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{formatCycleName(cycle.year, cycle.name)}</h1>
        </div>
      </div>
      <CycleDetail cycle={cycle} clubs={clubs} />
    </div>
  );
}
