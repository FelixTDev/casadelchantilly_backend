import React, { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BarChart3, Calendar, CreditCard, Download, FileSpreadsheet, FileText, ShoppingCart, TrendingUp, Trophy } from "lucide-react";
import { reporteService, ProductoVentaApi, VentasReporteApi } from "../../../services/reporteService";
import { AdminEmptyState, AdminErrorState, AdminFilterChip, AdminLoadingState, AdminPanel } from "../../components/adminUi";
import { exportSalesReportToExcel, exportSalesReportToPdf } from "../../lib/reportExport";
import { getLocalDateInputValue, validateDateRange } from "../../lib/validation";
import { toast } from "sonner";
import { showRequestError } from "../../../lib/notifyError";

type RangePreset = "today" | "7d" | "30d" | "custom";

function getFilterSummary(preset: RangePreset, desde: string, hasta: string) {
  return [
    { label: "Rango", value: `${desde} a ${hasta}` },
    { label: "Vista rápida", value: preset === "today" ? "Hoy" : preset === "7d" ? "Últimos 7 días" : preset === "30d" ? "Últimos 30 días" : "Personalizado" },
    { label: "Fuente", value: "Ventas del módulo administrativo" },
  ];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-2xl border border-gray-700/50 bg-gray-900 px-4 py-3 text-white shadow-xl">
        <p className="mb-1 text-sm font-bold">{label}</p>
        <p className="text-lg font-extrabold text-red-400">S/ {Number(payload[0].value).toFixed(2)}</p>
      </div>
    );
  }
  return null;
};

function getPresetDates(preset: RangePreset) {
  const today = new Date();
  const end = getLocalDateInputValue(today);

  if (preset === "today") {
    return { desde: end, hasta: end };
  }

  const days = preset === "7d" ? 6 : 29;
  const start = new Date(today.getTime() - days * 86400000);
  return { desde: getLocalDateInputValue(start), hasta: end };
}

export default function Reports() {
  const [preset, setPreset] = useState<RangePreset>("7d");
  const [desde, setDesde] = useState(getPresetDates("7d").desde);
  const [hasta, setHasta] = useState(getPresetDates("7d").hasta);
  const [reporte, setReporte] = useState<VentasReporteApi | null>(null);
  const [topProductos, setTopProductos] = useState<ProductoVentaApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<"" | "pdf" | "excel">("");
  const [error, setError] = useState("");

  const loadReporte = async (customDesde = desde, customHasta = hasta) => {
    const rangeError = validateDateRange(customDesde, customHasta);
    if (rangeError) {
      toast.error(rangeError);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const [ventasRes, prodRes] = await Promise.all([reporteService.getReporteVentas(customDesde, customHasta), reporteService.getProductosVendidos()]);
      setReporte(ventasRes.data);
      setTopProductos(prodRes.data);
    } catch (loadError) {
      console.error("Error cargando reportes", loadError);
      setError("No se pudieron cargar los reportes de ventas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReporte();
  }, []);

  const chartData = useMemo(
    () =>
      (reporte?.detallePorFecha || []).map((d) => ({
        date: d.fecha.slice(5).replace("-", "/"),
        ventas: Number(d.total),
      })),
    [reporte],
  );

  const applyPreset = (nextPreset: RangePreset) => {
    setPreset(nextPreset);
    if (nextPreset === "custom") return;
    const dates = getPresetDates(nextPreset);
    setDesde(dates.desde);
    setHasta(dates.hasta);
    loadReporte(dates.desde, dates.hasta);
  };

  const handleExportPdf = async () => {
    if (!reporte) return;
    try {
      setExporting("pdf");
      await exportSalesReportToPdf({ desde, hasta, reporte, topProductos, filters: getFilterSummary(preset, desde, hasta) });
      toast.success("PDF generado correctamente");
    } catch (exportError) {
      console.error("Error exportando PDF", exportError);
      showRequestError(exportError, "No se pudo exportar el PDF");
    } finally {
      setExporting("");
    }
  };

  const handleExportExcel = async () => {
    if (!reporte) return;
    try {
      setExporting("excel");
      await exportSalesReportToExcel({ desde, hasta, reporte, topProductos, filters: getFilterSummary(preset, desde, hasta) });
      toast.success("Excel generado correctamente");
    } catch (exportError) {
      console.error("Error exportando Excel", exportError);
      showRequestError(exportError, "No se pudo exportar el Excel");
    } finally {
      setExporting("");
    }
  };

  if (loading) {
    return <AdminLoadingState message="Procesando datos..." />;
  }

  if (error) {
    return <AdminErrorState description={error} onRetry={() => loadReporte()} />;
  }

  return (
    <div style={{ fontFamily: "Poppins" }}>
      <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">Rendimiento</h2>
          <p className="mt-1 text-sm font-medium text-gray-500">Reportes de ventas con filtros rápidos y exportación operativa.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExportPdf}
            disabled={!reporte || exporting !== ""}
            className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FileText className="h-4 w-4" />
            {exporting === "pdf" ? "Exportando..." : "PDF"}
          </button>
          <button
            onClick={handleExportExcel}
            disabled={!reporte || exporting !== ""}
            className="inline-flex items-center gap-2 rounded-2xl bg-gray-900 px-4 py-3 text-sm font-bold text-white shadow-md transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FileSpreadsheet className="h-4 w-4" />
            {exporting === "excel" ? "Exportando..." : "Excel"}
          </button>
        </div>
      </div>

      <AdminPanel className="mb-8 p-4 sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-2">
            <AdminFilterChip label="Hoy" active={preset === "today"} onClick={() => applyPreset("today")} />
            <AdminFilterChip label="7 días" active={preset === "7d"} onClick={() => applyPreset("7d")} />
            <AdminFilterChip label="30 días" active={preset === "30d"} onClick={() => applyPreset("30d")} />
            <AdminFilterChip label="Personalizado" active={preset === "custom"} onClick={() => setPreset("custom")} />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center rounded-xl bg-gray-50 px-4">
              <Calendar className="mr-2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                aria-label="Fecha inicial del reporte"
                title="Fecha inicial del reporte"
                value={desde}
                onChange={(e) => {
                  setPreset("custom");
                  setDesde(e.target.value);
                }}
                className="bg-transparent py-2.5 text-sm font-semibold text-gray-700 outline-none"
              />
            </div>
            <div className="flex items-center rounded-xl bg-gray-50 px-4">
              <Calendar className="mr-2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                aria-label="Fecha final del reporte"
                title="Fecha final del reporte"
                value={hasta}
                onChange={(e) => {
                  setPreset("custom");
                  setHasta(e.target.value);
                }}
                className="bg-transparent py-2.5 text-sm font-semibold text-gray-700 outline-none"
              />
            </div>
            <button onClick={() => loadReporte()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D32F2F] px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-red-700">
              <Download className="h-4 w-4" />
              Aplicar
            </button>
          </div>
        </div>
      </AdminPanel>

      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <AdminPanel className="p-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <ShoppingCart className="h-6 w-6" />
          </div>
          <p className="mb-1 text-sm font-bold uppercase tracking-wider text-gray-500">Total Pedidos</p>
          <p className="text-4xl font-black text-gray-900">{reporte?.totalPedidos ?? 0}</p>
          <div className="mt-3 flex items-center gap-2 text-xs font-semibold">
            <span className="rounded-md bg-green-100 px-2 py-0.5 text-green-700">{reporte?.pedidosEntregados ?? 0} cerrados</span>
            <span className="rounded-md bg-red-50 px-2 py-0.5 text-red-700">{reporte?.pedidosCancelados ?? 0} cancelados</span>
          </div>
        </AdminPanel>

        <AdminPanel className="p-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-[#D32F2F]">
            <TrendingUp className="h-6 w-6" />
          </div>
          <p className="mb-1 text-sm font-bold uppercase tracking-wider text-gray-500">Ingresos Brutos</p>
          <p className="text-4xl font-black text-gray-900">
            <span className="mr-1 text-xl text-gray-600">S/</span>
            {Number(reporte?.ingresosTotal ?? 0).toFixed(2)}
          </p>
        </AdminPanel>

        <AdminPanel className="p-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <CreditCard className="h-6 w-6" />
          </div>
          <p className="mb-1 text-sm font-bold uppercase tracking-wider text-gray-500">Ticket Promedio</p>
          <p className="text-4xl font-black text-gray-900">
            <span className="mr-1 text-xl text-gray-600">S/</span>
            {Number(reporte?.ticketPromedio ?? 0).toFixed(2)}
          </p>
        </AdminPanel>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
        <AdminPanel className="p-6 sm:p-8 xl:col-span-2">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-800">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-extrabold text-gray-900">Tendencia de Ventas</h2>
          </div>

          {chartData.length === 0 ? (
            <AdminEmptyState title="Sin ventas en este rango" description="Amplía el rango de fechas para encontrar movimientos." />
          ) : (
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D32F2F" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="#D32F2F" stopOpacity={0.3} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 12, fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 12, fontWeight: 600 }} tickFormatter={(value) => `S/ ${value}`} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f9fafb" }} />
                  <Bar dataKey="ventas" fill="url(#colorSales)" radius={[6, 6, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </AdminPanel>

        <AdminPanel className="p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
              <Trophy className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-extrabold text-gray-900">Top Vendidos</h2>
          </div>

          {topProductos.length === 0 ? (
            <AdminEmptyState title="Sin productos en ranking" description="Cuando existan ventas, el ranking aparecerá aquí." />
          ) : (
            <div className="space-y-4">
              {topProductos.slice(0, 8).map((p, i) => (
                <div key={p.id} className="flex items-center justify-between rounded-2xl border border-transparent p-3 transition-colors hover:border-gray-100 hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-black ${
                        i === 0
                          ? "bg-amber-100 text-amber-700"
                          : i === 1
                            ? "bg-gray-200 text-gray-700"
                            : i === 2
                              ? "bg-orange-100 text-orange-700"
                              : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      #{i + 1}
                    </div>
                    <div>
                      <p className="line-clamp-1 text-sm font-bold leading-tight text-gray-900" title={p.nombre}>
                        {p.nombre}
                      </p>
                      <p className="text-xs font-semibold text-gray-600">{p.totalVendido} unid.</p>
                    </div>
                  </div>
                  <div className="pl-2 text-right">
                    <p className="text-sm font-black text-gray-900">S/ {Number(p.ingresosGenerados).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </AdminPanel>
      </div>
    </div>
  );
}
