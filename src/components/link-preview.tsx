import type { LinkPreviewData } from "@/lib/link-preview";

export function LinkPreviewCard({ data, className = "" }: { data: LinkPreviewData; className?: string }) {
  return (
    <a
      href={data.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`block w-full max-w-[50%] rounded border-x border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-visible hover:border-[hsl(var(--muted-foreground))]/40 transition-colors ${className}`}
    >
      {data.image ? (
        <div className="relative w-full aspect-video rounded-t-[inherit] bg-[hsl(var(--muted))] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.image}
            alt=""
            className="size-full object-cover object-top"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        </div>
      ) : null}
      <div className="px-2 py-1">
        <p className="text-xs font-medium text-white leading-tight truncate">{data.title}</p>
        {data.description && (
          <p className="mt-0.5 text-[10px] text-[hsl(var(--muted-foreground))] leading-snug break-words">
            {data.description}
          </p>
        )}
      </div>
    </a>
  );
}
