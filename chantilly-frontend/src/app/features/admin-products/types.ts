export type ViewProduct = {
  id: number;
  nombre: string;
  categoriaId: number;
  categoriaNombre: string;
  precio: number;
  stock: number;
  descripcion: string;
  imagenUrl: string;
  disponible: boolean;
};

export type ProductForm = {
  nombre: string;
  categoriaId: string;
  precio: string;
  stock: string;
  descripcion: string;
  imagenUrl: string;
};

export type ProductErrors = Partial<Record<keyof ProductForm, string>>;
export type ProductStatusFilter = "TODOS" | "ACTIVOS" | "INACTIVOS";
export type BulkConfirmState = {
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => Promise<void>;
} | null;
