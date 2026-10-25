import { defineMessages } from "react-intl";

export const messages = defineMessages({
  greeting: {
    id: "8od4Gv",
    defaultMessage: "Welcome back{name, select, empty {} other {, {name}}}",
    description: "store home greeting",
  },
  subtitle: {
    id: "xOOuyD",
    defaultMessage: "Here's what needs your attention today.",
    description: "store home subtitle",
  },
  toFulfill: {
    id: "QP+Rzj",
    defaultMessage: "Orders to fulfill",
    description: "store home stat tile",
  },
  unconfirmed: {
    id: "/W6IDH",
    defaultMessage: "Unconfirmed orders",
    description: "store home stat tile",
  },
  outOfStock: {
    id: "ka1+II",
    defaultMessage: "Products out of stock",
    description: "store home stat tile",
  },
  salesLast7Days: {
    id: "9ZW8sg",
    defaultMessage: "Sales, last 7 days",
    description: "store home stat tile",
  },
  salesOrderCount: {
    id: "izzYX/",
    defaultMessage: "{count, plural, one {# order} other {# orders}}",
    description: "store home sales tile caption",
  },
  salesTruncated: {
    id: "pEvzET",
    defaultMessage: "{count, plural, one {# order} other {# orders}} · total covers latest 100",
    description: "store home sales tile caption when more than 100 orders",
  },
  noSales: {
    id: "Nrv3Fp",
    defaultMessage: "No sales yet",
    description: "store home sales tile empty value",
  },
  recentOrders: {
    id: "fzbl8z",
    defaultMessage: "Recent orders",
    description: "store home recent orders card title",
  },
  viewAllOrders: {
    id: "t+i0fy",
    defaultMessage: "View all orders",
    description: "store home button",
  },
  noOrders: {
    id: "rJiiGw",
    defaultMessage: "No orders yet",
    description: "store home recent orders empty state",
  },
  orderColumn: {
    id: "0q4oAK",
    defaultMessage: "Order",
    description: "store home recent orders column",
  },
  dateColumn: {
    id: "KpNx7i",
    defaultMessage: "Date",
    description: "store home recent orders column",
  },
  customerColumn: {
    id: "07+pGX",
    defaultMessage: "Customer",
    description: "store home recent orders column",
  },
  statusColumn: {
    id: "iRBCd7",
    defaultMessage: "Status",
    description: "store home recent orders column",
  },
  totalColumn: {
    id: "EfDa7w",
    defaultMessage: "Total",
    description: "store home recent orders column",
  },
  quickLinks: {
    id: "1Km7Y2",
    defaultMessage: "Quick actions",
    description: "store home quick links card title",
  },
  createProduct: {
    id: "IIXH/V",
    defaultMessage: "Add a product",
    description: "store home quick link",
  },
  createOrder: {
    id: "4c371d",
    defaultMessage: "Draft orders",
    description: "store home quick link",
  },
  customers: {
    id: "LzS0cG",
    defaultMessage: "Customers",
    description: "store home quick link",
  },
  discounts: {
    id: "Ll4ULh",
    defaultMessage: "Discounts",
    description: "store home quick link",
  },
  loadError: {
    id: "7vUpmW",
    defaultMessage: "Couldn't load store overview. Try refreshing the page.",
    description: "store home query error",
  },
});
