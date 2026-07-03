import type { AdobeCartQueryResponse } from "@/types/adobe-commerce";

const money = (value: number) => ({
  value,
  currency: "USD" as const,
  __typename: "Money" as const,
});

export const adobeCartFixture: AdobeCartQueryResponse = {
  data: {
    cart: {
      id: "CYmiiQRjPVc2gJUc5r7IsBmwegVIFO43",
      email: "shopper@example.com",
      is_virtual: false,
      total_quantity: 3,
      itemsV2: {
        total_count: 2,
        items: [
          {
            uid: "MTY=",
            quantity: 2,
            product: {
              uid: "MTE=",
              sku: "24-MB04",
              name: "Strive Shoulder Pack",
              small_image: null,
              __typename: "SimpleProduct",
            },
            prices: {
              price: money(32),
              row_total: money(64),
              __typename: "CartItemPrices",
            },
            configurable_options: [
              {
                id: 1,
                option_label: "Color",
                value_label: "Black",
                __typename: "SelectedConfigurableOption",
              },
            ],
            __typename: "SimpleCartItem",
          },
          {
            uid: "MTc=",
            quantity: 1,
            product: {
              uid: "MTI=",
              sku: "24-WB05",
              name: "Savvy Shoulder Tote",
              small_image: null,
              __typename: "SimpleProduct",
            },
            prices: {
              price: money(52),
              row_total: money(52),
              __typename: "CartItemPrices",
            },
            configurable_options: [
              {
                id: 2,
                option_label: "Material",
                value_label: "Nylon",
                __typename: "SelectedConfigurableOption",
              },
            ],
            __typename: "SimpleCartItem",
          },
        ],
        page_info: {
          page_size: 20,
          current_page: 1,
          total_pages: 1,
          __typename: "SearchResultPageInfo",
        },
        __typename: "CartItems",
      },
      prices: {
        subtotal_excluding_tax: money(116),
        subtotal_including_tax: money(122.96),
        grand_total: money(122.96),
        __typename: "CartPrices",
      },
      __typename: "Cart",
    },
  },
};
