"use client";

import { Input } from "@/components/ui/input";
import { TiptapEditor } from "@/components/tiptap-editor";
import { createProject, updateProject } from "@/actions/project";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";

interface Club {
  id: string;
  name: string;
}

interface Project {
  id: string;
  title: string;
  thumbnail: string | null;
  category: string | null;
  participants: string | null;
  clubId: string | null;
  content: unknown;
  isPublished: boolean;
}

interface ProjectFormProps {
  project?: Project;
  clubs: Club[];
}

export function ProjectForm({ project, clubs }: ProjectFormProps) {
  const [content, setContent] = useState<object | null>(
    (project?.content as object) || null
  );

  const handleSubmit = async (formData: FormData) => {
    if (content) {
      formData.set("content", JSON.stringify(content));
    }
    if (project) {
      await updateProject(project.id, formData);
    } else {
      await createProject(formData);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/projects"
          className="inline-flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))] hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          프로젝트 목록
        </Link>
        <h1 className="text-2xl font-bold">
          {project ? "프로젝트 수정" : "새 프로젝트"}
        </h1>
      </div>

      <form action={handleSubmit} className="space-y-6">
        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-5 space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm text-[hsl(var(--muted-foreground))] mb-2">
                제목 *
              </label>
              <Input
                name="title"
                defaultValue={project?.title || ""}
                required
              />
            </div>

            <div>
              <label className="block text-sm text-[hsl(var(--muted-foreground))] mb-2">
                동아리
              </label>
              <select
                name="clubId"
                defaultValue={project?.clubId || ""}
                className="w-full h-10 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 text-sm"
              >
                <option value="">선택 안함</option>
                {clubs.map((club) => (
                  <option key={club.id} value={club.id}>
                    {club.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-[hsl(var(--muted-foreground))] mb-2">
                분야
              </label>
              <Input
                name="category"
                defaultValue={project?.category || ""}
                placeholder="예: Hacking, Programming"
              />
            </div>

            <div>
              <label className="block text-sm text-[hsl(var(--muted-foreground))] mb-2">
                참가자
              </label>
              <Input
                name="participants"
                defaultValue={project?.participants || ""}
                placeholder="예: 홍길동, 김철수"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-[hsl(var(--muted-foreground))] mb-2">
                썸네일 URL
              </label>
              <Input
                name="thumbnail"
                defaultValue={project?.thumbnail || ""}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isPublished"
              id="isPublished"
              defaultChecked={project?.isPublished ?? false}
              className="w-4 h-4 rounded border-[hsl(var(--border))] bg-transparent"
            />
            <label
              htmlFor="isPublished"
              className="text-sm text-[hsl(var(--muted-foreground))]"
            >
              공개
            </label>
          </div>
        </div>

        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-5">
          <label className="block text-sm text-[hsl(var(--muted-foreground))] mb-3">
            내용
          </label>
          <TiptapEditor
            content={(project?.content as object) || undefined}
            onChange={setContent}
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            {project ? "수정" : "생성"}
          </button>
          <Link
            href="/admin/projects"
            className="px-4 py-2 bg-[hsl(var(--secondary))] rounded-lg text-sm font-medium hover:bg-[hsl(var(--secondary))]/80 transition-colors"
          >
            취소
          </Link>
        </div>
      </form>
    </div>
  );
}
