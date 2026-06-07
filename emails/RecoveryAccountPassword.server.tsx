import { TFunction } from "i18next";

import Layout from "./Layout.server";
import { Heading } from "./ui/Heading";
import { Link } from "./ui/Link";
import { Text } from "./ui/Text";
import { defaultT } from "./utilities.server";

type T_RecoveryAccountPassword = {
  recoveryLink: string;
  t: TFunction<"emails", undefined>;
};

export default function RecoveryAccountPassword({
  recoveryLink = "",
  t = defaultT,
}: T_RecoveryAccountPassword) {
  return (
    <Layout footer={{ t }} preview={t("preview")}>
      <Heading>{t("title")}</Heading>
      <Text>{t("sendRecoveryAccountPassword.paragraph1")}</Text>
      <Text>{t("sendRecoveryAccountPassword.paragraph2")}</Text>
      <Link href={recoveryLink}>
        {t("sendRecoveryAccountPassword.paragraph3")}
      </Link>
      <Text />
      <Text>{t("footerParagraph")}</Text>
    </Layout>
  );
}
