import { TFunction } from "i18next";

import Layout from "./Layout.server";
import { Heading } from "./ui/Heading";
import { Text } from "./ui/Text";
import { defaultT } from "./utilities.server";

type T_SubscriptionCreated = {
  t: TFunction<"emails", undefined>;
};

export default function SubscriptionCreated({
  t = defaultT,
}: T_SubscriptionCreated) {
  return (
    <Layout footer={{ t }} preview={t("preview")}>
      <Heading>{t("title")}</Heading>
      <Text>{t("sendSubscriptionCreated.paragraph1")}</Text>
      <Heading>{t("sendSubscriptionCreated.title2")}</Heading>
      <Text>{t("sendSubscriptionCreated.paragraph2")}</Text>
      <Text>{t("sendSubscriptionCreated.paragraph3")}</Text>
      <Text>{t("sendSubscriptionCreated.paragraph4")}</Text>
    </Layout>
  );
}
