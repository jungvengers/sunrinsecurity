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

function getEmbedColor(action: string): number {
  if (action.includes("delete") || action.includes("cancel")) return 0xed4245; // red
  if (action.includes("create") || action.includes("add") || action.includes("submit")) return 0x57f284; // green
  if (action.includes("update") || action.includes("allocate")) return 0x5865f2; // blurple
  return 0x99aab5; // gray
}

const DISCORD_FIELD_MAX = 1024;

function truncate(value: string, max: number = DISCORD_FIELD_MAX): string {
  if (value.length <= max) return value;
  return value.slice(0, max - 3) + "...";
}

async function sendAuditLogToDiscord(entry: AuditLogInput & { timestamp: string }) {
  const webhookUrl = process.env.DISCORD_AUDIT_WEBHOOK_URL;
  if (!webhookUrl?.startsWith("https://discord.com/api/webhooks/")) return;

  const metadataStr =
    Object.keys(entry.metadata ?? {}).length > 0
      ? truncate("```json\n" + JSON.stringify(entry.metadata, null, 2) + "\n```")
      : "—";

  const targetValue = truncate(
    `${entry.targetType}${entry.targetId ? ` · ${entry.targetId}` : ""}`
  );

  const payload = {
    embeds: [
      {
        title: entry.action,
        color: getEmbedColor(entry.action),
        fields: [
          { name: "Actor ID", value: truncate(entry.actorId, 256), inline: true },
          { name: "Role", value: entry.actorRole, inline: true },
          { name: "Target", value: targetValue, inline: false },
          { name: "Metadata", value: metadataStr, inline: false },
        ],
        timestamp: entry.timestamp,
        footer: { text: "Audit Log" },
      },
    ],
  };

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error("Discord audit webhook failed:", res.status, await res.text());
    }
  } catch (error) {
    console.error("Discord audit webhook error:", error);
  }
}

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
    } else {
      await prisma.siteSettings.create({
        data: {
          key: AUDIT_LOG_KEY,
          value: trimmedLogs,
        },
      });
    }

    await sendAuditLogToDiscord({
      ...input,
      timestamp: entry.timestamp,
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
}
