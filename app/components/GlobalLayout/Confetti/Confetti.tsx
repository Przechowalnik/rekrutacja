import { Box } from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import ConfettiLib from "react-confetti";
import { useWindowSize } from "usehooks-ts";

import { useConfetti } from "~/hooks/useConfetti";

const CONFETTI_MS = 3400;

const Confetti = () => {
  const { enabled, onChangeConfetti } = useConfetti();
  const { height, width } = useWindowSize();

  const [mounted, setMounted] = useState(false);
  const timeoutReference = useRef<null | ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (timeoutReference.current) {
      clearTimeout(timeoutReference.current);
      timeoutReference.current = null;
    }

    if (!enabled) {
      return;
    }

    timeoutReference.current = setTimeout(() => {
      onChangeConfetti(false);
      timeoutReference.current = null;
    }, CONFETTI_MS);

    return () => {
      if (timeoutReference.current) {
        clearTimeout(timeoutReference.current);
        timeoutReference.current = null;
      }
    };
  }, [enabled, onChangeConfetti]);

  if (!mounted || width === 0 || height === 0) {
    return null;
  }

  if (!enabled) {
    return null;
  }

  return (
    <Box
      pos="fixed"
      style={{
        inset: 0,
        pointerEvents: "none",
        zIndex: 101,
      }}
    >
      <ConfettiLib
        gravity={0.2}
        height={height}
        numberOfPieces={1000}
        tweenDuration={1400}
        width={width}
      />
    </Box>
  );
};

export default Confetti;
