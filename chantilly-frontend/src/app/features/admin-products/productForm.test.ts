import { describe, expect, it } from "vitest";
import { emptyProductForm, normalizeProductPayload, validateProductForm } from "./productForm";

describe("productForm", () => {
  it("marca errores visibles cuando faltan campos obligatorios", () => {
    const result = validateProductForm(emptyProductForm);

    expect(result.isValid).toBe(false);
    expect(result.errors.nombre).toContain("obligatorio");
    expect(result.errors.categoriaId).toContain("obligatoria");
    expect(result.errors.precio).toContain("obligatorio");
    expect(result.errors.stock).toContain("obligatorio");
  });

  it("normaliza el payload sin alterar la forma esperada por la API", () => {
    const payload = normalizeProductPayload({
      nombre: "  Torta de Fresa  ",
      categoriaId: "4",
      precio: "68",
      stock: "12",
      descripcion: "  Cobertura   suave y relleno fresco  ",
      imagenUrl: " https://cdn.test/torta.jpg ",
    });

    expect(payload).toEqual({
      nombre: "Torta de Fresa",
      categoriaId: 4,
      precio: 68,
      stock: 12,
      descripcion: "Cobertura suave y relleno fresco",
      imagenUrl: "https://cdn.test/torta.jpg",
    });
  });
});
