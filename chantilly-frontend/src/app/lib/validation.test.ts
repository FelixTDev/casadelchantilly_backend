import { describe, expect, it } from "vitest";
import {
  normalizePersonName,
  sanitizeNameInput,
  validateDateRange,
  validateImageUrl,
  validateName,
  validatePhone,
} from "./validation";

describe("validation", () => {
  it("sanitiza nombres y bloquea números o símbolos", () => {
    expect(sanitizeNameInput("  Luc1a@@  del  mar ")).toBe("Luca del mar ");
    expect(validateName("Luc1a", "El nombre")).toBe("Solo se permiten letras");
  });

  it("normaliza nombres de persona con espacios y capitalización", () => {
    expect(normalizePersonName("  marIA   del  cArMen ")).toBe("Maria Del Carmen");
  });

  it("valida longitud y caracteres permitidos en nombres", () => {
    expect(validateName("A", "El nombre")).toBe("El nombre debe tener entre 2 y 60 caracteres");
    expect(validateName("María Fernanda", "El nombre")).toBe("");
  });

  it("valida URLs de imagen y teléfonos", () => {
    expect(validateImageUrl("ftp://imagen.test")).toBe("La imagen debe usar http o https");
    expect(validateImageUrl("https://cdn.chantilly.test/torta.jpg")).toBe("");
    expect(validatePhone("999")).toBe("Ingresa un teléfono de 9 dígitos");
  });

  it("valida rangos de fecha visibles al usuario", () => {
    expect(validateDateRange("", "2026-06-16")).toBe("Debes seleccionar ambas fechas");
    expect(validateDateRange("2026-06-20", "2026-06-16")).toBe("La fecha inicial no puede ser mayor a la final");
    expect(validateDateRange("2026-06-16", "2026-06-20")).toBe("");
  });
});
