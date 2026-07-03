import { render } from "preact";
import { useState } from "preact/hooks";

import { getCart } from "@services/cart";

type MiniCartComponent = preact.ComponentType<{
  isOpen: boolean;
  onClose: () => void;
}>;

export const Header = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [MiniCart, setMiniCart] = useState<MiniCartComponent | null>(null);

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
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/docs">Docs</a>
            </li>
            <li>
              <a href="/blocks">Blocks</a>
            </li>
            <li>
              <a href="https://github.com">GitHub</a>
            </li>
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
