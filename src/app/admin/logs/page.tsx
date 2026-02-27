import { prisma } from "@/lib/prisma";

interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorRole: string;
  action: string;
  targetType: string;
  targetId: string | null;
  metadata: Record<string, unknown>;
}

function parseAuditLogs(value: unknown): AuditLogEntry[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (entry): entry is AuditLogEntry =>
        typeof entry === "object" &&
        entry !== null &&
        typeof (entry as AuditLogEntry).id === "string" &&
        typeof (entry as AuditLogEntry).timestamp === "string" &&
        typeof (entry as AuditLogEntry).actorId === "string" &&
        typeof (entry as AuditLogEntry).actorRole === "string" &&
        typeof (entry as AuditLogEntry).action === "string" &&
        typeof (entry as AuditLogEntry).targetType === "string"
    )
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
}

export default async function AdminLogsPage() {
  const auditSetting = await prisma.siteSettings.findUnique({
    where: { key: "audit_log" },
    select: { value: true },
  });

  const logs = parseAuditLogs(auditSetting?.value);

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">Logs</p>
        <h1 className="text-2xl font-bold">감사 로그</h1>
      </div>

      <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-8 text-center text-[hsl(var(--muted-foreground))]">
            기록된 로그가 없습니다.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                <th className="text-left p-4 text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  시각
                </th>
                <th className="text-left p-4 text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  액션
                </th>
                <th className="text-left p-4 text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  대상
                </th>
                <th className="text-left p-4 text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  수행자
                </th>
                <th className="text-left p-4 text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  메타데이터
                </th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-[hsl(var(--border))] last:border-0 align-top"
                >
                  <td className="p-4 text-sm whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString("ko-KR")}
                  </td>
                  <td className="p-4 text-sm font-medium">{log.action}</td>
                  <td className="p-4 text-sm text-[hsl(var(--muted-foreground))]">
                    {log.targetType}
                    {log.targetId ? ` (${log.targetId})` : ""}
                  </td>
                  <td className="p-4 text-sm">
                    {log.actorRole} / {log.actorId}
                  </td>
                  <td className="p-4 text-xs text-[hsl(var(--muted-foreground))] max-w-md break-all">
                    {Object.keys(log.metadata || {}).length > 0
                      ? JSON.stringify(log.metadata)
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
