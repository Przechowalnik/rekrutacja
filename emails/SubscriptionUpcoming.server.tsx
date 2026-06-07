import { TFunction } from "i18next";

import Layout from "./Layout.server";
import { Heading } from "./ui/Heading";
import { Text } from "./ui/Text";
import { defaultT } from "./utilities.server";

type T_SubscriptionUpcoming = {
  nextPaymentAttempt: string;
  t: TFunction<"emails", undefined>;
};

export default function SubscriptionUpcoming({
  nextPaymentAttempt = "01-01-2025",
  t = defaultT,
}: T_SubscriptionUpcoming) {
  return (
    <Layout footer={{ t }} preview={t("preview")}>
      <Heading>{t("title")}</Heading>
      <Text>{t("sendSubscriptionUpcoming.paragraph1")}</Text>
      <Heading>{t("sendSubscriptionUpcoming.title2")}</Heading>
      <Text>
        {t("sendSubscriptionUpcoming.paragraph2")} <b>{nextPaymentAttempt}</b>
      </Text>
      <Text>{t("sendSubscriptionUpcoming.paragraph3")}</Text>
      <Text>{t("sendSubscriptionUpcoming.paragraph4")}</Text>
    </Layout>
  );
}
