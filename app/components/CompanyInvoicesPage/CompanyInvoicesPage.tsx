import { faBriefcase } from "@fortawesome/free-solid-svg-icons";
import { Box, Flex } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { colorsMantine } from "~/constants/colorsMantine";
import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { globalClasses } from "~/constants/styles";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { useSubmitWithActions } from "~/hooks/useSubmitWithActions";
import { formNames } from "~/lib/zodFormValidator";
import type { T_CompanyInvoiceData } from "~/models/company/companyInvoiceData";
import { type T_Invoices, Z_Invoices } from "~/models/invoices";
import { Accordion } from "~/ui/Accordion";
import { Button } from "~/ui/Button";
import { ButtonArrowLeft } from "~/ui/ButtonArrowLeft";
import { ButtonWrapper } from "~/ui/ButtonWrapper";
import { Collapse } from "~/ui/Collapse";
import { InfiniteDataQueryPagination } from "~/ui/InfiniteDataQueryPagination";
import { Section } from "~/ui/Section";
import { Text } from "~/ui/Text";
import { TextRow } from "~/ui/TextRow";
import { replaceDateToYearMonthHoursMinutesInWordsDay } from "~/utilities/date";
import { convertToFormData } from "~/utilities/form";

type T_CompanyInvoicesPage = {
  companyInvoiceData: T_CompanyInvoiceData;
  invoices: T_Invoices;
  nextPage: null | number;
  totalPages: null | number | undefined;
  totalResults: number;
};

export const CompanyInvoicesPage = ({
  companyInvoiceData,
  invoices,
  nextPage,
  totalPages,
  totalResults,
}: T_CompanyInvoicesPage) => {
  const [hasItems, setHasItems] = useState(false);

  const { t: tNotifications } = useTranslation(namespaces.notifications);
  const { t: tCommon } = useTranslation(namespaces.common);
  const { t: tQuestions } = useTranslation(namespaces.questions);
  const { t } = useTranslation(namespaces.companyInvoices);
  const submit = useSubmitWithActions();
  const { getLocalizedRoute } = useLocalizedRoute();

  useEffect(() => {
    setHasItems(totalResults > 0);
  }, [totalResults]);

  const handleSendInvoiceToEmail = useCallback((invoiceId: string) => {
    if (!invoiceId) {
      notifications.show({
        color: "red",
        message: tNotifications(`somethingWentWrong.message`),
        title: tNotifications(`somethingWentWrong.title`),
      });
      return;
    }

    submit(
      convertToFormData({
        [formNames.invoiceId]: invoiceId,
      }),
      {
        action: getLocalizedRoute({
          route: E_Routes.companyInvoices,
        }),
        method: "post",
      },
    );
  }, []);

  const accordionRowItems = [
    {
      description: companyInvoiceData?.companyName?.toUpperCase() ?? "-",
      title: tCommon("inputs.companyName"),
    },
    {
      description: companyInvoiceData?.taxCountry ?? "-",
      title: tCommon("inputs.taxCountry"),
    },
    {
      description: companyInvoiceData?.taxNumber ?? "-",
      title: tCommon("inputs.taxNumber"),
    },
    {
      description: companyInvoiceData?.country ?? "-",
      title: tCommon("inputs.country"),
    },
    {
      description: companyInvoiceData?.postalCode ?? "-",
      title: tCommon("inputs.postalCode"),
    },
    {
      description: companyInvoiceData?.city?.toUpperCase() ?? "-",
      title: tCommon("inputs.city"),
    },
    {
      description: companyInvoiceData?.streetName?.toUpperCase() ?? "-",
      title: tCommon("inputs.streetName"),
    },
    {
      description: companyInvoiceData?.streetNumber ?? "-",
      title: tCommon("inputs.streetNumber"),
    },
    {
      description: companyInvoiceData?.flatNumber ?? "-",
      title: tCommon("inputs.flatNumber"),
    },
  ];

  return (
    <Section
      breadcrumbs={[E_Routes.home, E_Routes.company, E_Routes.companyInvoices]}
      buttons={
        <>
          <ButtonArrowLeft routeTo={E_Routes.company} textGoBack />
          <Button routeTo={E_Routes.companyInvoiceEdit}>
            {t("buttonEditFull")}
          </Button>
        </>
      }
      description={t("description")}
      fullHeight
      pageMeta={{
        route: E_Routes.companyInvoices,
      }}
      questions={[
        {
          description: tQuestions(
            "companyInvoices.updateDataToInvoice.description",
          ),
          title: tQuestions("companyInvoices.updateDataToInvoice.title"),
        },
        {
          description: tQuestions("companyInvoices.sendInvoice.description"),
          title: tQuestions("companyInvoices.sendInvoice.title"),
        },
      ]}
      size="md"
      title={t("title")}
    >
      <Accordion
        items={[
          {
            content: (
              <>
                <TextRow items={accordionRowItems} titleWidthMobile={140} />
                <ButtonWrapper p={0}>
                  <Button routeTo={E_Routes.companyInvoiceEdit}>
                    {t("buttonEdit")}
                  </Button>
                </ButtonWrapper>
              </>
            ),
            icon: {
              icon: faBriefcase,
            },
            title: t("dataToInvoices"),
          },
        ]}
        mb={{
          base: 24,
          xs: 64,
        }}
      />

      <Collapse fullWith opened={hasItems}>
        <Flex align="center" gap={4} justify="center" pb={12} pt={4} w="100%">
          <Box w="60%">
            <Text center fw="bold" size="md">
              {t("createdAt")}
            </Text>
          </Box>
          <Box w="40%">
            <Text center fw="bold" size="md">
              {t("actions")}
            </Text>
          </Box>
        </Flex>
      </Collapse>
      <InfiniteDataQueryPagination
        data={{
          items: invoices,
          nextPage: nextPage,
          totalPages: totalPages,
        }}
        noMoreDataDescription={t("noInvoices")}
        renderItem={item => {
          return (
            <Flex
              align="center"
              className={globalClasses.fadePage}
              gap={4}
              justify="center"
              key={`invoice_${item.id}`}
              pt={4}
              style={{
                borderTop: `1px solid light-dark(${colorsMantine.gray3}, ${colorsMantine.gray8})`,
              }}
              w="100%"
            >
              <Box w="60%">
                <Text size="sm">
                  {replaceDateToYearMonthHoursMinutesInWordsDay({
                    date: item.createdAt.toString(),
                    withNbsp: false,
                  })}
                </Text>
              </Box>
              <Box w="40%">
                <Button
                  fullWidth
                  onClick={() => handleSendInvoiceToEmail(item.id)}
                  size="sm"
                  variant="light"
                >
                  {t("buttonSendInvoice")}
                </Button>
              </Box>
            </Flex>
          );
        }}
        schema={Z_Invoices}
      />
    </Section>
  );
};
