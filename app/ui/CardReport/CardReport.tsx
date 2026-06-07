import { memo } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { T_Report } from "~/models/report";
import { replaceDateToYearMonthHoursMinutesInWordsDay } from "~/utilities/date";

import { Card } from "../Card";
import { Text } from "../Text";

type T_CardReport = {
  report: T_Report;
};

const CardReportToMemoize = ({ report }: T_CardReport) => {
  const { t } = useTranslation(namespaces.common);
  const { getLocalizedRoute } = useLocalizedRoute();

  return (
    <Card
      customButtonLabel={t("cardReport.button")}
      href={
        report?.listingId
          ? getLocalizedRoute({
              extraPath: `/${report.listing?.slug ?? report.listingId}`,
              route: E_Routes.listings,
            })
          : undefined
      }
      isEditable
      minHeight={{
        base: "auto",
        xs: 250,
      }}
      title={t(`reportType.${report.type}`)}
    >
      <Text c="white">
        {t("cardReport.createdAt")}:{" "}
        <b>
          {replaceDateToYearMonthHoursMinutesInWordsDay({
            date: report.createdAt.toString(),
            withNbsp: false,
          })}
        </b>
      </Text>
      {report?.targetCompany?.name && (
        <Text c="white">
          {t("cardReport.companyName")}: <b>{report.targetCompany.name}</b>
        </Text>
      )}
      {report?.targetUser?.email && (
        <Text c="white">
          {t("cardReport.targetUserEmail")}: <b>{report.targetUser.email}</b>
        </Text>
      )}
      {report?.user?.email && (
        <Text c="white">
          {t("cardReport.userEmail")}: <b>{report.user.email}</b>
        </Text>
      )}
      {report?.description && (
        <Text c="white">
          {t("cardReport.description")}: <b>{report.description}</b>
        </Text>
      )}
    </Card>
  );
};

export const CardReport = memo(CardReportToMemoize);
