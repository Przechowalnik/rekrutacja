import { TFunction } from "i18next";

import Layout from "./Layout.server";
import { Heading } from "./ui/Heading";
import { Text } from "./ui/Text";
import { defaultT } from "./utilities.server";

type T_EmailVerified = {
  t: TFunction<"emails", undefined>;
};

export default function EmailVerified({ t = defaultT }: T_EmailVerified) {
  return (
    <Layout footer={{ t }} preview={t("preview")}>
      <Heading>{t("sendEmailIsVerified.title")}</Heading>
      <Text>{t("sendEmailIsVerified.paragraph1")}</Text>
      <Text>{t("sendEmailIsVerified.paragraph2")}</Text>
      <Text>{t("sendEmailIsVerified.paragraph3")}</Text>
    </Layout>
  );
}
