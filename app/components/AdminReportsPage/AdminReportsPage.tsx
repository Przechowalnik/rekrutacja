import { Box, Flex } from "@mantine/core";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { formNames } from "~/lib/zodFormValidator";
import { T_Reports, Z_Reports } from "~/models/reports";
import { Button } from "~/ui/Button";
import { ButtonArrowLeft } from "~/ui/ButtonArrowLeft";
import { ButtonWrapper } from "~/ui/ButtonWrapper";
import { CardReport } from "~/ui/CardReport";
import { InfiniteDataQueryPagination } from "~/ui/InfiniteDataQueryPagination";
import { Input } from "~/ui/Input";
import { Section } from "~/ui/Section";

type T_AdminBugsPage = {
  nextPage: null | number;
  reports: T_Reports;
  totalPages: null | number | undefined;
};

export const AdminReportsPage = ({
  nextPage,
  reports,
  totalPages,
}: T_AdminBugsPage) => {
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [searchEmail, setSearchEmail] = useState("");

  const { t } = useTranslation(namespaces.adminReports);

  const extraQuery = useMemo(() => {
    return {
      ...(searchEmail
        ? {
            [formNames.email]: searchEmail,
          }
        : {}),
    };
  }, [searchEmail]);

  const handleUpdateEmail = useCallback((value: number | string) => {
    setSearchEmail(value.toString());
  }, []);

  const handleTriggerSearch = useCallback(() => {
    setReloadTrigger(previousState => previousState + 1);
  }, []);

  return (
    <Section
      breadcrumbs={[E_Routes.home, E_Routes.admin, E_Routes.adminReports]}
      buttons={<ButtonArrowLeft routeTo={E_Routes.admin} textGoBack />}
      pageMeta={{
        route: E_Routes.adminReports,
      }}
      size="md"
      title={t("title")}
      withHTML
    >
      <Flex align="center" gap={8} justify="center" wrap="wrap">
        <Input
          clearable
          name={formNames.email}
          onChange={handleUpdateEmail}
          required
          type="email"
          value={searchEmail}
        />
      </Flex>
      <Box pb={24}>
        <ButtonWrapper p={0}>
          <Button onClick={handleTriggerSearch} size="md" variant="light">
            {t("buttonSearch")}
          </Button>
        </ButtonWrapper>
      </Box>
      <InfiniteDataQueryPagination
        data={{
          items: reports,
          nextPage: nextPage,
          totalPages: totalPages,
        }}
        extraQuery={extraQuery}
        noMoreDataDescription={t("noData")}
        reloadTrigger={reloadTrigger}
        renderItem={item => {
          return <CardReport key={`report_${item.id}`} report={item} />;
        }}
        schema={Z_Reports}
      />
    </Section>
  );
};
