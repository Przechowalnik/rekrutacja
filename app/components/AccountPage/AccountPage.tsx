import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { useUser } from "~/hooks/useUser";
import { E_Roles } from "~/models/enums";
import { Button } from "~/ui/Button";
import { ButtonWrapper } from "~/ui/ButtonWrapper";
import { Fieldset } from "~/ui/Fieldset";
import { Section } from "~/ui/Section";

const PADDING_BUTTONS = 8;
const PADDING_FIELDSET = 10;

export const AccountPage = () => {
  const { t } = useTranslation(namespaces.account);
  const { t: tCommon } = useTranslation(namespaces.common);
  const { logout, refreshData, user } = useUser();

  const userHasEmailVerified = user?.emailVerification?.verifiedAt;

  const disabledButtonListing = user?.company
    ? !user?.company?.phone?.verifiedAt
    : !user?.phone?.verifiedAt;

  const handleLogout = useCallback(async () => {
    await logout();
  }, [logout]);

  const handleOpenConfirmEmail = useCallback(() => {
    refreshData();
  }, [refreshData]);

  const title = (() => {
    if (!user?.company) {
      return t("title");
    }

    if (user.role === E_Roles.B2B_OWNER) {
      return t("titleCompanyAdmin");
    }

    return t("titleCompany");
  })();

  return (
    <Section
      alert={
        userHasEmailVerified
          ? undefined
          : tCommon("alertVerifyEmailToUnlockFeatures")
      }
      breadcrumbs={[E_Routes.home, E_Routes.account]}
      pageMeta={{
        route: E_Routes.account,
      }}
      px={0}
      scrollToPositionBefore
      size="md"
      title={title}
    >
      <ButtonWrapper withMobileReverse={false} withTopPadding={false}>
        {userHasEmailVerified ? (
          <>
            {user?.company && (
              <Button
                fullWidth
                px={PADDING_BUTTONS}
                routeTo={E_Routes.company}
                size="lg"
                variant="filled"
              >
                {t("buttonCompany")}
              </Button>
            )}
            {!!user?.company || user?.role?.includes(E_Roles.ADMIN) ? null : (
              <Fieldset legend={t("fieldsetListings")} p={PADDING_FIELDSET}>
                <Button
                  disabled={disabledButtonListing}
                  fullWidth
                  px={PADDING_BUTTONS}
                  routeTo={E_Routes.accountListingsNew}
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
                <Button
                  disabled={disabledButtonListing}
                  fullWidth
                  px={PADDING_BUTTONS}
                  routeTo={E_Routes.accountListings}
                  size="lg"
                  tooltip={{
                    label: user?.company
                      ? tCommon("navigation.tooltipNewListingDisabledCompany")
                      : tCommon("navigation.tooltipNewListingDisabledAccount"),
                  }}
                  variant="light"
                >
                  {t("buttonListings")}
                </Button>
              </Fieldset>
            )}
            {user?.role === E_Roles.USER && (
              <Fieldset legend={t("fieldsetPayments")} p={PADDING_FIELDSET}>
                <Button
                  disabled={disabledButtonListing}
                  fullWidth
                  px={PADDING_BUTTONS}
                  routeTo={E_Routes.accountPoints}
                  size="lg"
                  tooltip={{
                    label: user?.company
                      ? tCommon("navigation.tooltipCompanyNoPhone")
                      : tCommon("navigation.tooltipAccountNoPhone"),
                  }}
                  variant="light"
                >
                  {t("buttonPoints")}
                </Button>
                <Button
                  disabled={disabledButtonListing}
                  fullWidth
                  px={PADDING_BUTTONS}
                  routeTo={E_Routes.accountInvoices}
                  size="lg"
                  tooltip={{
                    label: user?.company
                      ? tCommon("navigation.tooltipCompanyNoPhone")
                      : tCommon("navigation.tooltipAccountNoPhone"),
                  }}
                  variant="light"
                >
                  {t("buttonInvoices")}
                </Button>
              </Fieldset>
            )}
            <Fieldset
              legend={t("fieldsetSettings")}
              maw="100%"
              p={PADDING_FIELDSET}
            >
              <Button
                fullWidth
                px={PADDING_BUTTONS}
                routeTo={E_Routes.accountProfile}
                size="lg"
                variant="light"
              >
                {t("buttonProfile")}
              </Button>
              <Button
                fullWidth
                px={PADDING_BUTTONS}
                routeTo={E_Routes.accountPassword}
                size="lg"
                variant="light"
              >
                {t("buttonUpdatePassword")}
              </Button>
              <Button
                fullWidth
                px={PADDING_BUTTONS}
                routeTo={E_Routes.accountEmail}
                size="lg"
                variant="light"
              >
                {t("buttonUpdateEmail")}
              </Button>
              <Button
                fullWidth
                px={PADDING_BUTTONS}
                routeTo={E_Routes.accountPhone}
                size="lg"
                variant="light"
              >
                {user?.phone?.verifiedAt
                  ? t("buttonUpdatePhone")
                  : t("buttonAddPhone")}
              </Button>
              <Button
                fullWidth
                px={PADDING_BUTTONS}
                routeTo={E_Routes.accountAuthenticator}
                size="lg"
                variant="light"
              >
                {t("buttonUpdateAuthenticator")}
              </Button>
              <Button
                fullWidth
                px={PADDING_BUTTONS}
                routeTo={E_Routes.accountConsents}
                size="lg"
                variant="light"
              >
                {t("buttonUpdateConsents")}
              </Button>
            </Fieldset>
            <Fieldset legend={t("fieldsetOthers")} p={PADDING_FIELDSET}>
              {user?.role === E_Roles.USER && (
                <Button
                  fullWidth
                  px={PADDING_BUTTONS}
                  routeTo={E_Routes.accountReferral}
                  size="lg"
                  variant="light"
                >
                  {t("buttonReferral")}
                </Button>
              )}
              <Button
                color="orange"
                fullWidth
                px={PADDING_BUTTONS}
                routeTo={E_Routes.accountBugs}
                size="lg"
                variant="light"
              >
                {t("buttonBugs")}
              </Button>
              <Button
                color="orange"
                fullWidth
                px={PADDING_BUTTONS}
                routeTo={E_Routes.accountSessions}
                size="lg"
                variant="light"
              >
                {t("buttonManageSessions")}
              </Button>
              {user?.role === E_Roles.USER && (
                <Button
                  color="red"
                  fullWidth
                  px={PADDING_BUTTONS}
                  routeTo={E_Routes.accountDelete}
                  size="lg"
                  variant="light"
                >
                  {t("buttonDeleteAccount")}
                </Button>
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
            </Fieldset>
          </>
        ) : (
          <>
            <Button
              disabled={!!userHasEmailVerified}
              fullWidth
              onClick={handleOpenConfirmEmail}
              px={PADDING_BUTTONS}
              size="lg"
              variant="filled"
            >
              {t("buttonConfirmEmail")}
            </Button>
            {user?.role === E_Roles.USER && (
              <Button
                color="red"
                fullWidth
                px={PADDING_BUTTONS}
                routeTo={E_Routes.accountDelete}
                size="lg"
                variant="light"
              >
                {t("buttonDeleteAccount")}
              </Button>
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
          </>
        )}
      </ButtonWrapper>
    </Section>
  );
};
