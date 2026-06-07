import { TFunction } from "i18next";

import Layout from "./Layout.server";
import { Heading } from "./ui/Heading";
import { Text } from "./ui/Text";
import { defaultT } from "./utilities.server";

type T_SubscriptionTrialEndingWithBilling = {
  nextPaymentAttempt: string;
  t: TFunction<"emails", undefined>;
};

export default function SubscriptionTrialEndingWithBilling({
  nextPaymentAttempt = "01-01-2025",
  t = defaultT,
}: T_SubscriptionTrialEndingWithBilling) {
  return (
    <Layout footer={{ t }} preview={t("preview")}>
      <Heading>{t("title")}</Heading>
      <Text>{t("sendSubscriptionTrialEndingWithBilling.paragraph1")}</Text>
      <Heading>{t("sendSubscriptionTrialEndingWithBilling.title2")}</Heading>
      <Text>
        {t("sendSubscriptionTrialEndingWithBilling.paragraph2")}{" "}
        <b>{nextPaymentAttempt}</b>
      </Text>
      <Text>{t("sendSubscriptionTrialEndingWithBilling.paragraph3")}</Text>
      <Text>{t("sendSubscriptionTrialEndingWithBilling.paragraph4")}</Text>
    </Layout>
  );
}
