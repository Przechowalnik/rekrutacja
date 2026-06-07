import { Flex } from "@mantine/core";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import type { T_Coupons } from "~/models/coupons";
import { Button } from "~/ui/Button";
import { ButtonArrowLeft } from "~/ui/ButtonArrowLeft";
import { CardAdminCoupon } from "~/ui/CardAdminCoupon";
import { CardNoData } from "~/ui/CardNoData";
import { Section } from "~/ui/Section";

type T_AdminCouponsPage = {
  coupons: T_Coupons;
};

export const AdminCouponsPage = ({ coupons }: T_AdminCouponsPage) => {
  const { t } = useTranslation(namespaces.adminCoupons);

  const mapCoupons = coupons?.map(item => {
    return <CardAdminCoupon key={`plan_${item.id}`} {...item} />;
  });

  return (
    <Section
      breadcrumbs={[E_Routes.home, E_Routes.admin, E_Routes.adminPlans]}
      buttons={
        <>
          <ButtonArrowLeft routeTo={E_Routes.admin} textGoBack />
          <Button routeTo={E_Routes.adminCouponNew}>{t("buttonNew")}</Button>
        </>
      }
      pageMeta={{
        route: E_Routes.adminPlans,
      }}
      title={t("title")}
    >
      <Flex align="center" gap={24} justify="center" wrap="wrap">
        {mapCoupons.length === 0 && <CardNoData description={t("noCoupons")} />}
        {mapCoupons.length > 0 && mapCoupons}
      </Flex>
    </Section>
  );
};
