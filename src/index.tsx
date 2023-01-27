import { ApolloProvider } from "@apollo/client";
import DemoBanner from "@dashboard/components/DemoBanner";
import { PermissionEnum } from "@dashboard/graphql";
import useAppState from "@dashboard/hooks/useAppState";
import { ThemeProvider } from "@saleor/macaw-ui";
import { SaleorProvider } from "@saleor/sdk";
import React from "react";
import { render } from "react-dom";
import { ErrorBoundary } from "react-error-boundary";
import TagManager from "react-gtm-module";
import { useIntl } from "react-intl";
import { BrowserRouter, Route, Switch } from "react-router-dom";

import { ExternalAppProvider } from "./apps/components/ExternalAppContext";
import { useLocationState } from "./apps/hooks/useLocationState";
import AttributeSection from "./attributes";
import { attributeSection } from "./attributes/urls";
import Auth, { useUser } from "./auth";
import AuthProvider from "./auth/AuthProvider";
import LoginLoading from "./auth/components/LoginLoading/LoginLoading";
import SectionRoute from "./auth/components/SectionRoute";
import CategorySection from "./categories";
import ChannelsSection from "./channels";
import { channelsSection } from "./channels/urls";
import CollectionSection from "./collections";
import AppLayout from "./components/AppLayout";
import useAppChannel, {
  AppChannelProvider,
} from "./components/AppLayout/AppChannelContext";
import { DateProvider } from "./components/Date";
import ErrorPage from "./components/ErrorPage";
import ExitFormDialogProvider from "./components/Form/ExitFormDialogProvider";
import { LocaleProvider } from "./components/Locale";
import MessageManagerProvider from "./components/messages";
import { ShopProvider } from "./components/Shop";
import { WindowTitle } from "./components/WindowTitle";
import { DEMO_MODE, getAppMountUri, GTM_ID } from "./config";
import ConfigurationSection from "./configuration";
import { getConfigMenuItemsPermissions } from "./configuration/utils";
import AppStateProvider from "./containers/AppState";
import BackgroundTasksProvider from "./containers/BackgroundTasks";
import ServiceWorker from "./containers/ServiceWorker/ServiceWorker";
import CustomAppsSection from "./custom-apps";
import { CustomAppSections } from "./custom-apps/urls";
import { CustomerSection } from "./customers";
import DiscountSection from "./discounts";
import GiftCardSection from "./giftCards";
import { giftCardsSectionUrlName } from "./giftCards/urls";
import { apolloClient, saleorClient } from "./graphql/client";
import HomePage from "./home";
import { FlagsServiceProvider } from "./hooks/useFlags/flagsService";
import { commonMessages } from "./intl";
import MarketplaceSection from "./marketplace";
import { marketplaceUrl } from "./marketplace/urls";
import NavigationSection from "./navigation";
import { navigationSection } from "./navigation/urls";
import AppsSection from "./new-apps";
import { AppSections } from "./new-apps/urls";
import { NotFound } from "./NotFound";
import OrdersSection from "./orders";
import PageSection from "./pages";
import PageTypesSection from "./pageTypes";
import PermissionGroupSection from "./permissionGroups";
import PluginsSection from "./plugins";
import ProductSection from "./products";
import ProductTypesSection from "./productTypes";
import errorTracker from "./services/errorTracking";
import ShippingSection from "./shipping";
import SiteSettingsSection from "./siteSettings";
import StaffSection from "./staff";
import TaxesSection from "./taxes";
import themeOverrides from "./themeOverrides";
import TranslationsSection from "./translations";
import WarehouseSection from "./warehouses";
import { warehouseSection } from "./warehouses/urls";

if (process.env.GTM_ID) {
  TagManager.initialize({ gtmId: GTM_ID });
}

errorTracker.init();

const App: React.FC = () => (
  <SaleorProvider client={saleorClient}>
    <ApolloProvider client={apolloClient}>
      <BrowserRouter basename={getAppMountUri()}>
        <ThemeProvider overrides={themeOverrides}>
          <DateProvider>
            <LocaleProvider>
              <MessageManagerProvider>
                <ServiceWorker />
                <BackgroundTasksProvider>
                  <AppStateProvider>
                    <FlagsServiceProvider>
                      <AuthProvider>
                        <ShopProvider>
                          <AppChannelProvider>
                            <ExternalAppProvider>
                              <ExitFormDialogProvider>
                                <Routes />
                              </ExitFormDialogProvider>
                            </ExternalAppProvider>
                          </AppChannelProvider>
                        </ShopProvider>
                      </AuthProvider>
                    </FlagsServiceProvider>
                  </AppStateProvider>
                </BackgroundTasksProvider>
              </MessageManagerProvider>
            </LocaleProvider>
          </DateProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ApolloProvider>
  </SaleorProvider>
);

const Routes: React.FC = () => {
  const intl = useIntl();
  const [, dispatchAppState] = useAppState();
  const { authenticated, authenticating } = useUser();

  const { channel } = useAppChannel(false);

  const channelLoaded = typeof channel !== "undefined";

  const homePageLoaded = channelLoaded && authenticated;

  const homePageLoading = (authenticated && !channelLoaded) || authenticating;

  const { isAppPath } = useLocationState();

  return (
    <>
      <style>{`
        #portal { position: fixed; top: 0; }
        body {
          background: none;
        }
        #dashboard-app .MuiCard-root {
          border: 0;
          background: none;
        }

        #dashboard-app .MuiCardHeader-root,
        #dashboard-app .MuiCardContent-root,
        #dashboard-app .MuiListItem-root,
        #dashboard-app .MuiCardActions-root {
          padding-left: 0;
          padding-right: 0;
        }
        #dashboard-app .MuiPaper-root {
          background: none;
        }
      `}</style>
      <WindowTitle title={intl.formatMessage(commonMessages.dashboard)} />
      {DEMO_MODE && <DemoBanner />}
      {homePageLoaded ? (
        <AppLayout fullSize={isAppPath}>
          <ErrorBoundary
            onError={e => {
              const errorId = errorTracker.captureException(e);

              dispatchAppState({
                payload: {
                  error: "unhandled",
                  errorId,
                },
                type: "displayError",
              });
            }}
            fallbackRender={({ resetErrorBoundary }) => (
              <ErrorPage
                onBack={resetErrorBoundary}
                onRefresh={() => window.location.reload()}
              />
            )}
          >
            <Switch>
              <SectionRoute exact path="/" component={HomePage} />
              <SectionRoute
                permissions={[PermissionEnum.MANAGE_PRODUCTS]}
                path="/categories"
                component={CategorySection}
              />
              <SectionRoute
                permissions={[PermissionEnum.MANAGE_PRODUCTS]}
                path="/collections"
                component={CollectionSection}
              />
              <SectionRoute
                permissions={[PermissionEnum.MANAGE_USERS]}
                path="/customers"
                component={CustomerSection}
              />
              <SectionRoute
                permissions={[PermissionEnum.MANAGE_GIFT_CARD]}
                path={giftCardsSectionUrlName}
                component={GiftCardSection}
              />
              <SectionRoute
                permissions={[PermissionEnum.MANAGE_DISCOUNTS]}
                path="/discounts"
                component={DiscountSection}
              />
              <SectionRoute
                permissions={[PermissionEnum.MANAGE_PAGES]}
                path="/pages"
                component={PageSection}
              />
              <SectionRoute
                permissions={[
                  PermissionEnum.MANAGE_PAGES,
                  PermissionEnum.MANAGE_PAGE_TYPES_AND_ATTRIBUTES,
                ]}
                path="/page-types"
                component={PageTypesSection}
                matchPermission="any"
              />
              <SectionRoute
                permissions={[PermissionEnum.MANAGE_PLUGINS]}
                path="/plugins"
                component={PluginsSection}
              />
              <SectionRoute
                permissions={[PermissionEnum.MANAGE_ORDERS]}
                path="/orders"
                component={OrdersSection}
              />
              <SectionRoute
                permissions={[PermissionEnum.MANAGE_PRODUCTS]}
                path="/products"
                component={ProductSection}
              />
              <SectionRoute
                permissions={[
                  PermissionEnum.MANAGE_PRODUCT_TYPES_AND_ATTRIBUTES,
                ]}
                path="/product-types"
                component={ProductTypesSection}
              />
              <SectionRoute path="/staff" component={StaffSection} />
              <SectionRoute
                permissions={[PermissionEnum.MANAGE_STAFF]}
                path="/permission-groups"
                component={PermissionGroupSection}
              />
              <SectionRoute
                permissions={[PermissionEnum.MANAGE_SETTINGS]}
                path="/site-settings"
                component={SiteSettingsSection}
              />
              <SectionRoute path="/taxes" component={TaxesSection} />
              <SectionRoute
                permissions={[PermissionEnum.MANAGE_SHIPPING]}
                path="/shipping"
                component={ShippingSection}
              />
              <SectionRoute
                permissions={[PermissionEnum.MANAGE_TRANSLATIONS]}
                path="/translations"
                component={TranslationsSection}
              />
              <SectionRoute
                permissions={[PermissionEnum.MANAGE_MENUS]}
                path={navigationSection}
                component={NavigationSection}
              />
              <SectionRoute
                permissions={[
                  PermissionEnum.MANAGE_PRODUCT_TYPES_AND_ATTRIBUTES,
                  PermissionEnum.MANAGE_PAGE_TYPES_AND_ATTRIBUTES,
                ]}
                path={attributeSection}
                component={AttributeSection}
                matchPermission="any"
              />
              <SectionRoute
                permissions={[PermissionEnum.MANAGE_APPS]}
                path={AppSections.appsSection}
                component={AppsSection}
              />
              <SectionRoute
                permissions={[PermissionEnum.MANAGE_APPS]}
                path={marketplaceUrl}
                component={MarketplaceSection}
              />
              <SectionRoute
                permissions={[PermissionEnum.MANAGE_PRODUCTS]}
                path={warehouseSection}
                component={WarehouseSection}
              />
              <SectionRoute
                permissions={[PermissionEnum.MANAGE_CHANNELS]}
                path={channelsSection}
                component={ChannelsSection}
              />
              <SectionRoute
                matchPermission="any"
                permissions={getConfigMenuItemsPermissions(intl)}
                exact
                path="/configuration"
                component={ConfigurationSection}
              />
              <SectionRoute
                path={CustomAppSections.appsSection}
                component={CustomAppsSection}
              />
              <Route component={NotFound} />
            </Switch>
          </ErrorBoundary>
        </AppLayout>
      ) : homePageLoading ? (
        <LoginLoading />
      ) : (
        <Auth />
      )}
    </>
  );
};

render(<App />, document.querySelector("#dashboard-app"));
