import { useQuery } from "@tanstack/react-query";
import type { Cart } from "@/types/cart";
import type { Product } from "@/types/catalog";
import { adobeGraphQl, RECOMMENDATIONS_QUERY } from "@services/adobe-graphql";
import { commerceQueryClient, commerceQueryKeys } from "@services/query-client";

type Amount = { amount: { currency: string; value: number } };
type RecommendationProduct = { sku: string; name: string; inStock: boolean; images?: Array<{ url: string }>; price?: { final?: Amount }; priceRange?: { minimum?: { final?: Amount }; maximum?: { final?: Amount } } };
type RecommendationResult = { productsView: RecommendationProduct[]; storefrontLabel: string; totalProducts: number; userError?: string | null };
type ViewHistory = { sku: string; date: string };
const historyKey = "eds-vite-product-view-history:v1";

function readHistory(): ViewHistory[] { try { return JSON.parse(window.localStorage.getItem(historyKey) || "[]") as ViewHistory[]; } catch { return []; } }
export function recordProductView(sku: string) { const history = readHistory().filter((item) => item.sku !== sku); history.push({ sku, date: new Date().toISOString() }); window.localStorage.setItem(historyKey, JSON.stringify(history.slice(-20))); }
function normalize(product: RecommendationProduct): Product { const amount = product.price?.final?.amount || product.priceRange?.minimum?.final?.amount; const images = product.images?.map((image) => image.url) || []; return { id: product.sku, sku: product.sku, name: product.name, description: "", category: "Recommended", price: amount?.value || 0, currency: "USD", image: images[0], images, inStock: product.inStock }; }

export async function fetchRecommendations(unitId: string, currentSku = "") {
  const cart = commerceQueryClient.getQueryData<Cart>(commerceQueryKeys.cart());
  const data = await adobeGraphQl<{ recommendationsByUnitIds: { results: RecommendationResult[]; totalResults: number } }>(RECOMMENDATIONS_QUERY, { unitIds: [unitId], currentSku, cartSkus: cart?.items.map((item) => item.sku) || [], userPurchaseHistory: [], userViewHistory: readHistory() }, true);
  const unit = data.recommendationsByUnitIds.results.find((result) => !result.userError && result.productsView?.length);
  return unit?.productsView.map(normalize) || [];
}
function options(unitId: string, sku: string) { return { queryKey: commerceQueryKeys.recommendations(unitId, sku), queryFn: () => fetchRecommendations(unitId, sku), staleTime: 300_000 }; }
export function getRecommendations(unitId: string, sku = "") { return commerceQueryClient.ensureQueryData(options(unitId, sku)); }
export function useRecommendations(unitId: string, sku = "") { return useQuery(options(unitId, sku)); }
