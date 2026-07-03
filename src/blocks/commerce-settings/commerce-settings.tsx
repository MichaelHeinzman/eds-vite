import { render } from "preact";
import { useState } from "preact/hooks";

import { clearAdobeCommerceConfig, getAdobeCommerceConfig, isAdobeCommerceConfigured, saveAdobeCommerceConfig } from "@services/adobe-config";
import { clearCommerceQueryCache } from "@services/query-client";
import type { AdobeCatalogMode, AdobeCommerceConfig } from "@/types/adobe-config";

type Props = { onComplete?: () => void; embedded?: boolean };

export function CommerceSettingsPanel({ onComplete, embedded = false }: Props) {
  const [config, setConfig] = useState<AdobeCommerceConfig>(getAdobeCommerceConfig());
  const [saved, setSaved] = useState(false);

  function update<K extends keyof AdobeCommerceConfig>(key: K, value: AdobeCommerceConfig[K]) {
    setConfig((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  function submit(event: Event) {
    event.preventDefault();
    saveAdobeCommerceConfig(config);
    clearCommerceQueryCache();
    setSaved(true);
    onComplete?.();
  }

  function clear() {
    clearAdobeCommerceConfig();
    clearCommerceQueryCache();
    setConfig(getAdobeCommerceConfig());
    setSaved(false);
  }

  return (
    <div class={`commerce-config ${embedded ? "embedded" : ""}`}>
      {!embedded ? <header class="settings-intro"><p class="page-eyebrow">Commerce integration</p><h1>Configure Adobe Commerce</h1><p class="page-lead">Connect Core Commerce GraphQL and choose the catalog source used for product reads.</p></header> : null}

      <div class="backend-cards" aria-label="Configured commerce backend">
        <div class="selected"><span class="backend-badge">Active backend</span><strong>Adobe Commerce</strong><small>Core GraphQL for carts and optional Catalog Service for product reads.</small></div>
      </div>

      <form class="settings-form" onSubmit={submit}>
          <div class="adobe-readiness"><div><strong>{isAdobeCommerceConfigured(config) ? "Configuration ready" : "Configuration required"}</strong><span>Core GraphQL is always required for cart and checkout mutations.</span></div><a href="https://developer.adobe.com/commerce/webapi/graphql/" target="_blank" rel="noreferrer">Adobe API docs ↗</a></div>

          <section>
            <div class="settings-section-heading"><span>1</span><div><h3>Core Commerce GraphQL</h3><p>Used for guest carts, customers, checkout, and—when selected—the product catalog.</p></div></div>
            <label><span>GraphQL endpoint</span><input type="url" required value={config.commerceGraphqlEndpoint} placeholder="https://commerce.example.com/graphql" onInput={(event) => update("commerceGraphqlEndpoint", event.currentTarget.value)} /><small>Magento Open Source, Adobe Commerce on-premises/PaaS, or the core endpoint provided by Adobe Commerce as a Cloud Service.</small></label>
            <div class="settings-row"><label><span>Store view code</span><input value={config.storeViewCode} onInput={(event) => update("storeViewCode", event.currentTarget.value)} /><small>Sent as the <code>Store</code> header.</small></label><label><span>Currency</span><input value={config.currency} onInput={(event) => update("currency", event.currentTarget.value.toUpperCase())} /><small>Sent as <code>Content-Currency</code>.</small></label></div>
          </section>

          <section>
            <div class="settings-section-heading"><span>2</span><div><h3>Choose the catalog API</h3><p>Core GraphQL and Catalog Service expose different product schemas.</p></div></div>
            <label><span>Catalog mode</span><select value={config.catalogMode} onChange={(event) => update("catalogMode", event.currentTarget.value as AdobeCatalogMode)}><option value="core">Core Magento / Commerce GraphQL</option><option value="catalog-service">Adobe Catalog Service</option></select></label>
            <div class="platform-guidance"><article><strong>Core GraphQL</strong><p>Best for Magento Open Source and Adobe Commerce on-premises/PaaS. Supports search, categories, products, and mutations from one endpoint.</p></article><article><strong>Catalog Service</strong><p>Adobe's read-optimized SaaS catalog. Required for Adobe Commerce as a Cloud Service product reads. It has no cart mutations.</p></article></div>
          </section>

          {config.catalogMode === "catalog-service" ? (
            <section>
              <div class="settings-section-heading"><span>3</span><div><h3>Catalog Service context</h3><p>Get these values from Commerce Services Connector in Adobe Commerce Admin.</p></div></div>
              <label><span>Catalog Service endpoint</span><input type="url" required value={config.catalogGraphqlEndpoint} placeholder="https://catalog-service-sandbox.adobe.io/graphql" onInput={(event) => update("catalogGraphqlEndpoint", event.currentTarget.value)} /></label>
              <label><span>Catalog SKUs</span><textarea required value={config.catalogSkus.join(", ")} placeholder="24-MB04, 24-WB05" onInput={(event) => update("catalogSkus", event.currentTarget.value.split(",").map((sku) => sku.trim()).filter(Boolean))} /><small>The Catalog Service <code>products</code> query retrieves known SKUs. Use Live Search <code>productSearch</code> for a production PLP with discovery and facets.</small></label>
              <div class="settings-row"><label><span>Data Space / Environment ID</span><input value={config.environmentId} onInput={(event) => update("environmentId", event.currentTarget.value)} /></label><label><span>API key (PaaS)</span><input value={config.apiKey} onInput={(event) => update("apiKey", event.currentTarget.value)} /></label><label><span>Website code</span><input value={config.websiteCode} onInput={(event) => update("websiteCode", event.currentTarget.value)} /></label><label><span>Store code</span><input value={config.storeCode} onInput={(event) => update("storeCode", event.currentTarget.value)} /></label><label><span>Customer group code</span><input value={config.customerGroup} onInput={(event) => update("customerGroup", event.currentTarget.value)} /></label></div>
              <details class="header-reference"><summary>Headers this application sends</summary><code>Magento-Customer-Group</code><code>Magento-Environment-Id</code><code>Magento-Website-Code</code><code>Magento-Store-Code</code><code>Magento-Store-View-Code</code><code>X-Api-Key (PaaS)</code></details>
            </section>
          ) : null}

          <aside class="security-notice"><strong>Before connecting</strong><ul><li>Your Commerce endpoint must allow this storefront origin through CORS.</li><li>Do not enter Admin tokens, integration secrets, or customer bearer tokens.</li><li><code>VITE_*</code> variables and browser storage are visible to shoppers.</li><li>Real checkout still requires shipping, billing, payment, and order-placement UI.</li></ul></aside>
          <div class="settings-actions"><sp-button type="submit">Save and use Adobe Commerce</sp-button><button type="button" onClick={clear}>Clear Adobe configuration</button>{saved ? <strong role="status">Saved. Reloading applies the backend.</strong> : null}</div>
      </form>
    </div>
  );
}

function CommerceSettingsPage() { return <div class="settings-page"><CommerceSettingsPanel /></div>; }
export default function decorate(block: HTMLElement) { render(<CommerceSettingsPage />, block); }
