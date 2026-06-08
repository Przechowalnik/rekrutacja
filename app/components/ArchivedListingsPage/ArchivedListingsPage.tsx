import { Box, Flex, Pagination } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router";

import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { T_Listings } from "~/models/listings";
import { CardNoData } from "~/ui/CardNoData";
import { CardSearchListing } from "~/ui/CardSearchListing";
import { Section } from "~/ui/Section";

type T_ArchivedListingsPage = {
  listings: T_Listings;
  page: number;
  totalPages: number;
};

export const ArchivedListingsPage = ({
  listings,
  page,
  totalPages,
}: T_ArchivedListingsPage) => {
  const { t } = useTranslation(namespaces.archive);
  const { getLocalizedRoute } = useLocalizedRoute();
  const navigate = useNavigate();
  const [searchParameters] = useSearchParams();

  const handleChangePage = (newPage: number) => {
    const parameters = new URLSearchParams(searchParameters);
    parameters.set("page", newPage.toString());
    navigate(
      `${getLocalizedRoute({ route: E_Routes.archive })}?${parameters.toString()}`,
    );
  };

  return (
    <Section
      breadcrumbs={[E_Routes.home, E_Routes.archive]}
      description={t("description")}
      pageMeta={{
        route: E_Routes.archive,
      }}
      size="lg"
      title={t("title")}
    >
      {listings.length === 0 ? (
        <CardNoData description={t("noListings")} pt={24} />
      ) : (
        <Box w="100%">
          <Flex align="center" direction="column" gap={16} w="100%">
            {listings.map(listing => (
              <CardSearchListing key={listing.id} listing={listing} />
            ))}
          </Flex>
          {totalPages > 1 && (
            <Flex justify="center" pt={32} w="100%">
              <Pagination
                onChange={handleChangePage}
                total={totalPages}
                value={page}
              />
            </Flex>
          )}
        </Box>
      )}
    </Section>
  );
};
