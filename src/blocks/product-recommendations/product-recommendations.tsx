import { render } from "preact";
import "./product-recommendations.css";
import { ProductCard } from "@components/product-card/product-card";
import { getRecommendations, useRecommendations } from "@services/recommendations";
import { CommerceQueryProvider } from "@services/query-client";
import { readBlockConfig } from "@utils/blocks";

function Recommendations({ unitId, sku }: { unitId: string; sku: string }) {
  const { data = [], error, isPending } = useRecommendations(unitId, sku);
  if (isPending) return <p role="status">Loading recommendations…</p>;
  if (error) return <p role="status">Recommendations are temporarily unavailable.</p>;
  if (!data.length) return null;
  return <section class="recommendations-content" aria-labelledby={`recommendations-${unitId}`}><h2 id={`recommendations-${unitId}`}>You may also like</h2><div class="product-grid">{data.map((product) => <ProductCard key={product.sku} product={product} />)}</div></section>;
}

export default async function decorate(block: HTMLElement) {
  const config = readBlockConfig(block);
  const unitId = config.recid || config["rec-id"] || "";
  const sku = window.location.pathname.startsWith("/products/") ? decodeURIComponent(window.location.pathname.split("/").at(-1) || "") : "";
  block.textContent = "";
  if (!unitId) { block.dataset.blockStatus = "error"; block.textContent = "Recommendation block requires a recId."; return; }
  await getRecommendations(unitId, sku).catch(() => undefined);
  render(<CommerceQueryProvider><Recommendations unitId={unitId} sku={sku} /></CommerceQueryProvider>, block);
}
