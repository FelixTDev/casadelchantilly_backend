export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^[0-9]{9}$/;
export const NAME_REGEX = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,60}$/;
export const NAME_ALLOWED_INPUT_REGEX = /[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g;

export function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function sanitizeNameInput(value: string) {
  return value
    .replace(NAME_ALLOWED_INPUT_REGEX, "")
    .replace(/\s{2,}/g, " ")
    .replace(/^\s+/, "");
}

export function normalizePersonName(value: string) {
  const sanitized = normalizeText(sanitizeNameInput(value)).toLocaleLowerCase("es-PE");
  return sanitized.replace(/(^|\s)([a-záéíóúñ])/g, (match) => match.toLocaleUpperCase("es-PE"));
}

export function hasInvalidNameCharacters(value: string) {
  return NAME_ALLOWED_INPUT_REGEX.test(value);
}

export function normalizePhone(value: string) {
  return value.replace(/\D/g, "").slice(0, 9);
}

export function validateEmail(value: string) {
  const normalized = value.trim();
  if (!normalized) return "Este campo es obligatorio";
  if (!EMAIL_REGEX.test(normalized)) return "Ingresa un correo válido";
  return "";
}

export function validatePassword(value: string) {
  if (!value) return "Este campo es obligatorio";
  if (value.length < 6) return "La contraseña debe tener al menos 6 caracteres";
  return "";
}

export function validatePasswordConfirmation(password: string, confirmation: string) {
  if (!confirmation) return "Este campo es obligatorio";
  if (password !== confirmation) return "Las contraseñas no coinciden";
  return "";
}

export function validateName(value: string, label: string) {
  const hasInvalidCharacters = hasInvalidNameCharacters(value);
  const sanitized = sanitizeNameInput(value);
  const normalized = normalizeText(sanitized);
  if (!normalized) return `${label} es obligatorio`;
  if (hasInvalidCharacters) return "Solo se permiten letras";
  if (normalized.length < 2 || normalized.length > 60) return `${label} debe tener entre 2 y 60 caracteres`;
  if (!NAME_REGEX.test(normalized)) return "Solo se permiten letras";
  return "";
}

export function validatePhone(value: string, required = true) {
  const normalized = normalizePhone(value);
  if (!normalized) return required ? "El teléfono es obligatorio" : "";
  if (!PHONE_REGEX.test(normalized)) return "Ingresa un teléfono de 9 dígitos";
  return "";
}

export function validateAddressLabel(value: string) {
  const normalized = normalizeText(value);
  if (!normalized) return "La etiqueta es obligatoria";
  if (normalized.length < 2) return "La etiqueta debe tener al menos 2 caracteres";
  if (normalized.length > 30) return "La etiqueta no debe superar los 30 caracteres";
  return "";
}

export function validateAddress(value: string) {
  const normalized = normalizeText(value);
  if (!normalized) return "La dirección es obligatoria";
  if (normalized.length < 10) return "La dirección debe ser más específica";
  return "";
}

export function validateDedication(value: string, maxLength: number) {
  if (!value) return "";
  if (!value.trim()) return "La dedicatoria no puede contener solo espacios";
  if (value.length > maxLength) return `La dedicatoria no debe superar ${maxLength} caracteres`;
  return "";
}

export function getLocalDateInputValue(date = new Date()) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
}

export function validateRequiredText(value: string, label: string, min = 2, max = 120) {
  const normalized = normalizeText(value);
  if (!normalized) return `${label} es obligatorio`;
  if (normalized.length < min) return `${label} debe tener al menos ${min} caracteres`;
  if (normalized.length > max) return `${label} no debe superar los ${max} caracteres`;
  return "";
}

export function validatePositiveNumber(value: string, label: string, allowZero = false) {
  if (!value.trim()) return `${label} es obligatorio`;
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return `${label} debe ser un número válido`;
  if (allowZero ? numeric < 0 : numeric <= 0) {
    return allowZero ? `${label} no puede ser negativo` : `${label} debe ser mayor a 0`;
  }
  return "";
}

export function validateImageUrl(value: string, required = false) {
  const normalized = value.trim();
  if (!normalized) return required ? "La URL de imagen es obligatoria" : "";
  try {
    const url = new URL(normalized);
    if (!["http:", "https:"].includes(url.protocol)) {
      return "La imagen debe usar http o https";
    }
    return "";
  } catch {
    return "Ingresa una URL de imagen válida";
  }
}

export function validateDateRange(desde: string, hasta: string) {
  if (!desde || !hasta) return "Debes seleccionar ambas fechas";
  if (desde > hasta) return "La fecha inicial no puede ser mayor a la final";
  return "";
}
