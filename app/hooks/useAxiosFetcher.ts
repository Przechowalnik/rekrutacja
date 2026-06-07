/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AxiosRequestConfig } from "axios";
import { useCallback, useState } from "react";

import { axiosClient } from "~/apiCalls/axiosClient";

interface FetchState<T> {
  data: null | T;
  error: any;
  loading: boolean;
}

export function useAxiosFetcher<T = any>({
  disabledLoader = false,
  minimumLoadingTime = 500,
}: {
  disabledLoader?: boolean;
  minimumLoadingTime?: number;
}) {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    error: null,
    loading: false,
  });

  const fetch = useCallback(
    async (config: AxiosRequestConfig) => {
      if (!disabledLoader) {
        setState({ data: null, error: null, loading: true });
      }
      const startTime = Date.now();

      try {
        const response = await axiosClient(config);
        const elapsed = Date.now() - startTime;

        if (elapsed < minimumLoadingTime && !disabledLoader) {
          await new Promise(resolve =>
            setTimeout(resolve, minimumLoadingTime - elapsed),
          );
        }

        setState({ data: response.data, error: null, loading: false });
        return response.data;
      } catch (error) {
        const elapsed = Date.now() - startTime;
        if (elapsed < minimumLoadingTime && !disabledLoader) {
          await new Promise(resolve =>
            setTimeout(resolve, minimumLoadingTime - elapsed),
          );
        }
        setState({ data: null, error, loading: false });
        throw error;
      }
    },
    [disabledLoader, minimumLoadingTime],
  );

  return { ...state, fetch };
}
