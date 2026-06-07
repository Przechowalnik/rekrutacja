import { Flex } from "@mantine/core";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import type { T_Exchanges } from "~/models/exchanges";
import { Button } from "~/ui/Button";
import { ButtonArrowLeft } from "~/ui/ButtonArrowLeft";
import { CardAdminExchange } from "~/ui/CardAdminExchange";
import { CardNoData } from "~/ui/CardNoData";
import { Section } from "~/ui/Section";

type T_AdminExchangePage = {
  exchanges: T_Exchanges;
};

export const AdminExchangePage = ({ exchanges }: T_AdminExchangePage) => {
  const { t } = useTranslation(namespaces.adminExchanges);

  const mapExchanges = exchanges.map(item => {
    return <CardAdminExchange key={`exchange_${item.id}`} {...item} />;
  });

  return (
    <Section
      breadcrumbs={[E_Routes.home, E_Routes.admin, E_Routes.adminExchanges]}
      buttons={
        <>
          <ButtonArrowLeft routeTo={E_Routes.admin} textGoBack />
          <Button routeTo={E_Routes.adminExchangesNew}>{t("buttonNew")}</Button>
        </>
      }
      pageMeta={{
        route: E_Routes.adminExchanges,
      }}
      title={t("title")}
    >
      <Flex align="center" gap={24} justify="center" wrap="wrap">
        {mapExchanges?.length === 0 && (
          <CardNoData description={t("noPlans")} />
        )}
        {mapExchanges?.length > 0 && mapExchanges}
      </Flex>
    </Section>
  );
};
