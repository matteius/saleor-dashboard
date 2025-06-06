import { ChannelPage } from "@pages/channelsPage";
import { ConfigurationPage } from "@pages/configurationPage";
import { HomePage } from "@pages/homePage";
import { MainMenuPage } from "@pages/mainMenuPage";
import { expect } from "@playwright/test";
import { test } from "utils/testWithPermission";

test.use({ permissionName: "channel" });

let channelPage: ChannelPage;
let mainMenuPage: MainMenuPage;
let configurationPage: ConfigurationPage;
let home: HomePage;

test.beforeEach(async ({ page }) => {
  channelPage = new ChannelPage(page);
  mainMenuPage = new MainMenuPage(page);
  configurationPage = new ConfigurationPage(page);
  home = new HomePage(page);

  await home.goto();
  await home.welcomeMessage.waitFor({ state: "visible", timeout: 30000 });
});

test("TC: SALEOR_11 User should be able to navigate to channel list as a staff member using CHANNEL permission #e2e", async () => {
  await mainMenuPage.openConfiguration();
  await mainMenuPage.expectMenuItemsCount(3);
  await configurationPage.openChannels();
  await expect(channelPage.createChannelButton).toBeVisible();
  await expect(channelPage.deleteChannelButton.first()).toBeVisible();
});
