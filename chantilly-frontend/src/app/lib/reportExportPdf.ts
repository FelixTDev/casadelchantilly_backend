import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { ProductoVentaApi, VentasReporteApi } from "../../services/reporteService";
import { ExportMeta, formatCurrency } from "./reportExportShared";

export function exportSalesReportToPdfImpl(args: {
  desde: string;
  hasta: string;
  reporte: VentasReporteApi;
  topProductos: ProductoVentaApi[];
  filters: Array<{ label: string; value: string }>;
  meta: ExportMeta;
}) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 40;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(211, 47, 47);
  doc.text("LA CASA DEL CHANTILLY", margin, 34);

  doc.setFontSize(22);
  doc.setTextColor(33, 33, 33);
  doc.text("Reporte de ventas", margin, 58);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(90, 90, 90);
  doc.text(`Periodo: ${args.desde} a ${args.hasta}`, margin, 78);
  doc.text(`Exportado por: ${args.meta.exportedBy}`, margin, 94);
  doc.text(`Generado: ${args.meta.exportedAt}`, margin, 108);

  autoTable(doc, {
    startY: 124,
    theme: "plain",
    styles: { fontSize: 9, cellPadding: 6, textColor: [75, 85, 99] },
    body:
      args.filters.length > 0
        ? args.filters.map((filter) => [`${filter.label}:`, filter.value])
        : [["Filtros", "No se encontraron filtros aplicados"]],
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 120 },
      1: { cellWidth: 360 },
    },
  });

  autoTable(doc, {
    startY: (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 18,
    theme: "striped",
    styles: { fontSize: 10, cellPadding: 8 },
    head: [["Indicador", "Valor"]],
    body: [
      ["Pedidos totales", String(args.reporte.totalPedidos)],
      ["Ingresos brutos", formatCurrency(Number(args.reporte.ingresosTotal))],
      ["Ticket promedio", formatCurrency(Number(args.reporte.ticketPromedio))],
      ["Pedidos entregados", String(args.reporte.pedidosEntregados)],
      ["Pedidos cancelados", String(args.reporte.pedidosCancelados)],
    ],
    headStyles: { fillColor: [184, 58, 58] },
    alternateRowStyles: { fillColor: [250, 250, 250] },
  });

  autoTable(doc, {
    startY: (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 22,
    theme: "striped",
    styles: { fontSize: 9, cellPadding: 7 },
    head: [["Fecha", "Pedidos", "Ingresos"]],
    body:
      args.reporte.detallePorFecha.length > 0
        ? args.reporte.detallePorFecha.map((item) => [
            item.fecha,
            String(item.cantidad),
            formatCurrency(Number(item.total)),
          ])
        : [["Sin resultados", "0", "S/ 0.00"]],
    headStyles: { fillColor: [31, 41, 55] },
    alternateRowStyles: { fillColor: [249, 250, 251] },
  });

  autoTable(doc, {
    startY: (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 22,
    theme: "striped",
    styles: { fontSize: 9, cellPadding: 7 },
    head: [["#", "Producto", "Categoría", "Unidades", "Ingresos"]],
    body:
      args.topProductos.length > 0
        ? args.topProductos.map((item, index) => [
            String(index + 1),
            item.nombre,
            item.categoria,
            String(item.totalVendido),
            formatCurrency(Number(item.ingresosGenerados)),
          ])
        : [["-", "No se encontraron registros para los filtros aplicados", "-", "0", "S/ 0.00"]],
    headStyles: { fillColor: [245, 197, 24] },
    alternateRowStyles: { fillColor: [255, 251, 235] },
  });

  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page++) {
    doc.setPage(page);
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(`Página ${page} de ${pages}`, margin, doc.internal.pageSize.getHeight() - 16);
    doc.text(`Exportado por ${args.meta.exportedBy}`, doc.internal.pageSize.getWidth() - 170, doc.internal.pageSize.getHeight() - 16);
  }

  doc.save(`reporte-ventas-${args.desde}-a-${args.hasta}.pdf`);
}
