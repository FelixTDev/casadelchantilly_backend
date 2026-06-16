import type { PagoApi } from "./pagoService";

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
  cambiadoPorNombre?: string;
  creadoEn?: string;
}

export interface PedidoApi {
  id: number;
  codigoPedido: string;
  estado: string;
  modalidadEntrega: string;
  idDireccion?: number | null;
  direccionEtiqueta?: string;
  direccionDetalle?: string;
  direccionTelefono?: string;
  clienteNombre?: string;
  clienteEmail?: string;
  clienteTelefono?: string;
  fechaEntrega?: string;
  horaEntrega?: string;
  subtotal: number;
  costoEnvio: number;
  descuento: number;
  total: number;
  notasCliente?: string;
  pago?: PagoApi;
  items: PedidoItemApi[];
  historialEstados: HistorialEstadoApi[];
  creadoEn?: string;
}
