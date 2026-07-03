import { CartItem } from "@components/cart-item/cart-item";
import { Modal } from "@components/modal/modal";
import { useCart, useRemoveCartItem, useUpdateCartItem } from "@services/cart";

type MiniCartProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function MiniCart({ isOpen, onClose }: MiniCartProps) {
  const { data: cart, error, isPending } = useCart(isOpen);
  const updateMutation = useUpdateCartItem();
  const removeMutation = useRemoveCartItem();

  return (
    <Modal isOpen={isOpen} title="Cart" position="right" onClose={onClose}>
      {isPending ? (
        <div class="minicart-loading" aria-live="polite">
          <sp-progress-circle indeterminate size="l" />
          <span>Loading cart…</span>
        </div>
      ) : error || !cart ? <div class="empty-cart" role="alert"><h3>Cart unavailable</h3><p>{error?.message}</p></div> : (
        <div class="minicart">
          <p class="minicart-count">{cart.itemCount} {cart.itemCount === 1 ? "item" : "items"} in your cart</p>

          <div class="minicart-items">
            {cart.items.map((item) => (
              <CartItem key={item.id} item={item} compact onQuantityChange={(quantity) => updateMutation.mutateAsync({ itemId: item.id, quantity })} onRemove={() => removeMutation.mutateAsync(item.id)} />
            ))}
            {!cart.items.length ? <div class="empty-cart"><h3>Your cart is empty</h3><a href="/products">Browse products</a></div> : null}
          </div>

          <footer class="minicart-footer">
            <div class="minicart-subtotal">
              <div><strong>Subtotal</strong><small>Taxes and delivery calculated at checkout</small></div>
              <strong>${cart.subtotal.toLocaleString()}</strong>
            </div>

            <a class="spectrum-Button spectrum-Button--accent" href="/cart">
              View Cart
            </a>
          </footer>
        </div>
      )}
    </Modal>
  );
}
