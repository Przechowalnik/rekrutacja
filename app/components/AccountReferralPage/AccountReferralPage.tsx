import { Center, Flex } from "@mantine/core";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import QRCode from "react-qr-code";

import { namespaces } from "~/constants/namespaces";
import { queryKey } from "~/constants/queryAndHashes";
import { E_Routes } from "~/constants/routes";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { useSubmitWithActions } from "~/hooks/useSubmitWithActions";
import { useUser } from "~/hooks/useUser";
import { E_Roles } from "~/models/enums";
import type { T_PlatformSetting } from "~/models/platformSetting";
import type { T_Referral } from "~/models/referral";
import { Button } from "~/ui/Button";
import { ButtonArrowLeft } from "~/ui/ButtonArrowLeft";
import { CardCode } from "~/ui/CardCode";
import { CardNoData } from "~/ui/CardNoData";
import { Section } from "~/ui/Section";
import { TextRow } from "~/ui/TextRow";
import { Title } from "~/ui/Title";

type T_AccountReferralPage = {
  platformSetting: T_PlatformSetting;
  referral: null | T_Referral;
};

export const AccountReferralPage = ({
  platformSetting,
  referral,
}: T_AccountReferralPage) => {
  const [linkRegistrationAccount, setLinkRegistrationAccount] = useState<
    null | string
  >(null);
  const [linkRegistrationCompany, setLinkRegistrationCompany] = useState<
    null | string
  >(null);
  const [qrCodeIsReady, setQrCodeIsReady] = useState(false);

  const { t } = useTranslation(namespaces.accountReferral);
  const { t: tCommon } = useTranslation(namespaces.common);
  const { user } = useUser();
  const submit = useSubmitWithActions();
  const { getLocalizedRoute } = useLocalizedRoute();

  const accessToCreateReferral = user?.role === E_Roles.USER && !referral?.code;

  useEffect(() => {
    setQrCodeIsReady(true);
  }, []);

  useEffect(() => {
    if (!referral?.code) {
      return;
    }

    setLinkRegistrationAccount(
      `${globalThis.location.origin}${getLocalizedRoute({
        extraQuery: {
          [queryKey.referralCode]: referral?.code,
        },
        route: E_Routes.registrationAccount,
      })}`,
    );

    setLinkRegistrationCompany(
      `${globalThis.location.origin}${getLocalizedRoute({
        extraQuery: {
          [queryKey.referralCode]: referral?.code,
        },
        route: E_Routes.registrationCompany,
      })}`,
    );
  }, [referral]);

  const handleCreateReferral = useCallback(() => {
    if (!accessToCreateReferral) {
      return;
    }

    submit(null, {
      action: getLocalizedRoute({
        route: E_Routes.accountReferral,
      }),
      method: "post",
    });
  }, [user]);

  const handlePrintQrCode = useCallback(() => {
    globalThis.print();
  }, []);

  const { planFreeTrialCompany, pointsReferralCompany, pointsReferralUser } =
    platformSetting;

  let validPointsReferralUser = 0;
  let validPointsReferralCompany = 0;
  let validPlanFreeTrialCompany = "-";

  if (typeof pointsReferralUser === "number") {
    validPointsReferralUser = pointsReferralUser;
  }

  if (typeof pointsReferralCompany === "number") {
    validPointsReferralCompany = pointsReferralCompany;
  }

  if (planFreeTrialCompany) {
    validPlanFreeTrialCompany = tCommon(
      `plansType.${planFreeTrialCompany.type}`,
    );
  }

  return (
    <Section
      breadcrumbs={[E_Routes.home, E_Routes.account, E_Routes.accountReferral]}
      buttons={
        <>
          <ButtonArrowLeft routeTo={E_Routes.account} textGoBack />
          {accessToCreateReferral && (
            <Button onClick={handleCreateReferral}>{t("buttonNew")}</Button>
          )}
        </>
      }
      description={t("description", {
        planFreeTrialCompany: validPlanFreeTrialCompany,
        pointsReferralCompany: validPointsReferralCompany,
        pointsReferralUser: validPointsReferralUser,
      })}
      information={t("information")}
      pageMeta={{
        route: E_Routes.accountReferral,
      }}
      size="md"
      title={t("title")}
      withHTML
    >
      {referral?.code && (
        <>
          <Title center mb={12} order={3}>
            {t("titleCode")}:
          </Title>
          <Center mb={48}>
            <CardCode code={referral?.code} />
          </Center>
          <div className="printable">
            <Title center mb={12} order={3}>
              {t("titleQrCodeAccount")}:
            </Title>
            <Center h={160} mb={12}>
              {qrCodeIsReady && linkRegistrationAccount && (
                <QRCode level="L" size={160} value={linkRegistrationAccount} />
              )}
            </Center>
            <Center className="noPrint" visibleFrom="xs">
              <Button onClick={handlePrintQrCode} variant="light">
                {t("buttonPrintQrCode")}
              </Button>
            </Center>
            <Title center mb={12} mt={48} order={3}>
              {t("titleQrCodeCompany")}:
            </Title>
            <Center h={160} mb={12}>
              {qrCodeIsReady && linkRegistrationCompany && (
                <QRCode level="L" size={160} value={linkRegistrationCompany} />
              )}
            </Center>
            <Center className="noPrint" visibleFrom="xs">
              <Button onClick={handlePrintQrCode} variant="light">
                {t("buttonPrintQrCode")}
              </Button>
            </Center>
          </div>
          <Title center mb={12} mt={48} order={2}>
            {t("titleStatistics")}:
          </Title>
          <Center>
            <TextRow
              items={[
                {
                  description: referral?.countCompanies?.toString() ?? "0",
                  title: t("referralCompanies"),
                },
                {
                  description: referral?.countUsers?.toString() ?? "0",
                  title: t("referralUsers"),
                },
              ]}
              textToRight
              w={250}
            />
          </Center>
        </>
      )}
      {!referral?.code && (
        <Flex align="center" justify="center">
          <CardNoData description={t("noActiveReferral")} />
        </Flex>
      )}
    </Section>
  );
};
