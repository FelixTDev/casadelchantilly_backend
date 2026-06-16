import axios, { AxiosError } from "axios";

const STATUS_MESSAGES: Record<number, string> = {
  401: "Tu sesión ha expirado. Vuelve a iniciar sesión.",
  403: "No tienes permisos para realizar esta acción.",
  404: "No encontramos la información solicitada.",
  409: "La información ya existe o entra en conflicto con un registro existente.",
  422: "Los datos ingresados no son válidos.",
  429: "Has realizado demasiados intentos. Espera unos minutos e inténtalo nuevamente.",
  500: "Ocurrió un problema inesperado. Intenta nuevamente más tarde.",
};

export type FriendlyAxiosError = AxiosError & {
  friendlyMessage?: string;
  statusCode?: number;
};

export function getUserErrorMessage(error: unknown, fallback?: string) {
  if (!axios.isAxiosError(error)) {
    return fallback || "Ocurrió un problema inesperado. Intenta nuevamente más tarde.";
  }

  if (error.code === "ECONNABORTED") {
    return "La operación tardó demasiado tiempo. Inténtalo nuevamente.";
  }

  if (!error.response) {
    return "No pudimos conectarnos con el servidor. Verifica tu conexión.";
  }

  const status = error.response.status;
  const apiMessage = typeof error.response.data?.message === "string" ? error.response.data.message.trim() : "";
  if ([404, 409, 422].includes(status) && apiMessage && isSafeBusinessMessage(apiMessage)) {
    return apiMessage;
  }
  return STATUS_MESSAGES[status] || fallback || "Ocurrió un problema inesperado. Intenta nuevamente más tarde.";
}

export function toFriendlyAxiosError(error: unknown, fallback?: string) {
  if (!axios.isAxiosError(error)) {
    return error;
  }

  const friendlyError = error as FriendlyAxiosError;
  friendlyError.statusCode = error.response?.status;
  friendlyError.friendlyMessage = getUserErrorMessage(error, fallback);
  return friendlyError;
}

function isSafeBusinessMessage(message: string) {
  const normalized = message.toLowerCase();
  return ![
    "exception",
    "stack",
    "sql",
    "hibernate",
    "jakarta",
    "spring",
    "java.",
    "trace",
    "syntax",
  ].some((fragment) => normalized.includes(fragment));
}
