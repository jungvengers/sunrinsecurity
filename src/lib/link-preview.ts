const MAX_BODY = 100_000;
const TIMEOUT_MS = 8_000;

function extractMeta(html: string, property: string): string | null {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(
    `<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']*)["']|` +
      `<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${escaped}["']`,
    "i"
  );
  const m = html.match(regex);
  return m ? (m[1] ?? m[2] ?? "").trim() || null : null;
}

export interface LinkPreviewData {
  url: string;
  title: string;
  description: string | null;
  image: string | null;
}

export async function getLinkPreview(url: string): Promise<LinkPreviewData | null> {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
  } catch {
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; LinkPreview/1.0)" },
      redirect: "follow",
    });
    if (!res.ok || !(res.headers.get("content-type") ?? "").includes("text/html")) return null;
    const html = new TextDecoder("utf-8", { fatal: false }).decode(
      await res.arrayBuffer().then((b) => (b.byteLength > MAX_BODY ? b.slice(0, MAX_BODY) : b))
    );
    const title =
      extractMeta(html, "og:title") ?? extractMeta(html, "twitter:title") ?? html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() ?? null;
    const description =
      extractMeta(html, "og:description") ?? extractMeta(html, "twitter:description") ?? extractMeta(html, "description") ?? null;
    let image = extractMeta(html, "og:image") ?? extractMeta(html, "twitter:image") ?? null;
    if (image) {
      try {
        image = new URL(image, url).href;
      } catch {
        image = null;
      }
    }
    return { url, title: title || new URL(url).hostname, description, image };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
