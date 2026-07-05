
export function toClassName(value: string) {
  return typeof value === "string"
    ? value
        .toLowerCase()
        .replace(/[^0-9a-z]/gi, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
    : "";
}

export function toCamelCase(value: string) {
  return toClassName(value).replace(/-([a-z])/g, (_, letter: string) =>
    letter.toUpperCase(),
  );
}

export function getMetadata(name: string, doc: Document = document) {
  const attribute = name.includes(":") ? "property" : "name";
  return [...doc.head.querySelectorAll<HTMLMetaElement>(`meta[${attribute}="${name}"]`)]
    .map((meta) => meta.content)
    .join(", ");
}

function setMeta(selector: string, attributes: Record<string, string>) {
  let meta = document.head.querySelector<HTMLMetaElement>(selector);
  if (!meta) {
    meta = document.createElement("meta");
    document.head.append(meta);
  }
  Object.entries(attributes).forEach(([name, value]) => meta?.setAttribute(name, value));
}

export interface PageMetadata {
  title: string;
  description: string;
  canonicalUrl?: string;
  image?: string;
  type?: "website" | "product";
  robots?: string;
}

export function setPageMetadata({ title, description, canonicalUrl = window.location.href, image, type = "website", robots = "index, follow, max-image-preview:large" }: PageMetadata) {
  const canonical = new URL(canonicalUrl, window.location.origin).href;
  document.title = title;
  setMeta('meta[name="description"]', { name: "description", content: description });
  setMeta('meta[name="robots"]', { name: "robots", content: robots });
  setMeta('meta[property="og:type"]', { property: "og:type", content: type });
  setMeta('meta[property="og:url"]', { property: "og:url", content: canonical });
  setMeta('meta[property="og:title"]', { property: "og:title", content: title });
  setMeta('meta[property="og:description"]', { property: "og:description", content: description });
  setMeta('meta[name="twitter:card"]', { name: "twitter:card", content: image ? "summary_large_image" : "summary" });
  setMeta('meta[name="twitter:title"]', { name: "twitter:title", content: title });
  setMeta('meta[name="twitter:description"]', { name: "twitter:description", content: description });
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) { link = document.createElement("link"); link.rel = "canonical"; document.head.append(link); }
  link.href = canonical;
  if (image) {
    const absoluteImage = new URL(image, window.location.origin).href;
    setMeta('meta[property="og:image"]', { property: "og:image", content: absoluteImage });
    setMeta('meta[property="og:image:alt"]', { property: "og:image:alt", content: title });
    setMeta('meta[name="twitter:image"]', { name: "twitter:image", content: absoluteImage });
  }
}
