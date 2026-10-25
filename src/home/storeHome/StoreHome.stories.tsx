import { AllocationStrategyEnum, type ChannelFragment, OrderStatus } from "@dashboard/graphql";
import type { Meta, StoryFn, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router-dom";

import { StoreHomeView, type StoreHomeViewProps } from "./StoreHome";

const channels: ChannelFragment[] = [
  {
    __typename: "Channel",
    id: "Q2hhbm5lbDox",
    name: "Online store",
    slug: "default-channel",
    isActive: true,
    currencyCode: "USD",
    defaultCountry: { __typename: "CountryDisplay", code: "US", country: "United States" },
    stockSettings: {
      __typename: "StockSettings",
      allocationStrategy: AllocationStrategyEnum.PRIORITIZE_HIGH_STOCK,
    },
  },
  {
    __typename: "Channel",
    id: "Q2hhbm5lbDoy",
    name: "Coin shows",
    slug: "coin-shows",
    isActive: true,
    currencyCode: "USD",
    defaultCountry: { __typename: "CountryDisplay", code: "US", country: "United States" },
    stockSettings: {
      __typename: "StockSettings",
      allocationStrategy: AllocationStrategyEnum.PRIORITIZE_HIGH_STOCK,
    },
  },
];

const baseProps: StoreHomeViewProps = {
  firstName: "Matt",
  channel: channels[0],
  channels,
  onChannelSelect: () => undefined,
  loading: false,
  hasError: false,
  canManageOrders: true,
  canManageProducts: true,
  canManageCheckouts: true,
  toFulfillCount: 3,
  unconfirmedCount: 0,
  outOfStockCount: 12,
  sales: {
    totals: [{ amount: 1843.5, currency: "USD" }],
    orderCount: 14,
    truncated: false,
  },
  recentOrders: [
    {
      __typename: "Order",
      id: "T3JkZXI6MQ==",
      number: "1042",
      created: "2026-10-24T18:12:00Z",
      status: OrderStatus.UNFULFILLED,
      userEmail: "collector@example.com",
      billingAddress: {
        __typename: "Address",
        id: "QWRkcmVzczox",
        firstName: "Ada",
        lastName: "Lovelace",
      },
      total: {
        __typename: "TaxedMoney",
        gross: { __typename: "Money", amount: 249, currency: "USD" },
      },
    },
    {
      __typename: "Order",
      id: "T3JkZXI6Mg==",
      number: "1041",
      created: "2026-10-23T09:40:00Z",
      status: OrderStatus.FULFILLED,
      userEmail: "guest@example.com",
      billingAddress: null,
      total: {
        __typename: "TaxedMoney",
        gross: { __typename: "Money", amount: 64.99, currency: "USD" },
      },
    },
  ],
  openCarts: [
    {
      __typename: "Checkout",
      id: "Q2hlY2tvdXQ6MQ==",
      updatedAt: "2026-10-25T07:55:00Z",
      email: "numismatist@example.com",
      quantity: 3,
      billingAddress: null,
      lines: [
        {
          __typename: "CheckoutLine",
          id: "Q2hlY2tvdXRMaW5lOjE=",
          quantity: 1,
          variant: {
            __typename: "ProductVariant",
            id: "UHJvZHVjdFZhcmlhbnQ6MQ==",
            name: "",
            product: { __typename: "Product", id: "UHJvZHVjdDox", name: "1909-S VDB Lincoln Cent" },
          },
        },
        {
          __typename: "CheckoutLine",
          id: "Q2hlY2tvdXRMaW5lOjI=",
          quantity: 2,
          variant: {
            __typename: "ProductVariant",
            id: "UHJvZHVjdFZhcmlhbnQ6Mg==",
            name: "",
            product: { __typename: "Product", id: "UHJvZHVjdDoy", name: "1921 Morgan Dollar" },
          },
        },
      ],
      totalPrice: {
        __typename: "TaxedMoney",
        gross: { __typename: "Money", amount: 1189, currency: "USD" },
      },
    },
    {
      __typename: "Checkout",
      id: "Q2hlY2tvdXQ6Mg==",
      updatedAt: "2026-10-23T21:10:00Z",
      email: null,
      quantity: 1,
      billingAddress: null,
      lines: [
        {
          __typename: "CheckoutLine",
          id: "Q2hlY2tvdXRMaW5lOjM=",
          quantity: 1,
          variant: {
            __typename: "ProductVariant",
            id: "UHJvZHVjdFZhcmlhbnQ6Mw==",
            name: "",
            product: { __typename: "Product", id: "UHJvZHVjdDoz", name: "1916-D Mercury Dime" },
          },
        },
      ],
      totalPrice: {
        __typename: "TaxedMoney",
        gross: { __typename: "Money", amount: 2150, currency: "USD" },
      },
    },
  ],
};

const meta: Meta<typeof StoreHomeView> = {
  title: "Home / StoreHome",
  component: StoreHomeView,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story: StoryFn): React.ReactNode => (
      <MemoryRouter>
        <div style={{ minHeight: "100vh", background: "var(--mu-colors-background-default1)" }}>
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
  args: baseProps,
};

export default meta;

type Story = StoryObj<typeof StoreHomeView>;

export const Default: Story = {};

export const Loading: Story = {
  args: { loading: true, recentOrders: undefined, sales: undefined, openCarts: undefined },
};

export const Empty: Story = {
  args: {
    toFulfillCount: 0,
    unconfirmedCount: 0,
    outOfStockCount: 0,
    sales: { totals: [], orderCount: 0, truncated: false },
    recentOrders: [],
    openCarts: [],
  },
};

export const ProductsOnlyStaff: Story = {
  args: { canManageOrders: false },
};
