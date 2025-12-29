import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const project = await prisma.project.findUnique({
    where: { slug, isPublished: true },
    include: { club: true },
  });

  if (!project) {
    notFound();
  }

  const content = project.content as object | null;

  return (
    <section className="min-h-screen py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/project"
          className="inline-flex items-center gap-2 text-[hsl(var(--muted-foreground))] hover:text-white transition-colors mb-8"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          프로젝트 목록
        </Link>

        <article>
          <header className="mb-12">
            {project.thumbnail && (
              <div className="relative aspect-video rounded-2xl overflow-hidden mb-8">
                <Image
                  src={project.thumbnail}
                  alt={project.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <h1 className="text-4xl font-bold mb-6">{project.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-[hsl(var(--muted-foreground))]">
              {project.club && (
                <div className="flex items-center gap-2">
                  <span className="opacity-60">참여 동아리</span>
                  <span className="text-white">{project.club.name}</span>
                </div>
              )}
              {project.participants && (
                <div className="flex items-center gap-2">
                  <span className="opacity-60">참가자</span>
                  <span className="text-white">{project.participants}</span>
                </div>
              )}
              {project.category && (
                <div className="flex items-center gap-2">
                  <span className="opacity-60">분야</span>
                  <span className="text-white">{project.category}</span>
                </div>
              )}
            </div>
          </header>

          <div className="prose prose-invert max-w-none">
            {content ? (
              <TiptapRenderer content={content} />
            ) : (
              <p className="text-[hsl(var(--muted-foreground))]">
                프로젝트 내용이 없습니다.
              </p>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}

function TiptapRenderer({ content }: { content: object }) {
  return (
    <div
      className="tiptap-content"
      dangerouslySetInnerHTML={{
        __html: renderTiptapContent(content as TiptapNode),
      }}
    />
  );
}

interface TiptapNode {
  type: string;
  content?: TiptapNode[];
  text?: string;
  marks?: { type: string }[];
  attrs?: Record<string, unknown>;
}

function renderTiptapContent(node: TiptapNode): string {
  if (!node) return "";

  if (node.type === "doc") {
    return (node.content || []).map(renderTiptapContent).join("");
  }

  if (node.type === "text") {
    let text = node.text || "";
    if (node.marks) {
      node.marks.forEach((mark) => {
        switch (mark.type) {
          case "bold":
            text = `<strong>${text}</strong>`;
            break;
          case "italic":
            text = `<em>${text}</em>`;
            break;
          case "underline":
            text = `<u>${text}</u>`;
            break;
          case "strike":
            text = `<s>${text}</s>`;
            break;
          case "code":
            text = `<code>${text}</code>`;
            break;
        }
      });
    }
    return text;
  }

  const children = (node.content || []).map(renderTiptapContent).join("");

  switch (node.type) {
    case "paragraph":
      return `<p>${children}</p>`;
    case "heading":
      const level = (node.attrs?.level as number) || 1;
      return `<h${level}>${children}</h${level}>`;
    case "bulletList":
      return `<ul>${children}</ul>`;
    case "orderedList":
      return `<ol>${children}</ol>`;
    case "listItem":
      return `<li>${children}</li>`;
    case "codeBlock":
      return `<pre><code>${children}</code></pre>`;
    case "blockquote":
      return `<blockquote>${children}</blockquote>`;
    case "horizontalRule":
      return `<hr />`;
    case "image":
      return `<img src="${node.attrs?.src}" alt="${node.attrs?.alt || ""}" />`;
    default:
      return children;
  }
}
