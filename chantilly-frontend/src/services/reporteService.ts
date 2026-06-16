import axiosInstance from "../lib/axiosInstance";

export interface VentasDiaApi {
  fecha: string;
  cantidad: number;
  total: number;
}

export interface VentasReporteApi {
  totalPedidos: number;
  ingresosTotal: number;
  ticketPromedio: number;
  pedidosEntregados: number;
  pedidosCancelados: number;
  detallePorFecha: VentasDiaApi[];
}

export interface ProductoVentaApi {
  id: number;
  nombre: string;
  categoria: string;
  totalVendido: number;
  ingresosGenerados: number;
}

export interface AlertaStockApi {
  id: number;
  productoId: number;
  nombreProducto: string;
  stockActual: number;
  stockMinimo: number;
  creadoEn?: string;
}

export interface DashboardApi {
  ventasHoyTotal: number;
  ventasHoyCantidad: number;
  pedidosPendientes: number;
  alertasStockActivas: number;
  totalClientes: number;
  tasaConversion: number;
  ticketDelivery: number;
  ticketRecojoTienda: number;
  tiempoEntregaPromedioHoras: number;
  ventasSemana: VentasDiaApi[];
}

export const reporteService = {
  getReporteVentas: (desde: string, hasta: string) =>
    axiosInstance.get<VentasReporteApi>("/reportes/ventas", { params: { desde, hasta } }),
  getProductosVendidos: () =>
    axiosInstance.get<ProductoVentaApi[]>("/reportes/productos-vendidos"),
  getPedidosPorEstado: () =>
    axiosInstance.get<Record<string, number>>("/reportes/pedidos-por-estado"),
  getIngresosPorPago: () =>
    axiosInstance.get<Record<string, number>>("/reportes/ingresos-por-pago"),
  getDashboard: () =>
    axiosInstance.get<DashboardApi>("/reportes/dashboard"),
  getAlertasStock: () =>
    axiosInstance.get<AlertaStockApi[]>("/reportes/alertas-stock"),
  marcarAlertaAtendida: (id: number) =>
    axiosInstance.put(`/reportes/alertas-stock/${id}`),
};
