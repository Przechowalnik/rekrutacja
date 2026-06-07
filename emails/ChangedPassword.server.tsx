import { TFunction } from "i18next";

import Layout from "./Layout.server";
import { Heading } from "./ui/Heading";
import { Text } from "./ui/Text";
import { defaultT } from "./utilities.server";

type T_ChangedPassword = {
  t: TFunction<"emails", undefined>;
};

export default function ChangedPassword({ t = defaultT }: T_ChangedPassword) {
  return (
    <Layout footer={{ t }} preview={t("preview")}>
      <Heading>{t("title")}</Heading>
      <Text>{t("sendChangedPassword.paragraph1")}</Text>
      <Text />
      <Text>{t("footerParagraph")}</Text>
    </Layout>
  );
}
