import { render } from "preact";
import "@styles/index.css";

type BlockModule = {
  default?: (block: HTMLElement) => void | Promise<void>;
};

const blockModules = import.meta.glob<BlockModule>(
  "./blocks/*/*.{ts,tsx,js,jsx}",
);

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

export function decorateButtons(element: HTMLElement) {
  element.querySelectorAll<HTMLAnchorElement>("a").forEach((a) => {
    a.title = a.title || a.textContent || "";

    if (a.href === a.textContent) return;
    if (a.querySelector("img")) return;

    const parent = a.parentElement;
    const grandparent = parent?.parentElement;

    if (!parent) return;

    if (
      parent.childNodes.length === 1 &&
      ["P", "DIV"].includes(parent.tagName)
    ) {
      a.className = "button";
      parent.classList.add("button-container");
    }

    if (
      parent.childNodes.length === 1 &&
      parent.tagName === "STRONG" &&
      grandparent?.childNodes.length === 1 &&
      grandparent.tagName === "P"
    ) {
      a.className = "button primary";
      grandparent.classList.add("button-container");
    }

    if (
      parent.childNodes.length === 1 &&
      parent.tagName === "EM" &&
      grandparent?.childNodes.length === 1 &&
      grandparent.tagName === "P"
    ) {
      a.className = "button secondary";
      grandparent.classList.add("button-container");
    }
  });
}

export function decorateIcon(span: HTMLElement, prefix = "", alt = "") {
  const iconName = [...span.classList]
    .find((className) => className.startsWith("icon-"))
    ?.substring(5);

  if (!iconName) return;

  const img = document.createElement("img");
  img.dataset.iconName = iconName;
  img.src = `${prefix}/icons/${iconName}.svg`;
  img.alt = alt;
  img.loading = "lazy";

  span.append(img);
}

export function decorateIcons(element: HTMLElement, prefix = "") {
  element
    .querySelectorAll<HTMLElement>("span.icon")
    .forEach((span) => decorateIcon(span, prefix));
}

export function wrapTextNodes(block: HTMLElement) {
  const validWrappers = [
    "P",
    "PRE",
    "UL",
    "OL",
    "PICTURE",
    "TABLE",
    "H1",
    "H2",
    "H3",
    "H4",
    "H5",
    "H6",
  ];

  const wrap = (element: HTMLElement) => {
    const wrapper = document.createElement("p");
    wrapper.append(...element.childNodes);
    element.append(wrapper);
  };

  block.querySelectorAll<HTMLElement>(":scope > div > div").forEach((cell) => {
    if (!cell.hasChildNodes()) return;

    const first = cell.firstElementChild;
    const alreadyWrapped = !!first && validWrappers.includes(first.tagName);

    if (!alreadyWrapped) {
      wrap(cell);
    } else if (
      first.tagName === "PICTURE" &&
      (cell.children.length > 1 || !!cell.textContent?.trim())
    ) {
      wrap(cell);
    }
  });
}

export function decorateSections(main: HTMLElement) {
  main.id = "main-container";

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

          if (defaultContent) {
            wrapper.classList.add("default-content-wrapper");
          }
        }

        wrappers.at(-1)?.append(child);
      });

      wrappers.forEach((wrapper) => section.append(wrapper));

      section.classList.add("section");
      section.dataset.sectionStatus = "initialized";
      section.style.display = "none";

      const sectionMeta = section.querySelector<HTMLElement>(
        "div.section-metadata",
      );

      if (!sectionMeta) return;

      const meta = readBlockConfig(sectionMeta);

      Object.entries(meta).forEach(([key, value]) => {
        if (!value) return;

        if (key === "style") {
          value
            .split(",")
            .map((style) => toClassName(style.trim()))
            .filter(Boolean)
            .forEach((style) => section.classList.add(style));
        } else if (key === "sectionid") {
          section.id = value;
        } else if (key === "aria-label") {
          section.setAttribute("aria-label", value);
        } else if (key === "backgroundimage") {
          section.dataset.backgroundimage = value;
          section.style.backgroundImage = `url("${value}")`;
          section.style.backgroundSize = "cover";
          section.style.backgroundPosition = "center center";
          section.style.backgroundRepeat = "no-repeat";
          section.classList.add("bg-image");
        } else {
          section.dataset[toCamelCase(key)] = value;
        }
      });

      sectionMeta.parentElement?.remove();
    });
}

export function decorateBlock(block: HTMLElement) {
  const blockName = block.classList[0];

  if (!blockName || block.dataset.blockStatus) return;
  if (blockName === "section-metadata") return;

  block.classList.add("block");
  block.dataset.blockName = blockName;
  block.dataset.blockStatus = "initialized";

  wrapTextNodes(block);

  block.parentElement?.classList.add(`${blockName}-wrapper`);
  block.closest(".section")?.classList.add(`${blockName}-container`);
}

export function decorateBlocks(main: HTMLElement) {
  main
    .querySelectorAll<HTMLElement>("div.section > div > div")
    .forEach(decorateBlock);
}

export function decorateMain(main: HTMLElement) {
  decorateButtons(main);
  decorateIcons(main);
  decorateSections(main);
  decorateBlocks(main);
}

export async function loadBlock(block: HTMLElement) {
  const status = block.dataset.blockStatus;

  if (status === "loading" || status === "loaded") return block;

  const blockName = block.dataset.blockName;
  if (!blockName) return block;

  const possiblePaths = [
    `./blocks/${blockName}/${blockName}.tsx`,
    `./blocks/${blockName}/${blockName}.ts`,
    `./blocks/${blockName}/${blockName}.jsx`,
    `./blocks/${blockName}/${blockName}.js`,
  ];

  const modulePath = possiblePaths.find((path) => path in blockModules);

  if (!modulePath) {
    console.warn(`No Vite block found for "${blockName}"`);
    block.dataset.blockStatus = "loaded";
    return block;
  }

  block.dataset.blockStatus = "loading";

  try {
    const mod = await blockModules[modulePath]();
    await mod.default?.(block);
    block.dataset.blockStatus = "loaded";
  } catch (error) {
    block.dataset.blockStatus = "error";
    console.error(`Failed to load block "${blockName}"`, error);
  }

  return block;
}

export async function waitForFirstImage(section: HTMLElement) {
  const image = section.querySelector<HTMLImageElement>("img");

  await new Promise<void>((resolve) => {
    if (image && !image.complete) {
      image.loading = "eager";
      image.addEventListener("load", () => resolve(), { once: true });
      image.addEventListener("error", () => resolve(), { once: true });
    } else {
      resolve();
    }
  });
}

export async function loadSection(
  section: HTMLElement,
  loadCallback?: (section: HTMLElement) => void | Promise<void>,
) {
  const status = section.dataset.sectionStatus;

  if (status && status !== "initialized") return section;

  section.dataset.sectionStatus = "loading";

  const blocks = [...section.querySelectorAll<HTMLElement>("div.block")];

  await Promise.all(blocks.map((block) => loadBlock(block)));

  if (section.classList.contains("grid-container")) {
    const updatedBlocks = [
      ...section.querySelectorAll<HTMLElement>(":scope > div > div.block"),
    ];
    const gridWrapper = document.createElement("div");

    gridWrapper.classList.add("grid-wrapper");

    updatedBlocks.forEach((block) => {
      if (block.parentNode) {
        gridWrapper.append(block.parentNode);
      }
    });

    section.replaceChildren(gridWrapper);
  }

  await loadCallback?.(section);

  section.dataset.sectionStatus = "loaded";
  section.style.display = "";

  return section;
}

export function preloadVideoFromSection(section: HTMLElement) {
  const videoUrl = section.querySelector<HTMLAnchorElement>(
    'a[href$=".mp4"], a[href*=".mp4?"]',
  )?.href;

  if (!videoUrl) return;

  if (document.querySelector(`link[rel="preload"][href="${videoUrl}"]`)) return;

  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "video";
  link.href = videoUrl;
  link.type = "video/mp4";

  document.head.append(link);
}

export async function loadSections(main: HTMLElement) {
  const sections = [...main.querySelectorAll<HTMLElement>("div.section")];

  for (const section of sections) {
    await loadSection(section);
  }
}

export function getSectionsToLoad(main: HTMLElement) {
  const sections = [...main.querySelectorAll<HTMLElement>(".section")];
  const firstSection = sections[0];

  let lcpSection: HTMLElement | undefined;

  for (const section of sections) {
    const blocks = [...section.querySelectorAll<HTMLElement>(".block")];
    const validBlocks = blocks.filter(
      (block) =>
        !block.classList.contains("breadcrumb") &&
        !block.classList.contains("back-to-all"),
    );

    if (validBlocks.length > 0) {
      lcpSection = section;
      break;
    }
  }

  if (!firstSection) return [];
  if (!lcpSection) return [firstSection];

  return lcpSection === firstSection
    ? [lcpSection]
    : [firstSection, lcpSection];
}

export async function loadPage() {
  const main = document.querySelector<HTMLElement>("main");
  if (!main) return;

  decorateMain(main);

  const sectionsToLoad = getSectionsToLoad(main);
  sectionsToLoad.forEach(preloadVideoFromSection);

  await Promise.allSettled(
    sectionsToLoad.map((section) => loadSection(section, waitForFirstImage)),
  );

  document.body.classList.add("appear");

  await loadSections(main);
}

loadPage();

export { render };
