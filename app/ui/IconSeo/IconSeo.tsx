import type {
  IconDefinition,
  RotateProp,
  SizeProp,
} from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CSSProperties, memo } from "react";

export type T_IconPrefix = "brand" | "regular" | "solid";

export type T_IconSeo = {
  beat?: boolean;
  beatFade?: boolean;
  border?: boolean;
  bounce?: boolean;
  color?: string;
  fade?: boolean;
  icon: IconDefinition;
  pulse?: boolean;
  rotation?: RotateProp;
  shake?: boolean;
  size?: "md" | SizeProp;
  spin?: boolean;
  spinPulse?: boolean;
  spinReverse?: boolean;
  style?: CSSProperties;
  width?: number | string;
};

const IconSeoToMemoize = ({
  beat,
  beatFade,
  border,
  bounce,
  color,
  fade,
  icon,
  pulse,
  rotation,
  shake,
  size = "lg",
  spin = false,
  spinPulse,
  spinReverse,
  style,
  width,
}: T_IconSeo) => {
  return (
    <FontAwesomeIcon
      beat={beat}
      beatFade={beatFade}
      border={border}
      bounce={bounce}
      color={color}
      fade={fade}
      icon={icon}
      pulse={pulse}
      rotation={rotation}
      shake={shake}
      size={size === "md" ? undefined : size}
      spin={spin}
      spinPulse={spinPulse}
      spinReverse={spinReverse}
      style={{
        ...(width ? { width } : {}),
        userSelect: "none",
        ...style,
      }}
      tabIndex={-1}
    />
  );
};

export const IconSeo = memo(IconSeoToMemoize);
