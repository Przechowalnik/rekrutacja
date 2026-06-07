import { TFunction } from "i18next";

import Layout from "./Layout.server";
import { Code } from "./ui/Code";
import { Heading } from "./ui/Heading";
import { Text } from "./ui/Text";
import { defaultT } from "./utilities.server";

type T_LoginCodeEmail = {
  t: TFunction<"emails", undefined>;
  validationCode: string;
};

export default function LoginCodeEmail({
  t = defaultT,
  validationCode = "000000",
}: T_LoginCodeEmail) {
  return (
    <Layout footer={{ t }} preview={t("preview")}>
      <Heading>{t("sendVerifiedEmail.title")}</Heading>
      <Text>{t("sendVerifiedEmail.paragraph1")}</Text>
      <Code>{validationCode}</Code>
      <Text />
      <Text>{t("sendVerifiedEmail.paragraph2")}</Text>
      <Text>{t("sendVerifiedEmail.paragraph3")}</Text>
    </Layout>
  );
}
