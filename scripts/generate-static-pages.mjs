import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const template = await readFile(resolve(root, "index.html"), "utf8");

const siteUrl = (process.env.SITE_URL || "https://eds-vite.vercel.app").replace(/\/$/, "");
const pages = [
  { name: "docs", title: "Documentation", description: "Learn how EDS Vite combines Adobe Edge Delivery Services authoring with Vite, Preact, TypeScript, and progressive enhancement." },
  { name: "blocks", title: "Block Library", description: "Explore the independently loaded, progressively enhanced blocks available in the EDS Vite runtime." },
  { name: "github", title: "GitHub Repository", description: "View the source, architecture, and contribution details for the open-source EDS Vite project." },
  { name: "cart", title: "Shopping Cart", description: "Review the products in your EDS Market shopping cart.", noindex: true },
  { name: "wishlist", title: "Wishlist", description: "Review products saved to your EDS Market wishlist.", noindex: true },
  { name: "account", title: "Customer Account", description: "Sign in to or manage your EDS Market customer account.", noindex: true },
  { name: "commerce-settings", title: "Commerce Settings", description: "Configure the Adobe Commerce connection for this EDS Market demo.", noindex: true },
  { name: "products", title: "Shop Products", description: "Browse and filter the EDS Market product collection powered by Adobe Commerce." },
  { name: "product", title: "Product", description: "View product details, availability, and pricing at EDS Market.", noindex: true },
];

function escapeAttribute(value) {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
}

function createSeoHead(page) {
  const canonical = `${siteUrl}/${page.name}`;
  const robots = page.noindex ? "noindex, follow" : "index, follow, max-image-preview:large";
  const title = `${page.title} | EDS Market`;
  const image = `${siteUrl}/eds-market-mark-192.png`;
  return [
    `<title>${title}</title>`,
    `<meta name="description" content="${escapeAttribute(page.description)}" />`,
    `<meta name="robots" content="${robots}" />`,
    `<link rel="canonical" href="${canonical}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:title" content="${escapeAttribute(title)}" />`,
    `<meta property="og:description" content="${escapeAttribute(page.description)}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta name="twitter:card" content="summary" />`,
    `<meta name="twitter:title" content="${escapeAttribute(title)}" />`,
    `<meta name="twitter:description" content="${escapeAttribute(page.description)}" />`,
    `<meta name="twitter:image" content="${image}" />`,
  ].join("\n    ");
}

await Promise.all(pages.map(async (page) => {
  const authoredHtml = await readFile(resolve(root, "src", "mocks", "pages", `${page.name}.html`), "utf8");
  const document = template
    .replace(/<title>.*?<\/title>[\s\S]*?(?=\s*<meta name="theme-color")/, createSeoHead(page))
    .replace(/<main>[\s\S]*?<\/main>/, `<main>\n${authoredHtml.trim()}\n    </main>`);
  await writeFile(resolve(root, `${page.name}.html`), document);
}));

const indexableRoutes = ["", ...pages.filter((page) => !page.noindex).map((page) => page.name)];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexableRoutes.map((route) => `  <url><loc>${siteUrl}/${route}</loc></url>`).join("\n")}\n</urlset>\n`;
await writeFile(resolve(root, "public", "sitemap.xml"), sitemap);
await writeFile(resolve(root, "public", "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`);
