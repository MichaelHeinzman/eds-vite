import { render } from "preact";
import { useState } from "preact/hooks";

import { getCart } from "@services/cart";

type MiniCartComponent = preact.ComponentType<{
  isOpen: boolean;
  onClose: () => void;
}>;

const navItems = [
  { href: "/", label: "Home" },
  { href: "/docs", label: "Docs" },
  { href: "/blocks", label: "Blocks" },
  { href: "/github", label: "GitHub" },
];

export const Header = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [MiniCart, setMiniCart] = useState<MiniCartComponent | null>(null);
  const currentPath = window.location.pathname;

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
                <a href={item.href} aria-current={currentPath === item.href ? "page" : undefined}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <sp-action-button
          class="header-cart-button"
          aria-label="Open cart"
          aria-expanded={isCartOpen}
          onClick={openCart}
        >
          <sp-icon-shopping-cart slot="icon" />
          Cart
        </sp-action-button>

        {MiniCart && <MiniCart isOpen={isCartOpen} onClose={closeCart} />}
      </div>
    </div>
  );
};

export default function decorate(block: HTMLElement) {
  render(<Header />, block);
}
