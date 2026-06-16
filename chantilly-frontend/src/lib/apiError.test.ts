import axios, { AxiosError } from "axios";
import { describe, expect, it } from "vitest";
import { getUserErrorMessage } from "./apiError";

function buildAxiosError(status?: number, code?: string) {
  return new AxiosError(
    "request failed",
    code,
    undefined,
    undefined,
    status
      ? {
          data: { message: "backend detail" },
          status,
          statusText: "Error",
          headers: {},
          config: {} as never,
        }
      : undefined
  );
}

describe("getUserErrorMessage", () => {
  it("maps auth errors to a friendly message", () => {
    expect(getUserErrorMessage(buildAxiosError(401))).toBe("Tu sesión ha expirado. Vuelve a iniciar sesión.");
    expect(getUserErrorMessage(buildAxiosError(403))).toBe("No tienes permisos para realizar esta acción.");
  });

  it("maps network and timeout errors", () => {
    expect(getUserErrorMessage(buildAxiosError(undefined, "ECONNABORTED"))).toBe(
      "La operación tardó demasiado tiempo. Inténtalo nuevamente."
    );

    const networkError = axios.isAxiosError(buildAxiosError()) ? buildAxiosError() : new Error("network");
    expect(getUserErrorMessage(networkError)).toBe("No pudimos conectarnos con el servidor. Verifica tu conexión.");
  });

  it("falls back to a generic message for unhandled statuses", () => {
    expect(getUserErrorMessage(buildAxiosError(418))).toBe(
      "Ocurrió un problema inesperado. Intenta nuevamente más tarde."
    );
  });
});
