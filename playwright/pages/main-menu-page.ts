import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

export class MainMenuPage {
  readonly page: Page;

  readonly catalog: Locator;
  readonly pages: Locator;
  readonly configuration: Locator;
  readonly home: Locator;
  readonly orders: Locator;
  readonly discounts: Locator;
  readonly appSection: Locator;
  readonly vouchers: Locator;
  readonly app: Locator;
  readonly translations: Locator;
  readonly customers: Locator;
  readonly list: Locator;
  readonly listItem: Locator;
  readonly products: Locator;
  readonly menuItem: Locator;
  readonly drafts: Locator;

  constructor(page: Page) {
    this.page = page;
    (this.catalog = page.getByTestId("menu-item-label-catalogue")),
      (this.pages = page.getByTestId("menu-item-label-pages")),
      (this.configuration = page.getByTestId("menu-item-label-configure")),
      (this.home = page.getByTestId("menu-item-label-home")),
      (this.orders = page.getByTestId("menu-item-label-orders")),
      (this.drafts = page.getByTestId("menu-item-label-order-drafts")),
      (this.discounts = page.getByTestId("menu-item-label-discounts")),
      (this.vouchers = page.getByTestId("menu-item-label-vouchers")),
      (this.appSection = page.getByTestId("menu-item-label-apps_section")),
      (this.app = page.getByTestId("menu-item-label-apps")),
      (this.translations = page.getByTestId("menu-item-label-translations")),
      (this.customers = page.getByTestId("menu-item-label-customers")),
      (this.list = page.getByTestId("menu-list")),
      (this.listItem = page.getByTestId("menu-list-item")),
      (this.products = page.getByTestId("menu-item-label-products")),
      (this.menuItem = page.locator("[data-test-id*='menu-item-label-']"));
  }
  async openDiscounts() {
    await this.discounts.click();
  }
  async openOrders() {
    await this.orders.click();
  }
  async openDrafts() {
    await this.orders.click();
    await this.drafts.click();
  }
  async openVouchers() {
    await this.discounts.click();
    await this.vouchers.click();
  }
  async expectMenuItemsCount(liItemsCount: number) {
    // expect li items count in menu
    await expect(this.list.locator("li")).toHaveCount(liItemsCount);
  }
}
