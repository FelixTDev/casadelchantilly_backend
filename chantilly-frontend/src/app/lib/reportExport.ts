import type { ProductoVentaApi, VentasReporteApi } from "../../services/reporteService";

type ExportFilter = {
  label: string;
  value: string;
};

type PdfModule = typeof import("./reportExportPdf");
type ExcelModule = typeof import("./reportExportExcel");

function getExportMeta() {
  const userRaw = sessionStorage.getItem("chantilly_user");
  const parsed = userRaw ? JSON.parse(userRaw) : null;
  return {
    exportedAt: new Date().toLocaleString("es-PE"),
    exportedBy: parsed?.email || "Administrador",
  };
}

export async function exportSalesReportToExcel(args: {
  desde: string;
  hasta: string;
  reporte: VentasReporteApi;
  topProductos: ProductoVentaApi[];
  filters: ExportFilter[];
}) {
  const module = (await import("./reportExportExcel")) as ExcelModule;
  return module.exportSalesReportToExcelImpl({
    ...args,
    meta: getExportMeta(),
  });
}

export async function exportSalesReportToPdf(args: {
  desde: string;
  hasta: string;
  reporte: VentasReporteApi;
  topProductos: ProductoVentaApi[];
  filters: ExportFilter[];
}) {
  const module = (await import("./reportExportPdf")) as PdfModule;
  return module.exportSalesReportToPdfImpl({
    ...args,
    meta: getExportMeta(),
  });
}
