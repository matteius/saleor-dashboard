import { ADDRESS } from "@data/addresses";
import { ORDERS, PRODUCTS } from "@data/e2eTestData";
import { AddressesListPage } from "@pages/addressesListPage";
import { AddressDialog } from "@pages/dialogs/addressDialog";
import { DraftOrdersPage } from "@pages/draftOrdersPage";
import { AddressForm } from "@pages/forms/addressForm";
import { FulfillmentPage } from "@pages/fulfillmentPage";
import { OrdersPage } from "@pages/ordersPage";
import { RefundPage } from "@pages/refundPage";
import { expect } from "@playwright/test";
import * as faker from "faker";
import { test } from "utils/testWithPermission";

test.use({ permissionName: "admin" });

let ordersPage: OrdersPage;
let draftOrdersPage: DraftOrdersPage;
let fulfillmentPage: FulfillmentPage;
let addressDialog: AddressDialog;
let addressForm: AddressForm;
let addressesListPage: AddressesListPage;
let refundPage: RefundPage;

test.beforeEach(({ page }) => {
  ordersPage = new OrdersPage(page);
  draftOrdersPage = new DraftOrdersPage(page);
  fulfillmentPage = new FulfillmentPage(page);
  addressDialog = new AddressDialog(page);
  addressesListPage = new AddressesListPage(page);
  addressForm = new AddressForm(page);
  refundPage = new RefundPage(page);
});

const variantSKU = PRODUCTS.productAvailableWithTransactionFlow.variant1sku;

test("TC: SALEOR_28 Create basic order #e2e #order", async () => {
  await ordersPage.goToOrdersListView();
  await ordersPage.clickCreateOrderButton();
  await ordersPage.orderCreateDialog.completeOrderCreateDialogWithFirstChannel();
  await ordersPage.clickAddProductsButton();
  await draftOrdersPage.addProductsDialog.selectVariantBySKU(variantSKU);
  await draftOrdersPage.addProductsDialog.clickConfirmButton();
  await ordersPage.rightSideDetailsPage.clickEditCustomerButton();
  await ordersPage.rightSideDetailsPage.clickSearchCustomerInput();
  await ordersPage.rightSideDetailsPage.selectCustomer();
  await ordersPage.addressDialog.clickConfirmButton();
  await ordersPage.clickAddShippingCarrierButton();
  await ordersPage.shippingAddressDialog.pickAndConfirmFirstShippingMethod();
  await ordersPage.clickFinalizeButton();
  await draftOrdersPage.expectSuccessBanner({ message: "finalized" });
});

test("TC: SALEOR_76 Create order with transaction flow activated #e2e #order", async () => {
  await ordersPage.goToOrdersListView();
  await ordersPage.clickCreateOrderButton();
  await ordersPage.orderCreateDialog.completeOrderCreateDialogWithTransactionChannel();
  await ordersPage.clickAddProductsButton();
  await draftOrdersPage.addProductsDialog.selectVariantBySKU(variantSKU);
  await draftOrdersPage.addProductsDialog.clickConfirmButton();
  await ordersPage.rightSideDetailsPage.clickEditCustomerButton();
  await ordersPage.rightSideDetailsPage.clickSearchCustomerInput();
  await ordersPage.rightSideDetailsPage.selectCustomer();
  await expect(ordersPage.addressDialog.existingAddressRadioButton).toBeVisible();
  await ordersPage.addressDialog.clickConfirmButton();
  await ordersPage.clickAddShippingCarrierButton();
  await ordersPage.shippingAddressDialog.pickAndConfirmFirstShippingMethod();
  await ordersPage.clickFinalizeButton();
  await draftOrdersPage.expectSuccessBanner({ message: "finalized" });
});

test("TC: SALEOR_77 Mark order as paid and fulfill it with transaction flow activated #e2e #order", async () => {
  await ordersPage.goToExistingOrderPage(
    ORDERS.ordersWithinTransactionFlow.markAsPaidOrder.orderId,
  );
  await ordersPage.clickMarkAsPaidButton();
  await ordersPage.markOrderAsPaidDialog.typeAndSaveOrderReference();
  await ordersPage.expectSuccessBanner({ message: "paid" });

  const transactionsMadeRows = await ordersPage.orderTransactionsList.locator("tr");

  expect(await transactionsMadeRows.count()).toEqual(1);
  await expect(transactionsMadeRows).toContainText("Success");
  await ordersPage.clickFulfillButton();
  await fulfillmentPage.clickFulfillButton();
  await ordersPage.expectSuccessBanner({ message: "fulfilled" });
  await expect(ordersPage.pageHeaderStatusInfo).toContainText("Fulfilled");
});

test("TC: SALEOR_78 Capture partial amounts by manual transactions and fulfill order with transaction flow activated #e2e #order", async () => {
  const firstManualTransactionAmount = "100";
  const secondManualTransactionAmount = "20";

  test.slow();

  await ordersPage.goToExistingOrderPage(
    ORDERS.ordersWithinTransactionFlow.captureManualTransactionOrder.orderId,
  );
  await ordersPage.clickManualTransactionButton();
  await ordersPage.manualTransactionDialog.completeManualTransactionDialogAndSave(
    "partial payment 1",
    "111111",
    firstManualTransactionAmount,
  );

  const completedTransactionsRows = await ordersPage.orderTransactionsList.locator("tr");

  await expect(
    completedTransactionsRows.filter({
      hasText: `EUR${firstManualTransactionAmount}`,
    }),
    "Row with first manual transaction details is visible with Success status",
  ).toContainText("Success");
  expect(await ordersPage.pageHeaderStatusInfo, "Order should not be yet fulfilled").toContainText(
    "Unfulfilled",
  );
  expect(await ordersPage.paymentStatusInfo, "Order should be partially paid").toContainText(
    "Partially paid",
  );
  await ordersPage.clickManualTransactionButton();
  await ordersPage.manualTransactionDialog.completeManualTransactionDialogAndSave(
    "partial payment 2",
    "222222",
    secondManualTransactionAmount,
  );
  await expect(
    completedTransactionsRows.filter({
      hasText: `EUR${secondManualTransactionAmount}`,
    }),
    "Row with first manual transaction details is visible with Success status",
  ).toContainText("Success");
  expect(
    await completedTransactionsRows.filter({ hasText: "Success" }).count(),
    "Two rows are visible within Manual capture sections with Success status",
  ).toEqual(2);
  expect(await ordersPage.pageHeaderStatusInfo, "Order should not be yet fulfilled").toContainText(
    "Unfulfilled",
  );
  expect(await ordersPage.paymentStatusInfo, "Order should be fully paid").toContainText(
    "Fully paid",
  );
  await ordersPage.clickFulfillButton();
  await fulfillmentPage.clickFulfillButton();
  await ordersPage.expectSuccessBanner({ message: "fulfilled" });
  await expect(ordersPage.pageHeaderStatusInfo, "Order should be yet fulfilled").toContainText(
    "Fulfilled",
  );
});

test("TC: SALEOR_79 Mark order as paid and fulfill it with regular flow #e2e #order", async () => {
  await ordersPage.goToExistingOrderPage(ORDERS.orderToMarkAsPaidAndFulfill.id);
  await ordersPage.clickMarkAsPaidButton();
  await ordersPage.markOrderAsPaidDialog.typeAndSaveOrderReference();
  await ordersPage.expectSuccessBanner({ message: "paid" });
  await expect(ordersPage.balanceStatusInfo).toHaveText("Settled");
  expect(await ordersPage.paymentStatusInfo, "Order should be fully paid").toContainText(
    "Fully paid",
  );

  await ordersPage.clickFulfillButton();
  await fulfillmentPage.clickFulfillButton();
  await ordersPage.expectSuccessBanner({ message: "fulfilled" });
  await expect(ordersPage.pageHeaderStatusInfo).toContainText("Fulfilled");
});

test("TC: SALEOR_80 Add tracking to order #e2e #order", async () => {
  const trackingNumber = "123456789";

  await ordersPage.goToExistingOrderPage(ORDERS.orderToAddTrackingNumberTo.id);
  await ordersPage.clickAddTrackingButton();
  await ordersPage.addTrackingDialog.typeTrackingNumberAndSave(trackingNumber);
  await ordersPage.expectSuccessBanner({ message: "updated" });
  await expect(ordersPage.setTrackingNumber).toContainText(trackingNumber);
});

test("TC: SALEOR_81 Change billing address in fulfilled order #e2e #order", async () => {
  await ordersPage.goToExistingOrderPage(ORDERS.orderFulfilledToChangeBillingAddress.id);
  await ordersPage.rightSideDetailsPage.clickEditBillingAddressButton();
  await ordersPage.addressDialog.clickNewAddressRadioButton();

  const newAddress = ADDRESS.addressPL;

  await addressForm.completeBasicInfoAddressForm(newAddress);
  await addressForm.typeCompanyName(newAddress.companyName);
  await addressForm.typePhone(newAddress.phone);
  await addressForm.typeAddressLine2(newAddress.addressLine2);
  await addressDialog.clickConfirmButton();

  await ordersPage.expectSuccessBanner();

  await addressesListPage.verifyRequiredAddressFields(newAddress.firstName, newAddress);
  await addressesListPage.verifyPhoneField(newAddress.firstName, newAddress);
  await addressesListPage.verifyCompanyField(newAddress.firstName, newAddress);
  await addressesListPage.verifyAddressLine2Field(newAddress.firstName, newAddress);
  await expect(ordersPage.rightSideDetailsPage.billingAddressSection).toContainText(
    ADDRESS.addressPL.firstName,
  );
  await expect(ordersPage.rightSideDetailsPage.billingAddressSection).toContainText(
    ADDRESS.addressPL.firstName,
  );
});

test("TC: SALEOR_82 Change shipping address in not fulfilled order #e2e #order", async () => {
  await ordersPage.goToExistingOrderPage(ORDERS.orderNotFulfilledToChangeShippingAddress.id);
  await ordersPage.rightSideDetailsPage.clickEditShippingAddressButton();
  await ordersPage.addressDialog.clickNewAddressRadioButton();

  const newAddress = ADDRESS.addressPL;

  await addressForm.completeBasicInfoAddressForm(newAddress);
  await addressForm.typeCompanyName(newAddress.companyName);
  await addressForm.typePhone(newAddress.phone);
  await addressForm.typeAddressLine2(newAddress.addressLine2);
  addressDialog.clickConfirmButton();
  await ordersPage.expectSuccessBanner();
  await addressesListPage.verifyRequiredAddressFields(newAddress.firstName, newAddress);
  await addressesListPage.verifyPhoneField(newAddress.firstName, newAddress);
  await addressesListPage.verifyCompanyField(newAddress.firstName, newAddress);
  await addressesListPage.verifyAddressLine2Field(newAddress.firstName, newAddress);
  await expect(ordersPage.rightSideDetailsPage.shippingAddressSection).toContainText(
    ADDRESS.addressPL.firstName,
  );
});

test("TC: SALEOR_83 Draft orders bulk delete #e2e #draft", async () => {
  await draftOrdersPage.goToDraftOrdersListView();
  await draftOrdersPage.checkListRowsBasedOnContainingText(ORDERS.draftOrdersToBeDeleted.ids);
  await draftOrdersPage.clickBulkDeleteButton();
  await draftOrdersPage.deleteDraftOrdersDialog.clickDeleteButton();
  await draftOrdersPage.expectSuccessBanner();
  await draftOrdersPage.waitForGrid();
  await expect(
    await draftOrdersPage.findRowIndexBasedOnText(PRODUCTS.productsToBeBulkDeleted.names),
    `Given draft orders: ${ORDERS.draftOrdersToBeDeleted.ids} should be deleted from the list`,
  ).toEqual([]);
});

test("TC: SALEOR_84 Create draft order #e2e #draft", async () => {
  test.slow();
  await draftOrdersPage.goToDraftOrdersListView();
  await draftOrdersPage.clickCreateDraftOrderButton();
  await draftOrdersPage.draftOrderCreateDialog.completeDraftOrderCreateDialogWithFirstChannel();
  await draftOrdersPage.clickAddProductsButton();
  await draftOrdersPage.addProductsDialog.searchForProductInDialog(
    PRODUCTS.productAvailableWithTransactionFlow.name,
  );
  await draftOrdersPage.addProductsDialog.selectVariantBySKU(variantSKU);
  await draftOrdersPage.addProductsDialog.clickConfirmButton();
  await draftOrdersPage.rightSideDetailsPage.clickEditCustomerButton();
  await draftOrdersPage.rightSideDetailsPage.clickSearchCustomerInput();
  await draftOrdersPage.rightSideDetailsPage.selectCustomer();
  await draftOrdersPage.expectSuccessBanner();
  await draftOrdersPage.addressDialog.clickConfirmButton();
  await draftOrdersPage.expectSuccessBanner();

  await draftOrdersPage.addShippingCarrierLink.waitFor({ state: "visible" });
  // Ensure the button is in viewport before clicking
  await draftOrdersPage.addShippingCarrierLink.scrollIntoViewIfNeeded();

  await expect(draftOrdersPage.addShippingCarrierLink).toBeVisible();
  await draftOrdersPage.clickAddShippingCarrierButton();

  await draftOrdersPage.shippingAddressDialog.pickAndConfirmFirstShippingMethod();
  await draftOrdersPage.clickFinalizeButton();
  await draftOrdersPage.expectSuccessBanner({ message: "finalized" });
});

test("TC: SALEOR_191 Refund products from the fully paid order #e2e #refunds", async () => {
  // All steps of this test pass (including after hooks), but Playwright
  // marks it as failed because of exceeding 30s timeout
  test.slow();

  const order = ORDERS.fullyPaidOrderWithSingleTransaction;

  await ordersPage.goToExistingOrderPage(order.id);
  await ordersPage.clickAddRefundButton();
  await ordersPage.orderRefundDialog.pickLineItemsRefund();
  await ordersPage.orderRefundModal.waitFor({ state: "hidden" });
  await refundPage.expectAddLineItemsRefundPageOpen(order.id);
  await refundPage.pickAllProductQuantityToRefund(order.lineItems[0].name);

  const productRow = await refundPage.getProductRow(order.lineItems[0].name);

  await expect(productRow.locator(refundPage.productQuantityInput)).toHaveValue(
    order.lineItems[0].quantity,
  );

  const refundReason = "Expectations not met";

  await refundPage.inputProductLineQuantity(order.lineItems[1].name, "1");
  await refundPage.clickLineRefundReasonButton(order.lineItems[0].name);
  await refundPage.addLineRefundReasonDialog.provideLineRefundReason("Item is damaged");
  await refundPage.addLineRefundReasonDialog.submitLineRefundReason();
  await refundPage.provideRefundReason(refundReason);
  await refundPage.saveDraft();
  await refundPage.expectSuccessBanner();
  await ordersPage.goToExistingOrderPage(order.id);
  await ordersPage.orderRefundSection.waitFor({ state: "visible" });
  await ordersPage.assertRefundOnList(refundReason);
  await ordersPage.clickEditRefundButton(refundReason);
  await refundPage.waitForDOMToFullyLoad();
  await refundPage.transferFunds();
  await refundPage.expectSuccessBanner({ message: "Refund has been sent" });
});

test("TC: SALEOR_192 Should create a manual refund with a custom amount #e2e #refunds", async () => {
  const order = ORDERS.fullyPaidOrderWithSeveralTransactions;

  await ordersPage.goToExistingOrderPage(order.id);
  await ordersPage.clickAddRefundButton();
  await ordersPage.orderRefundDialog.pickManualRefund();
  await ordersPage.orderRefundModal.waitFor({ state: "hidden" });
  await refundPage.expectManualRefundPageOpen(order.id);
  await refundPage.selectTransactionToRefund(order.transactionToRefundId);
  await refundPage.transferFunds();
  await refundPage.expectErrorMessage("You must provide amount value");
  await refundPage.provideRefundAmount("1000");
  await refundPage.expectErrorMessage(
    "Provided amount cannot exceed charged amount for the selected transaction",
  );
  await refundPage.provideRefundAmount("10");
  await refundPage.transferFunds();
  await refundPage.expectSuccessBanner({ message: "Transaction action requested successfully" });
  await ordersPage.goToExistingOrderPage(order.id);
  await ordersPage.orderRefundSection.waitFor({ state: "visible" });
  await ordersPage.assertRefundOnList("Manual refund");
});

const orderRefunds = ORDERS.orderWithRefundsInStatusOtherThanSuccess.refunds;

for (const refund of orderRefunds) {
  test(`TC: SALEOR_193 Update order with non-manual refund in ${refund.status} status #e2e #refunds`, async () => {
    await ordersPage.goToExistingOrderPage(ORDERS.orderWithRefundsInStatusOtherThanSuccess.id);
    await ordersPage.orderRefundList.scrollIntoViewIfNeeded();

    const orderRefundListRow = await ordersPage.orderRefundList.locator("tr");
    const pendingRefunds = await orderRefundListRow.filter({ hasText: "PENDING" }).all();

    for (const pendingRefund of pendingRefunds) {
      await expect(pendingRefund.locator(ordersPage.editRefundButton)).toBeDisabled();
    }
    await ordersPage.clickEditRefundButton(refund.status);
    await refundPage.expectEditLineItemsRefundPageOpen(
      ORDERS.orderWithRefundsInStatusOtherThanSuccess.id,
      refund.id,
    );
    await refundPage.transferFunds();
    await refundPage.expectSuccessBanner();
    await expect(ordersPage.orderRefundList).not.toContainText(refund.status);
  });
}

test(`TC: SALEOR_215 Inline discount is applied in a draft order #draft #discounts #e2e`, async () => {
  test.slow();

  const calculateDiscountedPrice = (
    undiscountedPrice: number,
    discountPercentage: number,
  ): number => {
    return undiscountedPrice - (undiscountedPrice * discountPercentage) / 100;
  };

  const formatPrice = (price: string): number => parseFloat(price.slice(3));

  const discountedProduct = PRODUCTS.productWithDiscountChannelPLN;
  const productAlreadyInBasket = ORDERS.draftOrderChannelPLN.productInBasket;
  const totalPriceLocator = ordersPage.orderSummary.locator(ordersPage.totalPrice);

  await ordersPage.goToExistingOrderPage(ORDERS.draftOrderChannelPLN.id);

  const [initialTotal] = await Promise.all([
    totalPriceLocator.innerText(),
    draftOrdersPage.basketProductList.isVisible(),
  ]);

  expect(initialTotal).toContain(productAlreadyInBasket.price.toString());

  await draftOrdersPage.clickAddProductsButton();
  await draftOrdersPage.addProductsDialog.searchForProductInDialog(discountedProduct.name);
  await draftOrdersPage.addProductsDialog.selectVariantBySKU(discountedProduct.variant.sku);
  await draftOrdersPage.addProductsDialog.clickConfirmButton();

  await draftOrdersPage.expectElementIsHidden(draftOrdersPage.dialog);
  await draftOrdersPage.expectElementIsHidden(draftOrdersPage.successBanner);

  const expectedDiscountedPrice = calculateDiscountedPrice(
    discountedProduct.variant.undiscountedPrice,
    discountedProduct.rewardPercentageDiscountValue,
  );

  expect(discountedProduct.variant.discountedPrice).toEqual(expectedDiscountedPrice);

  await totalPriceLocator.waitFor({ state: "visible" });

  const finalTotal = await totalPriceLocator.innerText();

  const expectedTotal = (
    productAlreadyInBasket.price + discountedProduct.variant.discountedPrice
  ).toFixed(2);

  expect(formatPrice(finalTotal).toFixed(2)).toEqual(expectedTotal);
});

test(`TC: SALEOR_216 Order type discount is applied to a draft order #draft #discounts #e2e`, async () => {
  test.slow();
  await draftOrdersPage.goToDraftOrdersListView();
  await draftOrdersPage.clickCreateDraftOrderButton();
  await draftOrdersPage.draftOrderCreateDialog.completeDraftOrderCreateDialogWithSpecificChannel(
    "e2e-channel-do-not-delete",
  );

  await draftOrdersPage.clickAddProductsButton();
  await draftOrdersPage.addProductsDialog.searchForProductInDialog(
    PRODUCTS.productWithPriceLowerThan20.name,
  );
  await draftOrdersPage.addProductsDialog.selectVariantBySKU(
    PRODUCTS.productWithPriceLowerThan20.variantSKU,
  );
  await draftOrdersPage.addProductsDialog.clickConfirmButton();
  await draftOrdersPage.expectElementIsHidden(draftOrdersPage.dialog);
  await ordersPage.totalPrice.waitFor({ state: "visible" });
  await draftOrdersPage.expectElementIsHidden(draftOrdersPage.successBanner);

  // TODO uncomment when MERX-727 is fixed
  // const giftProduct = PRODUCTS.giftProduct.name;

  // expect(draftOrdersPage.basketProductList).toContainText(giftProduct);

  const initialTotalPrice = await ordersPage.orderSummary
    .locator(ordersPage.totalPrice)
    .innerText();
  const initialSubTotalPrice = await ordersPage.subTotalPrice.innerText();

  expect(parseFloat(initialSubTotalPrice.slice(3))).toBeLessThan(20);
  expect(parseFloat(initialSubTotalPrice.slice(3))).toEqual(
    PRODUCTS.productWithPriceLowerThan20.price,
  );
  expect(initialTotalPrice).toBe(initialSubTotalPrice);

  await draftOrdersPage.clickAddProductsButton();

  await draftOrdersPage.addProductsDialog.searchForProductInDialog(
    PRODUCTS.productWithPriceHigherThan20.name,
  );
  await draftOrdersPage.addProductsDialog.selectVariantBySKU(
    PRODUCTS.productWithPriceHigherThan20.variantSKU,
  );
  await draftOrdersPage.addProductsDialog.clickConfirmButton();
  await draftOrdersPage.expectElementIsHidden(draftOrdersPage.dialog);
  await ordersPage.totalPrice.waitFor({ state: "visible" });
  await draftOrdersPage.expectElementIsHidden(draftOrdersPage.successBanner);

  const finalSubTotalPrice = await ordersPage.subTotalPrice.innerText();

  expect(parseFloat(finalSubTotalPrice.slice(3))).toBeGreaterThan(20);

  const undiscountedOrderSubTotal =
    PRODUCTS.productWithPriceLowerThan20.price + PRODUCTS.productWithPriceHigherThan20.price;
  const finalTotalPrice = await ordersPage.orderSummary.locator(ordersPage.totalPrice).innerText();

  expect(finalTotalPrice.slice(3)).not.toContain(initialSubTotalPrice);

  const discountedOrderSubTotal = undiscountedOrderSubTotal - (undiscountedOrderSubTotal * 5) / 100;

  expect(finalTotalPrice.slice(3)).toContain(discountedOrderSubTotal.toString());
});

/**
 * TODO: flaky test, Skipping for now as this tests takes to long.
 * Let's decide what do with it latter
 */
test.skip("TC: SALEOR_217 Complete basic order for non existing customer #e2e #order", async () => {
  const nonExistingEmail = `customer-${faker.datatype.number()}@example.com`;
  const newAddress = ADDRESS.addressPL;

  await ordersPage.goToExistingOrderPage(ORDERS.orderWithoutAddedCustomer.id);
  await ordersPage.rightSideDetailsPage.clickEditCustomerButton();
  await ordersPage.rightSideDetailsPage.clickSearchCustomerInput();
  await ordersPage.rightSideDetailsPage.typeAndSelectCustomerEmail(nonExistingEmail);
  await addressForm.completeBasicInfoAddressForm(newAddress);
  await addressForm.typeCompanyName(newAddress.companyName);
  await addressForm.typePhone(newAddress.phone);
  await addressForm.typeAddressLine2(newAddress.addressLine2);
  await addressDialog.clickConfirmButton();
  await ordersPage.expectSuccessBanner();
  await ordersPage.clickAddShippingCarrierButton();
  await ordersPage.shippingAddressDialog.pickAndConfirmFirstShippingMethod();
  await ordersPage.clickFinalizeButton();
  await ordersPage.expectSuccessBanner({ message: "finalized" });
});
