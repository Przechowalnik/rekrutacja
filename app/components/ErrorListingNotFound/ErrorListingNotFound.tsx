import { Center } from "@mantine/core";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { CardInfo } from "~/ui/CardInfo";

export const ErrorListingNotFound = () => {
  const { t } = useTranslation(namespaces.notifications);
  const { t: tCommon } = useTranslation(namespaces.common);

  return (
    <Center inset={0} pos="fixed">
      <CardInfo
        button={{
          link: E_Routes.home,
          text: tCommon("goToHomePage"),
        }}
        description={t("listingNotFound.message")}
        title={t("listingNotFound.title")}
      />
    </Center>
  );
};
