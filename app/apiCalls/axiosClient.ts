import type { AxiosRequestConfig } from "axios";
import axios from "axios";

const axiosConfig: AxiosRequestConfig = {
  baseURL: globalThis.window === undefined ? "" : globalThis.location.origin,
  headers: {
    "Cache-Control": "no-store, no-cache, must-revalidate",
    "content-type": "application/json",
    Pragma: "no-cache",
  },
};

export const axiosClient = axios.create(axiosConfig);
