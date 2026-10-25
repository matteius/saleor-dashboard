import { gql } from "@apollo/client";

export const homeStoreOverview = gql`
  query HomeStoreOverview(
    $channel: String!
    $channelId: ID!
    $since: DateTime!
    $hasManageOrders: Boolean!
    $hasManageProducts: Boolean!
  ) {
    toFulfill: orders(
      where: {
        channelId: { eq: $channelId }
        status: { oneOf: [UNFULFILLED, PARTIALLY_FULFILLED] }
      }
    ) @include(if: $hasManageOrders) {
      totalCount
    }
    unconfirmed: orders(where: { channelId: { eq: $channelId }, status: { eq: UNCONFIRMED } })
      @include(if: $hasManageOrders) {
      totalCount
    }
    recentSales: orders(
      first: 100
      where: {
        channelId: { eq: $channelId }
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
    recentOrders: orders(
      first: 10
      sortBy: { field: CREATED_AT, direction: DESC }
      where: { channelId: { eq: $channelId } }
    ) @include(if: $hasManageOrders) {
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
    outOfStock: products(channel: $channel, where: { stockAvailability: OUT_OF_STOCK })
      @include(if: $hasManageProducts) {
      totalCount
    }
  }
`;
