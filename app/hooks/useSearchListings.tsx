import { useContext } from "react";

import { SearchListingsContext } from "~/context/SearchListingsContext";

export const useSearchListings = () => {
  const properties = useContext(SearchListingsContext);

  return properties;
};
