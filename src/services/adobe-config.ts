import type { AdobeCommerceConfig } from "@/types/adobe-config";

// Version the key when checked-in defaults change so stale local configuration
// cannot silently override a newly supplied storefront setup.
const storageKey = "eds-vite-adobe-commerce-config:v2";

const envConfig: AdobeCommerceConfig = {
  commerceGraphqlEndpoint: import.meta.env.VITE_ADOBE_COMMERCE_GRAPHQL_URL || "https://www.aemshop.net/graphql",
  catalogMode: import.meta.env.VITE_ADOBE_CATALOG_MODE === "core" ? "core" : "catalog-service",
  catalogGraphqlEndpoint: import.meta.env.VITE_ADOBE_CATALOG_GRAPHQL_URL || "https://www.aemshop.net/cs-graphql",
  storeViewCode: import.meta.env.VITE_ADOBE_STORE_VIEW_CODE || "default",
  currency: import.meta.env.VITE_ADOBE_CURRENCY || "USD",
  environmentId: import.meta.env.VITE_ADOBE_ENVIRONMENT_ID || "f38a0de0-764b-41fa-bd2c-5bc2f3c7b39a",
  websiteCode: import.meta.env.VITE_ADOBE_WEBSITE_CODE || "base",
  storeCode: import.meta.env.VITE_ADOBE_STORE_CODE || "main_website_store",
  customerGroup: import.meta.env.VITE_ADOBE_CUSTOMER_GROUP || "NOT LOGGED IN",
  apiKey: import.meta.env.VITE_ADOBE_API_KEY || "4dfa19c9fe6f4cccade55cc5b3da94f7",
  catalogSkus: (import.meta.env.VITE_ADOBE_CATALOG_SKUS || "").split(",").map((sku: string) => sku.trim()).filter(Boolean),
};

export function getAdobeCommerceConfig(): AdobeCommerceConfig {
  try {
    const stored = window.localStorage.getItem(storageKey);
    return stored ? { ...envConfig, ...(JSON.parse(stored) as Partial<AdobeCommerceConfig>) } : envConfig;
  } catch {
    return envConfig;
  }
}

export function saveAdobeCommerceConfig(config: AdobeCommerceConfig) {
  window.localStorage.setItem(storageKey, JSON.stringify(config));
}

export function clearAdobeCommerceConfig() {
  window.localStorage.removeItem(storageKey);
}

export function isAdobeCommerceConfigured(config = getAdobeCommerceConfig()) {
  if (!config.commerceGraphqlEndpoint) return false;
  return config.catalogMode === "core" || Boolean(config.catalogGraphqlEndpoint);
}
