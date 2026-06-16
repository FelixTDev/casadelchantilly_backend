import axiosInstance from "../lib/axiosInstance";

export interface CategoriaApi {
  id: number;
  nombre: string;
  descripcion?: string;
  imagenUrl?: string;
  activo?: boolean;
}

export interface ProductoApi {
  id?: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  precioOferta?: number | null;
  stock: number;
  stockMinimo?: number;
  imagenUrl?: string;
  disponible?: boolean;
  enOferta?: boolean;
  tiempoPreparacion?: number;
  categoriaId: number;
  categoriaNombre?: string;
}

export interface PromocionApi {
  id?: number;
  nombre: string;
  descripcion?: string;
  tipo: string;
  valor: number;
  fechaInicio: string;
  fechaFin: string;
  activo?: boolean;
  productoIds?: number[];
  codigoCupon?: string;
}

export const productoService = {
  getAll: () => axiosInstance.get<ProductoApi[]>("/productos"),
  getAdminAll: () => axiosInstance.get<ProductoApi[]>("/productos/admin/listado"),
  getById: (id: number) => axiosInstance.get<ProductoApi>(`/productos/${id}`),
  getBuscar: (nombre: string) => axiosInstance.get<ProductoApi[]>("/productos/buscar", { params: { nombre } }),
  getByCategoria: (id: number) => axiosInstance.get<ProductoApi[]>(`/productos/categoria/${id}`),
  getCategorias: () => axiosInstance.get<CategoriaApi[]>("/categorias"),
  getPromociones: () => axiosInstance.get<PromocionApi[]>("/promociones"),
  getPromocionesAdmin: () => axiosInstance.get<PromocionApi[]>("/promociones/admin/listado"),
  crear: (data: ProductoApi) => axiosInstance.post<ProductoApi>("/productos", data),
  actualizar: (id: number, data: ProductoApi) => axiosInstance.put<ProductoApi>(`/productos/${id}`, data),
  desactivar: (id: number) => axiosInstance.delete(`/productos/${id}`),
  crearPromocion: (data: PromocionApi) => axiosInstance.post<PromocionApi>("/promociones", data),
  actualizarPromocion: (id: number, data: PromocionApi) => axiosInstance.put<PromocionApi>(`/promociones/${id}`, data),
  desactivarPromocion: (id: number) => axiosInstance.delete(`/promociones/${id}`),
};
