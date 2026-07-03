import { render } from "preact";
import { useEffect, useState } from "preact/hooks";

import {
  getCart,
  getCommerceBackend,
  setCommerceBackend,
  subscribeCart,
  type CommerceBackend,
} from "@services/cart";

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
  const currentPath = window.location.pathname;
  const commerceBackend = getCommerceBackend();

  useEffect(() => {
    let mounted = true;
    const unsubscribe = subscribeCart((cart) => { if (mounted) setCartCount(cart.itemCount); });
    getCart().then((cart) => { if (mounted) setCartCount(cart.itemCount); });
    return () => { mounted = false; unsubscribe(); };
  }, []);

  function changeBackend(event: Event) {
    const select = event.currentTarget as HTMLSelectElement;
    setCommerceBackend(select.value as CommerceBackend);
    window.location.reload();
  }

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

        <label class="backend-switcher">
          <span>Commerce backend</span>
          <select value={commerceBackend} onChange={changeBackend}>
            <option value="adobe">Adobe Commerce</option>
            <option value="dummyjson">DummyJSON</option>
          </select>
        </label>

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
      </div>
    </div>
  );
};

export default function decorate(block: HTMLElement) {
  render(<Header />, block);
}
