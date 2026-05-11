import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { reporteService, VentasReporteApi, ProductoVentaApi } from "../../../services/reporteService";
import { Calendar, TrendingUp, ShoppingCart, CreditCard, BarChart3, Trophy } from "lucide-react";

// Componente para Custom Tooltip del gráfico
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-gray-700/50">
        <p className="font-bold text-sm mb-1">{label}</p>
        <p className="text-red-400 font-extrabold text-lg">
          S/ {Number(payload[0].value).toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
};

export default function Reports() {
  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);

  const [desde, setDesde] = useState(weekAgo);
  const [hasta, setHasta] = useState(today);
  const [reporte, setReporte] = useState<VentasReporteApi | null>(null);
  const [topProductos, setTopProductos] = useState<ProductoVentaApi[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReporte = async () => {
    setLoading(true);
    try {
      const [ventasRes, prodRes] = await Promise.all([
        reporteService.getReporteVentas(desde, hasta),
        reporteService.getProductosVendidos(),
      ]);
      setReporte(ventasRes.data);
      setTopProductos(prodRes.data);
    } catch (error) {
      console.error("Error cargando reportes", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReporte();
  }, []); // Carga inicial

  const chartData = (reporte?.detallePorFecha || []).map(d => ({
    date: d.fecha.slice(5).replace("-", "/"), // Formato visual ej: 05/03
    ventas: Number(d.total),
  }));

  return (
    <div style={{ fontFamily: "Poppins" }}>
      
      {/* Header & Date Pickers */}
      <div className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-gray-900 font-extrabold text-3xl tracking-tight mb-1">Rendimiento</h2>
          <p className="text-gray-500 text-sm font-medium">Analiza tus ventas y productos estrella.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center px-4 bg-gray-50 rounded-xl w-full sm:w-auto">
            <Calendar className="w-4 h-4 text-gray-400 mr-2" />
            <input type="date" value={desde} onChange={e => setDesde(e.target.value)}
              className="bg-transparent border-none focus:ring-0 py-2.5 text-gray-700 font-semibold text-sm outline-none" />
          </div>
          <span className="text-gray-300 font-bold hidden sm:block">→</span>
          <div className="flex items-center px-4 bg-gray-50 rounded-xl w-full sm:w-auto">
            <Calendar className="w-4 h-4 text-gray-400 mr-2" />
            <input type="date" value={hasta} onChange={e => setHasta(e.target.value)}
              className="bg-transparent border-none focus:ring-0 py-2.5 text-gray-700 font-semibold text-sm outline-none" />
          </div>
          <button 
            onClick={loadReporte}
            className="w-full sm:w-auto bg-gray-900 hover:bg-black text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md">
            Filtrar
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400 font-medium">Procesando datos...</p>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-3xl p-6 relative overflow-hidden transition-all hover:-translate-y-1" style={{ boxShadow: "0 10px 40px -10px rgba(0,0,0,0.08)" }}>
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <p className="text-gray-500 font-bold text-sm mb-1 uppercase tracking-wider">Total Pedidos</p>
              <p className="text-gray-900 font-black text-4xl">{reporte?.totalPedidos ?? 0}</p>
              <div className="mt-3 flex items-center gap-2 text-xs font-semibold">
                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-md">{reporte?.pedidosEntregados ?? 0} cerrados</span>
                <span className="bg-red-50 text-red-500 px-2 py-0.5 rounded-md">{reporte?.pedidosCancelados ?? 0} cancelados</span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 relative overflow-hidden transition-all hover:-translate-y-1" style={{ boxShadow: "0 10px 40px -10px rgba(0,0,0,0.08)" }}>
              <div className="w-12 h-12 bg-red-50 text-[#D32F2F] rounded-2xl flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <p className="text-gray-500 font-bold text-sm mb-1 uppercase tracking-wider">Ingresos Brutos</p>
              <p className="text-gray-900 font-black text-4xl">
                <span className="text-xl text-gray-400 mr-1">S/</span>
                {Number(reporte?.ingresosTotal ?? 0).toFixed(2)}
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 relative overflow-hidden transition-all hover:-translate-y-1" style={{ boxShadow: "0 10px 40px -10px rgba(0,0,0,0.08)" }}>
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-4">
                <CreditCard className="w-6 h-6" />
              </div>
              <p className="text-gray-500 font-bold text-sm mb-1 uppercase tracking-wider">Ticket Promedio</p>
              <p className="text-gray-900 font-black text-4xl">
                <span className="text-xl text-gray-400 mr-1">S/</span>
                {Number(reporte?.ticketPromedio ?? 0).toFixed(2)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
            {/* Chart */}
            <div className="xl:col-span-2 bg-white rounded-3xl p-6 sm:p-8" style={{ boxShadow: "0 10px 40px -10px rgba(0,0,0,0.08)" }}>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-800">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h2 className="text-gray-900 font-extrabold text-xl">Tendencia de Ventas</h2>
              </div>
              
              {chartData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <BarChart3 className="w-12 h-12 text-gray-200 mb-3" />
                  <p className="text-gray-400 font-medium">No hay registros de ventas en este rango de fechas.</p>
                </div>
              ) : (
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#D32F2F" stopOpacity={0.9}/>
                          <stop offset="95%" stopColor="#D32F2F" stopOpacity={0.3}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 600 }} 
                        dy={10} 
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 600 }}
                        tickFormatter={(value) => `S/ ${value}`}
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
                      <Bar dataKey="ventas" fill="url(#colorSales)" radius={[6, 6, 0, 0]} maxBarSize={60} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Top Products */}
            <div className="xl:col-span-1 bg-white rounded-3xl p-6 sm:p-8" style={{ boxShadow: "0 10px 40px -10px rgba(0,0,0,0.08)" }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500">
                  <Trophy className="w-5 h-5" />
                </div>
                <h2 className="text-gray-900 font-extrabold text-xl">Top Vendidos</h2>
              </div>

              {topProductos.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-400 font-medium">Sin datos de productos.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {topProductos.map((p, i) => (
                    <div key={p.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm shrink-0 ${
                          i === 0 ? "bg-amber-100 text-amber-700" :
                          i === 1 ? "bg-gray-200 text-gray-700" :
                          i === 2 ? "bg-orange-100 text-orange-700" :
                          "bg-gray-50 text-gray-400"
                        }`}>
                          #{i + 1}
                        </div>
                        <div>
                          <p className="text-gray-900 font-bold text-sm leading-tight line-clamp-1" title={p.nombre}>{p.nombre}</p>
                          <p className="text-gray-400 text-xs font-semibold">{p.totalVendido} unid.</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 pl-2">
                        <p className="text-gray-900 font-black text-sm">S/ {Number(p.ingresosGenerados).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </>
      )}
    </div>
  );
}
