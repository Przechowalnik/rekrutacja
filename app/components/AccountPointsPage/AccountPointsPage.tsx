import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { useUser } from "~/hooks/useUser";
import { ButtonArrowLeft } from "~/ui/ButtonArrowLeft";
import { Section } from "~/ui/Section";

export const AccountPointsPage = () => {
  const { t } = useTranslation(namespaces.accountPoints);
  const { t: tQuestions } = useTranslation(namespaces.questions);
  const { user } = useUser();

  return (
    <Section
      breadcrumbs={[E_Routes.home, E_Routes.account, E_Routes.accountPoints]}
      buttons={<ButtonArrowLeft routeTo={E_Routes.account} textGoBack />}
      information={t("information", {
        pointsBalance: user?.points?.balance ?? 0,
      })}
      pageMeta={{
        route: E_Routes.accountPoints,
      }}
      questions={[
        {
          description: tQuestions("companyPoints.getPoints.description"),
          title: tQuestions("companyPoints.getPoints.title"),
        },
        {
          description: tQuestions(
            "companyPoints.pointsInformation.description",
          ),
          title: tQuestions("companyPoints.pointsInformation.title"),
        },
      ]}
      size="md"
      title={t("title")}
      withHTML={false}
      withTextsToUi
    ></Section>
  );
};
