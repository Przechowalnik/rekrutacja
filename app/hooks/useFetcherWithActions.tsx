/* eslint-disable @typescript-eslint/no-explicit-any */
import { notifications } from "@mantine/notifications";
import dayjs from "dayjs";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useFetcher, useNavigate } from "react-router";
import type { infer as ZodInfer, ZodSchema } from "zod";

import { namespaces } from "~/constants/namespaces";
import type { T_GetRouteExtraQuery, T_RouteName } from "~/constants/routes";
import { E_Routes } from "~/constants/routes";
import type localesNotificationsPL from "~/locales/pl/notifications.json";
import { omitNested, reduceToUniqueFields } from "~/utilities/functions";

import { useGlobalGeneratedModalContext } from "./useGlobalGeneratedModalContext";
import { useLoading } from "./useLoading";
import { useLocalizedRoute } from "./useLocalizedRoute";
import { useUser } from "./useUser";

type T_Messages = keyof typeof localesNotificationsPL;
type T_RedirectTo = {
  extraPath?: string;
  extraQuery?: T_GetRouteExtraQuery;
  route: T_RouteName;
};

type T_FetcherCommonData = {
  formErrors?: { field: string; message: string }[];
  message?: T_Messages;
  modal?: string;
  redirectTo?: T_RedirectTo | T_RouteName;
  refetchUserSession?: boolean;
  status?: number;
};

export const useFetcherWithActions = <
  T extends undefined | ZodSchema<any> = undefined,
>(properties: {
  disabledAlert?: boolean;
  disabledFormErrors?: boolean;
  disabledLoader?: boolean;
  key?: string;
  onSuccess?: () => void;
  onSuccessRefetchUserData?: boolean;
  schema?: T;
}) => {
  type T_InferredData = (T extends ZodSchema<any> ? ZodInfer<T> : unknown) &
    T_FetcherCommonData;
  const fetcher = useFetcher<T_InferredData>({
    key: properties.key,
  });
  const { t } = useTranslation(namespaces.notifications);
  const { t: tModals } = useTranslation(namespaces.modals);
  const { t: tCommon } = useTranslation(namespaces.common);
  const { onChangeModalName } = useGlobalGeneratedModalContext();
  const { onChangeLoading } = useLoading();
  const { getLocalizedRoute } = useLocalizedRoute();
  const { forceRefreshData, logout } = useUser({
    fetchUserIfNotExist: false,
    requireSession: false,
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (properties?.disabledLoader) {
      return;
    }

    onChangeLoading({
      value: fetcher.state !== "idle",
    });
  }, [fetcher]);

  useEffect(() => {
    if (!fetcher.data || fetcher.state !== "idle") {
      return;
    }

    const run = async () => {
      const fetcherData = fetcher.data;
      const isErrorStatus = (fetcherData?.status ?? 200) >= 400;

      if (properties?.schema) {
        const sanitizedData = omitNested(fetcherData, {
          formErrors: false,
          message: false,
          modal: false,
          redirectTo: false,
          refetchUserSession: false,
          status: false,
        });
        const result = properties.schema.safeParse(sanitizedData);
        if (!result.success) {
          console.error(result.error);
          navigate(getLocalizedRoute({ route: E_Routes.error }));
          return;
        }
      }

      if (fetcherData?.message && !properties?.disabledAlert) {
        notifications.show({
          color: isErrorStatus ? "red" : "green",
          id: dayjs().set("milliseconds", 0).unix().toString(),
          message: t(`${fetcherData.message}.message` as any),
          title: t(`${fetcherData.message}.title` as any),
        });

        if (fetcherData?.status === 401) {
          await logout();
          return;
        }
      }

      if (fetcherData?.formErrors && !properties?.disabledFormErrors) {
        const uniqueErrors = reduceToUniqueFields(fetcherData.formErrors);
        for (const { field, message } of uniqueErrors) {
          notifications.show({
            color: "red",
            id: dayjs().set("milliseconds", 0).unix().toString(),
            message: t(`${message}.message` as any),
            title: `${t(`${message}.title` as any)} ${tCommon(`inputs.${field}` as any)}`,
          });
        }
      }

      if (
        fetcherData?.modal &&
        tModals(`${fetcherData.modal}.title` as any) !==
          `${fetcherData.modal}.title`
      ) {
        onChangeModalName({
          newModalName: fetcherData.modal,
          withConfetti:
            tModals(`${fetcherData.modal}.confetti` as any) === "true",
        });
      }

      if (
        fetcherData?.refetchUserSession ||
        properties?.onSuccessRefetchUserData
      ) {
        forceRefreshData();
      }

      if (fetcherData?.redirectTo) {
        const redirectTo = fetcherData.redirectTo as T_RedirectTo | T_RouteName;
        const path =
          typeof redirectTo === "string"
            ? getLocalizedRoute({ route: redirectTo })
            : getLocalizedRoute({
                extraPath: redirectTo.extraPath,
                route: redirectTo.route,
              });
        navigate(path);
      }

      properties?.onSuccess?.();
    };

    run();
  }, [fetcher]);

  return fetcher;
};
