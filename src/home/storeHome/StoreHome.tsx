import { hasPermission } from "@dashboard/auth/misc";
import { useUser } from "@dashboard/auth/useUser";
import useAppChannel from "@dashboard/components/AppLayout/AppChannelContext";
import AppChannelSelect from "@dashboard/components/AppLayout/AppChannelSelect";
import { AssignableListCard } from "@dashboard/components/AssignableListTable/AssignableListCard";
import {
  AssignableListCell,
  AssignableListTable,
} from "@dashboard/components/AssignableListTable/AssignableListTable";
import { ASSIGNABLE_LIST_TABLE_CARD_LEADING_INSET } from "@dashboard/components/AssignableListTable/assignableListTableLayout";
import { DateTime } from "@dashboard/components/Date/DateTime";
import { DetailSettingsCard } from "@dashboard/components/DetailSettingsCard/DetailSettingsCard";
import { iconSize, iconStrokeWidthBySize } from "@dashboard/components/icons";
import Money from "@dashboard/components/Money";
import { Pill } from "@dashboard/components/Pill/Pill";
import { customerListUrl } from "@dashboard/customers/urls";
import { discountListUrl } from "@dashboard/discounts/discountsUrls";
import {
  type ChannelFragment,
  type HomeStoreOverviewQuery,
  OrderStatus,
  PermissionEnum,
  useHomeStoreOverviewQuery,
} from "@dashboard/graphql";
import { transformOrderStatus } from "@dashboard/misc";
import {
  orderDraftListUrl,
  orderListUrlWithChannel,
  orderListUrlWithStatuses,
  orderUrl,
} from "@dashboard/orders/urls";
import { productListUrl } from "@dashboard/products/urls";
import { type RelayToFlat } from "@dashboard/types";
import { type IMoney } from "@dashboard/utils/intl";
import { mapEdgesToItems } from "@dashboard/utils/maps";
import { Box, Button, Skeleton, Text } from "@saleor/macaw-ui-next";
import clsx from "clsx";
import { ChevronRight, FileText, PackagePlus, Percent, ShoppingCart, Users } from "lucide-react";
import { type ReactNode, useMemo } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Link } from "react-router-dom";

import { messages } from "./messages";
import styles from "./StoreHome.module.css";
import { startOfDayDaysAgo, sumByCurrency } from "./sumByCurrency";

const SALES_WINDOW_DAYS = 7;
const TO_FULFILL_STATUSES = [OrderStatus.UNFULFILLED, OrderStatus.PARTIALLY_FULFILLED];

type RecentOrder = NonNullable<
  RelayToFlat<NonNullable<HomeStoreOverviewQuery["recentOrders"]>>
>[number];

export interface StoreHomeSales {
  totals: IMoney[];
  orderCount: number;
  truncated: boolean;
}

export interface StoreHomeViewProps {
  firstName?: string | null;
  channel?: ChannelFragment;
  channels: ChannelFragment[];
  onChannelSelect: (id: string) => void;
  loading: boolean;
  hasError: boolean;
  canManageOrders: boolean;
  canManageProducts: boolean;
  toFulfillCount?: number | null;
  unconfirmedCount?: number | null;
  outOfStockCount?: number | null;
  sales?: StoreHomeSales;
  recentOrders?: RecentOrder[];
}

const StatValue = ({
  loading,
  children,
}: {
  loading: boolean;
  children: ReactNode;
}): React.ReactNode =>
  loading ? (
    <Skeleton __width="4rem" __height="2rem" />
  ) : (
    <Text size={9} fontWeight="bold" lineHeight={1}>
      {children}
    </Text>
  );

const StatTile = ({
  label,
  href,
  attention = false,
  testId,
  children,
}: {
  label: ReactNode;
  href?: string;
  attention?: boolean;
  testId: string;
  children: ReactNode;
}): React.ReactNode => {
  const body = (
    <>
      <Text size={2} color="default2" fontWeight="medium">
        {label}
      </Text>
      {children}
    </>
  );
  const className = clsx(styles.tile, attention && styles.tileAttention);

  return href ? (
    <Link to={href} className={className} data-test-id={testId}>
      {body}
    </Link>
  ) : (
    <Box className={className} data-test-id={testId}>
      {body}
    </Box>
  );
};

const OrderStatusPill = ({ status }: { status: OrderStatus }): React.ReactNode => {
  const intl = useIntl();
  const { localized, status: color } = transformOrderStatus(status, intl);

  return <Pill label={localized} color={color} />;
};

const customerLabel = (order: RecentOrder): string => {
  const name = [order.billingAddress?.firstName, order.billingAddress?.lastName]
    .filter(Boolean)
    .join(" ");

  return name || order.userEmail || "-";
};

const QuickLink = ({
  to,
  icon,
  children,
}: {
  to: string;
  icon: ReactNode;
  children: ReactNode;
}): React.ReactNode => (
  <Link to={to} className={styles.quickLink}>
    <Box color="default2" display="flex" aria-hidden>
      {icon}
    </Box>
    <Text size={3} flexGrow="1">
      {children}
    </Text>
    <Box color="default2" display="flex" aria-hidden>
      <ChevronRight size={iconSize.small} strokeWidth={iconStrokeWidthBySize.small} />
    </Box>
  </Link>
);

const quickLinkIcon = { size: iconSize.medium, strokeWidth: iconStrokeWidthBySize.medium };

export const StoreHomeView = ({
  firstName,
  channel,
  channels,
  onChannelSelect,
  loading,
  hasError,
  canManageOrders,
  canManageProducts,
  toFulfillCount,
  unconfirmedCount,
  outOfStockCount,
  sales,
  recentOrders,
}: StoreHomeViewProps): React.ReactNode => {
  const intl = useIntl();

  return (
    <Box
      className={styles.root}
      padding={6}
      display="flex"
      flexDirection="column"
      gap={6}
      data-test-id="store-home"
    >
      <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={4}>
        <Box display="flex" flexDirection="column" gap={1}>
          <Text as="h1" size={8} fontWeight="bold">
            <FormattedMessage {...messages.greeting} values={{ name: firstName || "empty" }} />
          </Text>
          <Text size={3} color="default2">
            <FormattedMessage {...messages.subtitle} />
          </Text>
        </Box>
        {channel && channels.length > 1 ? (
          <AppChannelSelect
            channels={channels}
            selectedChannelId={channel.id}
            onChannelSelect={onChannelSelect}
          />
        ) : null}
      </Box>

      {hasError ? (
        <Text size={3} color="critical1" data-test-id="store-home-error">
          <FormattedMessage {...messages.loadError} />
        </Text>
      ) : null}

      <Box className={styles.stats}>
        {canManageOrders ? (
          <>
            <StatTile
              label={<FormattedMessage {...messages.toFulfill} />}
              href={orderListUrlWithStatuses(TO_FULFILL_STATUSES, channel)}
              attention={!!toFulfillCount}
              testId="store-home-to-fulfill"
            >
              <StatValue loading={loading}>{toFulfillCount ?? 0}</StatValue>
            </StatTile>
            <StatTile
              label={<FormattedMessage {...messages.unconfirmed} />}
              href={orderListUrlWithStatuses([OrderStatus.UNCONFIRMED], channel)}
              attention={!!unconfirmedCount}
              testId="store-home-unconfirmed"
            >
              <StatValue loading={loading}>{unconfirmedCount ?? 0}</StatValue>
            </StatTile>
            <StatTile
              label={<FormattedMessage {...messages.salesLast7Days} />}
              testId="store-home-sales"
            >
              {loading || !sales || sales.totals.length === 0 ? (
                <StatValue loading={loading}>
                  <Text size={6} color="default2">
                    <FormattedMessage {...messages.noSales} />
                  </Text>
                </StatValue>
              ) : (
                sales.totals.map(total => (
                  <StatValue key={total.currency} loading={false}>
                    <Money money={total} />
                  </StatValue>
                ))
              )}
              {!loading && sales && sales.orderCount > 0 ? (
                <Text size={2} color="default2">
                  <FormattedMessage
                    {...(sales.truncated ? messages.salesTruncated : messages.salesOrderCount)}
                    values={{ count: sales.orderCount }}
                  />
                </Text>
              ) : null}
            </StatTile>
          </>
        ) : null}
        {canManageProducts ? (
          <StatTile
            label={<FormattedMessage {...messages.outOfStock} />}
            href={productListUrl()}
            attention={!!outOfStockCount}
            testId="store-home-out-of-stock"
          >
            <StatValue loading={loading}>{outOfStockCount ?? 0}</StatValue>
          </StatTile>
        ) : null}
      </Box>

      <Box className={styles.columns}>
        {canManageOrders ? (
          <AssignableListCard
            data-test-id="store-home-recent-orders"
            title={<FormattedMessage {...messages.recentOrders} />}
            headerEnd={
              <Link to={orderListUrlWithChannel(channel)}>
                <Button variant="secondary">
                  <FormattedMessage {...messages.viewAllOrders} />
                </Button>
              </Link>
            }
          >
            <AssignableListTable<RecentOrder>
              rowTestId="store-home-order-row"
              items={loading ? undefined : (recentOrders ?? [])}
              selection="none"
              getRowHref={order => orderUrl(order.id)}
              getRowLabel={order => `#${order.number}`}
              leadingInset={ASSIGNABLE_LIST_TABLE_CARD_LEADING_INSET}
              emptyMessage={<FormattedMessage {...messages.noOrders} />}
              emptyIcon={
                <Box color="default2" display="flex" aria-hidden>
                  <ShoppingCart size={iconSize.large} strokeWidth={iconStrokeWidthBySize.large} />
                </Box>
              }
              columns={[
                {
                  id: "number",
                  width: "12%",
                  header: <FormattedMessage {...messages.orderColumn} />,
                },
                {
                  id: "date",
                  width: "20%",
                  header: <FormattedMessage {...messages.dateColumn} />,
                },
                {
                  id: "customer",
                  width: "30%",
                  header: <FormattedMessage {...messages.customerColumn} />,
                },
                {
                  id: "status",
                  width: "20%",
                  header: <FormattedMessage {...messages.statusColumn} />,
                },
                {
                  id: "total",
                  width: "18%",
                  align: "end",
                  header: <FormattedMessage {...messages.totalColumn} />,
                },
              ]}
              renderCells={order => (
                <>
                  <AssignableListCell truncate>
                    <Text ellipsis display="block" size={2}>
                      #{order.number}
                    </Text>
                  </AssignableListCell>
                  <AssignableListCell truncate>
                    <DateTime date={order.created} plain />
                  </AssignableListCell>
                  <AssignableListCell truncate>
                    <Text ellipsis display="block" size={2}>
                      {customerLabel(order)}
                    </Text>
                  </AssignableListCell>
                  <AssignableListCell>
                    <OrderStatusPill status={order.status} />
                  </AssignableListCell>
                  <AssignableListCell align="end">
                    <Money money={order.total.gross} />
                  </AssignableListCell>
                </>
              )}
            />
          </AssignableListCard>
        ) : (
          <Box />
        )}

        <DetailSettingsCard
          title={<FormattedMessage {...messages.quickLinks} />}
          contentFlush
          data-test-id="store-home-quick-links"
        >
          {canManageProducts ? (
            <QuickLink
              to={productListUrl({ action: "create-product" })}
              icon={<PackagePlus {...quickLinkIcon} />}
            >
              {intl.formatMessage(messages.createProduct)}
            </QuickLink>
          ) : null}
          {canManageOrders ? (
            <QuickLink to={orderDraftListUrl()} icon={<FileText {...quickLinkIcon} />}>
              {intl.formatMessage(messages.createOrder)}
            </QuickLink>
          ) : null}
          <QuickLink to={customerListUrl()} icon={<Users {...quickLinkIcon} />}>
            {intl.formatMessage(messages.customers)}
          </QuickLink>
          <QuickLink to={discountListUrl()} icon={<Percent {...quickLinkIcon} />}>
            {intl.formatMessage(messages.discounts)}
          </QuickLink>
        </DetailSettingsCard>
      </Box>
    </Box>
  );
};

/**
 * Native store overview shown on /home when no app contributes homepage widgets.
 * Replaces upstream's Saleor Pulse promotion.
 */
export const StoreHome = (): React.ReactNode => {
  const { user } = useUser();
  const canManageOrders = !!user && !!hasPermission(PermissionEnum.MANAGE_ORDERS, user);
  const canManageProducts = !!user && !!hasPermission(PermissionEnum.MANAGE_PRODUCTS, user);
  // Stock availability is per channel, and Saleor rejects the products query without one
  // once the store has several channels, so the whole overview follows the selected channel.
  const { channel, setChannel } = useAppChannel(false);
  const channels = user?.accessibleChannels ?? [];
  // Fixed per mount so the query variables (and Apollo cache key) stay stable.
  const since = useMemo(() => startOfDayDaysAgo(SALES_WINDOW_DAYS - 1), []);

  const { data, loading, error } = useHomeStoreOverviewQuery({
    variables: {
      channel: channel?.slug ?? "",
      channelId: channel?.id ?? "",
      since,
      hasManageOrders: canManageOrders,
      hasManageProducts: canManageProducts,
    },
    skip: !channel || (!canManageOrders && !canManageProducts),
    fetchPolicy: "cache-and-network",
  });

  const sales = useMemo((): StoreHomeSales | undefined => {
    const recentSales = data?.recentSales;

    if (!recentSales) {
      return undefined;
    }

    return {
      totals: sumByCurrency(recentSales.edges.map(({ node }) => node.total.gross)),
      orderCount: recentSales.totalCount ?? recentSales.edges.length,
      truncated: recentSales.pageInfo.hasNextPage,
    };
  }, [data?.recentSales]);

  return (
    <StoreHomeView
      firstName={user?.firstName}
      channel={channel}
      channels={channels}
      onChannelSelect={setChannel}
      loading={loading && !data}
      hasError={!!error && !data}
      canManageOrders={canManageOrders}
      canManageProducts={canManageProducts}
      toFulfillCount={data?.toFulfill?.totalCount}
      unconfirmedCount={data?.unconfirmed?.totalCount}
      outOfStockCount={data?.outOfStock?.totalCount}
      sales={sales}
      recentOrders={mapEdgesToItems(data?.recentOrders) ?? undefined}
    />
  );
};
