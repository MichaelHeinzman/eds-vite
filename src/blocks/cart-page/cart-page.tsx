import { render } from "preact";
import { useEffect, useState } from "preact/hooks";

import { CartItem } from "@components/cart-item/cart-item";
import { CartPageSkeleton } from "@components/loading-skeleton/loading-skeleton";
import { getCart, removeCartItem, subscribeCart, updateCartItem } from "@services/cart";
import type { Cart } from "@models/cart";

function CartPage({ initialCart }: { initialCart: Cart }) {
  const [cart, setCart] = useState(initialCart);

  useEffect(() => {
    let mounted = true;
    const unsubscribe = subscribeCart((data) => { if (mounted) setCart(data); });
    return () => { mounted = false; unsubscribe(); };
  }, []);

  const delivery = 0;
  const estimatedTax = Math.round(cart.subtotal * 0.06);
  const estimatedTotal = cart.subtotal + delivery + estimatedTax;

  return (
    <div class="cart-page-content">
      <header class="cart-page-heading">
        <div>
          <p class="page-eyebrow">Your cart</p>
          <h1>Review your selections</h1>
        </div>
        <p>{cart.itemCount} {cart.itemCount === 1 ? "item" : "items"}</p>
      </header>

      <div class="cart-page-layout">
        <section class="cart-page-items" aria-label="Cart items">
          {cart.items.map((item, index) => <CartItem key={item.id} item={item} priority={index === 0} onQuantityChange={(quantity) => updateCartItem(item.id, quantity)} onRemove={() => removeCartItem(item.id)} />)}
          {!cart.items.length ? <div class="empty-cart"><h2>Your cart is empty</h2><p>Add something from the catalog to see the full flow.</p><a href="/products">Browse products</a></div> : null}
          <div class="delivery-note">
            <strong>Free local delivery</strong>
            <span>White-glove delivery scheduling is available after checkout.</span>
          </div>
        </section>

        <aside class="order-summary" aria-label="Order summary">
          <h2>Order summary</h2>
          <dl>
            <div><dt>Subtotal</dt><dd>${cart.subtotal.toLocaleString()}</dd></div>
            <div><dt>Estimated delivery</dt><dd>{delivery ? `$${delivery}` : "Free"}</dd></div>
            <div><dt>Estimated tax</dt><dd>${estimatedTax.toLocaleString()}</dd></div>
          </dl>
          <sp-divider size="s" />
          <div class="order-total"><strong>Estimated total</strong><strong>${estimatedTotal.toLocaleString()}</strong></div>
          <sp-button size="l">Proceed to checkout</sp-button>
          <a href="/">Continue shopping</a>
          <small>This is local mock data. No payment or order will be submitted.</small>
        </aside>
      </div>
    </div>
  );
}

export default async function decorate(block: HTMLElement) {
  block.dataset.blockLoadingUi = "true";
  render(<div class="skeleton-loading" role="status" aria-label="Loading your cart"><CartPageSkeleton /></div>, block);
  try {
    render(<CartPage initialCart={await getCart()} />, block);
  } catch {
    render(<div class="catalog-empty"><h1>Cart unavailable</h1><p>Unable to load your Adobe Commerce cart.</p></div>, block);
  }
  delete block.dataset.blockLoadingUi;
}
