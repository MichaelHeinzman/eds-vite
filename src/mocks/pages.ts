import blocksHtml from "./pages/blocks.html?raw";
import cartHtml from "./pages/cart.html?raw";
import docsHtml from "./pages/docs.html?raw";
import githubHtml from "./pages/github.html?raw";

type MockPage = {
  title: string;
  html: string;
};

const pages: Record<string, MockPage> = {
  "/docs": { title: "Documentation", html: docsHtml },
  "/blocks": { title: "Block Library", html: blocksHtml },
  "/github": { title: "GitHub", html: githubHtml },
  "/cart": { title: "Cart", html: cartHtml },
};

function normalizePath(pathname: string) {
  const normalized = pathname.replace(/\/+$/, "");
  return normalized || "/";
}

export function loadMockPage() {
  const path = normalizePath(window.location.pathname);
  const page = pages[path];

  if (!page) return;

  const main = document.querySelector<HTMLElement>("main");
  if (!main) return;

  main.innerHTML = page.html;
  document.title = `${page.title} | EDS Vite`;
}
