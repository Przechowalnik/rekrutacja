import { Box, Flex } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import type { T_RouteValue } from "~/constants/routes";
import { E_Routes } from "~/constants/routes";
import { useUser } from "~/hooks/useUser";
import { formNames } from "~/lib/zodFormValidator";
import type { T_CompanyProfile } from "~/models/company/companyProfile";
import { Button } from "~/ui/Button";
import { ButtonArrowLeft } from "~/ui/ButtonArrowLeft";
import { CompanyAvatar } from "~/ui/CompanyAvatar";
import { CompanyBanner } from "~/ui/CompanyBanner";
import { Link } from "~/ui/Link";
import { Section } from "~/ui/Section";
import { Textarea } from "~/ui/Textarea";
import { TextRow } from "~/ui/TextRow";

type T_CompanyProfilePage = {
  companyProfile: T_CompanyProfile;
};

export const CompanyProfilePage = ({
  companyProfile,
}: T_CompanyProfilePage) => {
  const { t } = useTranslation(namespaces.companyProfile);
  const { t: tCommon } = useTranslation(namespaces.common);
  const { t: tQuestions } = useTranslation(namespaces.questions);
  const { t: tNotifications } = useTranslation(namespaces.notifications);
  const { user } = useUser();

  const handleCopyCompanySocial = useCallback(async (socialLink: string) => {
    try {
      await navigator.clipboard.writeText(socialLink);
      notifications.show({
        color: "green",
        message: tNotifications(`successCopyUrl.message`),
        title: tNotifications(`successCopyUrl.title`),
      });
      return;
    } catch {
      notifications.show({
        color: "red",
        message: tNotifications(`somethingWentWrong.message`),
        title: tNotifications(`somethingWentWrong.title`),
      });
      return;
    }
  }, []);

  return (
    <Section
      breadcrumbs={[E_Routes.home, E_Routes.company, E_Routes.companyProfile]}
      buttons={
        <>
          <ButtonArrowLeft routeTo={E_Routes.company} textGoBack />
          <Button routeTo={E_Routes.companyProfileEdit}>
            {t("buttonEdit")}
          </Button>
        </>
      }
      description={t("description")}
      pageMeta={{
        route: E_Routes.companyProfile,
      }}
      questions={[
        {
          description: tQuestions("companyProfile.status.description"),
          title: tQuestions("companyProfile.status.title"),
        },
        {
          description: tQuestions("companyProfile.locations.description"),
          title: tQuestions("companyProfile.locations.title"),
        },
      ]}
      size="md"
      title={t("title")}
      withHTML={false}
      withTextsToUi
    >
      <Box mb={64}>
        <CompanyAvatar />
      </Box>
      <Box mb={64}>
        <CompanyBanner />
      </Box>
      <TextRow
        items={[
          {
            description: user?.company?.name ?? "",
            title: tCommon("inputs.companyName"),
          },
          {
            content: companyProfile?.urlInstagram ? (
              <Flex align="flex-start" direction="column" justify="center">
                <Link
                  rel="noreferrer"
                  size="sm"
                  target="_blank"
                  text
                  to={companyProfile?.urlInstagram as T_RouteValue}
                >
                  {companyProfile?.urlInstagram ?? "-"}
                </Link>
                {companyProfile?.urlInstagram && (
                  <Flex justify="flex-end" mt={4} w="100%">
                    <Button
                      onClick={() =>
                        handleCopyCompanySocial(
                          companyProfile?.urlInstagram ?? "",
                        )
                      }
                      size="xs"
                      variant="light"
                      w="auto"
                    >
                      {t("copyURL")}
                    </Button>
                  </Flex>
                )}
              </Flex>
            ) : undefined,
            description: companyProfile?.urlInstagram
              ? undefined
              : t("noneUrl"),
            title: tCommon("inputs.urlInstagram"),
          },
          {
            content: companyProfile?.urlFacebook ? (
              <Flex align="flex-start" direction="column" justify="center">
                <Link
                  rel="noreferrer"
                  size="sm"
                  target="_blank"
                  text
                  to={companyProfile?.urlFacebook as T_RouteValue}
                >
                  {companyProfile?.urlFacebook ?? "-"}
                </Link>
                {companyProfile?.urlFacebook && (
                  <Flex justify="flex-end" mt={4} w="100%">
                    <Button
                      onClick={() =>
                        handleCopyCompanySocial(
                          companyProfile?.urlFacebook ?? "",
                        )
                      }
                      size="xs"
                      variant="light"
                      w="auto"
                    >
                      {t("copyURL")}
                    </Button>
                  </Flex>
                )}
              </Flex>
            ) : undefined,
            description: companyProfile?.urlFacebook ? undefined : t("noneUrl"),
            title: tCommon("inputs.urlFacebook"),
          },
          {
            content: companyProfile?.urlTiktok ? (
              <Flex align="flex-start" direction="column" justify="center">
                <Link
                  rel="noreferrer"
                  size="sm"
                  target="_blank"
                  text
                  to={companyProfile?.urlTiktok as T_RouteValue}
                >
                  {companyProfile?.urlTiktok ?? "-"}
                </Link>
                {companyProfile?.urlTiktok && (
                  <Flex justify="flex-end" mt={4} w="100%">
                    <Button
                      onClick={() =>
                        handleCopyCompanySocial(companyProfile?.urlTiktok ?? "")
                      }
                      size="xs"
                      variant="light"
                      w="auto"
                    >
                      {t("copyURL")}
                    </Button>
                  </Flex>
                )}
              </Flex>
            ) : undefined,
            description: companyProfile?.urlTiktok ? undefined : t("noneUrl"),
            title: tCommon("inputs.urlTiktok"),
          },
        ]}
        titleWidthMobile={140}
      />
      <Textarea
        defaultValue={companyProfile?.description ?? t("noDescription")}
        disabled
        disabledWithOpacity={false}
        maxLength={null}
        mt={64}
        name={formNames.companyDescription}
        required={false}
      />
    </Section>
  );
};
