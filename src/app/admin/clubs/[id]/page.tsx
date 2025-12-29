import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ClubForm } from "../form";

export default async function EditClubPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const club = await prisma.club.findUnique({
    where: { id },
  });

  if (!club) {
    notFound();
  }

  return <ClubForm club={club} />;
}
