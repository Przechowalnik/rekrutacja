import { TFunction } from "i18next";

import Layout from "./Layout.server";
import { Heading } from "./ui/Heading";
import { Text } from "./ui/Text";
import { defaultT } from "./utilities.server";

type T_SendInvoice = {
  t: TFunction<"emails", undefined>;
};

export default function SendInvoice({ t = defaultT }: T_SendInvoice) {
  return (
    <Layout footer={{ t }} preview={t("preview")}>
      <Heading>{t("title")}</Heading>
      <Text>{t("sendInvoice.paragraph1")}</Text>
      <Text>{t("sendInvoice.paragraph2")}</Text>
      <Text />
      <Text>{t("footerParagraph")}</Text>
    </Layout>
  );
}
