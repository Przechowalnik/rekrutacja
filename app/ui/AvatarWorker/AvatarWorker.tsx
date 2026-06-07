import { faCheck, faUserGroup } from "@fortawesome/free-solid-svg-icons";
import { Box, Flex } from "@mantine/core";
import { memo } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import type { T_CompanyWorkers } from "~/models/company/companyWorkers";

import { Avatar } from "../Avatar";
import { Button } from "../Button";
import { IconSeo } from "../IconSeo";
import { Text } from "../Text";

type T_AvatarWorker = {
  activeWorkerSettingsId: null | string;
  onChangeActiveWorker: (workerSettingsId: null | string) => void;
  worker: null | T_CompanyWorkers[number];
};

const AvatarWorkerToMemoize = ({
  activeWorkerSettingsId,
  onChangeActiveWorker,
  worker,
}: T_AvatarWorker) => {
  const { t } = useTranslation(namespaces.common);

  const isActive =
    activeWorkerSettingsId === (worker ? worker?.workerSettings?.id : null);

  return (
    <Flex
      align="center"
      direction="column"
      gap={4}
      justify="center"
      pos="relative"
      pt={8}
      style={{
        overflow: "hidden",
      }}
      w={90}
    >
      <Avatar
        color="gray"
        customIcon={worker ? undefined : faUserGroup}
        onClick={() => onChangeActiveWorker(worker?.workerSettings?.id ?? null)}
        pointer
        radius={10}
        size="lg"
        url={worker ? (worker.avatar ?? undefined) : undefined}
        variant="light"
        withBorderPrimary={
          activeWorkerSettingsId ===
          (worker ? worker?.workerSettings?.id : null)
        }
      />
      <Text center size="xs">
        {worker
          ? `${worker.firstName}${worker?.lastName ? ` ${worker.lastName.slice(0, 1)}` : ""}.`
          : t("avatarWorker.anyPerson")}
      </Text>
      <Box opacity={isActive ? 1 : 0} pos="absolute" right={8} top={-3}>
        <Button h={20} px={4} py={0} size="xs" variant="filled">
          <IconSeo icon={faCheck} size="lg" />
        </Button>
      </Box>
    </Flex>
  );
};

export const AvatarWorker = memo(AvatarWorkerToMemoize);
