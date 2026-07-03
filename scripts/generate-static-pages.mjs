import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const template = await readFile(resolve(root, "index.html"), "utf8");

const pages = [
  ["docs", "Documentation", "docs.html"],
  ["blocks", "Block Library", "blocks.html"],
  ["github", "GitHub", "github.html"],
  ["cart", "Cart", "cart.html"],
  ["wishlist", "Wishlist", "wishlist.html"],
  ["account", "Account", "account.html"],
  ["commerce-settings", "Commerce Settings", "commerce-settings.html"],
  ["products", "Products", "products.html"],
  ["product", "Product", "product.html"],
];

await Promise.all(pages.map(async ([outputName, title, sourceName]) => {
  const authoredHtml = await readFile(resolve(root, "src", "mocks", "pages", sourceName), "utf8");
  const document = template
    .replace(/<title>.*?<\/title>/s, `<title>${title} | EDS Market</title>`)
    .replace(/<main>[\s\S]*?<\/main>/, `<main>\n${authoredHtml.trim()}\n    </main>`);
  await writeFile(resolve(root, `${outputName}.html`), document);
}));
