import { TFunction } from "i18next";

import Layout from "./Layout.server";
import { Code } from "./ui/Code";
import { Heading } from "./ui/Heading";
import { Text } from "./ui/Text";
import { defaultT } from "./utilities.server";

type T_NewEmailCode = {
  t: TFunction<"emails", undefined>;
  validationCode: string;
};

export default function NewEmailCode({
  t = defaultT,
  validationCode = "000000",
}: T_NewEmailCode) {
  return (
    <Layout footer={{ t }} preview={t("preview")}>
      <Heading>{t("title")}</Heading>
      <Text>{t("sendVerifiedNewEmail.paragraph1")}</Text>
      <Code>{validationCode}</Code>
      <Text />
      <Text>{t("sendVerifiedNewEmail.paragraph2")}</Text>
      <Text>{t("footerParagraph")}</Text>
    </Layout>
  );
}
