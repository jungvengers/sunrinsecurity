import { prisma } from "@/lib/prisma";
import { ProjectForm } from "../form";

export default async function NewProjectPage() {
  const clubs = await prisma.club.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });

  return <ProjectForm clubs={clubs} />;
}
