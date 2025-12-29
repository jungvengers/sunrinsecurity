"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateSettings(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("권한이 없습니다.");
  }

  const key = formData.get("key") as string;

  const entries = Array.from(formData.entries()).filter(
    ([k]) => k !== "key"
  );
  const value = Object.fromEntries(
    entries.map(([k, v]) => [k, v.toString()])
  ) as Record<string, string>;

  const existing = await prisma.siteSettings.findUnique({
    where: { key },
  });

  if (existing) {
    await prisma.siteSettings.update({
      where: { key },
      data: { value },
    });
  } else {
    await prisma.siteSettings.create({
      data: { key, value },
    });
  }

  revalidatePath("/admin/settings");
}
