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
  options?: ProductOption[];
  variants?: ProductVariant[];
};

export type ProductOption = {
  id: string;
  title: string;
  required: boolean;
  values: Array<{ id: string; title: string; inStock: boolean; swatch?: string }>;
};

export type ProductVariant = {
  sku: string;
  selections: string[];
  price?: number;
  image?: string;
  inStock: boolean;
};
