import axiosInstance from "../lib/axiosInstance";

export interface CrearPedidoRequest {
  modalidadEntrega: "DELIVERY" | "RECOJO_TIENDA";
  idDireccion?: number | null;
  fechaEntrega: string;
  horaEntrega?: string | null;
  notasCliente?: string;
  codigoCupon?: string;
}

export interface PedidoItemApi {
  id: number;
  productoId: number;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  personalizacion?: string;
}

export interface HistorialEstadoApi {
  id: number;
  estado: string;
  comentario?: string;
  cambiadoPor?: number;
  creadoEn?: string;
}

export interface PedidoApi {
  id: number;
  codigoPedido: string;
  estado: string;
  modalidadEntrega: string;
  fechaEntrega?: string;
  horaEntrega?: string;
  subtotal: number;
  costoEnvio: number;
  descuento: number;
  total: number;
  notasCliente?: string;
  items: PedidoItemApi[];
  historialEstados: HistorialEstadoApi[];
  creadoEn?: string;
}

export const pedidoService = {
  crear: (data: CrearPedidoRequest) => axiosInstance.post<PedidoApi>("/pedidos", data),
  getMisPedidos: () => axiosInstance.get<PedidoApi[]>("/pedidos/mis-pedidos"),
  getById: (id: number | string) => axiosInstance.get<PedidoApi>(`/pedidos/${id}`),
  getTodos: () => axiosInstance.get<PedidoApi[]>("/pedidos"),
  cambiarEstado: (id: number | string, estado: string) => axiosInstance.put<PedidoApi>(`/pedidos/${id}/estado`, { estado }),
  cancelar: (id: number | string) => axiosInstance.delete(`/pedidos/${id}/cancelar`),
};

