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
  openCarts: {
    id: "GhOvwv",
    defaultMessage: "Open carts, last {days} days",
    description: "store home open carts card title; checkouts not yet completed",
  },
  openCartsSummary: {
    id: "VgalSb",
    defaultMessage: "{count, plural, one {# cart} other {# carts}}",
    description: "store home open carts card header count",
  },
  noOpenCarts: {
    id: "Tf+50R",
    defaultMessage: "No carts with items in the last {days} days",
    description: "store home open carts empty state",
  },
  itemsColumn: {
    id: "nF5iBV",
    defaultMessage: "Items",
    description: "store home open carts column",
  },
  quantityColumn: {
    id: "1WY1RV",
    defaultMessage: "Qty",
    description: "store home open carts column, number of items in cart",
  },
  lastActivityColumn: {
    id: "AmjheX",
    defaultMessage: "Last activity",
    description: "store home open carts column",
  },
  cartItems: {
    id: "DBYwfH",
    defaultMessage: "{name} +{more} more",
    description:
      "store home open cart items summary, first product name plus count of other products in the cart",
  },
  guestCustomer: {
    id: "NXBx4F",
    defaultMessage: "Guest",
    description: "store home open cart without customer email",
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
