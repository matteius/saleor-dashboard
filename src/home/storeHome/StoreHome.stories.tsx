import { OrderStatus } from "@dashboard/graphql";
import type { Meta, StoryFn, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router-dom";

import { StoreHomeView, type StoreHomeViewProps } from "./StoreHome";

const baseProps: StoreHomeViewProps = {
  firstName: "Matt",
  loading: false,
  hasError: false,
  canManageOrders: true,
  canManageProducts: true,
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
  args: { loading: true, recentOrders: undefined, sales: undefined },
};

export const Empty: Story = {
  args: {
    toFulfillCount: 0,
    unconfirmedCount: 0,
    outOfStockCount: 0,
    sales: { totals: [], orderCount: 0, truncated: false },
    recentOrders: [],
  },
};

export const ProductsOnlyStaff: Story = {
  args: { canManageOrders: false },
};
