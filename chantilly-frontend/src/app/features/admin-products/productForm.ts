import { normalizeText, validateImageUrl, validatePositiveNumber, validateRequiredText } from "../../lib/validation";
import type { ProductErrors, ProductForm } from "./types";

export const PAGE_SIZE = 8;

export const emptyProductForm: ProductForm = {
  nombre: "",
  categoriaId: "",
  precio: "",
  stock: "",
  descripcion: "",
  imagenUrl: "",
};

export function validateProductForm(form: ProductForm) {
  const nextErrors: ProductErrors = {
    nombre: validateRequiredText(form.nombre, "El nombre", 3, 80),
    categoriaId: form.categoriaId ? "" : "La categoría es obligatoria",
    precio: validatePositiveNumber(form.precio, "El precio"),
    stock: validatePositiveNumber(form.stock, "El stock", true),
    descripcion: form.descripcion ? validateRequiredText(form.descripcion, "La descripción", 10, 250) : "",
    imagenUrl: validateImageUrl(form.imagenUrl, false),
  };

  return {
    errors: nextErrors,
    isValid: !Object.values(nextErrors).some(Boolean),
  };
}

export function normalizeProductPayload(form: ProductForm) {
  return {
    nombre: normalizeText(form.nombre),
    categoriaId: Number(form.categoriaId),
    precio: Number(form.precio),
    stock: Number(form.stock),
    descripcion: normalizeText(form.descripcion),
    imagenUrl: form.imagenUrl.trim(),
  };
}
