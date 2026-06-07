import { Flex } from "@mantine/core";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { useUser } from "~/hooks/useUser";
import { E_SubscriptionStatus } from "~/models/enums";
import { Button } from "~/ui/Button";
import { ButtonArrowLeft } from "~/ui/ButtonArrowLeft";
import { ButtonRefreshUserSession } from "~/ui/ButtonRefreshUserSession";
import { CardFreeTrial } from "~/ui/CardFreeTrial";
import { CardNoData } from "~/ui/CardNoData";
import { CardSubscription } from "~/ui/CardSubscription";
import { Section } from "~/ui/Section";

export const CompanySubscriptionsPage = () => {
  const { t } = useTranslation(namespaces.companySubscriptions);
  const { t: tQuestions } = useTranslation(namespaces.questions);
  const { user } = useUser();

  const filterActiveSubscription =
    user?.company?.subscriptions?.filter(
      item => item.status !== E_SubscriptionStatus.CANCELLED,
    ) ?? [];

  const mapActiveSubscriptions = filterActiveSubscription?.map(item => {
    return <CardSubscription {...item} key={`subscription_${item.id}`} />;
  });

  const isExtraFreeDaysInCurrentPeriodInCurrentSubscription =
    filterActiveSubscription.some(item => item.extraFreeDaysInCurrentPeriod);

  return (
    <Section
      alert={
        isExtraFreeDaysInCurrentPeriodInCurrentSubscription
          ? t("alert")
          : undefined
      }
      breadcrumbs={[
        E_Routes.home,
        E_Routes.company,
        E_Routes.companySubscriptions,
      ]}
      buttons={
        <>
          <ButtonArrowLeft routeTo={E_Routes.company} textGoBack />
          <ButtonRefreshUserSession />
          <Button
            disabled={filterActiveSubscription.length > 0}
            routeTo={E_Routes.companySubscriptionNew}
            tooltip={{
              label: t("existingSubscription"),
            }}
          >
            {t("buttonNew")}
          </Button>
        </>
      }
      description={t("description")}
      pageMeta={{
        route: E_Routes.companySubscriptions,
      }}
      questions={[
        {
          description: tQuestions(
            "companySubscriptions.maximumSubscriptions.description",
          ),
          title: tQuestions("companySubscriptions.maximumSubscriptions.title"),
        },
        {
          description: tQuestions(
            "companySubscriptions.replacePointsToFreeDaysInSubscription.description",
          ),
          title: tQuestions(
            "companySubscriptions.replacePointsToFreeDaysInSubscription.title",
          ),
        },
        {
          description: tQuestions(
            "companySubscriptions.freeSubscriptionDaysWithoutSubscription.description",
          ),
          title: tQuestions(
            "companySubscriptions.freeSubscriptionDaysWithoutSubscription.title",
          ),
        },
        {
          description: tQuestions(
            "companySubscriptions.newSubscriptionOnActiveFreeTrial.description",
          ),
          title: tQuestions(
            "companySubscriptions.newSubscriptionOnActiveFreeTrial.title",
          ),
        },
      ]}
      size="md"
      title={t("title")}
      withHTML={false}
      withTextsToUi
    >
      {mapActiveSubscriptions.length === 0 && !user?.company?.freeTrial && (
        <Flex align="center" justify="center">
          <CardNoData description={t("noSubscriptions")} />
        </Flex>
      )}
      <Flex align="center" direction="column" gap={24} justify="center">
        <CardFreeTrial />
        {mapActiveSubscriptions}
      </Flex>
    </Section>
  );
};
