export const hexToRGB = (hex: string, alpha: number) => {
  const r = Number.parseInt(hex.slice(1, 3), 16),
    g = Number.parseInt(hex.slice(3, 5), 16),
    b = Number.parseInt(hex.slice(5, 7), 16);

  return alpha
    ? "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")"
    : "rgb(" + r + ", " + g + ", " + b + ")";
};

type T_AddAlphaToColor = {
  alpha: number;
  rgbColor: string;
};

export const addAlphaToColor = ({
  alpha,
  rgbColor,
}: T_AddAlphaToColor): string => {
  const regex = /rgb\((\d+), (\d+), (\d+)\)/;
  const match = regex.exec(rgbColor);

  if (!match) {
    console.warn("!match", rgbColor);
  }

  if (!match || alpha < 0 || alpha > 1) {
    console.warn("Error in rgb color.");
    return "";
  }

  const [match1, match2, match3] = match;
  if (!match1 || !match2 || !match3) {
    console.warn("Error in rgb color.");
    return "";
  }

  const r = Number.parseInt(match1);
  const g = Number.parseInt(match2);
  const b = Number.parseInt(match3);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
