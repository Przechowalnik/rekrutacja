import { ReactNode, useEffect, useState } from "react";

export const WrapperRemoveOnHidden = ({
  children,
  opened,
}: {
  children: ({}: { visible: boolean }) => ReactNode;
  opened: boolean | undefined;
}) => {
  const [isMounted, setIsMounted] = useState(opened);
  const [isVisible, setIsVisible] = useState(!!opened);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (opened) {
      setIsMounted(true);
      timer = setTimeout(() => {
        setIsVisible(true);
      }, 1);
    } else {
      setIsVisible(false);
      timer = setTimeout(() => {
        setIsMounted(false);
      }, 200);
    }

    return () => clearTimeout(timer);
  }, [opened]);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      {children({
        visible: isVisible,
      })}
    </>
  );
};
