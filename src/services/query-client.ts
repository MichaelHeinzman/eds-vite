import { QueryClient } from "@tanstack/query-core";
import { QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "preact";
import type { ComponentChildren, ComponentType } from "preact";

import { getAdobeCommerceConfig } from "@services/adobe-config";

export const commerceQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      retry: 1,
    },
    mutations: { retry: 0 },
  },
});

const PreactQueryClientProvider = QueryClientProvider as unknown as ComponentType<{
  client: QueryClient;
  children?: ComponentChildren;
}>;

export function CommerceQueryProvider({ children }: { children: ComponentChildren }) {
  return createElement(PreactQueryClientProvider, { client: commerceQueryClient }, children);
}

export function adobeQueryContext() {
  const config = getAdobeCommerceConfig();
  return [
    "adobe",
    config.catalogMode,
    config.commerceGraphqlEndpoint,
    config.catalogGraphqlEndpoint,
    config.storeViewCode,
    config.currency,
    config.environmentId,
    config.websiteCode,
    config.storeCode,
    config.customerGroup,
  ] as const;
}

export const commerceQueryKeys = {
  all: ["commerce"] as const,
  products: () => ["commerce", ...adobeQueryContext(), "products"] as const,
  productSearch: (criteria: unknown) => ["commerce", ...adobeQueryContext(), "product-search", criteria] as const,
  product: (id: string) => ["commerce", ...adobeQueryContext(), "product", id] as const,
  cart: () => ["commerce", ...adobeQueryContext(), "cart"] as const,
  customer: () => ["commerce", ...adobeQueryContext(), "customer"] as const,
  wishlist: () => ["commerce", ...adobeQueryContext(), "wishlist"] as const,
  recommendations: (unitId: string, sku = "") => ["commerce", ...adobeQueryContext(), "recommendations", unitId, sku] as const,
};

export function runCommerceMutation<TData, TVariables>(
  mutationKey: readonly unknown[],
  mutationFn: (variables: TVariables) => Promise<TData>,
  variables: TVariables,
) {
  const mutation = commerceQueryClient.getMutationCache().build<TData, Error, TVariables, unknown>(
    commerceQueryClient,
    { mutationKey, mutationFn },
  );
  return mutation.execute(variables);
}

export function clearCommerceQueryCache() {
  commerceQueryClient.removeQueries({ queryKey: commerceQueryKeys.all });
}
