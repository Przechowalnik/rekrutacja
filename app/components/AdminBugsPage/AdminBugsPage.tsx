import { Flex } from "@mantine/core";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { formNames } from "~/lib/zodFormValidator";
import { type T_Bugs, Z_Bugs } from "~/models/bugs";
import { ButtonArrowLeft } from "~/ui/ButtonArrowLeft";
import { CardBug } from "~/ui/CardBug";
import { InfiniteDataQueryPagination } from "~/ui/InfiniteDataQueryPagination";
import { Section } from "~/ui/Section";
import { Switch } from "~/ui/Switch";

type T_AdminBugsPage = {
  bugs: T_Bugs;
  nextPage: null | number;
  totalPages: null | number | undefined;
};

export const AdminBugsPage = ({
  bugs,
  nextPage,
  totalPages,
}: T_AdminBugsPage) => {
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [showAllBugs, setShowAllBugs] = useState(false);

  const { t } = useTranslation(namespaces.adminBugs);

  const extraQuery = useMemo(() => {
    return {
      ...(showAllBugs
        ? {
            [formNames.bugShowClosed]: showAllBugs.toString(),
          }
        : {}),
    };
  }, [showAllBugs]);

  const handleChangeSwitch = () => {
    setShowAllBugs(previousState => !previousState);
    setReloadTrigger(previousState => previousState + 1);
  };

  return (
    <Section
      breadcrumbs={[E_Routes.home, E_Routes.admin, E_Routes.adminBugs]}
      buttons={<ButtonArrowLeft routeTo={E_Routes.admin} textGoBack />}
      pageMeta={{
        route: E_Routes.adminBugs,
      }}
      size="md"
      title={t("title")}
      withHTML
    >
      <Flex align="center" gap={8} justify="center" wrap="wrap">
        <Switch
          checked={showAllBugs}
          description={t("switchDescription")}
          label={t("switchLabel")}
          onChange={handleChangeSwitch}
          size="md"
          w="auto"
        />
      </Flex>
      <InfiniteDataQueryPagination
        data={{
          items: bugs,
          nextPage: nextPage,
          totalPages: totalPages,
        }}
        extraQuery={extraQuery}
        noMoreDataDescription={t("noData")}
        reloadTrigger={reloadTrigger}
        renderItem={(item, index) => {
          return (
            <CardBug bug={item} index={index} isAdmin key={`bug_${item.id}`} />
          );
        }}
        schema={Z_Bugs}
      />
    </Section>
  );
};
