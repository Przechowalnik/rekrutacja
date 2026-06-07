import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { E_Routes, routesExtra } from "~/constants/routes";
import { useCompanyWorker } from "~/hooks/useCompanyWorker";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { useUser } from "~/hooks/useUser";
import { E_CompanyWorkerPermissions, E_Roles } from "~/models/enums";
import { Button } from "~/ui/Button";
import { ButtonArrowLeft } from "~/ui/ButtonArrowLeft";
import { ButtonWrapper } from "~/ui/ButtonWrapper";
import { Link } from "~/ui/Link";
import { Section } from "~/ui/Section";

export const CompanyWorkerPage = () => {
  const { t } = useTranslation(namespaces.companyWorker);
  const { user } = useUser();
  const { companyWorker } = useCompanyWorker();
  const { getLocalizedRoute } = useLocalizedRoute();

  if (!companyWorker) {
    return;
  }

  return (
    <Section
      breadcrumbs={[
        E_Routes.home,
        E_Routes.company,
        E_Routes.companyWorkers,
        {
          customHref: getLocalizedRoute({
            extraPath: `/${companyWorker?.id}`,
            route: E_Routes.companyWorkerEdit,
          }),
          customTitle: `${companyWorker?.firstName ?? ""}${companyWorker.lastName ? ` ${companyWorker.lastName.at(0)}.` : ""}`,
        },
      ]}
      buttons={<ButtonArrowLeft routeTo={E_Routes.companyWorkers} textGoBack />}
      pageMeta={{
        route: E_Routes.companyWorkerEdit,
      }}
      size="md"
      title={`${t("title")}</br>${companyWorker?.firstName ?? ""}${companyWorker.lastName ? ` ${companyWorker.lastName}` : ""}`}
      withHTML
    >
      <ButtonWrapper withMobileReverse={false}>
        <Link
          fullWidth
          to={getLocalizedRoute({
            extraPath: `/${companyWorker.id}${routesExtra[E_Routes.companyWorkerEdit].profile}`,
            route: E_Routes.companyWorkerEdit,
          })}
        >
          <Button fullWidth size="lg" variant="light">
            {companyWorker?.role === E_Roles.B2B_OWNER
              ? t("buttonProfileOwner")
              : t("buttonProfile")}
          </Button>
        </Link>
        {companyWorker?.role !== E_Roles.B2B_OWNER &&
          user?.role === E_Roles.B2B_OWNER && (
            <Link
              fullWidth
              to={getLocalizedRoute({
                extraPath: `/${companyWorker.id}${routesExtra[E_Routes.companyWorkerEdit].permissions}`,
                route: E_Routes.companyWorkerEdit,
              })}
            >
              <Button fullWidth size="lg" variant="light">
                {t("buttonRole")}
              </Button>
            </Link>
          )}
        {user?.id !== companyWorker?.id &&
          companyWorker?.role === E_Roles.B2B_WORKER &&
          (user?.role === E_Roles.B2B_OWNER ||
            user?.workerSettings?.permissions?.includes(
              E_CompanyWorkerPermissions.MANAGE_WORKERS,
            )) && (
            <Link
              fullWidth
              to={getLocalizedRoute({
                extraPath: `/${companyWorker.id}${routesExtra[E_Routes.companyWorkerEdit].delete}`,
                route: E_Routes.companyWorkerEdit,
              })}
            >
              <Button color="red" fullWidth size="lg" variant="light">
                {t("buttonDeleteAccount")}
              </Button>
            </Link>
          )}
      </ButtonWrapper>
    </Section>
  );
};
