import { memo } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import type { T_Coupons } from "~/models/coupons";

import { Card } from "../Card";
import { Text } from "../Text";

type T_CardCoupon = {
  coupon: T_Coupons[number];
};

const CardCouponToMemoize = ({ coupon }: T_CardCoupon) => {
  const { t } = useTranslation(namespaces.common);

  return (
    <Card color="gray" isEditable={false} title={coupon.name}>
      <Text c="white" size="sm">
        {t("inputs.couponPromotionCode")}: <b>{coupon.promotionCode}</b>
      </Text>
      {coupon?.firstTimeTransaction && (
        <Text c="white" fw="bold" size="sm">
          {t("cardCoupon.firstTimeTransaction")}
        </Text>
      )}
      {!!coupon?.maxRedemptions && (
        <Text c="white" fw="bold" size="sm">
          {t("cardCoupon.limited")}
        </Text>
      )}
    </Card>
  );
};

export const CardCoupon = memo(CardCouponToMemoize);
