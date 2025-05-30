import NotFoundPage from "@dashboard/components/NotFoundPage";
import { WindowTitle } from "@dashboard/components/WindowTitle";
import { ExtensionsUrls } from "@dashboard/extensions/urls";
import {
  useWebhookDetailsQuery,
  useWebhookUpdateMutation,
  WebhookEventTypeAsyncEnum,
} from "@dashboard/graphql";
import useNotifier from "@dashboard/hooks/useNotifier";
import { commonMessages } from "@dashboard/intl";
import { extractMutationErrors, getStringOrPlaceholder } from "@dashboard/misc";
import React from "react";
import { useIntl } from "react-intl";

import WebhookDetailsPage, { WebhookFormData } from "../../components/WebhookDetailsPage";
import { useAvailableEvents } from "../../hooks/useAvailableEvents";

export interface EditCustomExtensionWebhookProps {
  id: string;
}

export const EditCustomExtensionWebhook: React.FC<EditCustomExtensionWebhookProps> = ({ id }) => {
  const notify = useNotifier();
  const intl = useIntl();
  const availableEvents = useAvailableEvents();
  const { data: webhookDetails, loading } = useWebhookDetailsQuery({
    variables: { id },
  });
  const [webhookUpdate, webhookUpdateOpts] = useWebhookUpdateMutation({
    onCompleted: data => {
      const errors = data.webhookUpdate?.errors;
      const webhook = data.webhookUpdate?.webhook;

      if (errors?.length === 0 && webhook) {
        notify({
          status: "success",
          text: intl.formatMessage(commonMessages.savedChanges),
        });
      }
    },
  });
  const webhook = webhookDetails?.webhook;
  const formErrors = webhookUpdateOpts.data?.webhookUpdate?.errors || [];
  const handleSubmit = (data: WebhookFormData) =>
    extractMutationErrors(
      webhookUpdate({
        variables: {
          id,
          input: {
            syncEvents: data.syncEvents,
            asyncEvents: data.asyncEvents.includes(WebhookEventTypeAsyncEnum.ANY_EVENTS)
              ? [WebhookEventTypeAsyncEnum.ANY_EVENTS]
              : data.asyncEvents,
            isActive: data.isActive,
            name: data.name,
            secretKey: data.secretKey,
            targetUrl: data.targetUrl,
            query: data.subscriptionQuery,
            customHeaders: data.customHeaders,
          },
        },
      }),
    );

  if (!webhook && !loading) {
    return <NotFoundPage backHref={ExtensionsUrls.resolveInstalledExtensionsUrl()} />;
  }

  return (
    <>
      <WindowTitle title={getStringOrPlaceholder(webhookDetails?.webhook?.name)} />
      <WebhookDetailsPage
        appId={webhook?.app.id ?? ""}
        appName={webhook?.app.name ?? ""}
        disabled={loading}
        errors={formErrors}
        saveButtonBarState={webhookUpdateOpts.status}
        webhook={webhook}
        onSubmit={handleSubmit}
        availableEvents={availableEvents}
      />
    </>
  );
};

EditCustomExtensionWebhook.displayName = "CustomAppWebhookDetails";
