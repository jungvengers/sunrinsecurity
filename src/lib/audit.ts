import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

interface AuditLogInput {
  actorId: string;
  actorRole: string;
  action: string;
  targetType: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}

const AUDIT_LOG_KEY = "audit_log";
const MAX_AUDIT_LOG_ENTRIES = 1000;

export async function writeAuditLog(input: AuditLogInput) {
  const entry = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    actorId: input.actorId,
    actorRole: input.actorRole,
    action: input.action,
    targetType: input.targetType,
    targetId: input.targetId ?? null,
    metadata: input.metadata ?? {},
  };

  try {
    const current = await prisma.siteSettings.findUnique({
      where: { key: AUDIT_LOG_KEY },
      select: { id: true, value: true },
    });

    const existingLogs = Array.isArray(current?.value)
      ? (current.value as Prisma.InputJsonValue[])
      : [];
    const logs: Prisma.InputJsonValue[] = [
      ...existingLogs,
      entry as Prisma.InputJsonValue,
    ];
    const trimmedLogs =
      logs.length > MAX_AUDIT_LOG_ENTRIES
        ? logs.slice(logs.length - MAX_AUDIT_LOG_ENTRIES)
        : logs;

    if (current) {
      await prisma.siteSettings.update({
        where: { id: current.id },
        data: { value: trimmedLogs },
      });
      return;
    }

    await prisma.siteSettings.create({
      data: {
        key: AUDIT_LOG_KEY,
        value: trimmedLogs,
      },
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
}
