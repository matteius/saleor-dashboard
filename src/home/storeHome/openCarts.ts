import { type HomeStoreOverviewQuery } from "@dashboard/graphql";
import { type RelayToFlat } from "@dashboard/types";

export type OpenCart = NonNullable<
  RelayToFlat<NonNullable<HomeStoreOverviewQuery["openCarts"]>>
>[number];

/**
 * Saleor deletes a checkout once it is completed into an order, so every checkout
 * still around is a cart that hasn't been checked out. Storefronts also create
 * empty checkouts eagerly; only carts with items and activity since `since` count.
 */
export const selectOpenCarts = (carts: OpenCart[], since: string): OpenCart[] => {
  const sinceTime = new Date(since).getTime();

  return carts
    .filter(cart => cart.quantity > 0 && new Date(cart.updatedAt).getTime() >= sinceTime)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
};

/** Local calendar date `days` days ago as `YYYY-MM-DD`, for `Date` range filters. */
export const localDateDaysAgo = (days: number, now: Date = new Date()): string => {
  const date = new Date(now);

  date.setDate(date.getDate() - days);

  const pad = (value: number): string => String(value).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};
