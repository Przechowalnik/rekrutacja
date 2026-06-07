import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { Button } from "~/ui/Button";
import { ButtonWrapper } from "~/ui/ButtonWrapper";
import { Section } from "~/ui/Section";
import { isEnableCreateOrLoginCompany } from "~/utilities/flags";

export const RegistrationPage = () => {
  const { t } = useTranslation(namespaces.registration);

  return (
    <Section
      breadcrumbs={[E_Routes.home, E_Routes.registration]}
      description={t("description")}
      information={t("information")}
      pageMeta={{
        route: E_Routes.registration,
      }}
      size="sm"
      title={t("title")}
    >
      <ButtonWrapper withMobileReverse={false}>
        <Button
          fullWidth
          routeTo={E_Routes.registrationAccount}
          size="lg"
          variant="light"
        >
          {t("buttonRegistrationAccount")}
        </Button>
        {isEnableCreateOrLoginCompany() && (
          <Button
            fullWidth
            routeTo={E_Routes.registrationCompany}
            size="lg"
            variant="light"
          >
            {t("buttonRegistrationCompany")}
          </Button>
        )}
        <Button fullWidth routeTo={E_Routes.login} size="lg" variant="light">
          {t("buttonLogin")}
        </Button>
      </ButtonWrapper>
    </Section>
  );
};
