// @ts-strict-ignore
import { DashboardCard } from "@dashboard/components/Card";
import IconButtonTableCell from "@dashboard/components/IconButtonTableCell";
import Money from "@dashboard/components/Money";
import MoneyRange from "@dashboard/components/MoneyRange";
import ResponsiveTable from "@dashboard/components/ResponsiveTable";
import { TableButtonWrapper } from "@dashboard/components/TableButtonWrapper/TableButtonWrapper";
import TableRowLink from "@dashboard/components/TableRowLink";
import WeightRange from "@dashboard/components/WeightRange";
import { ShippingZoneDetailsFragment } from "@dashboard/graphql";
import useNavigator from "@dashboard/hooks/useNavigator";
import { ChannelProps } from "@dashboard/types";
import { TableBody, TableCell, TableHead } from "@material-ui/core";
import { ICONBUTTON_SIZE, makeStyles } from "@saleor/macaw-ui";
import { Button, EditIcon, Skeleton, TrashBinIcon } from "@saleor/macaw-ui-next";
import React from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { maybe, renderCollection } from "../../../misc";

export interface ShippingZoneRatesProps extends ChannelProps {
  disabled: boolean;
  rates: ShippingZoneDetailsFragment["shippingMethods"];
  variant: "price" | "weight";
  testId?: string;
  onRateAdd: () => void;
  getRateEditHref: (id: string) => string;
  onRateRemove: (id: string) => void;
}

const useStyles = makeStyles(
  theme => ({
    alignRight: {
      paddingRight: 24,
      width: `calc(${ICONBUTTON_SIZE}px + ${theme.spacing(0.5)})`,
    },
    buttonColumn: {
      padding: "4px 0",
      width: "44px",
      "&:last-child": {
        paddingRight: theme.spacing(4),
      },
    },
    nameColumn: {
      width: "auto",
    },
    valueColumn: {
      width: "auto",
    },
  }),
  { name: "ShippingZoneRates" },
);
const ShippingZoneRates: React.FC<ShippingZoneRatesProps> = props => {
  const {
    disabled,
    onRateAdd,
    getRateEditHref,
    onRateRemove,
    rates,
    selectedChannelId,
    variant,
    testId,
  } = props;
  const classes = useStyles(props);
  const navigate = useNavigator();
  const intl = useIntl();

  return (
    <DashboardCard data-test-id={variant === "price" ? "price-based-rates" : "weight-based-rates"}>
      <DashboardCard.Header>
        <DashboardCard.Title>
          {variant === "price"
            ? intl.formatMessage({
                id: "FjrExY",
                defaultMessage: "Price Based Rates",
                description: "price based shipping methods, section header",
              })
            : intl.formatMessage({
                id: "foB6wx",
                defaultMessage: "Weight Based Rates",
                description: "weight based shipping methods, section header",
              })}
        </DashboardCard.Title>
        <DashboardCard.Toolbar>
          <Button disabled={disabled} onClick={onRateAdd} data-test-id={testId} variant="secondary">
            <FormattedMessage id="WR8rir" defaultMessage="Create rate" description="button" />
          </Button>
        </DashboardCard.Toolbar>
      </DashboardCard.Header>
      <ResponsiveTable>
        <TableHead>
          <TableRowLink>
            <TableCell className={classes.nameColumn}>
              <FormattedMessage
                id="aPCrsp"
                defaultMessage="Name"
                description="shipping method name"
              />
            </TableCell>
            <TableCell className={classes.valueColumn}>
              {variant === "price"
                ? intl.formatMessage({
                    id: "njUQPz",
                    defaultMessage: "Value Range",
                    description: "shipping method price range",
                  })
                : intl.formatMessage({
                    id: "aYhcie",
                    defaultMessage: "Weight Range",
                    description: "shipping method weight range",
                  })}
            </TableCell>
            <TableCell className={classes.nameColumn}>
              <FormattedMessage
                id="EKoPNg"
                defaultMessage="Price"
                description="shipping method price"
              />
            </TableCell>
            <TableCell className={classes.buttonColumn} />
            <TableCell className={classes.buttonColumn} />
          </TableRowLink>
        </TableHead>
        <TableBody>
          {renderCollection(
            rates,
            rate => {
              const channel = rate?.channelListings?.find(
                listing => listing.channel.id === selectedChannelId,
              );

              return (
                <TableRowLink
                  hover={!!rate}
                  key={rate ? rate.id : "skeleton"}
                  href={rate && getRateEditHref(rate.id)}
                  data-test-id="shipping-method-row"
                >
                  <TableCell className={classes.nameColumn}>
                    {maybe<React.ReactNode>(() => rate.name, <Skeleton />)}
                  </TableCell>
                  <TableCell>
                    {maybe<React.ReactNode>(
                      () =>
                        rate && !channel ? (
                          "-"
                        ) : variant === "price" ? (
                          <MoneyRange
                            from={channel.minimumOrderPrice}
                            to={channel.maximumOrderPrice}
                          />
                        ) : (
                          <WeightRange
                            from={rate.minimumOrderWeight}
                            to={rate.maximumOrderWeight}
                          />
                        ),
                      <Skeleton />,
                    )}
                  </TableCell>
                  <TableCell data-test-id="shipping-rate-price">
                    {maybe<React.ReactNode>(
                      () => (rate && !channel ? "-" : <Money money={channel.price} />),
                      <Skeleton />,
                    )}
                  </TableCell>
                  <TableButtonWrapper>
                    <IconButtonTableCell
                      disabled={disabled}
                      onClick={() => navigate(getRateEditHref(rate.id))}
                      className={classes.buttonColumn}
                    >
                      <EditIcon />
                    </IconButtonTableCell>
                  </TableButtonWrapper>

                  <TableButtonWrapper>
                    <IconButtonTableCell
                      disabled={disabled}
                      onClick={() => onRateRemove(rate.id)}
                      className={classes.buttonColumn}
                    >
                      <TrashBinIcon data-test-id="delete-button" />
                    </IconButtonTableCell>
                  </TableButtonWrapper>
                </TableRowLink>
              );
            },
            () => (
              <TableRowLink>
                <TableCell colSpan={5}>
                  <FormattedMessage id="RUzdUH" defaultMessage="No shipping rates found" />
                </TableCell>
              </TableRowLink>
            ),
          )}
        </TableBody>
      </ResponsiveTable>
    </DashboardCard>
  );
};

ShippingZoneRates.displayName = "ShippingZoneRates";
export default ShippingZoneRates;
