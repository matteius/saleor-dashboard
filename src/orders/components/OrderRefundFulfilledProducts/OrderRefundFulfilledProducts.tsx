// @ts-strict-ignore
import { DashboardCard } from "@dashboard/components/Card";
import Money from "@dashboard/components/Money";
import { QuantityInput } from "@dashboard/components/QuantityInput";
import TableCellAvatar from "@dashboard/components/TableCellAvatar";
import TableRowLink from "@dashboard/components/TableRowLink";
import { OrderRefundDataQuery } from "@dashboard/graphql";
import { FormsetChange } from "@dashboard/hooks/useFormset";
import { renderCollection } from "@dashboard/misc";
import { Table, TableBody, TableCell, TableHead } from "@material-ui/core";
import { makeStyles } from "@saleor/macaw-ui";
import { Button, Skeleton, Text } from "@saleor/macaw-ui-next";
import React from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { OrderRefundFormData } from "../OrderRefundPage/form";
import { getTitle } from "./messages";

const useStyles = makeStyles(
  theme => {
    const inputPadding = {
      paddingBottom: theme.spacing(2),
      paddingTop: theme.spacing(2),
    };

    return {
      cartContent: {
        paddingBottom: 0,
        paddingTop: 0,
      },
      colQuantity: {
        textAlign: "right",
        width: 210,
      },
      notice: {
        marginBottom: theme.spacing(1),
        marginTop: theme.spacing(2),
      },
      orderNumber: {
        display: "inline",
        marginLeft: theme.spacing(1),
      },
      quantityInnerInput: {
        ...inputPadding,
      },
      quantityInnerInputNoRemaining: {
        paddingRight: 0,
      },
      remainingQuantity: {
        ...inputPadding,
        color: theme.palette.text.secondary,
        whiteSpace: "nowrap",
      },
      setMaximalQuantityButton: {
        marginTop: theme.spacing(1),
      },
    };
  },
  { name: "OrderRefundFulfilledProducts" },
);

interface OrderRefundFulfilledProductsProps {
  fulfillment: OrderRefundDataQuery["order"]["fulfillments"][0];
  data: OrderRefundFormData;
  disabled: boolean;
  orderNumber: string;
  onRefundedProductQuantityChange: FormsetChange<string>;
  onSetMaximalQuantities: () => void;
}

const OrderRefundFulfilledProducts: React.FC<OrderRefundFulfilledProductsProps> = props => {
  const {
    fulfillment,
    data,
    disabled,
    orderNumber,
    onRefundedProductQuantityChange,
    onSetMaximalQuantities,
  } = props;
  const classes = useStyles({});
  const intl = useIntl();

  return (
    <DashboardCard>
      <DashboardCard.Header>
        <DashboardCard.Title>
          <>
            {getTitle(fulfillment.status, intl)}
            {fulfillment && (
              <Text className={classes.orderNumber} fontSize={3}>
                {`#${orderNumber}-${fulfillment?.fulfillmentOrder}`}
              </Text>
            )}
          </>
        </DashboardCard.Title>
      </DashboardCard.Header>
      <DashboardCard.Content className={classes.cartContent}>
        <Button
          className={classes.setMaximalQuantityButton}
          onClick={onSetMaximalQuantities}
          data-test-id={"set-maximal-quantity-fulfilled-button-" + fulfillment?.id}
          variant="secondary"
          size="small"
        >
          <FormattedMessage
            id="2W4EBM"
            defaultMessage="Set maximal quantities"
            description="button"
          />
        </Button>
      </DashboardCard.Content>
      <Table>
        <TableHead>
          <TableRowLink>
            <TableCell>
              <FormattedMessage
                id="FNT4b+"
                defaultMessage="Product"
                description="tabel column header"
              />
            </TableCell>
            <TableCell>
              <FormattedMessage
                id="5aiFbL"
                defaultMessage="Price"
                description="tabel column header"
              />
            </TableCell>
            <TableCell>
              <FormattedMessage
                id="Tl+7X4"
                defaultMessage="Refunded Qty"
                description="tabel column header"
              />
            </TableCell>
            <TableCell>
              <FormattedMessage
                id="+PclgM"
                defaultMessage="Total"
                description="tabel column header"
              />
            </TableCell>
          </TableRowLink>
        </TableHead>
        <TableBody>
          {renderCollection(
            fulfillment?.lines,
            line => {
              const selectedLineQuantity = data.refundedFulfilledProductQuantities.find(
                refundedLine => refundedLine.id === line.id,
              );
              const isError =
                Number(selectedLineQuantity?.value) > line?.quantity ||
                Number(selectedLineQuantity?.value) < 0;

              return (
                <TableRowLink key={line?.id}>
                  <TableCellAvatar thumbnail={line?.orderLine?.thumbnail?.url}>
                    {line?.orderLine?.productName ? line?.orderLine?.productName : <Skeleton />}
                  </TableCellAvatar>
                  <TableCell>
                    {line?.orderLine?.unitPrice ? (
                      <Money money={line?.orderLine?.unitPrice.gross} />
                    ) : (
                      <Skeleton />
                    )}
                  </TableCell>
                  <TableCell className={classes.colQuantity}>
                    {line?.quantity ? (
                      <QuantityInput
                        disabled={disabled}
                        className={classes.quantityInnerInputNoRemaining}
                        data-test-id={"quantityInput" + line?.id}
                        value={Number(selectedLineQuantity?.value || 0)}
                        onChange={event =>
                          onRefundedProductQuantityChange(line.id, event.target.value)
                        }
                        max={line?.quantity}
                        min={0}
                        textAlign="right"
                        error={isError}
                      />
                    ) : (
                      <Skeleton />
                    )}
                  </TableCell>
                  <TableCell>
                    {(line?.quantity && line?.orderLine?.unitPrice.gross && (
                      <Money
                        money={{
                          ...line?.orderLine.unitPrice.gross,
                          amount:
                            (line?.orderLine.unitPrice.gross.amount || 0) *
                            Number(selectedLineQuantity?.value),
                        }}
                      />
                    )) || <Skeleton />}
                  </TableCell>
                </TableRowLink>
              );
            },
            () => (
              <TableRowLink>
                <TableCell colSpan={4}>
                  <FormattedMessage id="Q1Uzbb" defaultMessage="No products found" />
                </TableCell>
              </TableRowLink>
            ),
          )}
        </TableBody>
      </Table>
    </DashboardCard>
  );
};

OrderRefundFulfilledProducts.displayName = "OrderRefundFulfilledProducts";
export default OrderRefundFulfilledProducts;
