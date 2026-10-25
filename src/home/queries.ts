import { gql } from "@apollo/client";

export const homeStoreOverview = gql`
  query HomeStoreOverview(
    $since: DateTime!
    $hasManageOrders: Boolean!
    $hasManageProducts: Boolean!
  ) {
    toFulfill: orders(where: { status: { oneOf: [UNFULFILLED, PARTIALLY_FULFILLED] } })
      @include(if: $hasManageOrders) {
      totalCount
    }
    unconfirmed: orders(where: { status: { eq: UNCONFIRMED } }) @include(if: $hasManageOrders) {
      totalCount
    }
    recentSales: orders(
      first: 100
      where: {
        createdAt: { gte: $since }
        status: { oneOf: [UNFULFILLED, PARTIALLY_FULFILLED, FULFILLED, PARTIALLY_RETURNED] }
      }
    ) @include(if: $hasManageOrders) {
      totalCount
      pageInfo {
        hasNextPage
      }
      edges {
        node {
          id
          total {
            gross {
              amount
              currency
            }
          }
        }
      }
    }
    recentOrders: orders(first: 10, sortBy: { field: CREATED_AT, direction: DESC })
      @include(if: $hasManageOrders) {
      edges {
        node {
          id
          number
          created
          status
          userEmail
          billingAddress {
            id
            firstName
            lastName
          }
          total {
            gross {
              amount
              currency
            }
          }
        }
      }
    }
    outOfStock: products(where: { stockAvailability: OUT_OF_STOCK })
      @include(if: $hasManageProducts) {
      totalCount
    }
  }
`;
