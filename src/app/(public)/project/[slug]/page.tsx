import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { StorageImage } from "@/components/storage-image";
import { LinkPreviewCard } from "@/components/link-preview";
import { getLinkPreview, type LinkPreviewData } from "@/lib/link-preview";

function collectHrefs(node: { type?: string; content?: unknown[]; marks?: { type: string; attrs?: { href?: string } }[] }): string[] {
  const urls: string[] = [];
  try {
    if (node.type === "text" && Array.isArray(node.marks)) for (const m of node.marks) if (m?.type === "link" && typeof m.attrs?.href === "string") urls.push(m.attrs.href);
    const content = node.content;
    if (Array.isArray(content)) for (const c of content) if (c && typeof c === "object" && "type" in c) urls.push(...collectHrefs(c as typeof node));
  } catch {
    // 이상한 구조면 무시
  }
  return urls;
}

async function getPreviewMap(doc: object): Promise<Map<string, LinkPreviewData>> {
  const map = new Map<string, LinkPreviewData>();
  try {
    const urls = [...new Set(collectHrefs(doc as Parameters<typeof collectHrefs>[0]))];
    const results = await Promise.all(urls.map((u) => getLinkPreview(u).catch(() => null)));
    urls.forEach((url, i) => { if (results[i]) map.set(url, results[i]!); });
  } catch {
    // 실패 시 빈 맵
  }
  return map;
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!slug?.trim()) notFound();

  const project = await prisma.project.findUnique({
    where: { id: slug },
    include: { club: true },
  });

  if (!project || !project.isPublished) notFound();

  const content = project.content as object | null;
  let previewMap = new Map<string, LinkPreviewData>();
  if (content) {
    try {
      previewMap = await getPreviewMap(content);
    } catch {
      // 링크 미리보기 실패 시에도 본문은 그대로 표시
    }
  }

  return (
    <section className="min-h-screen overflow-visible py-20 px-6">
      <div className="max-w-4xl mx-auto overflow-visible">
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

        <article className="overflow-visible">
          <header className="mb-12">
            {project.thumbnail && (
              <div className="relative aspect-video rounded-2xl overflow-hidden mb-8">
                <StorageImage
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

          <div className="prose prose-invert max-w-none overflow-visible pb-8">
            {content ? (
              <TiptapRenderer content={content} previewMap={previewMap} />
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

function TiptapRenderer({ content, previewMap }: { content: object; previewMap: Map<string, LinkPreviewData> }) {
  return <div className="tiptap-content overflow-visible pb-8">{renderNode(content as TiptapNode, "root", previewMap)}</div>;
}

interface TiptapNode {
  type: string;
  content?: TiptapNode[];
  text?: string;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
  attrs?: Record<string, unknown>;
}

interface MarkWithAttrs {
  type: string;
  attrs?: Record<string, unknown>;
}

function getParagraphLinkHref(p: TiptapNode): string | null {
  const c = p.content;
  if (!c || c.length !== 1) return null;
  const child = c[0] as TiptapNode;
  if (child.type !== "text" || !child.marks) return null;
  const link = child.marks.find((m) => m.type === "link");
  return typeof link?.attrs?.href === "string" ? link.attrs.href : null;
}

function renderNode(node: TiptapNode, key: string, previewMap: Map<string, LinkPreviewData>): React.ReactNode {
  if (!node || typeof node !== "object" || typeof node.type !== "string") return null;
  if (node.type === "doc") return (node.content || []).map((child, i) => renderNode(child as TiptapNode, `${key}-${i}`, previewMap));
  if (node.type === "text") return applyMarks(node.text || "", node.marks as MarkWithAttrs[] | undefined, key);

  const children = (node.content || []).map((child, i) => renderNode(child as TiptapNode, `${key}-${i}`, previewMap));

  switch (node.type) {
    case "paragraph": {
      const href = getParagraphLinkHref(node);
      const data = href ? previewMap.get(href) : null;
      if (data)
        return (
          <span key={key} className="block overflow-visible pt-3 [&>p]:m-0 [&>p]:leading-tight">
            <p>{children}</p>
            <LinkPreviewCard data={data} className="block" />
          </span>
        );
      return <p key={key}>{children}</p>;
    }
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
    case "image": {
      const src = sanitizeImageSrc(node.attrs?.src);
      if (!src) return null;
      const alt = typeof node.attrs?.alt === "string" ? node.attrs.alt : "";
      return (
        <StorageImage
          key={key}
          src={src}
          alt={alt}
          width={1200}
          height={800}
          className="w-full h-auto"
        />
      );
    }
    default:
      return children;
  }
}

function applyMarks(
  text: string,
  marks: MarkWithAttrs[] | undefined,
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
      case "link": {
        const href = typeof mark.attrs?.href === "string" ? mark.attrs.href : "";
        if (!href) return acc;
        return (
          <a
            key={markKey}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            {acc}
          </a>
        );
      }
      default:
        return acc;
    }
  }, text);
}

function sanitizeImageSrc(src: unknown): string | null {
  if (typeof src !== "string" || src.length === 0) {
    return null;
  }

  if (src.startsWith("/storage/")) {
    return src;
  }

  try {
    const url = new URL(src);
    if (url.protocol === "http:" || url.protocol === "https:") {
      return src;
    }
    return null;
  } catch {
    return null;
  }
}
