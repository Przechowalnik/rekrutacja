import { memo } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import type { T_Bug } from "~/models/bug";
import { replaceDateToYearMonthInWordsDay } from "~/utilities/date";

import { Card } from "../Card";
import { Text } from "../Text";
import { generateColor } from "./utilities";

type T_CardBug = {
  bug: T_Bug;
  index: number;
  isAdmin?: boolean;
  isCompany?: boolean;
};

const CardBugToMemoize = ({ bug, index, isAdmin, isCompany }: T_CardBug) => {
  const { t } = useTranslation(namespaces.common);
  const { getLocalizedRoute } = useLocalizedRoute();

  const generatedColor = generateColor(bug);

  const bugRoute = (() => {
    if (isCompany) {
      return E_Routes.companyBugDetails;
    }
    if (isAdmin) {
      return E_Routes.adminBugDetails;
    }
    return E_Routes.accountBugDetails;
  })();

  return (
    <Card
      color={generatedColor}
      customButtonLabel={t("cardBug.button")}
      href={getLocalizedRoute({
        extraPath: `/${bug.id}`,
        route: bugRoute,
      })}
      isEditable
      minHeight={{
        base: "auto",
        xs: 250,
      }}
      title={`${t("cardBug.application")}: #${index + 1}`}
    >
      <Text c="white">
        {t("cardBug.status")}: <b>{t(`bugStatus.${bug.status}`)}</b>
      </Text>
      <Text c="white">
        {t("cardBug.date")}:{" "}
        <b>{replaceDateToYearMonthInWordsDay(bug.timestamp.toString())}</b>
      </Text>
      {isCompany && bug.companyId && (
        <Text c="white">
          {t("cardBug.prize")}:{" "}
          <b>
            {t(
              bug.pointsPaidAt ? "cardBug.pointsPaid" : "cardBug.pointsNoPaid",
            )}
          </b>
        </Text>
      )}
    </Card>
  );
};

export const CardBug = memo(CardBugToMemoize);
