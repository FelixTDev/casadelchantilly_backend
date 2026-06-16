import axiosInstance from "../lib/axiosInstance";

export interface PagoApi {
  id?: number;
  pedidoId?: number;
  codigoPedido?: string;
  clienteNombre?: string;
  modalidadEntrega?: string;
  metodoPago: string;
  estadoPago?: string;
  monto?: number;
  referencia?: string;
  fechaPago?: string;
}

export const pagoService = {
  registrar: (pedidoId: number, data: PagoApi) =>
    axiosInstance.post<PagoApi>(`/pagos?pedidoId=${pedidoId}`, data),
  getPorPedido: (pedidoId: number | string) => axiosInstance.get<PagoApi>(`/pagos/pedido/${pedidoId}`),
  getTodos: (params?: { estado?: string; metodo?: string }) => axiosInstance.get<PagoApi[]>("/pagos", { params }),
  actualizarEstado: (id: number | string, data: { estadoPago: string; referencia?: string }) =>
    axiosInstance.put<PagoApi>(`/pagos/${id}/estado`, data),
};
