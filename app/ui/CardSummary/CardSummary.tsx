import { Box, BoxProps } from "@mantine/core";
import { useTranslation } from "react-i18next";

import { colorsMantine } from "~/constants/colorsMantine";
import { namespaces } from "~/constants/namespaces";
import { globalClasses } from "~/constants/styles";
import { T_PlanInterval } from "~/models/enums";
import { Text } from "~/ui/Text";
import { Title } from "~/ui/Title";
import { calculateDiscount, formatAmountForDisplay } from "~/utilities/price";

type T_CardSummary = {
  amount: number;
  amountOff?: number;
  discountDurationInMonths?: number;
  interval?: T_PlanInterval;
  intervalCount?: number;
  percentOff?: number;
};

export const CardSummary = ({
  amount,
  amountOff,
  discountDurationInMonths,
  interval,
  intervalCount,
  percentOff,
  ...resetProps
}: T_CardSummary & BoxProps) => {
  const { t } = useTranslation(namespaces.common);

  const discountedPrice = (() => {
    if (typeof amountOff === "number") {
      return formatAmountForDisplay(amount - amountOff);
    }
    if (typeof percentOff === "number") {
      return formatAmountForDisplay(
        calculateDiscount({
          amount,
          discountPercentage: percentOff,
        }),
      );
    }
    return 0;
  })();

  const discountExtraText = (() => {
    if (discountDurationInMonths && interval) {
      return ` ${t("cardSummary.from", { discountDurationInMonths })} ${t(
        `plansJustInterval.${interval}`,
        {
          count: discountDurationInMonths ?? 1,
        },
      )}`;
    }
    return "";
  })();

  return (
    <Box {...resetProps} w="100%">
      <Box
        bg={`light-dark(${colorsMantine.gray1}, ${colorsMantine.gray9})`}
        className={globalClasses.borderRadius8}
        px={24}
        py={16}
        w="100%"
      >
        <Title order={3} pb={12} size="h2">
          {t("cardSummary.title")}
        </Title>
        {typeof amountOff === "number" || typeof percentOff === "number" ? (
          <>
            <Text withTextsToUi>
              {`${t("cardSummary.priceBeforeDiscount", {
                extraText: "",
                price: formatAmountForDisplay(amount),
              })}${
                interval
                  ? t("cardSummary.intervalPrimary", {
                      interval: `${intervalCount ? `${intervalCount} ` : ""}${t(
                        `plansJustInterval.${interval}`,
                        {
                          count: intervalCount ?? 1,
                        },
                      )}`,
                    })
                  : ""
              }`}
            </Text>
            <Text withTextsToUi>
              {t("cardSummary.discount", {
                discount:
                  typeof amountOff === "number"
                    ? formatAmountForDisplay(amountOff)
                    : `${percentOff ?? 0}%`,
              })}
            </Text>
            <Text fw="bold" pt={12} withTextsToUi>
              {`${t("cardSummary.priceAfterDiscount", {
                extraText: discountExtraText,
                price: discountedPrice,
              })}${
                interval
                  ? t("cardSummary.interval", {
                      count: intervalCount ?? 1,
                      interval: `${intervalCount ? `${intervalCount} ` : ""}${t(
                        `plansJustInterval.${interval}`,
                        {
                          count: intervalCount ?? 1,
                        },
                      )}`,
                    })
                  : ""
              }`}
            </Text>
            {typeof discountDurationInMonths === "number" && (
              <Text fw="bold" withTextsToUi>
                {`${t("cardSummary.priceAfterDiscountDuration", {
                  extraText: "",
                  price: formatAmountForDisplay(amount),
                })}${
                  interval
                    ? t("cardSummary.interval", {
                        interval: `${intervalCount ? `${intervalCount} ` : ""}${t(
                          `plansJustInterval.${interval}`,
                          {
                            count: intervalCount ?? 1,
                          },
                        )}`,
                      })
                    : ""
                }`}
              </Text>
            )}
          </>
        ) : (
          <Text withTextsToUi>
            {`${t("cardSummary.price", {
              extraText: "",
              price: formatAmountForDisplay(amount),
            })}${
              interval
                ? t("cardSummary.interval", {
                    count: intervalCount ?? 1,
                    interval: `${intervalCount ? `${intervalCount} ` : ""}${t(
                      `plansJustInterval.${interval}`,
                      {
                        count: intervalCount ?? 1,
                      },
                    )}`,
                  })
                : ""
            }`}
          </Text>
        )}
      </Box>
    </Box>
  );
};
