import React, { useEffect, useMemo, useState } from "react";
import { StatusBadge, toUiStatus } from "../../components/shared";
import { pedidoService, PedidoApi } from "../../../services/pedidoService";
import { ChevronDown, Receipt, Calendar, Hash, PackageSearch } from "lucide-react";

const ALL_STATUSES = ["PENDIENTE", "EN_PREPARACION", "LISTO", "EN_RUTA", "ENTREGADO", "CANCELADO", "RECHAZADO"];

// Utilidad para limpiar textos de estado (ej: EN_PREPARACION -> En preparación)
function formatStatusName(status: string) {
  return status.split("_").map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(" ");
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<PedidoApi[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("");

  const loadOrders = async () => {
    try {
      const response = await pedidoService.getTodos();
      // Ordenamos para ver los más recientes primero
      setOrders(response.data.sort((a, b) => b.id - a.id));
    } catch (error) {
      console.error("Error cargando pedidos admin", error);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filtered = useMemo(() => orders.filter(o => !filterStatus || o.estado === filterStatus), [orders, filterStatus]);

  const changeStatus = async (id: number, newStatus: string) => {
    try {
      await pedidoService.cambiarEstado(id, newStatus);
      await loadOrders();
    } catch (error) {
      console.error("Error cambiando estado", error);
      alert("No se pudo cambiar estado");
    }
  };

  return (
    <div style={{ fontFamily: "Poppins" }}>
      
      {/* Header y Resumen */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-gray-900 font-extrabold text-2xl tracking-tight mb-1">Gestión de Pedidos</h2>
          <p className="text-gray-500 text-sm font-medium flex items-center gap-1.5">
            <Receipt className="w-4 h-4" />
            {orders.length} pedidos registrados en total
          </p>
        </div>
      </div>

      {/* Filtros estilo Tabs Premium */}
      <div className="mb-8 overflow-x-auto pb-2" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        <div className="inline-flex items-center gap-1.5 bg-gray-100/80 p-1.5 rounded-2xl border border-gray-200">
          <button 
            onClick={() => setFilterStatus("")}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              !filterStatus 
                ? "bg-white text-gray-900 shadow-sm border border-gray-200/50" 
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
            }`}>
            Todos los pedidos
          </button>
          
          <div className="w-px h-6 bg-gray-300 mx-1"></div>

          {ALL_STATUSES.map(s => (
            <button 
              key={s} 
              onClick={() => setFilterStatus(filterStatus === s ? "" : s)}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                filterStatus === s 
                  ? "bg-white text-[#D32F2F] shadow-sm border border-gray-200/50" 
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
              }`}>
              {formatStatusName(s)}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla Premium */}
      <div className="bg-white rounded-3xl overflow-hidden" style={{ boxShadow: "0 10px 40px -10px rgba(0,0,0,0.08)" }}>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ fontSize: 14 }}>
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="text-left py-4 px-6 text-gray-500 font-bold text-xs uppercase tracking-wider">Orden</th>
                <th className="text-left py-4 px-6 text-gray-500 font-bold text-xs uppercase tracking-wider hidden sm:table-cell">Fecha</th>
                <th className="text-left py-4 px-6 text-gray-500 font-bold text-xs uppercase tracking-wider">Total</th>
                <th className="text-left py-4 px-6 text-gray-500 font-bold text-xs uppercase tracking-wider">Estado Actual</th>
                <th className="text-left py-4 px-6 text-gray-500 font-bold text-xs uppercase tracking-wider">Acción (Actualizar)</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center">
                        <PackageSearch className="w-7 h-7 text-gray-300" />
                      </div>
                      <p className="text-gray-400 font-medium">No se encontraron pedidos con este estado</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.map(o => (
                <tr key={o.id} className="group transition-colors border-b border-gray-50 hover:bg-gray-50/50">
                  
                  {/* Orden (Badge gris) */}
                  <td className="py-4 px-6">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-100 border border-gray-200 text-gray-700 font-bold text-xs shadow-sm">
                      <Hash className="w-3.5 h-3.5 text-gray-400" />
                      {o.codigoPedido}
                    </div>
                  </td>
                  
                  {/* Fecha */}
                  <td className="py-4 px-6 text-gray-500 font-medium hidden sm:table-cell">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {o.creadoEn ? o.creadoEn.slice(0, 10) : "-"}
                    </div>
                  </td>
                  
                  {/* Total */}
                  <td className="py-4 px-6">
                    <span className="text-gray-900 font-extrabold text-sm">S/ {Number(o.total || 0).toFixed(2)}</span>
                  </td>
                  
                  {/* Estado Badge */}
                  <td className="py-4 px-6">
                    <StatusBadge status={toUiStatus(o.estado)} />
                  </td>
                  
                  {/* Acción Selector Premium */}
                  <td className="py-4 px-6">
                    <div className="relative inline-block w-full min-w-[140px] max-w-[180px]">
                      <select 
                        value={o.estado} 
                        onChange={e => changeStatus(o.id, e.target.value)}
                        className="w-full appearance-none bg-white border border-gray-200 text-gray-700 text-xs font-bold py-2.5 pl-3 pr-8 rounded-xl focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-[#D32F2F] transition-all cursor-pointer shadow-sm hover:border-gray-300"
                      >
                        {ALL_STATUSES.map(s => (
                          <option key={s} value={s}>{formatStatusName(s)}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-2.5 pointer-events-none text-gray-400">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
