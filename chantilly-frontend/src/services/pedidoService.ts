export type { CrearPedidoRequest, HistorialEstadoApi, PedidoApi, PedidoItemApi } from "./pedidoService.types";
export {
  cambiarEstadoPedido,
  cancelarPedido,
  crearPedido,
  descargarBoletaPedido,
  getMisPedidos,
  getPedidoById,
  getTodosLosPedidos,
} from "./pedidoService.api";

import {
  cambiarEstadoPedido,
  cancelarPedido,
  crearPedido,
  descargarBoletaPedido,
  getMisPedidos,
  getPedidoById,
  getTodosLosPedidos,
} from "./pedidoService.api";

export const pedidoService = {
  crear: crearPedido,
  getMisPedidos,
  getById: getPedidoById,
  getTodos: getTodosLosPedidos,
  cambiarEstado: cambiarEstadoPedido,
  cancelar: cancelarPedido,
  descargarBoleta: descargarBoletaPedido,
};
