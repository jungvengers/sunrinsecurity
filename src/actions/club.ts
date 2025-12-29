"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export async function createClub(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("권한이 없습니다.");
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const curriculum = formData.get("curriculum") as string;
  const logoUrl = formData.get("logoUrl") as string;
  const order = parseInt(formData.get("order") as string) || 0;
  const isActive = formData.get("isActive") === "on";

  const website = formData.get("website") as string;
  const facebook = formData.get("facebook") as string;
  const instagram = formData.get("instagram") as string;
  const github = formData.get("github") as string;
  const youtube = formData.get("youtube") as string;

  const socialLinks = {
    ...(website && { website }),
    ...(facebook && { facebook }),
    ...(instagram && { instagram }),
    ...(github && { github }),
    ...(youtube && { youtube }),
  };

  const baseSlug = generateSlug(name);
  let slug = baseSlug;
  let counter = 1;

  while (await prisma.club.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  await prisma.club.create({
    data: {
      name,
      slug,
      description: description || null,
      curriculum: curriculum || null,
      logoUrl: logoUrl || null,
      order,
      isActive,
      socialLinks:
        Object.keys(socialLinks).length > 0 ? socialLinks : undefined,
    },
  });

  revalidatePath("/admin/clubs");
  revalidatePath("/club");
  redirect("/admin/clubs");
}

export async function updateClub(
  id: string,
  formData: FormData
): Promise<void> {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("권한이 없습니다.");
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const curriculum = formData.get("curriculum") as string;
  const logoUrl = formData.get("logoUrl") as string;
  const order = parseInt(formData.get("order") as string) || 0;
  const isActive = formData.get("isActive") === "on";

  const website = formData.get("website") as string;
  const facebook = formData.get("facebook") as string;
  const instagram = formData.get("instagram") as string;
  const github = formData.get("github") as string;
  const youtube = formData.get("youtube") as string;

  const socialLinks = {
    ...(website && { website }),
    ...(facebook && { facebook }),
    ...(instagram && { instagram }),
    ...(github && { github }),
    ...(youtube && { youtube }),
  };

  await prisma.club.update({
    where: { id },
    data: {
      name,
      description: description || null,
      curriculum: curriculum || null,
      logoUrl: logoUrl || null,
      order,
      isActive,
      socialLinks:
        Object.keys(socialLinks).length > 0 ? socialLinks : undefined,
    },
  });

  revalidatePath("/admin/clubs");
  revalidatePath("/club");
  redirect("/admin/clubs");
}

export async function deleteClub(id: string): Promise<void> {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("권한이 없습니다.");
  }

  await prisma.club.delete({
    where: { id },
  });

  revalidatePath("/admin/clubs");
  revalidatePath("/club");
}
