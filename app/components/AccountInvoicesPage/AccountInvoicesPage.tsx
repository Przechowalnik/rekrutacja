import { Box, Flex } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { colorsMantine } from "~/constants/colorsMantine";
import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { useSubmitWithActions } from "~/hooks/useSubmitWithActions";
import { formNames } from "~/lib/zodFormValidator";
import { type T_Invoices, Z_Invoices } from "~/models/invoices";
import { Button } from "~/ui/Button";
import { ButtonArrowLeft } from "~/ui/ButtonArrowLeft";
import { Collapse } from "~/ui/Collapse";
import { InfiniteDataQueryPagination } from "~/ui/InfiniteDataQueryPagination";
import { Section } from "~/ui/Section";
import { Text } from "~/ui/Text";
import { replaceDateToYearMonthHoursMinutesInWordsDay } from "~/utilities/date";
import { convertToFormData } from "~/utilities/form";

type T_AccountInvoicesPage = {
  invoices: T_Invoices;
  nextPage: null | number;
  totalPages: null | number | undefined;
  totalResults: number;
};

export const AccountInvoicesPage = ({
  invoices,
  nextPage,
  totalPages,
  totalResults,
}: T_AccountInvoicesPage) => {
  const [hasItems, setHasItems] = useState(false);
  const { t: tNotifications } = useTranslation(namespaces.notifications);
  const { t: tQuestions } = useTranslation(namespaces.questions);
  const { t } = useTranslation(namespaces.accountInvoices);
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
          route: E_Routes.accountInvoices,
        }),
        method: "post",
      },
    );
  }, []);

  return (
    <Section
      breadcrumbs={[E_Routes.home, E_Routes.account, E_Routes.accountInvoices]}
      buttons={<ButtonArrowLeft routeTo={E_Routes.account} textGoBack />}
      description={t("description")}
      pageMeta={{
        route: E_Routes.accountInvoices,
      }}
      questions={[
        {
          description: tQuestions("accountInvoices.sendInvoice.description"),
          title: tQuestions("accountInvoices.sendInvoice.title"),
        },
      ]}
      size="md"
      title={t("title")}
    >
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
