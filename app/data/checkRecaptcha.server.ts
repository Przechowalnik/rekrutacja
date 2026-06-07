import axios from "axios";

import { environment } from "~/data/environment.server";

export const checkRecaptcha = async (captcha: string) => {
  if (!captcha) {
    return false;
  }

  if (
    environment("LOCAL_ENV")?.toLowerCase() === "dev" ||
    process.env.NODE_ENV === "development" ||
    process.env.VITE_VERCEL_ENV === "preview"
  ) {
    return true;
  }

  try {
    const response = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      `secret=${environment("GOOGLE_RECAPTCHA_BACKEND")}&response=${captcha}`,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
        },
      },
    );

    return response.data.success;
  } catch {
    return false;
  }
};
