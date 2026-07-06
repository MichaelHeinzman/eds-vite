import "@styles/index.css";
import {
  decorateBlocks,
  decorateIcons,
  decorateSections,
  decorateTemplateAndTheme,
  loadFooter,
  loadHeader,
  loadSection,
  loadSections,
  waitForFirstImage,
} from "./aem";

export function decorateButtons(main: HTMLElement) {
  main.querySelectorAll<HTMLAnchorElement>("p a[href]").forEach((anchor) => {
    anchor.title = anchor.title || anchor.textContent || "";
    const paragraph = anchor.closest("p");
    const text = anchor.textContent?.trim() || "";
    if (!paragraph || anchor.querySelector("img") || paragraph.textContent?.trim() !== text) return;

    try {
      if (new URL(anchor.href).href === new URL(text, window.location.href).href) return;
    } catch {
      // Non-URL labels can still be buttons.
    }

    const strong = anchor.closest("strong");
    const emphasis = anchor.closest("em");
    if (!strong && !emphasis) return;

    paragraph.className = "button-wrapper";
    anchor.className = "button";
    if (strong && emphasis) anchor.classList.add("accent");
    else if (strong) anchor.classList.add("primary");
    else anchor.classList.add("secondary");

    const wrapper = strong && emphasis
      ? (strong.contains(emphasis) ? strong : emphasis)
      : strong || emphasis;
    wrapper?.replaceWith(anchor);
  });
}

export function decorateMain(main: HTMLElement) {
  decorateIcons(main);
  decorateSections(main);
  decorateBlocks(main);
  decorateButtons(main);
}

export async function loadEager(doc: Document) {
  document.documentElement.lang = "en";
  decorateTemplateAndTheme();
  const main = doc.querySelector<HTMLElement>("main");
  if (!main) return;

  decorateMain(main);
  document.body.classList.add("appear");
  const firstSection = main.querySelector<HTMLElement>(".section");
  if (firstSection) await loadSection(firstSection, waitForFirstImage);
}

export async function loadLazy(doc: Document) {
  void loadHeader(doc.querySelector<HTMLElement>("header"));
  const main = doc.querySelector<HTMLElement>("main");
  if (main) await loadSections(main);

  const target = window.location.hash
    ? doc.getElementById(window.location.hash.substring(1))
    : null;
  target?.scrollIntoView();
  void loadFooter(doc.querySelector<HTMLElement>("footer"));
}

/**
 * Loads work that can be postponed without affecting the user experience.
 */
export async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
}

void loadPage();
