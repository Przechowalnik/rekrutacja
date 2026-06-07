import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { useUser } from "~/hooks/useUser";
import { E_CompanyWorkerPermissions, E_Roles } from "~/models/enums";
import { Button } from "~/ui/Button";
import { ButtonRefreshUserSession } from "~/ui/ButtonRefreshUserSession";
import { ButtonWrapper } from "~/ui/ButtonWrapper";
import { Fieldset } from "~/ui/Fieldset";
import { Section } from "~/ui/Section";
import { isFreeListings } from "~/utilities/flags";

const PADDING_BUTTONS = 8;
const PADDING_FIELDSET = 10;

export const CompanyPage = () => {
  const { t } = useTranslation(namespaces.company);
  const { t: tCommon } = useTranslation(namespaces.common);
  const { logout, refreshData, user } = useUser();

  const isFreeListingConfiguration = isFreeListings();

  const userHasEmailVerified = user?.emailVerification?.verifiedAt;
  const companyHasPhoneVerified = user?.company?.phone?.verifiedAt;

  const disabledButtonListingNew = user?.company
    ? !user?.company?.phone?.verifiedAt
    : !user?.phone?.verifiedAt;

  const handleOpenConfirmEmail = useCallback(() => {
    refreshData();
  }, []);

  const handleLogout = useCallback(async () => {
    await logout();
  }, [logout]);

  if (!user?.company) {
    return null;
  }

  const getAlertMessage = (() => {
    if (!userHasEmailVerified) {
      return tCommon("alertVerifyEmailToUnlockFeatures");
    }

    if (!companyHasPhoneVerified) {
      return tCommon("alertVerifyPhoneToUnlockCompanyFeatures");
    }

    return;
  })();

  return (
    <Section
      alert={getAlertMessage}
      breadcrumbs={[E_Routes.home, E_Routes.company]}
      pageMeta={{
        route: E_Routes.company,
      }}
      px={0}
      scrollToPositionBefore
      size="md"
      title={user?.company?.name}
    >
      <ButtonWrapper withMobileReverse={false} withTopPadding={false}>
        {userHasEmailVerified && companyHasPhoneVerified ? (
          <>
            <Fieldset legend={t("fieldsetListings")} p={PADDING_FIELDSET}>
              {(user?.workerSettings?.permissions?.includes(
                E_CompanyWorkerPermissions.MANAGE_LISTINGS,
              ) ||
                user?.role === E_Roles.B2B_OWNER) && (
                <Button
                  disabled={disabledButtonListingNew}
                  fullWidth
                  px={PADDING_BUTTONS}
                  routeTo={E_Routes.companyListingsNew}
                  size="lg"
                  tooltip={{
                    label: user?.company
                      ? tCommon("navigation.tooltipNewListingDisabledCompany")
                      : tCommon("navigation.tooltipNewListingDisabledAccount"),
                  }}
                  variant="filled"
                >
                  {t("buttonAddListings")}
                </Button>
              )}
              <Button
                fullWidth
                px={PADDING_BUTTONS}
                routeTo={E_Routes.companyListings}
                size="lg"
                variant="light"
              >
                {t("buttonListings")}
              </Button>
            </Fieldset>
            {user?.role === E_Roles.B2B_OWNER && (
              <Fieldset legend={t("fieldsetPayments")} p={PADDING_FIELDSET}>
                {!isFreeListingConfiguration && (
                  <Button
                    fullWidth
                    px={PADDING_BUTTONS}
                    routeTo={E_Routes.companySubscriptions}
                    size="lg"
                    variant="light"
                  >
                    {t("buttonSubscriptions")}
                  </Button>
                )}
                <Button
                  fullWidth
                  px={PADDING_BUTTONS}
                  routeTo={E_Routes.companyInvoices}
                  size="lg"
                  variant="light"
                >
                  {t("buttonInvoices")}
                </Button>
                <Button
                  fullWidth
                  px={PADDING_BUTTONS}
                  routeTo={E_Routes.companyPoints}
                  size="lg"
                  variant="light"
                >
                  {t("buttonPoints")}
                </Button>
                {!isFreeListingConfiguration && (
                  <Button
                    fullWidth
                    px={PADDING_BUTTONS}
                    routeTo={E_Routes.companyCard}
                    size="lg"
                    variant="light"
                  >
                    {user?.company?.stripe?.customerHasCard
                      ? t("buttonCardUpdate")
                      : t("buttonAddCard")}
                  </Button>
                )}
              </Fieldset>
            )}
            <Fieldset legend={t("fieldsetSettings")} p={PADDING_FIELDSET}>
              <Button
                fullWidth
                px={PADDING_BUTTONS}
                routeTo={E_Routes.companyWorkers}
                size="lg"
                variant="light"
              >
                {t("buttonWorkers")}
              </Button>
              {user?.role === E_Roles.B2B_OWNER && (
                <>
                  <Button
                    fullWidth
                    px={PADDING_BUTTONS}
                    routeTo={E_Routes.companyProfile}
                    size="lg"
                    variant="light"
                  >
                    {t("buttonProfile")}
                  </Button>
                  <Button
                    fullWidth
                    px={PADDING_BUTTONS}
                    routeTo={E_Routes.companyPhone}
                    size="lg"
                    variant="light"
                  >
                    {t("buttonChangeCompanyPhone")}
                  </Button>
                  <Button
                    fullWidth
                    px={PADDING_BUTTONS}
                    routeTo={E_Routes.companySettings}
                    size="lg"
                    variant="light"
                  >
                    {t("buttonSettings")}
                  </Button>
                </>
              )}
            </Fieldset>
            <Fieldset legend={t("fieldsetOthers")} p={PADDING_FIELDSET}>
              <Button
                fullWidth
                px={PADDING_BUTTONS}
                routeTo={E_Routes.companyReferral}
                size="lg"
                variant="light"
              >
                {t("buttonReferral")}
              </Button>
              {user?.role === E_Roles.B2B_OWNER && (
                <Button
                  color="orange"
                  fullWidth
                  px={PADDING_BUTTONS}
                  routeTo={E_Routes.companyBugs}
                  size="lg"
                  variant="light"
                >
                  {t("buttonBugs")}
                </Button>
              )}
              <ButtonRefreshUserSession
                customText={t("buttonRefresh")}
                fullWidth
                onlyInDevelopmentMode
                refreshTimeout={10_000}
                size="lg"
                variant="light"
              />
              {user?.role === E_Roles.B2B_OWNER && (
                <Button
                  color="red"
                  fullWidth
                  px={PADDING_BUTTONS}
                  routeTo={E_Routes.companyDelete}
                  size="lg"
                  variant="light"
                >
                  {t("buttonDeleteCompany")}
                </Button>
              )}
            </Fieldset>
          </>
        ) : (
          <>
            <Button
              disabled={!!companyHasPhoneVerified}
              fullWidth
              onClick={handleOpenConfirmEmail}
              px={PADDING_BUTTONS}
              size="lg"
              variant="filled"
            >
              {t("buttonConfirmPhone")}
            </Button>
            {user?.role === E_Roles.B2B_OWNER && (
              <Button
                color="red"
                fullWidth
                px={PADDING_BUTTONS}
                routeTo={E_Routes.companyDelete}
                size="lg"
                variant="light"
              >
                {t("buttonDeleteCompany")}
              </Button>
            )}
          </>
        )}
        <Button
          color="red"
          fullWidth
          onClick={handleLogout}
          px={PADDING_BUTTONS}
          size="lg"
          variant="filled"
        >
          {tCommon("navigation.tooltipLogout")}
        </Button>
      </ButtonWrapper>
    </Section>
  );
};
