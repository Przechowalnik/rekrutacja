import type { PropsWithChildren } from "react";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useFetchers, useLocation, useNavigation } from "react-router";

import { fetchUserCookieWithFlashData } from "~/apiCalls/userCookies";
import { useFlash } from "~/hooks/useFlash";
import { T_UserCookie } from "~/models/userCookie";

export type T_UserCookieContext = {
  isAfterGetUserCookie: boolean;
  onUpdateUserCookie: (newUserCookie: null | T_UserCookie) => void;
  refreshUserCookie: () => void;
  userCookie: null | T_UserCookie;
};

export const UserCookieContext = createContext<T_UserCookieContext>({
  isAfterGetUserCookie: false,
  onUpdateUserCookie: () => {},
  refreshUserCookie: () => {},
  userCookie: null,
});

export const UserCookieContextProvider = ({ children }: PropsWithChildren) => {
  const [userCookie, setUserCookie] = useState<
    null | T_UserCookie | undefined
  >();

  const lastRefreshReference = useRef(0);
  const lastLocationKeyReference_ = useRef<null | string>(null);
  const mountedReference = useRef(false);
  const prevAnyLoadingReference = useRef(false);
  const navigation = useNavigation();
  const location = useLocation();
  const { onChangeFlashData } = useFlash();
  const fetchers = useFetchers();

  const refreshUserCookie = useCallback(async () => {
    const now = Date.now();
    if (now - lastRefreshReference.current < 200) {
      return;
    }
    lastRefreshReference.current = now;
    const result = await fetchUserCookieWithFlashData({
      forceNoCache: false,
    });

    if (!result?.data) {
      return;
    }

    onChangeFlashData(result?.data?.flashData ?? null);
    setUserCookie(result?.data?.userCookie ?? null);
  }, [onChangeFlashData]);

  useEffect(() => {
    let shouldRefresh = false;

    if (!mountedReference.current) {
      mountedReference.current = true;
      shouldRefresh = true;
    }

    if (
      navigation.state === "idle" &&
      lastLocationKeyReference_.current !== location.key
    ) {
      lastLocationKeyReference_.current = location.key;
      shouldRefresh = true;
    }

    const anyLoading = fetchers.some(
      item => item.state === "loading" || item.state === "submitting",
    );

    if (prevAnyLoadingReference.current && !anyLoading) {
      shouldRefresh = true;
    }

    prevAnyLoadingReference.current = anyLoading;

    if (shouldRefresh) {
      refreshUserCookie();
    }
  }, [navigation.state, location.key, fetchers, refreshUserCookie]);

  const onUpdateUserCookie = useCallback(
    (newUserCookie: null | T_UserCookie) => {
      setUserCookie(newUserCookie);
    },
    [],
  );

  const contextValues = useMemo(() => {
    return {
      isAfterGetUserCookie: userCookie !== undefined,
      onUpdateUserCookie,
      refreshUserCookie,
      userCookie: userCookie ?? null,
    };
  }, [userCookie, onUpdateUserCookie]);

  return (
    <UserCookieContext.Provider value={contextValues}>
      {children}
    </UserCookieContext.Provider>
  );
};
