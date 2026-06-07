import { TFunction } from "i18next";

import Layout from "./Layout.server";
import { Heading } from "./ui/Heading";
import { Text } from "./ui/Text";
import { defaultT } from "./utilities.server";

type T_CheckoutListingPaymentFailed = {
  t: TFunction<"emails", undefined>;
};

export default function CheckoutListingPaymentFailed({
  t = defaultT,
}: T_CheckoutListingPaymentFailed) {
  return (
    <Layout footer={{ t }} preview={t("preview")}>
      <Heading>{t("title")}</Heading>
      <Text>{t("sendListingExtensionPaymentFailed.paragraph1")}</Text>
      <Heading>{t("sendListingExtensionPaymentFailed.title2")}</Heading>
      <Text>{t("sendListingExtensionPaymentFailed.paragraph2")}</Text>
      <Text>{t("sendListingExtensionPaymentFailed.paragraph3")} </Text>
      <Text>{t("sendListingExtensionPaymentFailed.paragraph4")}</Text>
    </Layout>
  );
}
