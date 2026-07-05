import type { Product } from "@/types/catalog";

const selector = 'script[data-eds-structured-data="commerce"]';
function setSchema(value: object) {
  document.querySelector(selector)?.remove();
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.dataset.edsStructuredData = "commerce";
  script.textContent = JSON.stringify(value).replace(/</g, "\\u003c");
  document.head.append(script);
}
export function setProductSchema(product: Product) {
  const url = new URL(`/products/${encodeURIComponent(product.sku)}`, window.location.origin).href;
  setSchema({ "@context": "https://schema.org", "@graph": [
    { "@type": "Product", "@id": `${url}#product`, name: product.name, sku: product.sku, category: product.category, description: product.description, image: product.images, offers: { "@type": "Offer", price: product.price, priceCurrency: product.currency, availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock", url } },
    { "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: window.location.origin },
      { "@type": "ListItem", position: 2, name: "Products", item: new URL("/products", window.location.origin).href },
      { "@type": "ListItem", position: 3, name: product.name, item: url },
    ] },
  ] });
}
export function setProductListSchema(products: Product[]) { setSchema({ "@context": "https://schema.org", "@type": "ItemList", numberOfItems: products.length, itemListElement: products.map((product, index) => ({ "@type": "ListItem", position: index + 1, url: new URL(`/products/${encodeURIComponent(product.id)}`, window.location.origin).href, name: product.name })) }); }
