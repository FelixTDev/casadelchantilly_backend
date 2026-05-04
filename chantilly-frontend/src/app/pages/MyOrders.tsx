import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { Package, ChevronRight, FileDown } from "lucide-react";
import { StatusBadge, toUiStatus } from "../components/shared";
import { pedidoService, PedidoApi } from "../../services/pedidoService";
import axiosInstance from "../../lib/axiosInstance";

export default function MyOrders() {
  const [orders, setOrders] = useState<PedidoApi[]>([]);

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
        setOrders(response.data);
      } catch (error) {
        console.error("Error cargando pedidos", error);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F5F5] py-8 px-4" style={{ fontFamily: "Poppins" }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-[#333] mb-6" style={{ fontWeight: 700, fontSize: 28 }}>Mis Pedidos</h1>
        <div className="space-y-4">
          {orders.map(order => (
            <Link to={`/pedido/${order.id}`} key={order.id} className="block bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center shrink-0">
                    <Package className="w-6 h-6 text-[#D32F2F]" />
                  </div>
                  <div>
                    <p className="text-[#333]" style={{ fontWeight: 700 }}>{order.codigoPedido || `Pedido #${order.id}`}</p>
                    <p className="text-gray-500" style={{ fontSize: 13 }}>{order.creadoEn?.slice(0, 10)} · {order.items?.length || 0} producto(s)</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <StatusBadge status={toUiStatus(order.estado)} />
                  <span className="text-[#D32F2F]" style={{ fontWeight: 700 }}>S/ {Number(order.total || 0).toFixed(2)}</span>
                  {order.estado === "ENTREGADO" && (
                    <button onClick={(e) => { e.preventDefault(); descargarBoleta(order.id); }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-[#D32F2F] text-white rounded-lg text-xs font-semibold hover:bg-[#B71C1C] transition"
                      title="Descargar Boleta">
                      <FileDown className="w-4 h-4" /> Boleta
                    </button>
                  )}
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

