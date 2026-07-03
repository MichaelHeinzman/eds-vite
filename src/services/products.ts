import { QueryClient } from "@tanstack/query-core";

import { adobeProductFixtures } from "@/mocks/commerce/adobe-products";
import { getCommerceBackend } from "@services/cart";
import type { Product } from "@/types/catalog";

const productQueryClient = new QueryClient();

type DummyJsonProduct = {
  id: number;
  sku: string;
  title: string;
  description: string;
  category: string;
  price: number;
  thumbnail: string;
  images: string[];
  rating: number;
  stock: number;
};

function adaptDummyProduct(product: DummyJsonProduct): Product {
  return {
    id: String(product.id),
    sku: product.sku || `DUMMY-${product.id}`,
    name: product.title,
    description: product.description,
    category: product.category,
    price: product.price,
    currency: "USD",
    image: product.thumbnail,
    images: product.images || [product.thumbnail],
    rating: product.rating,
    inStock: product.stock > 0,
  };
}

async function fetchDummyProducts(): Promise<Product[]> {
  const response = await fetch("https://dummyjson.com/products/category/furniture?limit=24");
  if (!response.ok) throw new Error(`DummyJSON products failed: ${response.status}`);
  const data = (await response.json()) as { products: DummyJsonProduct[] };
  return data.products.map(adaptDummyProduct);
}

export function getProducts() {
  const backend = getCommerceBackend();
  return productQueryClient.ensureQueryData({
    queryKey: ["commerce", backend, "products"],
    queryFn: async () => backend === "dummyjson" ? fetchDummyProducts() : adobeProductFixtures,
    staleTime: 1000 * 60 * 5,
  });
}

export function getProduct(id: string) {
  const backend = getCommerceBackend();
  return productQueryClient.ensureQueryData({
    queryKey: ["commerce", backend, "product", id],
    queryFn: async () => {
      if (backend === "adobe") {
        return adobeProductFixtures.find((product) => product.id === id || product.sku.toLowerCase() === id.toLowerCase()) || null;
      }
      const response = await fetch(`https://dummyjson.com/products/${encodeURIComponent(id)}`);
      if (!response.ok) return null;
      return adaptDummyProduct((await response.json()) as DummyJsonProduct);
    },
    staleTime: 1000 * 60 * 5,
  });
}
