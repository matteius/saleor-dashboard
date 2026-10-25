import { type IMoney } from "@dashboard/utils/intl";

/**
 * Sums money amounts per currency, preserving first-seen currency order.
 * Orders across channels can be in different currencies, so they cannot be
 * folded into a single total.
 */
export const sumByCurrency = (amounts: Array<IMoney | null | undefined>): IMoney[] => {
  const totals = new Map<string, number>();

  for (const money of amounts) {
    if (!money) {
      continue;
    }

    totals.set(money.currency, (totals.get(money.currency) ?? 0) + money.amount);
  }

  return Array.from(totals, ([currency, amount]) => ({ currency, amount }));
};

/** Start of the local day `days` days ago, as an ISO string for `DateTime` filters. */
export const startOfDayDaysAgo = (days: number, now: Date = new Date()): string => {
  const date = new Date(now);

  date.setDate(date.getDate() - days);
  date.setHours(0, 0, 0, 0);

  return date.toISOString();
};
