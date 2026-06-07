import { useTranslation } from "react-i18next";
import { type LoaderFunctionArgs } from "react-router";

import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import {
  requireDevelopmentVersion,
  requireUserSession,
} from "~/data/auth.server";
import { responseThrowError } from "~/data/response.server";
import { applyRateLimit } from "~/data/security.server";
import { useCookies } from "~/hooks/useCookies";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { Button } from "~/ui/Button";
import { ButtonWrapper } from "~/ui/ButtonWrapper";
import { RespectLocalization } from "~/ui/RespectLocalization";
import { RespectUser } from "~/ui/RespectUser";
import { Section } from "~/ui/Section";

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.flags],
});

export default function Page() {
  const {
    isEmailDisabled,
    isOtpCodeDisabled,
    isSMSDisabled,
    onToggleEmail,
    onToggleOtpCode,
    onToggleSMS,
  } = useCookies();
  const { t } = useTranslation(namespaces.flags);

  return (
    <RespectLocalization namespaces={handle.i18n}>
      <RespectUser>
        <Section
          pageMeta={{
            route: "default",
          }}
          size="sm"
          title={t("title")}
        >
          <ButtonWrapper withMobileReverse={false}>
            <Button
              onClick={onToggleOtpCode}
              w="100%"
            >{`${t("otpCodeDisabled")}: ${isOtpCodeDisabled}`}</Button>
            <Button
              onClick={onToggleEmail}
              w="100%"
            >{`${t("emailDisabled")}: ${isEmailDisabled}`}</Button>
            <Button
              onClick={onToggleSMS}
              w="100%"
            >{`${t("smsDisabled")}: ${isSMSDisabled}`}</Button>
          </ButtonWrapper>
        </Section>
      </RespectUser>
    </RespectLocalization>
  );
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    await applyRateLimit({ request });

    await requireUserSession({
      redirectPath: E_Routes.error,
      request,
    });
    await requireDevelopmentVersion({ request });
    return null;
  } catch (error) {
    return responseThrowError({ error });
  }
};
