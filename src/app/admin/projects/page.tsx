import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Pencil, Eye, EyeOff, ExternalLink } from "lucide-react";
import { deleteProject } from "@/actions/project";
import { DeleteButton } from "@/components/delete-button";

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    include: { club: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">
            Projects
          </p>
          <h1 className="text-2xl font-bold">프로젝트</h1>
        </div>
        <Link
          href="/admin/projects/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />새 프로젝트
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-12 text-center">
          <p className="text-[hsl(var(--muted-foreground))]">
            아직 등록된 프로젝트가 없습니다.
          </p>
        </div>
      ) : (
        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                <th className="text-left p-4 text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  제목
                </th>
                <th className="text-left p-4 text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  동아리
                </th>
                <th className="text-left p-4 text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  분야
                </th>
                <th className="text-left p-4 text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  상태
                </th>
                <th className="text-right p-4 text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr
                  key={project.id}
                  className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--secondary))] transition-colors"
                >
                  <td className="p-4 font-medium">{project.title}</td>
                  <td className="p-4 text-[hsl(var(--muted-foreground))]">
                    {project.club?.name || "-"}
                  </td>
                  <td className="p-4 text-[hsl(var(--muted-foreground))]">
                    {project.category || "-"}
                  </td>
                  <td className="p-4">
                    {project.isPublished ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium bg-[hsl(var(--secondary))]">
                        <Eye className="w-3 h-3" />
                        공개
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))]">
                        <EyeOff className="w-3 h-3" />
                        비공개
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/projects/${project.id}/detail`}
                        className="p-2 rounded-lg hover:bg-[hsl(var(--secondary))] transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                      </Link>
                      <Link
                        href={`/admin/projects/${project.id}`}
                        className="p-2 rounded-lg hover:bg-[hsl(var(--secondary))] transition-colors"
                      >
                        <Pencil className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                      </Link>
                      <DeleteButton
                        onDelete={deleteProject.bind(null, project.id)}
                        confirmMessage={`"${project.title}" 프로젝트를 삭제하시겠습니까?`}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
