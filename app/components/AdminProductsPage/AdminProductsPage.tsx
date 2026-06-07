import { Flex } from "@mantine/core";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { T_Products } from "~/models/products";
import { Button } from "~/ui/Button";
import { ButtonArrowLeft } from "~/ui/ButtonArrowLeft";
import { CardAdminProduct } from "~/ui/CardAdminProduct";
import { CardNoData } from "~/ui/CardNoData";
import { Section } from "~/ui/Section";

type T_AdminProductsPage = {
  products: T_Products;
};

export const AdminProductsPage = ({ products }: T_AdminProductsPage) => {
  const { t } = useTranslation(namespaces.adminProducts);

  const mapProducts = products.map(item => {
    return <CardAdminProduct key={`product_${item.id}`} {...item} />;
  });

  return (
    <Section
      breadcrumbs={[E_Routes.home, E_Routes.admin, E_Routes.adminProducts]}
      buttons={
        <>
          <ButtonArrowLeft routeTo={E_Routes.admin} textGoBack />
          <Button
            disabled={products.length > 0}
            routeTo={E_Routes.adminProductsNew}
          >
            {t("buttonNew")}
          </Button>
        </>
      }
      pageMeta={{
        route: E_Routes.adminProducts,
      }}
      title={t("title")}
    >
      <Flex align="center" gap={24} justify="center" wrap="wrap">
        {mapProducts.length === 0 && (
          <CardNoData description={t("noProducts")} />
        )}
        {mapProducts.length > 0 && mapProducts}
      </Flex>
    </Section>
  );
};
