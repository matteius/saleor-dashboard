import Wrapper from "@test/wrapper";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { type OpenCart } from "./openCarts";
import { StoreHomeView, type StoreHomeViewProps } from "./StoreHome";

const openCart: OpenCart = {
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
};

const baseProps: StoreHomeViewProps = {
  channels: [],
  onChannelSelect: () => undefined,
  loading: false,
  hasError: false,
  canManageOrders: false,
  canManageProducts: false,
  canManageCheckouts: true,
  openCarts: [openCart],
};

const renderView = (props: Partial<StoreHomeViewProps> = {}): void => {
  render(
    <Wrapper>
      <MemoryRouter>
        <StoreHomeView {...baseProps} {...props} />
      </MemoryRouter>
    </Wrapper>,
  );
};

describe("StoreHomeView open carts", () => {
  it("lists open carts with customer, items summary and quantity", () => {
    // Arrange & Act
    renderView();

    // Assert
    const card = screen.getByTestId("store-home-open-carts");
    const row = within(card).getByTestId("store-home-open-cart-row");

    expect(within(card).getByText("Open carts, last 3 days")).toBeInTheDocument();
    expect(within(row).getByText("numismatist@example.com")).toBeInTheDocument();
    expect(within(row).getByText("1909-S VDB Lincoln Cent +1 more")).toBeInTheDocument();
    expect(within(row).getByText("3")).toBeInTheDocument();
  });

  it("shows an empty state when there are no open carts", () => {
    // Arrange & Act
    renderView({ openCarts: [] });

    // Assert
    expect(screen.getByText("No carts with items in the last 3 days")).toBeInTheDocument();
  });

  it("hides the card without the manage checkouts permission", () => {
    // Arrange & Act
    renderView({ canManageCheckouts: false });

    // Assert
    expect(screen.queryByTestId("store-home-open-carts")).not.toBeInTheDocument();
  });
});
