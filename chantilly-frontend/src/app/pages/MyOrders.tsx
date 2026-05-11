import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router";
import { ChevronRight, Download, Clock, ChefHat, Truck, CheckCircle2, XCircle, FileText, ShoppingBag } from "lucide-react";
import { StatusBadge, toUiStatus } from "../components/shared";
import { pedidoService, PedidoApi } from "../../services/pedidoService";
import axiosInstance from "../../lib/axiosInstance";

export default function MyOrders() {
  const [orders, setOrders] = useState<PedidoApi[]>([]);
  const [filter, setFilter] = useState<"TODOS" | "EN_CURSO" | "COMPLETADOS">("TODOS");
  const [loading, setLoading] = useState(true);

  const descargarBoleta = async (id: number) => {
    try {
      const response = await axiosInstance.get(`/pedidos/${id}/boleta`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `boleta-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Error descargando boleta", e);
      alert("No se pudo descargar la boleta");
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const response = await pedidoService.getMisPedidos();
        // Sort newest first
        const sorted = response.data.sort((a, b) => new Date(b.creadoEn || 0).getTime() - new Date(a.creadoEn || 0).getTime());
        setOrders(sorted);
      } catch (error) {
        console.error("Error cargando pedidos", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredOrders = useMemo(() => {
    if (filter === "EN_CURSO") {
      return orders.filter(o => ["PENDIENTE", "PREPARANDO", "EN_CAMINO", "LISTO"].includes(o.estado));
    }
    if (filter === "COMPLETADOS") {
      return orders.filter(o => ["ENTREGADO", "CANCELADO"].includes(o.estado));
    }
    return orders;
  }, [orders, filter]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" }).replace(".", "");
  };

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case "PENDIENTE": return <Clock className="w-6 h-6 text-yellow-600" />;
      case "PREPARANDO": return <ChefHat className="w-6 h-6 text-orange-600" />;
      case "EN_CAMINO": return <Truck className="w-6 h-6 text-blue-600" />;
      case "LISTO": return <ShoppingBag className="w-6 h-6 text-green-600" />;
      case "ENTREGADO": return <CheckCircle2 className="w-6 h-6 text-green-600" />;
      case "CANCELADO": return <XCircle className="w-6 h-6 text-red-600" />;
      default: return <FileText className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusBg = (estado: string) => {
    switch (estado) {
      case "PENDIENTE": return "bg-yellow-100";
      case "PREPARANDO": return "bg-orange-100";
      case "EN_CAMINO": return "bg-blue-100";
      case "LISTO": return "bg-green-100";
      case "ENTREGADO": return "bg-green-100";
      case "CANCELADO": return "bg-red-100";
      default: return "bg-gray-100";
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-10 px-4" style={{ fontFamily: "Poppins" }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl text-gray-900 mb-8" style={{ fontWeight: 800 }}>Mis Pedidos</h1>
        
        {/* Tabs de Filtrado */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 pb-2 overflow-x-auto no-scrollbar">
          {(["TODOS", "EN_CURSO", "COMPLETADOS"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                filter === tab 
                  ? "bg-gray-900 text-white shadow-md" 
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {tab === "TODOS" ? "Todos los pedidos" : tab === "EN_CURSO" ? "En Curso" : "Completados"}
            </button>
          ))}
        </div>

        {/* Lista de Pedidos */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No hay pedidos aquí</h3>
              <p className="text-gray-500 mb-6">Aún no tienes pedidos en esta categoría.</p>
              <Link to="/catalogo" className="inline-block bg-red-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-red-700 transition">
                Ir al Catálogo
              </Link>
            </div>
          ) : (
            filteredOrders.map(order => (
              <Link to={`/pedido/${order.id}`} key={order.id} className="block group">
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 transition-all duration-300 group-hover:shadow-lg group-hover:border-red-200 group-hover:-translate-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    
                    {/* Izquierda: Icono y Detalles */}
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${getStatusBg(order.estado)}`}>
                        {getStatusIcon(order.estado)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-gray-900 font-bold text-lg">{order.codigoPedido || `Pedido #${order.id}`}</p>
                        </div>
                        <p className="text-gray-500 text-sm font-medium capitalize">
                          {formatDate(order.creadoEn)} <span className="mx-1">•</span> {order.items?.length || 0} producto(s)
                        </p>
                      </div>
                    </div>

                    {/* Derecha: Estado, Precio y Acciones */}
                    <div className="flex items-center gap-5 sm:justify-end border-t sm:border-t-0 pt-4 sm:pt-0 border-gray-100">
                      <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
                        <div className="flex items-center gap-3 justify-between sm:justify-end w-full">
                          <StatusBadge status={toUiStatus(order.estado)} />
                          <span className="text-gray-900 font-extrabold text-lg">S/ {Number(order.total || 0).toFixed(2)}</span>
                        </div>
                        
                        {/* Botón Boleta rediseñado */}
                        {order.estado === "ENTREGADO" && (
                          <button 
                            onClick={(e) => { e.preventDefault(); descargarBoleta(order.id); }}
                            className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-100 hover:text-gray-900 transition-colors w-full sm:w-auto mt-1"
                            title="Descargar Boleta (PDF)"
                          >
                            <Download className="w-3.5 h-3.5" /> Descargar Boleta
                          </button>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-red-500 transition-colors hidden sm:block" />
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

