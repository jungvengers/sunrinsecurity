import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ProjectForm } from "../form";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [project, clubs] = await Promise.all([
    prisma.project.findUnique({ where: { id } }),
    prisma.club.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    }),
  ]);

  if (!project) {
    notFound();
  }

  return <ProjectForm project={project} clubs={clubs} />;
}
