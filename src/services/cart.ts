import { QueryClient } from "@tanstack/query-core";
import type { Cart } from "@/types/cart";

export const queryClient = new QueryClient();

const fakeCart: Cart = {
  id: "fake-cart-1",
  itemCount: 2,
  subtotal: 2498,
  items: [
    {
      id: "1",
      sku: "SOFA-001",
      name: "Emerson Sofa",
      image: "/assets/fake-product.jpg",
      price: 1299,
      quantity: 1,
      options: ["Performance Fabric", "Oatmeal"],
    },
    {
      id: "2",
      sku: "CHAIR-002",
      name: "Walnut Accent Chair",
      image: "/assets/fake-product.jpg",
      price: 1199,
      quantity: 1,
      options: ["Walnut", "Ivory"],
    },
  ],
};

export async function fetchCart(): Promise<Cart> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return fakeCart;
}

export function getCart() {
  return queryClient.ensureQueryData({
    queryKey: ["cart"],
    queryFn: fetchCart,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
}
