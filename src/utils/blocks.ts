import { toClassName } from "./metadata";

export function readBlockConfig(block: HTMLElement) {
  const config: Record<string, string> = {};

  block.querySelectorAll<HTMLElement>(":scope > div").forEach((row) => {
    const cols = [...row.children] as HTMLElement[];
    if (cols.length < 2) return;

    const key = toClassName(cols[0].textContent || "");
    const valueCol = cols[1];

    const link = valueCol.querySelector<HTMLAnchorElement>("a[href]");
    const img = valueCol.querySelector<HTMLImageElement>("img");

    if (link) config[key] = link.href;
    else if (img) config[key] = img.src;
    else config[key] = valueCol.textContent?.trim() || "";
  });

  return config;
}

export function readBlockKeyValue(block: HTMLElement) {
  return [...block.children].reduce<
    Record<string, HTMLElement | HTMLElement[]>
  >((result, row) => {
    const key = row.children[0]?.textContent?.trim();
    if (!key) return result;

    const isBlockItem = key.includes("block-item");

    if (row.children.length === 2 && !isBlockItem) {
      result[key] = row.children[1] as HTMLElement;
    } else if (isBlockItem) {
      const blockItemKey = key.split(",")[0].trim();

      if (result[blockItemKey]) {
        result[blockItemKey] = Array.isArray(result[blockItemKey])
          ? [...result[blockItemKey], row as HTMLElement]
          : [result[blockItemKey] as HTMLElement, row as HTMLElement];
      } else {
        result[blockItemKey] = [row as HTMLElement];
      }
    }

    return result;
  }, {});
}

export function getRows(block: HTMLElement): HTMLElement[][] {
  return [...block.children].map((row) => [...row.children] as HTMLElement[]);
}

export function getText(cell?: HTMLElement): string {
  return cell?.textContent?.trim() || "";
}

export function getLink(cell?: HTMLElement): string {
  return cell?.querySelector<HTMLAnchorElement>("a")?.href || "";
}
