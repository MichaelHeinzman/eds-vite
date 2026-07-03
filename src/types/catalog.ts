export type Product = {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  price: number;
  currency: "USD";
  image?: string;
  images: string[];
  rating?: number;
  inStock: boolean;
};
