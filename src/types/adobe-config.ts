export type AdobeCatalogMode = "core" | "catalog-service";

export type AdobeCommerceConfig = {
  commerceGraphqlEndpoint: string;
  catalogMode: AdobeCatalogMode;
  catalogGraphqlEndpoint: string;
  storeViewCode: string;
  currency: string;
  environmentId: string;
  websiteCode: string;
  storeCode: string;
  customerGroup: string;
  apiKey: string;
  catalogSkus: string[];
};
