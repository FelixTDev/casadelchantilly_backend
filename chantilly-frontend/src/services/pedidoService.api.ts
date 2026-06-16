import axiosInstance from "../lib/axiosInstance";
import type { CrearPedidoRequest, PedidoApi } from "./pedidoService.types";

export const crearPedido = (data: CrearPedidoRequest) => axiosInstance.post<PedidoApi>("/pedidos", data);
export const getMisPedidos = () => axiosInstance.get<PedidoApi[]>("/pedidos/mis-pedidos");
export const getPedidoById = (id: number | string) => axiosInstance.get<PedidoApi>(`/pedidos/${id}`);
export const getTodosLosPedidos = () => axiosInstance.get<PedidoApi[]>("/pedidos");
export const cambiarEstadoPedido = (id: number | string, estado: string) => axiosInstance.put<PedidoApi>(`/pedidos/${id}/estado`, { estado });
export const cancelarPedido = (id: number | string) => axiosInstance.delete(`/pedidos/${id}/cancelar`);
export const descargarBoletaPedido = (id: number | string) => axiosInstance.get(`/pedidos/${id}/boleta`, { responseType: "blob" });
