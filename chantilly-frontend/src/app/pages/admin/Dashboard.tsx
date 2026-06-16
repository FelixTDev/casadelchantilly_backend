import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { DollarSign, ShoppingBag, AlertTriangle, Users, TrendingUp, ArrowUpRight, ChevronRight, Clock, Package, BarChart3, Activity, Bike, ReceiptText, BadgeCheck, FileClock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { StatusBadge, toUiStatus } from "../../components/shared";
import { reporteService, DashboardApi } from "../../../services/reporteService";
import { pedidoService, PedidoApi } from "../../../services/pedidoService";
import { adminActivityService, AdminActivityLogApi } from "../../../services/adminActivityService";
import { AdminPanel } from "../../components/adminUi";

export default function Dashboard() {
  const [data, setData] = useState<DashboardApi | null>(null);
  const [orders, setOrders] = useState<PedidoApi[]>([]);
  const [activity, setActivity] = useState<AdminActivityLogApi[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [dashRes, ordersRes, activityRes] = await Promise.all([
        reporteService.getDashboard(),
        pedidoService.getTodos(),
        adminActivityService.getRecientes(),
      ]);
      setData(dashRes.data);
      setOrders(ordersRes.data.slice(0, 5));
      setActivity(activityRes.data);
    } catch (error) {
      console.error("Error cargando dashboard", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const metrics = [
    {
      label: "Ventas del Día",
      value: data ? `S/ ${Number(data.ventasHoyTotal).toFixed(2)}` : "—",
      icon: DollarSign,
      accent: "#16a34a",
      bg: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
      iconBg: "#16a34a",
      hint: "Ingresos de hoy",
    },
    {
      label: "Pedidos Pendientes",
      value: data ? String(data.pedidosPendientes) : "—",
      icon: ShoppingBag,
      accent: "#d97706",
      bg: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
      iconBg: "#d97706",
      hint: "Requieren atención",
    },
    {
      label: "Alertas de Stock",
      value: data ? String(data.alertasStockActivas) : "—",
      icon: AlertTriangle,
      accent: "#D32F2F",
      bg: "linear-gradient(135deg, #fff5f5 0%, #fee2e2 100%)",
      iconBg: "#D32F2F",
      hint: "Productos bajos",
    },
    {
      label: "Total Clientes",
      value: data ? String(data.totalClientes) : "—",
      icon: Users,
      accent: "#1d4ed8",
      bg: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
      iconBg: "#1d4ed8",
      hint: "Registrados",
    },
    {
      label: "Conversión",
      value: data ? `${Number(data.tasaConversion || 0).toFixed(1)}%` : "—",
      icon: Activity,
      accent: "#7c3aed",
      bg: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)",
      iconBg: "#7c3aed",
      hint: "Pagos confirmados vs pedidos",
    },
    {
      label: "Ticket Delivery",
      value: data ? `S/ ${Number(data.ticketDelivery || 0).toFixed(2)}` : "—",
      icon: ReceiptText,
      accent: "#0f766e",
      bg: "linear-gradient(135deg, #ecfeff 0%, #ccfbf1 100%)",
      iconBg: "#0f766e",
      hint: "Promedio por delivery",
    },
    {
      label: "Ticket Recojo",
      value: data ? `S/ ${Number(data.ticketRecojoTienda || 0).toFixed(2)}` : "—",
      icon: Package,
      accent: "#b45309",
      bg: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)",
      iconBg: "#b45309",
      hint: "Promedio en tienda",
    },
    {
      label: "Tiempo Entrega",
      value: data ? `${Number(data.tiempoEntregaPromedioHoras || 0).toFixed(1)} h` : "—",
      icon: Bike,
      accent: "#2563eb",
      bg: "linear-gradient(135deg, #eef2ff 0%, #dbeafe 100%)",
      iconBg: "#2563eb",
      hint: "Promedio hasta entregado",
    },
  ];

  const chartData = (data?.ventasSemana || []).map(d => ({
    date: d.fecha.slice(5),
    ventas: Number(d.total),
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3">
          <p className="text-gray-500 text-xs font-medium mb-1">{label}</p>
          <p className="text-gray-900 font-extrabold text-lg">S/ {payload[0].value.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32" style={{ fontFamily: "Poppins" }}>
      <div className="w-12 h-12 border-4 border-gray-200 border-t-[#D32F2F] rounded-full animate-spin mb-4"></div>
      <p className="text-gray-400 font-medium">Cargando dashboard...</p>
    </div>
  );

  return (
    <div style={{ fontFamily: "Poppins" }}>

      {/* Greeting */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-gray-900 font-extrabold text-3xl mb-1 tracking-tight">Resumen del día</h2>
          <p className="text-gray-500 text-sm font-medium flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {new Date().toLocaleDateString("es-PE", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/admin/reportes" className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 font-bold text-sm hover:bg-gray-50 transition-all shadow-sm">
            Descargar reporte
          </Link>
          <button onClick={load} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-[#D32F2F] rounded-xl text-white font-bold text-sm hover:bg-[#b71c1c] transition-all shadow-sm shadow-red-900/20">
            Actualizar
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {metrics.map(m => (
          <div key={m.label} className="bg-white rounded-2xl p-5 relative overflow-hidden group hover:-translate-y-0.5 transition-all duration-300"
            style={{ boxShadow: "0 10px 40px -10px rgba(0,0,0,0.08)" }}>
            {/* Gradient accent top */}
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: m.accent }} />

            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: m.bg }}>
                <m.icon className="w-5 h-5" style={{ color: m.iconBg }} />
              </div>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-gray-50 group-hover:bg-gray-100 transition-colors">
                <ArrowUpRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>

            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">{m.label}</p>
            <p className="text-gray-900 font-extrabold text-3xl mb-1">{m.value}</p>
            <p className="text-gray-400 text-xs font-medium">{m.hint}</p>
          </div>
        ))}
      </div>

      {/* Chart + Quick Actions row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-8">
        {/* Chart */}
        <div className="xl:col-span-2 bg-white rounded-3xl p-6 relative overflow-hidden" style={{ boxShadow: "0 10px 40px -10px rgba(0,0,0,0.08)" }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-gray-900 font-extrabold text-lg">Ventas de la Semana</h2>
              <p className="text-gray-400 text-xs font-medium mt-0.5">Ingresos diarios en soles</p>
            </div>
            <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-full">
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="text-xs font-bold">Esta semana</span>
            </div>
          </div>
          {chartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                <BarChart3 className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-400 font-medium">Sin ventas registradas esta semana</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} barCategoryGap="30%">
                <defs>
                  <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D32F2F" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#D32F2F" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="date" style={{ fontSize: 12, fontFamily: "Poppins" }} tick={{ fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis style={{ fontSize: 12, fontFamily: "Poppins" }} tick={{ fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={v => `S/${v}`} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(211,47,47,0.04)", radius: 8 }} />
                <Bar dataKey="ventas" fill="url(#colorVentas)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Quick Stats Panel */}
        <div className="bg-white rounded-3xl p-6 flex flex-col" style={{ boxShadow: "0 10px 40px -10px rgba(0,0,0,0.08)" }}>
          <h2 className="text-gray-900 font-extrabold text-lg mb-1">Acceso Rápido</h2>
          <p className="text-gray-400 text-xs font-medium mb-6">Secciones frecuentes y atajos operativos</p>
          <div className="flex flex-col gap-2 flex-1">
            {[
              { label: "Ver todos los pedidos", href: "/admin/pedidos", color: "#fef3c7", iconColor: "#d97706", icon: ShoppingBag },
              { label: "Gestionar productos", href: "/admin/productos", color: "#f0fdf4", iconColor: "#16a34a", icon: Package },
              { label: "Ver alertas de stock", href: "/admin/alertas", color: "#fff5f5", iconColor: "#D32F2F", icon: AlertTriangle },
              { label: "Reportes de ventas", href: "/admin/reportes", color: "#eff6ff", iconColor: "#1d4ed8", icon: BarChart3 },
              { label: "Confirmar pagos", href: "/admin/pagos", color: "#ecfeff", iconColor: "#0f766e", icon: BadgeCheck },
              { label: "Resolver reclamos", href: "/admin/reclamos", color: "#fdf2f8", iconColor: "#be185d", icon: FileClock },
            ].map(item => (
              <Link key={item.href} to={item.href}
                className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-all group border border-gray-100 hover:border-gray-200"
                style={{ background: "#ffffff" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: item.color }}>
                  <item.icon className="w-5 h-5" style={{ color: item.iconColor }} />
                </div>
                <span className="text-gray-700 font-bold text-sm flex-1">{item.label}</span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-50 group-hover:bg-white group-hover:shadow-sm transition-all">
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-900" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <AdminPanel className="p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Atajo comercial</p>
          <h3 className="mt-2 text-lg font-extrabold text-gray-900">Promociones activas y edición rápida</h3>
          <p className="mt-2 text-sm font-medium leading-relaxed text-gray-500">Revisa campañas vigentes, corrige descuentos y apaga promos vencidas sin salir del panel.</p>
          <Link to="/admin/promociones" className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-gray-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-black">
            Ir a promociones
            <ChevronRight className="h-4 w-4" />
          </Link>
        </AdminPanel>
        <AdminPanel className="p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Atajo operativo</p>
          <h3 className="mt-2 text-lg font-extrabold text-gray-900">Desactivación masiva de catálogo</h3>
          <p className="mt-2 text-sm font-medium leading-relaxed text-gray-500">Usa la selección múltiple en productos para retirar lotes, depurar duplicados o limpiar inventario estacional.</p>
          <Link to="/admin/productos" className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-gray-50">
            Abrir catálogo
            <ChevronRight className="h-4 w-4" />
          </Link>
        </AdminPanel>
        <AdminPanel className="p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Atajo de control</p>
          <h3 className="mt-2 text-lg font-extrabold text-gray-900">Auditoría reciente</h3>
          <p className="mt-2 text-sm font-medium leading-relaxed text-gray-500">Los cambios críticos ya quedan registrados y visibles para seguimiento administrativo diario.</p>
          <button onClick={load} className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-[#D32F2F] transition hover:bg-red-100">
            Actualizar actividad
            <ChevronRight className="h-4 w-4" />
          </button>
        </AdminPanel>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.6fr] gap-5 mb-8">
        <AdminPanel className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-gray-900 font-extrabold text-lg">Actividad Administrativa</h2>
              <p className="text-gray-400 text-xs font-medium mt-0.5">Cambios críticos recientes del panel</p>
            </div>
            <div className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-[#D32F2F]">{activity.length} eventos</div>
          </div>
          {activity.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm font-medium">Aún no hay eventos críticos registrados.</div>
          ) : (
            <div className="space-y-3">
              {activity.slice(0, 8).map((item) => (
                <div key={item.id} className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{item.resumen}</p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
                        {item.modulo} · {item.accion} · {item.adminNombre || "Administrador"}
                      </p>
                    </div>
                    <span className="text-[11px] font-semibold text-gray-400 whitespace-nowrap">{item.creadoEn?.slice(0, 16).replace("T", " ")}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </AdminPanel>

        <AdminPanel className="p-6">
          <h2 className="text-gray-900 font-extrabold text-lg mb-1">Lectura Operativa</h2>
          <p className="text-gray-400 text-xs font-medium mb-5">Indicadores listos para decisión rápida</p>
          <div className="space-y-4">
            <div className="rounded-2xl bg-emerald-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Conversión</p>
              <p className="mt-2 text-2xl font-extrabold text-emerald-900">{Number(data?.tasaConversion || 0).toFixed(1)}%</p>
            </div>
            <div className="rounded-2xl bg-sky-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-sky-700">Tiempo promedio de entrega</p>
              <p className="mt-2 text-2xl font-extrabold text-sky-900">{Number(data?.tiempoEntregaPromedioHoras || 0).toFixed(1)} h</p>
            </div>
            <div className="rounded-2xl bg-amber-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-700">Canal más fuerte</p>
              <p className="mt-2 text-base font-extrabold text-amber-900">
                {Number(data?.ticketDelivery || 0) >= Number(data?.ticketRecojoTienda || 0) ? "Delivery" : "Recojo en tienda"}
              </p>
            </div>
          </div>
        </AdminPanel>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-3xl p-6" style={{ boxShadow: "0 10px 40px -10px rgba(0,0,0,0.08)" }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-gray-900 font-extrabold text-lg">Pedidos Recientes</h2>
            <p className="text-gray-400 text-xs font-medium mt-0.5">Últimas 5 órdenes registradas</p>
          </div>
          <Link to="/admin/pedidos" className="flex items-center gap-1.5 text-[#D32F2F] hover:text-red-700 font-bold text-sm transition-colors">
            Ver todos <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <ShoppingBag className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-gray-400 font-medium">No hay pedidos aún</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" style={{ fontSize: 14 }}>
              <thead>
                <tr className="bg-gray-50/80" style={{ borderBottom: "1px solid #f3f4f6" }}>
                  {["Orden", "Fecha", "Total", "Estado"].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-gray-500 font-bold text-xs uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} className="group hover:bg-gray-50 transition-colors rounded-xl" style={{ borderBottom: "1px solid #f9fafb" }}>
                    <td className="py-4 px-4">
                      <span className="font-bold text-gray-700 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg text-xs transition-colors">
                        {o.codigoPedido}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-500 font-medium">{o.creadoEn?.slice(0, 10)}</td>
                    <td className="py-4 px-4">
                      <span className="text-gray-900 font-extrabold">S/ {Number(o.total || 0).toFixed(2)}</span>
                    </td>
                    <td className="py-4 px-4"><StatusBadge status={toUiStatus(o.estado)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
