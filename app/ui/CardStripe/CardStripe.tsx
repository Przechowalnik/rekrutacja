import type { BoxProps } from "@mantine/core";
import { Box } from "@mantine/core";
import { CardElement } from "@stripe/react-stripe-js";
import { useTranslation } from "react-i18next";

import { colorsMantine } from "~/constants/colorsMantine";
import { namespaces } from "~/constants/namespaces";
import { globalClasses } from "~/constants/styles";
import { useLayout } from "~/hooks/useLayout";
import { useUser } from "~/hooks/useUser";

import { Text } from "../Text";

export const CardStripe = ({ ...restProps }: BoxProps) => {
  const { t } = useTranslation(namespaces.common);
  const { user } = useUser();
  const { platformColor } = useLayout();

  if (!user?.company) {
    return <div></div>;
  }

  return (
    <Box
      {...restProps}
      bg={platformColor}
      className={globalClasses.shadowInset}
      maw={400}
      p={24}
      style={{
        borderRadius: 16,
        overflow: "hidden",
      }}
      w="100%"
    >
      <Text c="white" fw="bold" pb={64} size="1.6rem">
        {t("company.name")}
      </Text>
      <CardElement
        options={{
          disableLink: true,
          hidePostalCode: true,
          style: {
            base: {
              "::placeholder": {
                color: "white",
              },
              backgroundColor: colorsMantine.primary,
              color: "white",
              fontSize: "16px",
            },
            invalid: {
              backgroundColor: colorsMantine.primary,
              color: "white",
            },
          },
        }}
      />
      <Text c="white" fw="bold" pt={32} size="sm">
        {user?.company?.name?.toUpperCase()}
      </Text>
    </Box>
  );
};
