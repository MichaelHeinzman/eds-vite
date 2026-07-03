export type CartItem = {
  id: string;
  sku: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  options?: string[];
};

export type Cart = {
  id: string;
  items: CartItem[];
  subtotal: number;
  itemCount: number;
};
