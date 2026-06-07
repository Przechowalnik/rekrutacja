import type { PropsWithChildren } from "react";
import { memo, useEffect, useState } from "react";

type T_UnmountWrapper = {
  visible: boolean;
};

const UnmountWrapper = ({
  children,
  visible,
}: PropsWithChildren<T_UnmountWrapper>) => {
  const [isMounted, setIsMounted] = useState(visible);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (visible) {
      setIsMounted(true);
    } else {
      timer = setTimeout(() => {
        setIsMounted(false);
      }, 200);
    }

    return () => clearTimeout(timer);
  }, [visible]);

  if (!isMounted) {
    return null;
  }

  return children;
};

export default memo(UnmountWrapper);
