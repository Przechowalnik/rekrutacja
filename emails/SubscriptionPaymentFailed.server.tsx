import { TFunction } from "i18next";

import Layout from "./Layout.server";
import { Heading } from "./ui/Heading";
import { Text } from "./ui/Text";
import { defaultT } from "./utilities.server";

type T_SubscriptionPaymentFailed = {
  nextPaymentAttempt: string;
  t: TFunction<"emails", undefined>;
};

export default function SubscriptionPaymentFailed({
  nextPaymentAttempt = "01-01-2025",
  t = defaultT,
}: T_SubscriptionPaymentFailed) {
  return (
    <Layout footer={{ t }} preview={t("preview")}>
      <Heading>{t("title")}</Heading>
      <Text>{t("sendSubscriptionPaymentFailed.paragraph1")}</Text>
      <Heading>{t("sendSubscriptionPaymentFailed.title2")}</Heading>
      <Text>{t("sendSubscriptionPaymentFailed.paragraph2")}</Text>
      <Text>
        {t("sendSubscriptionPaymentFailed.paragraph3")}{" "}
        <b>{nextPaymentAttempt}</b>
      </Text>
      <Text>{t("sendSubscriptionPaymentFailed.paragraph4")}</Text>
    </Layout>
  );
}
