import { Flex } from "@mantine/core";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { useUser } from "~/hooks/useUser";
import type { T_CompanyWorkers } from "~/models/company/companyWorkers";
import { E_CompanyWorkerPermissions, E_Roles } from "~/models/enums";
import { Button } from "~/ui/Button";
import { ButtonArrowLeft } from "~/ui/ButtonArrowLeft";
import { CardWorker } from "~/ui/CardWorker";
import { Section } from "~/ui/Section";

type T_CompanyWorkersPage = {
  companyWorkers: T_CompanyWorkers;
};

export const CompanyWorkersPage = ({
  companyWorkers,
}: T_CompanyWorkersPage) => {
  const { t } = useTranslation(namespaces.companyWorkers);
  const { user } = useUser();

  const mapWorkers = companyWorkers?.map(item => {
    return <CardWorker companyWorker={item} key={`worker_${item.id}`} />;
  });

  return (
    <Section
      breadcrumbs={[E_Routes.home, E_Routes.company, E_Routes.companyWorkers]}
      buttons={
        <>
          <ButtonArrowLeft routeTo={E_Routes.company} textGoBack />
          {(user?.role === E_Roles.B2B_OWNER ||
            user?.workerSettings?.permissions?.includes(
              E_CompanyWorkerPermissions.MANAGE_WORKERS,
            )) && (
            <Button routeTo={E_Routes.companyWorkerNew}>
              {t("buttonNew")}
            </Button>
          )}
        </>
      }
      description={t("description")}
      pageMeta={{
        route: E_Routes.companyWorkers,
      }}
      size="lg"
      title={t("title")}
    >
      <Flex align="center" gap={12} justify="center" wrap="wrap">
        {mapWorkers}
      </Flex>
    </Section>
  );
};
