import { Flex } from "@mantine/core";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import type { T_Bugs } from "~/models/bugs";
import { Button } from "~/ui/Button";
import { ButtonArrowLeft } from "~/ui/ButtonArrowLeft";
import { CardBug } from "~/ui/CardBug";
import { CardNoData } from "~/ui/CardNoData";
import { Section } from "~/ui/Section";

type T_ReusableBugsPage = {
  bugs: T_Bugs;
  isCompany?: boolean;
};

export const ReusableBugsPage = ({ bugs, isCompany }: T_ReusableBugsPage) => {
  const { t: tQuestions } = useTranslation(namespaces.questions);
  const { t } = useTranslation(
    isCompany ? namespaces.companyBugs : namespaces.accountBugs,
  );

  const mapBugs = bugs?.map((item, index) => {
    return (
      <CardBug
        bug={item}
        index={bugs?.length - (index + 1)}
        isCompany={isCompany}
        key={`bug_${item.id}`}
      />
    );
  });

  return (
    <Section
      breadcrumbs={
        isCompany
          ? [E_Routes.home, E_Routes.company, E_Routes.companyBugs]
          : [E_Routes.home, E_Routes.account, E_Routes.accountBugs]
      }
      buttons={
        <>
          <ButtonArrowLeft
            routeTo={isCompany ? E_Routes.company : E_Routes.account}
            textGoBack
          />
          <Button routeTo={E_Routes.accountBugNew}>{t("buttonSave")}</Button>
        </>
      }
      description={t("description")}
      pageMeta={{
        route: isCompany ? E_Routes.companyBugs : E_Routes.accountBugs,
      }}
      questions={[
        {
          description: tQuestions("accountBugs.whenYouGetPoints.description"),
          title: tQuestions("accountBugs.whenYouGetPoints.title"),
        },
        {
          description: tQuestions("accountBugs.pointsPerBug.description", {
            points1: 5,
            points2: 20,
            points3: 100,
          }),
          title: tQuestions("accountBugs.pointsPerBug.title"),
        },
      ]}
      size="lg"
      title={t("title")}
      withHTML={false}
      withTextsToUi
    >
      <Flex align="center" gap={8} justify="center" wrap="wrap">
        {bugs?.length > 0 && mapBugs}
        {bugs?.length === 0 && <CardNoData description={t("noData")} />}
      </Flex>
    </Section>
  );
};
