import { localDateDaysAgo, type OpenCart, selectOpenCarts } from "./openCarts";

const cart = (id: string, updatedAt: string, quantity: number): OpenCart => ({
  __typename: "Checkout",
  id,
  updatedAt,
  email: null,
  quantity,
  billingAddress: null,
  lines: [],
  totalPrice: {
    __typename: "TaxedMoney",
    gross: { __typename: "Money", amount: 0, currency: "USD" },
  },
});

describe("selectOpenCarts", () => {
  it("keeps non-empty carts updated since the cutoff, most recent first", () => {
    // Arrange
    const carts = [
      cart("older", "2026-10-23T10:00:00Z", 1),
      cart("empty", "2026-10-25T10:00:00Z", 0),
      cart("stale", "2026-10-21T23:59:00Z", 3),
      cart("newest", "2026-10-24T08:00:00Z", 2),
    ];

    // Act
    const result = selectOpenCarts(carts, "2026-10-22T00:00:00Z");

    // Assert
    expect(result.map(({ id }) => id)).toEqual(["newest", "older"]);
  });
});

describe("localDateDaysAgo", () => {
  it("returns the local calendar date N days before now", () => {
    // Arrange
    const now = new Date(2026, 9, 2, 0, 15);

    // Act
    const result = localDateDaysAgo(2, now);

    // Assert
    expect(result).toBe("2026-09-30");
  });
});
