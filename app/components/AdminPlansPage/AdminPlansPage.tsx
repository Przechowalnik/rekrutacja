import { Flex } from "@mantine/core";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import type { T_Plans } from "~/models/plans";
import { Button } from "~/ui/Button";
import { ButtonArrowLeft } from "~/ui/ButtonArrowLeft";
import { CardAdminPlan } from "~/ui/CardAdminPlan";
import { CardNoData } from "~/ui/CardNoData";
import { Section } from "~/ui/Section";

type T_AdminPlansPage = {
  plans: T_Plans;
};

export const AdminPlansPage = ({ plans }: T_AdminPlansPage) => {
  const { t } = useTranslation(namespaces.adminPlans);

  const mapPlans = plans.map(item => {
    return <CardAdminPlan key={`plan_${item.id}`} {...item} />;
  });

  return (
    <Section
      breadcrumbs={[E_Routes.home, E_Routes.admin, E_Routes.adminPlans]}
      buttons={
        <>
          <ButtonArrowLeft routeTo={E_Routes.admin} textGoBack />
          <Button routeTo={E_Routes.adminPlanNew}>{t("buttonNew")}</Button>
        </>
      }
      pageMeta={{
        route: E_Routes.adminPlans,
      }}
      title={t("title")}
    >
      <Flex align="center" gap={24} justify="center" wrap="wrap">
        {mapPlans.length === 0 && <CardNoData description={t("noPlans")} />}
        {mapPlans.length > 0 && mapPlans}
      </Flex>
    </Section>
  );
};
