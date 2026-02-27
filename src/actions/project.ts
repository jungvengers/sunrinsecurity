"use server";

import { auth } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export async function createProject(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("권한이 없습니다.");
  }

  const title = formData.get("title") as string;
  const thumbnail = formData.get("thumbnail") as string;
  const category = formData.get("category") as string;
  const participants = formData.get("participants") as string;
  const clubId = formData.get("clubId") as string;
  const content = formData.get("content") as string;
  const isPublished = formData.get("isPublished") === "on";

  const baseSlug = generateSlug(title);
  let slug = baseSlug;
  let counter = 1;

  while (await prisma.project.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  const project = await prisma.project.create({
    data: {
      title,
      slug,
      thumbnail: thumbnail || null,
      category: category || null,
      participants: participants || null,
      clubId: clubId || null,
      content: content ? JSON.parse(content) : null,
      isPublished,
    },
  });

  await writeAuditLog({
    actorId: session.user.id,
    actorRole: session.user.role,
    action: "project.create",
    targetType: "Project",
    targetId: project.id,
    metadata: { title, slug, isPublished },
  });

  revalidatePath("/admin/projects");
  revalidatePath("/project");
  redirect("/admin/projects");
}

export async function updateProject(id: string, formData: FormData): Promise<void> {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("권한이 없습니다.");
  }

  const title = formData.get("title") as string;
  const thumbnail = formData.get("thumbnail") as string;
  const category = formData.get("category") as string;
  const participants = formData.get("participants") as string;
  const clubId = formData.get("clubId") as string;
  const content = formData.get("content") as string;
  const isPublished = formData.get("isPublished") === "on";

  await prisma.project.update({
    where: { id },
    data: {
      title,
      thumbnail: thumbnail || null,
      category: category || null,
      participants: participants || null,
      clubId: clubId || null,
      content: content ? JSON.parse(content) : null,
      isPublished,
    },
  });

  await writeAuditLog({
    actorId: session.user.id,
    actorRole: session.user.role,
    action: "project.update",
    targetType: "Project",
    targetId: id,
    metadata: { title, isPublished },
  });

  revalidatePath("/admin/projects");
  revalidatePath("/project");
  redirect("/admin/projects");
}

export async function deleteProject(id: string): Promise<void> {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("권한이 없습니다.");
  }

  await prisma.project.delete({
    where: { id },
  });

  await writeAuditLog({
    actorId: session.user.id,
    actorRole: session.user.role,
    action: "project.delete",
    targetType: "Project",
    targetId: id,
  });

  revalidatePath("/admin/projects");
  revalidatePath("/project");
}
