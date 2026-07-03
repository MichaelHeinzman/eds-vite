import { render } from "preact";
import { useEffect, useState } from "preact/hooks";

import {
  getCart,
  subscribeCart,
} from "@services/cart";
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

export const Header = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [MiniCart, setMiniCart] = useState<MiniCartComponent | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const currentPath = window.location.pathname;

  useEffect(() => {
    let mounted = true;
    const unsubscribe = subscribeCart((cart) => { if (mounted) setCartCount(cart.itemCount); });
    getCart().then((cart) => { if (mounted) setCartCount(cart.itemCount); }).catch(() => { if (mounted) setCartCount(0); });
    return () => { mounted = false; unsubscribe(); };
  }, []);

  function applySettings() { setIsSettingsOpen(false); window.location.reload(); }

  async function openCart() {
    setIsCartOpen(true);

    if (!MiniCart) {
      await getCart();

      const mod = await import("@components/minicart/minicart");
      setMiniCart(() => mod.MiniCart);
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

        <nav aria-label="Primary Navigation">
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
          onClick={openCart}
        >
          <sp-icon-shopping-cart slot="icon" />
          Cart{cartCount ? ` (${cartCount})` : ""}
        </sp-action-button>

        {MiniCart && <MiniCart isOpen={isCartOpen} onClose={closeCart} />}
        <Modal isOpen={isSettingsOpen} title="Commerce backend" onClose={() => setIsSettingsOpen(false)}>
          <CommerceSettingsPanel embedded onComplete={applySettings} />
        </Modal>
      </div>
    </div>
  );
};

export default function decorate(block: HTMLElement) {
  render(<Header />, block);
}
