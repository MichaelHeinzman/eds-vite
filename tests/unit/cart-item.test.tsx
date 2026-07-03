import { fireEvent, render, screen } from "@testing-library/preact";
import { expect, test, vi } from "vitest";

import { CartItem } from "@components/cart-item/cart-item";

const item = { id: "1", sku: "CHAIR-1", name: "Reading Chair", price: 499, quantity: 1 };

test("shows pending feedback while a cart mutation is running", async () => {
  let resolveMutation: (() => void) | undefined;
  const onRemove = vi.fn(() => new Promise<void>((resolve) => { resolveMutation = resolve; }));
  render(<CartItem item={item} onRemove={onRemove} />);

  fireEvent.click(screen.getByRole("button", { name: "Remove" }));
  expect((screen.getByRole("button", { name: "Removing…" }) as HTMLButtonElement).disabled).toBe(true);

  resolveMutation?.();
  expect(((await screen.findByRole("button", { name: "Remove" })) as HTMLButtonElement).disabled).toBe(false);
});

test("announces a failed cart mutation", async () => {
  render(<CartItem item={item} onRemove={() => Promise.reject(new Error("offline"))} />);
  fireEvent.click(screen.getByRole("button", { name: "Remove" }));
  expect((await screen.findByRole("alert")).textContent).toContain("Cart update failed");
});
