import { Flex } from "@mantine/core";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { formNames } from "~/lib/zodFormValidator";
import type { T_PlatformSetting } from "~/models/platformSetting";
import { Button } from "~/ui/Button";
import { ButtonArrowLeft } from "~/ui/ButtonArrowLeft";
import { CardNoData } from "~/ui/CardNoData";
import { Input } from "~/ui/Input";
import { InputWrapper } from "~/ui/InputWrapper";
import { Section } from "~/ui/Section";
import { SelectPlanType } from "~/ui/SelectPlanType";

export const AdminPlatformSettingsPage = ({
  platformSetting,
}: {
  platformSetting: null | T_PlatformSetting;
}) => {
  const { t } = useTranslation(namespaces.adminSettings);

  return (
    <Section
      breadcrumbs={[E_Routes.home, E_Routes.admin, E_Routes.adminSettings]}
      buttons={
        <>
          <ButtonArrowLeft routeTo={E_Routes.admin} textGoBack />
          {!platformSetting && (
            <Button routeTo={E_Routes.adminSettingNew}>{t("buttonNew")}</Button>
          )}
          {platformSetting && (
            <Button routeTo={E_Routes.adminSettingEdit}>
              {t("buttonEdit")}
            </Button>
          )}
        </>
      }
      pageMeta={{
        route: E_Routes.adminSettings,
      }}
      size="md"
      title={t("title")}
    >
      {platformSetting && (
        <InputWrapper>
          <Input
            disabled
            disabledWithOpacity={false}
            name={formNames.pointsReferralUser}
            required={false}
            value={platformSetting.pointsReferralUser}
          />
          <Input
            disabled
            disabledWithOpacity={false}
            name={formNames.pointsReferralCompany}
            required={false}
            value={platformSetting.pointsReferralCompany}
          />
          <Input
            disabled
            disabledWithOpacity={false}
            name={formNames.pointsSmallBug}
            required={false}
            value={platformSetting.pointsSmallBug}
          />
          <Input
            disabled
            disabledWithOpacity={false}
            name={formNames.pointsMediumBug}
            required={false}
            value={platformSetting.pointsMediumBug}
          />
          <Input
            disabled
            disabledWithOpacity={false}
            name={formNames.pointsBigBug}
            required={false}
            value={platformSetting.pointsBigBug}
          />
          <SelectPlanType
            defaultValue={platformSetting.planFreeTrialCompany.type}
            disabled
            disabledWithOpacity={false}
            label={t("planFreeTrialCompany")}
            required={false}
          />
          <Input
            disabled
            disabledWithOpacity={false}
            name={formNames.freeTrialCompanyMonthsCount}
            required={false}
            value={platformSetting.freeTrialCompanyMonthsCount}
          />
          <Input
            disabled
            disabledWithOpacity={false}
            name={formNames.freeTrialMaxListings}
            required={false}
            value={platformSetting.freeTrialMaxListings}
          />
        </InputWrapper>
      )}
      {!platformSetting && (
        <Flex align="center" justify="center">
          <CardNoData description={t("noPlatformSettings")} />
        </Flex>
      )}
    </Section>
  );
};
