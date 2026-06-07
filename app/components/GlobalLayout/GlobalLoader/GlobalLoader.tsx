import { useEffect, useRef, useState } from "react";
import { useNavigation } from "react-router";

import { useLoading } from "~/hooks/useLoading";
import { useUser } from "~/hooks/useUser";
import { Loader } from "~/ui/Loader";

export const GlobalLoader = () => {
  const [isLoading, setIsLoading] = useState(false);

  const { isUserFetching } = useUser({
    fetchUserIfNotExist: false,
    requireSession: false,
  });

  const navigation = useNavigation();
  const { isLoading: isLoadingHook, isLoadingLocalization } = useLoading();
  const showTimeoutReference = useRef<null | ReturnType<typeof setTimeout>>(
    null,
  );

  const isLoadingNavigation = navigation.state !== "idle";

  useEffect(() => {
    if (isLoadingNavigation || isLoadingHook || isLoadingLocalization) {
      showTimeoutReference.current = setTimeout(() => {
        if (isLoadingNavigation || isLoadingHook || isLoadingLocalization) {
          setIsLoading(true);
        } else {
          setIsLoading(false);
        }
      }, 200);
    } else {
      if (showTimeoutReference.current) {
        clearTimeout(showTimeoutReference.current);
      }
      setIsLoading(false);
    }

    return () => {
      if (showTimeoutReference.current) {
        clearTimeout(showTimeoutReference.current);
      }
    };
  }, [isLoadingNavigation, isLoadingHook, isLoadingLocalization]);

  return <Loader isLoading={isLoading || isUserFetching} />;
};
