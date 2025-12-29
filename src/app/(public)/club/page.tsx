import { prisma } from "@/lib/prisma";
import { StorageImage } from "@/components/storage-image";
import Link from "next/link";
import { Globe, Facebook, Instagram, Github, Youtube, Users, BookOpen, ExternalLink } from "lucide-react";

interface SocialLinks {
  website?: string;
  facebook?: string;
  instagram?: string;
  github?: string;
  youtube?: string;
}

const socialIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  website: Globe,
  facebook: Facebook,
  instagram: Instagram,
  github: Github,
  youtube: Youtube,
};

export default async function ClubPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string }>;
}) {
  const params = await searchParams;
  const clubs = await prisma.club.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });

  const selectedSlug = params.name || clubs[0]?.slug;
  const selectedClub = clubs.find((c) => c.slug === selectedSlug) || clubs[0];

  if (!selectedClub) {
    return (
      <>
        <section className="relative pt-32 pb-20 px-6 -mt-16 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--secondary))] via-[hsl(var(--background))] to-[hsl(var(--background))]" />
          </div>
          <div className="max-w-4xl mx-auto relative z-10 text-center">
            <Users className="w-16 h-16 mx-auto mb-6 text-[hsl(var(--muted-foreground))] opacity-50" />
            <h1 className="text-3xl font-bold mb-4">등록된 동아리가 없습니다</h1>
            <p className="text-[hsl(var(--muted-foreground))]">
              곧 동아리 정보가 업데이트됩니다.
            </p>
          </div>
        </section>
      </>
    );
  }

  const socialLinks = (selectedClub.socialLinks as SocialLinks) || {};

  return (
    <>
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-6 -mt-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--secondary))] via-[hsl(var(--background))] to-[hsl(var(--background))]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent" />
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <p className="text-sm text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
              Clubs
            </p>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">동아리 소개</h1>
          <p className="text-lg text-[hsl(var(--muted-foreground))] max-w-xl">
            정보보호과의 전문 동아리에서 함께 성장하세요
          </p>
        </div>
      </section>

      {/* Club Tabs */}
      <section className="px-6 pb-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap gap-2 p-1.5 bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))]">
            {clubs.map((club) => (
              <Link
                key={club.id}
                href={`/club?name=${club.slug}`}
                className={`flex-1 min-w-fit px-5 py-3 rounded-xl text-sm font-medium text-center transition-all ${
                  club.slug === selectedSlug
                    ? "bg-white text-black shadow-lg"
                    : "text-[hsl(var(--muted-foreground))] hover:text-white hover:bg-[hsl(var(--secondary))]"
                }`}
              >
                {club.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Club Detail */}
      <section className="px-6 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] overflow-hidden">
            {/* Club Header */}
            <div className="p-8 md:p-10 border-b border-[hsl(var(--border))] bg-gradient-to-br from-[hsl(var(--secondary))] to-transparent">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-28 h-28 rounded-2xl bg-[hsl(var(--background))] overflow-hidden flex-shrink-0 shadow-xl">
                  {selectedClub.logoUrl ? (
                    <StorageImage
                      src={selectedClub.logoUrl}
                      alt={selectedClub.name}
                      width={112}
                      height={112}
                      className="object-contain p-4 w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-[hsl(var(--muted-foreground))]">
                      {selectedClub.name.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-3">{selectedClub.name}</h2>
                  {selectedClub.description && (
                    <p className="text-[hsl(var(--muted-foreground))] leading-relaxed">
                      {selectedClub.description}
                    </p>
                  )}

                  {Object.keys(socialLinks).length > 0 && (
                    <div className="flex gap-2 mt-5">
                      {Object.entries(socialLinks).map(([key, url]) => {
                        if (!url) return null;
                        const Icon = socialIcons[key] || Globe;
                        return (
                          <a
                            key={key}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-[hsl(var(--background))] hover:bg-white hover:text-black transition-all group"
                          >
                            <Icon className="w-4 h-4" />
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Club Content */}
            {selectedClub.curriculum && (
              <div className="p-8 md:p-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-[hsl(var(--secondary))] flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <h3 className="font-semibold">커리큘럼</h3>
                </div>
                <p className="text-[hsl(var(--muted-foreground))] leading-relaxed whitespace-pre-wrap pl-11">
                  {selectedClub.curriculum}
                </p>
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="mt-10 text-center">
            <Link
              href="/apply"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-white/10"
            >
              지원하기
              <ExternalLink className="w-4 h-4" />
            </Link>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-4">
              모집 기간에 지원서를 제출할 수 있습니다
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
