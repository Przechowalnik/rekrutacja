import { Box, Flex } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { fetchLatestListings } from "~/apiCalls/latestListings";
import { namespaces } from "~/constants/namespaces";
import { reactQueryCacheTime, reactQueryKey } from "~/constants/reactQuery";
import { T_Listings } from "~/models/listings";
import { CardNoData } from "~/ui/CardNoData";
import { Section } from "~/ui/Section";
import { SliderListingsSmall } from "~/ui/SliderListingsSmall";

type T_HomeLatestListingsSection = {
  latestListings: T_Listings;
};

export const HomeLatestListingsSection = ({
  latestListings,
}: T_HomeLatestListingsSection) => {
  const { t } = useTranslation(namespaces.home);

  const { data } = useQuery({
    initialData: latestListings,
    queryFn: async () => {
      const result = await fetchLatestListings();
      return result ?? latestListings;
    },
    queryKey: [reactQueryKey.latestListings],
    staleTime: reactQueryCacheTime.latestListings,
  });

  const listings = data ?? latestListings;

  return (
    <Section
      backgroundSecondary
      title={t("homeLatestListings.title")}
      withLeftRightPadding={false}
      withPaddingUnderTitle={false}
      withPageMeta={false}
    >
      <Box
        pb={{
          base: 54,
          sm: 64,
        }}
        pt={{
          base: 32,
          sm: 12,
        }}
      >
        <Flex pt={24} w="100%">
          {listings.length > 0 ? (
            <SliderListingsSmall listings={listings} />
          ) : (
            <Flex align="center" justify="center" w="100%">
              <CardNoData description={t("noData")} />
            </Flex>
          )}
        </Flex>
      </Box>
    </Section>
  );
};
