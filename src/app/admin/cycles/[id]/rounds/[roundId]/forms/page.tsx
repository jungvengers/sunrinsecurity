import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { FormBuilder } from "./form-builder";
import { formatCycleName } from "@/lib/utils";

export default async function FormsPage({
  params,
}: {
  params: Promise<{ id: string; roundId: string }>;
}) {
  const { id, roundId } = await params;

  const [round, clubs, forms] = await Promise.all([
    prisma.recruitmentRound.findUnique({
      where: { id: roundId },
      include: { cycle: true },
    }),
    prisma.club.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    }),
    prisma.applicationForm.findMany({
      where: { roundId },
      include: { club: true },
    }),
  ]);

  if (!round || round.cycleId !== id) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">{round.name} 지원서 양식</h1>
      <p className="text-[hsl(var(--muted-foreground))] mb-8">
        {formatCycleName(round.cycle.year, round.cycle.name)}
      </p>
      <FormBuilder
        cycleId={id}
        roundId={roundId}
        clubs={clubs}
        existingForms={forms}
      />
    </div>
  );
}
