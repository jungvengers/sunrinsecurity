import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function AdminProjectPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: { club: true },
  });

  if (!project) {
    notFound();
  }

  const content = project.content as object | null;

  return (
    <section className="min-h-screen py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <Link
          href={`/admin/projects/${project.id}`}
          className="inline-flex items-center gap-2 text-[hsl(var(--muted-foreground))] hover:text-white transition-colors mb-8"
        >
          프로젝트 편집으로 돌아가기
        </Link>

        <article>
          <header className="mb-12">
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
  return <div className="tiptap-content">{renderNode(content as TiptapNode, "root")}</div>;
}

interface TiptapNode {
  type: string;
  content?: TiptapNode[];
  text?: string;
  marks?: { type: string }[];
  attrs?: Record<string, unknown>;
}

function renderNode(node: TiptapNode, key: string): React.ReactNode {
  if (!node || typeof node !== "object" || typeof node.type !== "string") {
    return null;
  }

  if (node.type === "doc") {
    return (node.content || []).map((child, index) =>
      renderNode(child, `${key}-${index}`)
    );
  }

  if (node.type === "text") {
    const text = node.text || "";
    return applyMarks(text, node.marks, key);
  }

  const children = (node.content || []).map((child, index) =>
    renderNode(child, `${key}-${index}`)
  );

  switch (node.type) {
    case "paragraph":
      return <p key={key}>{children}</p>;
    case "heading": {
      const levelRaw = Number(node.attrs?.level ?? 1);
      const level = Math.min(6, Math.max(1, Number.isFinite(levelRaw) ? levelRaw : 1));
      if (level === 1) return <h1 key={key}>{children}</h1>;
      if (level === 2) return <h2 key={key}>{children}</h2>;
      if (level === 3) return <h3 key={key}>{children}</h3>;
      if (level === 4) return <h4 key={key}>{children}</h4>;
      if (level === 5) return <h5 key={key}>{children}</h5>;
      return <h6 key={key}>{children}</h6>;
    }
    case "bulletList":
      return <ul key={key}>{children}</ul>;
    case "orderedList":
      return <ol key={key}>{children}</ol>;
    case "listItem":
      return <li key={key}>{children}</li>;
    case "codeBlock":
      return (
        <pre key={key}>
          <code>{children}</code>
        </pre>
      );
    case "blockquote":
      return <blockquote key={key}>{children}</blockquote>;
    case "horizontalRule":
      return <hr key={key} />;
    case "hardBreak":
      return <br key={key} />;
    default:
      return children;
  }
}

function applyMarks(
  text: string,
  marks: { type: string }[] | undefined,
  key: string
): React.ReactNode {
  if (!marks || marks.length === 0) {
    return text;
  }

  return marks.reduce<React.ReactNode>((acc, mark, index) => {
    const markKey = `${key}-mark-${index}`;
    switch (mark.type) {
      case "bold":
        return <strong key={markKey}>{acc}</strong>;
      case "italic":
        return <em key={markKey}>{acc}</em>;
      case "underline":
        return <u key={markKey}>{acc}</u>;
      case "strike":
        return <s key={markKey}>{acc}</s>;
      case "code":
        return <code key={markKey}>{acc}</code>;
      default:
        return acc;
    }
  }, text);
}
