import type { PropsWithChildren } from "react";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLocation } from "react-router";

export type T_Loading = {
  isLoading: boolean;
  isLoadingLocalization: boolean;
  onChangeLoading: (properties: { duration?: number; value: boolean }) => void;
  onChangeLoadingLocalization: (properties: {
    duration?: number;
    value: boolean;
  }) => void;
};

export const LoadingContext = createContext<T_Loading>({
  isLoading: false,
  isLoadingLocalization: false,
  onChangeLoading: () => {},
  onChangeLoadingLocalization: () => {},
});

export const LoadingContextProvider = ({ children }: PropsWithChildren) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLocalization, setIsLoadingLocalization] = useState(false);

  const location = useLocation();

  useEffect(() => {
    setIsLoading(false);
  }, [location.pathname]);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const onChangeLoading = useCallback(
    ({ duration = 500, value }: { duration?: number; value: boolean }) => {
      if (value) {
        setIsLoading(true);
      } else {
        setTimeout(() => setIsLoading(false), duration);
      }
    },
    [],
  );

  const onChangeLoadingLocalization = useCallback(
    ({ duration = 500, value }: { duration?: number; value: boolean }) => {
      if (value) {
        setIsLoadingLocalization(true);
      } else {
        setTimeout(() => setIsLoadingLocalization(false), duration);
      }
    },
    [],
  );

  const contextValues = useMemo(() => {
    return {
      isLoading,
      isLoadingLocalization,
      onChangeLoading,
      onChangeLoadingLocalization,
    };
  }, [
    isLoading,
    isLoadingLocalization,
    onChangeLoading,
    onChangeLoadingLocalization,
  ]);

  return (
    <LoadingContext.Provider value={contextValues}>
      {children}
    </LoadingContext.Provider>
  );
};
