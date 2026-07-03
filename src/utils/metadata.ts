
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
