import { prisma } from "@/lib/prisma";
import { StorageImage } from "@/components/storage-image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Folder } from "lucide-react";

export default async function ProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const requestedPage = Number(params.page ?? "1");
  const perPage = 9;

  const total = await prisma.project.count({ where: { isPublished: true } });
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const page =
    Number.isInteger(requestedPage) && requestedPage > 0
      ? Math.min(requestedPage, totalPages)
      : 1;

  const projects = await prisma.project.findMany({
    where: { isPublished: true },
    include: { club: true },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * perPage,
    take: perPage,
  });

  return (
    <>
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 -mt-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--secondary))] via-[hsl(var(--background))] to-[hsl(var(--background))]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent" />
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
              <Folder className="w-6 h-6" />
            </div>
            <p className="text-sm text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
              Projects
            </p>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">프로젝트 전시장</h1>
          <p className="text-lg text-[hsl(var(--muted-foreground))] max-w-xl">
            정보보호과 학생들이 만든 다양한 보안 프로젝트를 살펴보세요
          </p>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          {projects.length === 0 ? (
            <div className="text-center py-20 bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))]">
              <Folder className="w-12 h-12 mx-auto mb-4 text-[hsl(var(--muted-foreground))] opacity-50" />
              <p className="text-[hsl(var(--muted-foreground))]">
                아직 등록된 프로젝트가 없습니다.
              </p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project, index) => (
                  <Link
                    key={project.id}
                    href={`/project/${project.slug || project.id}`}
                    className="group bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] overflow-hidden hover:border-[hsl(var(--muted-foreground))] hover:shadow-xl hover:shadow-black/20 transition-all duration-300 hover:-translate-y-1"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="relative aspect-[16/10]">
                      {project.thumbnail ? (
                        <StorageImage
                          src={project.thumbnail}
                          alt={project.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[hsl(var(--secondary))] to-[hsl(var(--muted))] flex items-center justify-center">
                          <Folder className="w-12 h-12 text-[hsl(var(--muted-foreground))] opacity-30" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      {project.category && (
                        <span className="absolute top-3 left-3 px-2.5 py-1 text-xs font-medium bg-black/70 backdrop-blur-sm rounded-lg">
                          {project.category}
                        </span>
                      )}
                    </div>

                    <div className="p-5">
                      <h3 className="font-semibold text-lg mb-2 group-hover:text-white transition-colors line-clamp-1">
                        {project.title}
                      </h3>
                      <div className="text-sm text-[hsl(var(--muted-foreground))]">
                        {project.club && <span>{project.club.name}</span>}
                        {project.club && project.participants && (
                          <span className="mx-1.5">·</span>
                        )}
                        {project.participants && (
                          <span className="truncate">{project.participants}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  <Link
                    href={page > 1 ? `/project?page=${page - 1}` : "#"}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors ${
                      page > 1
                        ? "bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--muted))]"
                        : "opacity-30 cursor-not-allowed"
                    }`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Link>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <Link
                      key={p}
                      href={`/project?page=${p}`}
                      className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-medium transition-colors ${
                        p === page
                          ? "bg-white text-black"
                          : "bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--muted))]"
                      }`}
                    >
                      {p}
                    </Link>
                  ))}

                  <Link
                    href={page < totalPages ? `/project?page=${page + 1}` : "#"}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors ${
                      page < totalPages
                        ? "bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--muted))]"
                        : "opacity-30 cursor-not-allowed"
                    }`}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>
              )}

              <p className="text-center text-sm text-[hsl(var(--muted-foreground))] mt-6">
                총 {total}개의 프로젝트
              </p>
            </>
          )}
        </div>
      </section>
    </>
  );
}
