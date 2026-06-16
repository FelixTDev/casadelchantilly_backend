import axios, { AxiosHeaders } from "axios";
import { toFriendlyAxiosError } from "./apiError";
import type { InternalAxiosRequestConfig } from "axios";

const currentHost = typeof window !== "undefined" ? window.location.hostname : "localhost";
const fallbackBaseUrl = `http://${currentHost || "localhost"}:8081/api`;
const csrfUrl = `${import.meta.env.VITE_API_BASE_URL || fallbackBaseUrl}/auth/csrf`;
let csrfRequest: Promise<unknown> | null = null;

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || fallbackBaseUrl,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
  withCredentials: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
});

function hasCsrfCookie() {
  if (typeof document === "undefined") {
    return true;
  }
  return document.cookie.split("; ").some((entry) => entry.startsWith("XSRF-TOKEN="));
}

function getCookieValue(name: string) {
  if (typeof document === "undefined") {
    return null;
  }

  const match = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${name}=`));

  if (!match) {
    return null;
  }

  return decodeURIComponent(match.slice(name.length + 1));
}

axiosInstance.interceptors.request.use(async (config) => {
  const method = (config.method || "get").toLowerCase();
  const needsCsrf = !["get", "head", "options"].includes(method);
  if (needsCsrf && !hasCsrfCookie()) {
    csrfRequest ??= axios.get(csrfUrl, {
      withCredentials: true,
      timeout: 15000,
    }).finally(() => {
      csrfRequest = null;
    });
    await csrfRequest;
  }

  if (needsCsrf) {
    const csrfToken = getCookieValue("XSRF-TOKEN");
    if (csrfToken) {
      config.headers = AxiosHeaders.from(config.headers);
      config.headers.set("X-XSRF-TOKEN", csrfToken);
    }
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const friendlyError = toFriendlyAxiosError(error);
    const skipAuthRedirect = Boolean((error.config as InternalAxiosRequestConfig & { skipAuthRedirect?: boolean } | undefined)?.skipAuthRedirect);
    if (error.response?.status === 401 && !skipAuthRedirect) {
      sessionStorage.removeItem("chantilly_user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(friendlyError);
  }
);

export default axiosInstance;
