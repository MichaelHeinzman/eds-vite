import { fireEvent, render, screen } from "@testing-library/preact";
import { expect, test, vi } from "vitest";

import { CartItem } from "@components/cart-item/cart-item";
import { CommerceQueryProvider } from "@services/query-client";

const item = { id: "1", sku: "CHAIR-1", name: "Reading Chair", price: 499, quantity: 1 };
const renderCartItem = (props: preact.ComponentProps<typeof CartItem>) => render(<CommerceQueryProvider><CartItem {...props} /></CommerceQueryProvider>);

test("shows pending feedback while a cart mutation is running", async () => {
  let resolveMutation: (() => void) | undefined;
  const onRemove = vi.fn(() => new Promise<void>((resolve) => { resolveMutation = resolve; }));
  renderCartItem({ item, onRemove });

  fireEvent.click(screen.getByRole("button", { name: "Remove" }));
  expect((screen.getByRole("button", { name: "Removing…" }) as HTMLButtonElement).disabled).toBe(true);

  resolveMutation?.();
  expect(((await screen.findByRole("button", { name: "Remove" })) as HTMLButtonElement).disabled).toBe(false);
});

test("announces a failed cart mutation", async () => {
  renderCartItem({ item, onRemove: () => Promise.reject(new Error("offline")) });
  fireEvent.click(screen.getByRole("button", { name: "Remove" }));
  expect((await screen.findByRole("alert")).textContent).toContain("Cart update failed");
});

test("links cart media and title to the canonical product page and supports saving", async () => {
  renderCartItem({ item });
  expect(screen.getAllByRole("link", { name: /Reading Chair/ })).toHaveLength(2);
  expect(screen.getByRole("link", { name: "Reading Chair" }).getAttribute("href")).toBe("/products/CHAIR-1");
  fireEvent.click(screen.getByRole("button", { name: /Add Reading Chair to wishlist/ }));
  expect(await screen.findByRole("button", { name: /Remove Reading Chair from wishlist/ })).toBeTruthy();
});
