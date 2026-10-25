import { type IMoney } from "@dashboard/utils/intl";

import { startOfDayDaysAgo, sumByCurrency } from "./sumByCurrency";

describe("sumByCurrency", () => {
  it("sums amounts per currency in first-seen order and skips nulls", () => {
    // Arrange
    const amounts: Array<IMoney | null> = [
      { amount: 10, currency: "USD" },
      null,
      { amount: 5, currency: "EUR" },
      { amount: 2.5, currency: "USD" },
    ];

    // Act
    const result = sumByCurrency(amounts);

    // Assert
    expect(result).toEqual([
      { amount: 12.5, currency: "USD" },
      { amount: 5, currency: "EUR" },
    ]);
  });

  it("returns an empty list for no amounts", () => {
    // Arrange & Act
    const result = sumByCurrency([]);

    // Assert
    expect(result).toEqual([]);
  });
});

describe("startOfDayDaysAgo", () => {
  it("returns local midnight N days before now", () => {
    // Arrange
    const now = new Date(2026, 9, 25, 15, 30);

    // Act
    const result = new Date(startOfDayDaysAgo(6, now));

    // Assert
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(9);
    expect(result.getDate()).toBe(19);
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
  });
});
