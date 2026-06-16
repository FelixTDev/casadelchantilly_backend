import * as XLSX from "xlsx";
import type { ProductoVentaApi, VentasReporteApi } from "../../services/reporteService";
import { ExportMeta, safeSheetName } from "./reportExportShared";

export function exportSalesReportToExcelImpl(args: {
  desde: string;
  hasta: string;
  reporte: VentasReporteApi;
  topProductos: ProductoVentaApi[];
  filters: Array<{ label: string; value: string }>;
  meta: ExportMeta;
}) {
  const workbook = XLSX.utils.book_new();

  const resumen = [
    { Indicador: "Módulo", Valor: "Reportes de ventas" },
    { Indicador: "Rango", Valor: `${args.desde} a ${args.hasta}` },
    { Indicador: "Exportado por", Valor: args.meta.exportedBy },
    { Indicador: "Fecha de exportación", Valor: args.meta.exportedAt },
    { Indicador: "Pedidos totales", Valor: args.reporte.totalPedidos },
    { Indicador: "Ingresos brutos", Valor: Number(args.reporte.ingresosTotal) },
    { Indicador: "Ticket promedio", Valor: Number(args.reporte.ticketPromedio) },
    { Indicador: "Pedidos entregados", Valor: args.reporte.pedidosEntregados },
    { Indicador: "Pedidos cancelados", Valor: args.reporte.pedidosCancelados },
  ];

  const filtros = args.filters.length > 0
    ? args.filters.map((item) => ({ Filtro: item.label, Valor: item.value }))
    : [{ Filtro: "Estado", Valor: "No se encontraron filtros aplicados" }];

  const detalleVentas =
    args.reporte.detallePorFecha.length > 0
      ? args.reporte.detallePorFecha.map((item) => ({
          Fecha: item.fecha,
          Pedidos: item.cantidad,
          Ingresos: Number(item.total),
        }))
      : [{ Fecha: "Sin resultados", Pedidos: 0, Ingresos: 0 }];

  const productos =
    args.topProductos.length > 0
      ? args.topProductos.map((item, index) => ({
          Ranking: index + 1,
          Producto: item.nombre,
          Categoria: item.categoria,
          Unidades: item.totalVendido,
          Ingresos: Number(item.ingresosGenerados),
        }))
      : [{ Ranking: "-", Producto: "No se encontraron registros para los filtros aplicados", Categoria: "-", Unidades: 0, Ingresos: 0 }];

  const resumenSheet = XLSX.utils.json_to_sheet(resumen);
  const filtrosSheet = XLSX.utils.json_to_sheet(filtros);
  const ventasSheet = XLSX.utils.json_to_sheet(detalleVentas);
  const productosSheet = XLSX.utils.json_to_sheet(productos);

  resumenSheet["!cols"] = [{ wch: 28 }, { wch: 28 }];
  filtrosSheet["!cols"] = [{ wch: 22 }, { wch: 30 }];
  ventasSheet["!cols"] = [{ wch: 15 }, { wch: 14 }, { wch: 16 }];
  productosSheet["!cols"] = [{ wch: 10 }, { wch: 34 }, { wch: 18 }, { wch: 12 }, { wch: 16 }];
  ventasSheet["!autofilter"] = { ref: "A1:C2" };
  productosSheet["!autofilter"] = { ref: "A1:E2" };

  XLSX.utils.book_append_sheet(workbook, resumenSheet, safeSheetName("Resumen"));
  XLSX.utils.book_append_sheet(workbook, filtrosSheet, safeSheetName("Filtros"));
  XLSX.utils.book_append_sheet(workbook, ventasSheet, safeSheetName("Ventas"));
  XLSX.utils.book_append_sheet(workbook, productosSheet, safeSheetName("Productos"));

  XLSX.writeFile(workbook, `reporte-ventas-${args.desde}-a-${args.hasta}.xlsx`);
}
