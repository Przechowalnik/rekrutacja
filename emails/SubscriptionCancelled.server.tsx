import { TFunction } from "i18next";

import Layout from "./Layout.server";
import { Heading } from "./ui/Heading";
import { Text } from "./ui/Text";
import { defaultT } from "./utilities.server";

type T_SubscriptionCancelled = {
  t: TFunction<"emails", undefined>;
};

export default function SubscriptionCancelled({
  t = defaultT,
}: T_SubscriptionCancelled) {
  return (
    <Layout footer={{ t }} preview={t("preview")}>
      <Heading>{t("title")}</Heading>
      <Text>{t("sendSubscriptionCancelled.paragraph1")}</Text>
      <Heading>{t("sendSubscriptionCancelled.title2")}</Heading>
      <Text>{t("sendSubscriptionCancelled.paragraph2")}</Text>
      <Text>{t("sendSubscriptionCancelled.paragraph3")}</Text>
      <Text>{t("sendSubscriptionCancelled.paragraph4")}</Text>
    </Layout>
  );
}
