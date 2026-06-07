import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { useUser } from "~/hooks/useUser";
import { Button } from "~/ui/Button";
import { ButtonArrowLeft } from "~/ui/ButtonArrowLeft";
import { ButtonRefreshUserSession } from "~/ui/ButtonRefreshUserSession";
import { Section } from "~/ui/Section";
import { isFreeListings } from "~/utilities/flags";

export const CompanyPointsPage = () => {
  const { t } = useTranslation(namespaces.companyPoints);
  const { t: tQuestions } = useTranslation(namespaces.questions);
  const { user } = useUser();

  return (
    <Section
      breadcrumbs={[E_Routes.home, E_Routes.company, E_Routes.companyPoints]}
      buttons={
        <>
          <ButtonArrowLeft routeTo={E_Routes.company} textGoBack />
          <ButtonRefreshUserSession />
          {!isFreeListings() && (
            <Button routeTo={E_Routes.companyPointsExchanges}>
              {t("buttonReplace")}
            </Button>
          )}
        </>
      }
      information={t("information", {
        pointsBalance: user?.company?.points?.balance ?? 0,
      })}
      pageMeta={{
        route: E_Routes.companyPoints,
      }}
      questions={[
        {
          description: tQuestions("companyPoints.getPoints.description"),
          title: tQuestions("companyPoints.getPoints.title"),
        },
        {
          description: tQuestions(
            "companyPoints.getSubscriptionFreeDays.description",
          ),
          title: tQuestions("companyPoints.getSubscriptionFreeDays.title"),
        },
        {
          description: tQuestions(
            "companyPoints.pointsInformation.description",
          ),
          title: tQuestions("companyPoints.pointsInformation.title"),
        },
        {
          description: tQuestions(
            "companyPoints.subscriptionStatus.description",
          ),
          title: tQuestions("companyPoints.subscriptionStatus.title"),
        },
        {
          description: tQuestions("companyPoints.billingPeriod.description"),
          title: tQuestions("companyPoints.billingPeriod.title"),
        },
      ]}
      size="md"
      title={t("title")}
      withHTML={false}
      withTextsToUi
    ></Section>
  );
};
