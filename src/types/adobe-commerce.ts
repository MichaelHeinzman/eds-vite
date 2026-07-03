export type AdobeMoney = {
  value: number;
  currency: "USD";
  __typename: "Money";
};

export type AdobeCartItem = {
  uid: string;
  quantity: number;
  product: {
    uid: string;
    sku: string;
    name: string;
    small_image: {
      url: string;
      label: string;
      __typename: "ProductImage";
    } | null;
    __typename: "SimpleProduct";
  };
  prices: {
    price: AdobeMoney;
    row_total: AdobeMoney;
    __typename: "CartItemPrices";
  };
  configurable_options: Array<{
    id: number;
    option_label: string;
    value_label: string;
    __typename: "SelectedConfigurableOption";
  }>;
  __typename: "SimpleCartItem";
};

export type AdobeCart = {
  id: string;
  email: string;
  is_virtual: boolean;
  total_quantity: number;
  itemsV2: {
    total_count: number;
    items: AdobeCartItem[];
    page_info: {
      page_size: number;
      current_page: number;
      total_pages: number;
      __typename: "SearchResultPageInfo";
    };
    __typename: "CartItems";
  };
  prices: {
    subtotal_excluding_tax: AdobeMoney;
    subtotal_including_tax: AdobeMoney;
    grand_total: AdobeMoney;
    __typename: "CartPrices";
  };
  __typename: "Cart";
};

export type AdobeCartQueryResponse = {
  data: {
    cart: AdobeCart;
  };
};
