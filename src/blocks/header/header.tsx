import { render } from "preact";
import { useState } from "preact/hooks";

import { getCart, useCart } from "@services/cart";
import { CommerceQueryProvider } from "@services/query-client";
import { isAdobeCommerceConfigured } from "@services/adobe-config";
import { Modal } from "@components/modal/modal";
import { CommerceSettingsPanel } from "@blocks/commerce-settings/commerce-settings";

type MiniCartComponent = preact.ComponentType<{
  isOpen: boolean;
  onClose: () => void;
}>;

const navItems = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/docs", label: "Docs" },
  { href: "/blocks", label: "Blocks" },
  { href: "/github", label: "GitHub" },
];

export const Header = ({ initialCartCount = 0 }: { initialCartCount?: number }) => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [MiniCart, setMiniCart] = useState<MiniCartComponent | null>(null);
  const cartQuery = useCart();
  const cartCount = cartQuery.data?.itemCount ?? initialCartCount;
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCartLoading, setIsCartLoading] = useState(false);
  const [cartError, setCartError] = useState("");
  const [isNavOpen, setIsNavOpen] = useState(false);
  const currentPath = window.location.pathname;

  function applySettings() { setIsSettingsOpen(false); window.location.reload(); }

  async function openCart() {
    setIsCartOpen(true);

    if (!MiniCart) {
      setIsCartLoading(true);
      setCartError("");
      try {
        const mod = await import("@components/minicart/minicart");
        setMiniCart(() => mod.MiniCart);
      } catch {
        setIsCartOpen(false);
        setCartError("Unable to open the cart. Check your Commerce connection and try again.");
      } finally {
        setIsCartLoading(false);
      }
    }
  }

  function closeCart() {
    setIsCartOpen(false);
  }

  return (
    <div class="site-header">
      <div class="site-header-content">
        <a class="site-logo" href="/" aria-label="EDS Vite home">
          <sp-icon-home size="m" />
          <span>EDS Vite</span>
        </a>

        <button class="mobile-nav-toggle" type="button" aria-label="Toggle navigation" aria-expanded={isNavOpen} onClick={() => setIsNavOpen((open) => !open)}>
          <span aria-hidden="true">{isNavOpen ? "×" : "☰"}</span>
        </button>

        <nav class={isNavOpen ? "open" : ""} aria-label="Primary Navigation">
          <ul>
            {navItems.map((item) => (
              <li key={item.href}>
                <a href={item.href} aria-current={currentPath === item.href || (item.href === "/products" && currentPath.startsWith("/products/")) ? "page" : undefined}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <sp-action-button class="commerce-settings-button" aria-label="Commerce settings" onClick={() => setIsSettingsOpen(true)}>
          <sp-icon-settings slot="icon" />
          <span class="commerce-backend-label">{isAdobeCommerceConfigured() ? "Adobe Commerce" : "Adobe: setup needed"}</span>
        </sp-action-button>

        <sp-action-button
          class="header-cart-button"
          aria-label={`Open cart, ${cartCount} ${cartCount === 1 ? "item" : "items"}`}
          aria-expanded={isCartOpen}
          disabled={isCartLoading}
          onClick={openCart}
        >
          <sp-icon-shopping-cart slot="icon" />
          {isCartLoading ? "Loading…" : `Cart${cartCount ? ` (${cartCount})` : ""}`}
        </sp-action-button>
        {cartError || cartQuery.error ? <span class="header-action-error" role="alert">{cartError || cartQuery.error?.message}</span> : null}

        {MiniCart && <MiniCart isOpen={isCartOpen} onClose={closeCart} />}
        <Modal isOpen={isSettingsOpen} title="Commerce backend" onClose={() => setIsSettingsOpen(false)}>
          <CommerceSettingsPanel embedded onComplete={applySettings} />
        </Modal>
      </div>
    </div>
  );
};

export default async function decorate(block: HTMLElement) {
  block.dataset.blockLoadingUi = "true";
  render(<CommerceQueryProvider><Header /></CommerceQueryProvider>, block);
  const cart = await getCart().catch(() => null);
  if (cart) render(<CommerceQueryProvider><Header initialCartCount={cart.itemCount} /></CommerceQueryProvider>, block);
  delete block.dataset.blockLoadingUi;
}
