import { TFunction } from "i18next";

import Layout from "./Layout.server";
import { Code } from "./ui/Code";
import { Heading } from "./ui/Heading";
import { Text } from "./ui/Text";
import { defaultT } from "./utilities.server";

type T_EmailVerified = {
  t: TFunction<"emails", undefined>;
  validationCode: string;
};

export default function EmailVerified({
  t = defaultT,
  validationCode = "000000",
}: T_EmailVerified) {
  return (
    <Layout footer={{ t }} preview={t("preview")}>
      <Heading>{t("title")}</Heading>
      <Text>{t("sendEmailOTPCode.paragraph1")}</Text>
      <Code>{validationCode}</Code>
      <Text />
      <Text>{t("sendEmailOTPCode.paragraph2")}</Text>
      <Text>{t("footerParagraph")}</Text>
    </Layout>
  );
}
