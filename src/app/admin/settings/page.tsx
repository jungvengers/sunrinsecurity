import { prisma } from "@/lib/prisma";
import { Input } from "@/components/ui/input";
import { updateSettings } from "@/actions/settings";
import { BackgroundUploader } from "./background-uploader";

export default async function SettingsPage() {
  const settings = await prisma.siteSettings.findMany();

  const getSetting = (key: string) => {
    const setting = settings.find((s) => s.key === key);
    return setting?.value as Record<string, unknown> | null;
  };

  const general = getSetting("general") || {};
  const appearance = getSetting("appearance") || {};
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true, name: true, email: true },
  });

  const backgroundImage = (appearance.backgroundImage as string) || "";

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">
          Settings
        </p>
        <h1 className="text-2xl font-bold">설정</h1>
      </div>

      <div className="space-y-6 max-w-2xl">
        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-5">
          <h2 className="font-semibold mb-4">일반 설정</h2>
          <form action={updateSettings} className="space-y-4">
            <input type="hidden" name="key" value="general" />
            <div className="grid gap-4">
              <div>
                <label className="block text-sm text-[hsl(var(--muted-foreground))] mb-2">
                  사이트 제목
                </label>
                <Input
                  name="siteTitle"
                  defaultValue={(general.siteTitle as string) || "정보보호과"}
                />
              </div>
              <div>
                <label className="block text-sm text-[hsl(var(--muted-foreground))] mb-2">
                  학교 이름
                </label>
                <Input
                  name="schoolName"
                  defaultValue={
                    (general.schoolName as string) || "선린인터넷고등학교"
                  }
                />
              </div>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              저장
            </button>
          </form>
        </div>

        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-5">
          <h2 className="font-semibold mb-4">메인 페이지 배경</h2>
          <BackgroundUploader initialImage={backgroundImage} />
        </div>

        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-5">
          <h2 className="font-semibold mb-4">관리자 목록</h2>
          {admins.length === 0 ? (
            <p className="text-[hsl(var(--muted-foreground))] text-sm">
              등록된 관리자가 없습니다.
            </p>
          ) : (
            <div className="space-y-2">
              {admins.map((admin) => (
                <div
                  key={admin.id}
                  className="flex items-center justify-between bg-[hsl(var(--secondary))] rounded-lg p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-medium">
                      {admin.name?.charAt(0) || "A"}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{admin.name}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        {admin.email}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-4">
            관리자 권한은 데이터베이스에서 직접 변경해야 합니다.
          </p>
        </div>
      </div>
    </div>
  );
}
