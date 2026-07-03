/*
 * Copyright 2026 Adobe. All rights reserved.
 * Licensed under the Apache License, Version 2.0.
 */

import { readBlockConfig } from "@utils/blocks";
import { createOptimizedPicture } from "@utils/media";
import { getMetadata, toCamelCase, toClassName } from "@utils/metadata";

type BlockModule = {
  default?: (block: HTMLElement) => void | Promise<void>;
};

type BlockValue = string | Node | { elems: Array<string | Node> };
type BlockContent = BlockValue | BlockValue[][];

interface HlxRuntime {
  codeBasePath: string;
  lighthouse: boolean;
  RUM_MANUAL_ENHANCE: boolean;
  RUM_MASK_URL: string;
}

declare global {
  interface Window {
    hlx: HlxRuntime;
  }
}

const blockModules = import.meta.glob<BlockModule>(
  "./blocks/*/*.{ts,tsx,js,jsx}",
);

export function setup() {
  window.hlx = window.hlx || ({} as HlxRuntime);
  window.hlx.RUM_MASK_URL = "full";
  window.hlx.RUM_MANUAL_ENHANCE = true;
  window.hlx.codeBasePath = import.meta.env.BASE_URL.replace(/\/$/, "");
  window.hlx.lighthouse =
    new URLSearchParams(window.location.search).get("lighthouse") === "on";
}

export async function loadCSS(href: string) {
  if (document.querySelector(`head > link[href="${href}"]`)) return;

  await new Promise<void>((resolve, reject) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.addEventListener("load", () => resolve(), { once: true });
    link.addEventListener("error", () => reject(new Error(`Unable to load ${href}`)), {
      once: true,
    });
    document.head.append(link);
  });
}

export async function loadScript(
  src: string,
  attrs: Record<string, string> = {},
) {
  if (document.querySelector(`head > script[src="${src}"]`)) return;

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    Object.entries(attrs).forEach(([name, value]) => script.setAttribute(name, value));
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", () => reject(new Error(`Unable to load ${src}`)), {
      once: true,
    });
    document.head.append(script);
  });
}

export function decorateTemplateAndTheme() {
  const addClasses = (value: string) => {
    value
      .split(",")
      .map((item) => toClassName(item.trim()))
      .filter(Boolean)
      .forEach((item) => document.body.classList.add(item));
  };

  const template = getMetadata("template");
  const theme = getMetadata("theme");
  if (template) addClasses(template);
  if (theme) addClasses(theme);
}

export function decorateIcon(span: HTMLElement, prefix = "", alt = "") {
  if (span.hasChildNodes()) return;
  const iconName = [...span.classList]
    .find((className) => className.startsWith("icon-"))
    ?.substring(5);
  if (!iconName) return;

  const img = document.createElement("img");
  img.dataset.iconName = iconName;
  img.src = `${window.hlx.codeBasePath}${prefix}/icons/${iconName}.svg`;
  img.alt = alt;
  img.loading = "lazy";
  img.width = 16;
  img.height = 16;
  span.append(img);
}

export function decorateIcons(element: HTMLElement, prefix = "") {
  element
    .querySelectorAll<HTMLElement>("span.icon")
    .forEach((span) => decorateIcon(span, prefix));
}

export function wrapTextNodes(block: HTMLElement) {
  const validWrappers = new Set([
    "P", "PRE", "UL", "OL", "PICTURE", "TABLE", "H1", "H2", "H3", "H4", "H5", "H6",
  ]);

  block.querySelectorAll<HTMLElement>(":scope > div > div").forEach((cell) => {
    if (!cell.hasChildNodes()) return;
    const first = cell.firstElementChild;
    const isWrapped = !!first && validWrappers.has(first.tagName);
    const mixedPicture =
      first?.tagName === "PICTURE" &&
      (cell.children.length > 1 || !!cell.textContent?.trim());
    if (isWrapped && !mixedPicture) return;

    const wrapper = document.createElement("p");
    wrapper.append(...cell.childNodes);
    cell.append(wrapper);
  });
}

export function decorateSections(main: HTMLElement) {
  main
    .querySelectorAll<HTMLElement>(":scope > div:not([data-section-status])")
    .forEach((section) => {
      const wrappers: HTMLElement[] = [];
      let defaultContent = false;

      [...section.children].forEach((child) => {
        if (child.tagName === "DIV" || !defaultContent) {
          const wrapper = document.createElement("div");
          wrappers.push(wrapper);
          defaultContent = child.tagName !== "DIV";
          if (defaultContent) wrapper.classList.add("default-content-wrapper");
        }
        wrappers.at(-1)?.append(child);
      });

      wrappers.forEach((wrapper) => section.append(wrapper));
      section.classList.add("section");
      section.dataset.sectionStatus = "initialized";
      section.style.display = "none";

      const metadata = section.querySelector<HTMLElement>("div.section-metadata");
      if (!metadata) return;

      Object.entries(readBlockConfig(metadata)).forEach(([key, value]) => {
        const metadataValue = Array.isArray(value) ? value.join(",") : value;
        if (!metadataValue) return;
        if (key === "style") {
          metadataValue.split(",").map((item) => toClassName(item.trim())).filter(Boolean)
            .forEach((item) => section.classList.add(item));
        } else if (key === "sectionid") {
          section.id = metadataValue;
        } else if (key === "aria-label") {
          section.setAttribute("aria-label", metadataValue);
        } else if (key === "backgroundimage") {
          section.dataset.backgroundimage = metadataValue;
          section.style.backgroundImage = `url("${metadataValue}")`;
          section.classList.add("bg-image");
        } else {
          section.dataset[toCamelCase(key)] = metadataValue;
        }
      });
      metadata.parentElement?.remove();
    });
}

export function decorateBlock(block: HTMLElement) {
  const blockName = block.classList[0];
  if (!blockName || block.dataset.blockStatus || blockName === "section-metadata") return;

  block.classList.add("block");
  block.dataset.blockName = blockName;
  block.dataset.blockStatus = "initialized";
  wrapTextNodes(block);
  block.parentElement?.classList.add(`${blockName}-wrapper`);
  block.closest(".section")?.classList.add(`${blockName}-container`);
}

export function decorateBlocks(main: HTMLElement) {
  main.querySelectorAll<HTMLElement>("div.section > div > div").forEach(decorateBlock);
}

export function buildBlock(blockName: string, content: BlockContent) {
  const table: BlockValue[][] = Array.isArray(content) ? content : [[content]];
  const block = document.createElement("div");
  block.classList.add(blockName);

  table.forEach((row) => {
    const rowElement = document.createElement("div");
    row.forEach((column) => {
      const columnElement = document.createElement("div");
      const values = typeof column === "object" && "elems" in column
        ? column.elems
        : [column];
      values.forEach((value) => {
        if (typeof value === "string") columnElement.insertAdjacentHTML("beforeend", value);
        else if (value) columnElement.append(value);
      });
      rowElement.append(columnElement);
    });
    block.append(rowElement);
  });
  return block;
}

export async function loadBlock(block: HTMLElement) {
  const status = block.dataset.blockStatus;
  if (status === "loading" || status === "loaded") return block;

  const blockName = block.dataset.blockName;
  if (!blockName) return block;
  const modulePath = ["tsx", "ts", "jsx", "js"]
    .map((extension) => `./blocks/${blockName}/${blockName}.${extension}`)
    .find((path) => path in blockModules);

  block.dataset.blockStatus = "loading";
  if (!modulePath) {
    block.dataset.blockStatus = "error";
    console.warn(`No Vite block found for "${blockName}"`);
    return block;
  }

  try {
    const module = await blockModules[modulePath]();
    await module.default?.(block);
    block.dataset.blockStatus = "loaded";
  } catch (error) {
    block.dataset.blockStatus = "error";
    console.error(`Failed to load block "${blockName}"`, error);
  }
  return block;
}

export async function loadHeader(header = document.querySelector<HTMLElement>("body header")) {
  if (!header) return null;
  const block = buildBlock("header", "");
  header.append(block);
  decorateBlock(block);
  return loadBlock(block);
}

export async function loadFooter(footer = document.querySelector<HTMLElement>("body footer")) {
  if (!footer) return null;
  const block = buildBlock("footer", "");
  footer.append(block);
  decorateBlock(block);
  return loadBlock(block);
}

export function prioritizeFirstImage(root: ParentNode) {
  const image = root.querySelector<HTMLImageElement>("img");
  if (image) {
    image.loading = "eager";
    image.fetchPriority = "high";
  }
  return image;
}

export async function waitForFirstImage(section: HTMLElement) {
  const image = prioritizeFirstImage(section);
  await new Promise<void>((resolve) => {
    if (!image || image.complete) resolve();
    else {
      image.addEventListener("load", () => resolve(), { once: true });
      image.addEventListener("error", () => resolve(), { once: true });
    }
  });
}

export async function loadSection(
  section: HTMLElement,
  callback?: (section: HTMLElement) => void | Promise<void>,
) {
  const status = section.dataset.sectionStatus;
  if (status && status !== "initialized") return section;
  section.dataset.sectionStatus = "loading";

  for (const block of section.querySelectorAll<HTMLElement>("div.block")) {
    await loadBlock(block);
  }

  await callback?.(section);
  section.dataset.sectionStatus = "loaded";
  section.style.display = "";
  return section;
}

export async function loadSections(element: HTMLElement) {
  for (const section of element.querySelectorAll<HTMLElement>("div.section")) {
    await loadSection(section);
  }
}

export {
  createOptimizedPicture,
  getMetadata,
  readBlockConfig,
  toCamelCase,
  toClassName,
};

setup();
