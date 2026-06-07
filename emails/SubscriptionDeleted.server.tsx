import { TFunction } from "i18next";

import Layout from "./Layout.server";
import { Heading } from "./ui/Heading";
import { Text } from "./ui/Text";
import { defaultT } from "./utilities.server";

type T_SubscriptionDeleted = {
  t: TFunction<"emails", undefined>;
};

export default function SubscriptionDeleted({
  t = defaultT,
}: T_SubscriptionDeleted) {
  return (
    <Layout footer={{ t }} preview={t("preview")}>
      <Heading>{t("title")}</Heading>
      <Text>{t("sendSubscriptionDeleted.paragraph1")}</Text>
      <Heading>{t("sendSubscriptionDeleted.title2")}</Heading>
      <Text>{t("sendSubscriptionDeleted.paragraph2")}</Text>
      <Text>{t("sendSubscriptionDeleted.paragraph3")}</Text>
    </Layout>
  );
}
