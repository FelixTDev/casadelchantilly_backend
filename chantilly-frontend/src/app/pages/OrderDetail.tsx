import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router";
import { ArrowLeft, Check, Clock, ChefHat, Package, Truck, CheckCircle, XCircle, AlertTriangle, Download, Receipt, FileText } from "lucide-react";
import { BtnPrimary, BtnSecondary, StatusBadge, toUiStatus } from "../components/shared";
import { pedidoService, PedidoApi } from "../../services/pedidoService";
import axiosInstance from "../../lib/axiosInstance";
import { toast } from "sonner";

const TIMELINE = [
  { status: "PENDIENTE", icon: Clock, label: "Pedido recibido" },
  { status: "EN_PREPARACION", icon: ChefHat, label: "En preparación" },
  { status: "LISTO", icon: Package, label: "Listo para envío" },
  { status: "EN_RUTA", icon: Truck, label: "En camino" },
  { status: "ENTREGADO", icon: CheckCircle, label: "Entregado" },
];

const STATUS_ORDER = ["PENDIENTE", "EN_PREPARACION", "LISTO", "EN_RUTA", "ENTREGADO"];

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState<PedidoApi | null>(null);
  const [loading, setLoading] = useState(true);

  const loadOrder = async () => {
    if (!id) return;
    try {
      const response = await pedidoService.getById(id);
      setOrder(response.data);
    } catch (error) {
      console.error("Error cargando pedido", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  const currentIdx = useMemo(() => STATUS_ORDER.indexOf(order?.estado || ""), [order]);

  const handleCancelar = async () => {
    if (!id) return;
    if (!confirm("¿Estás seguro de cancelar este pedido?")) return;
    try {
      await pedidoService.cancelar(id);
      toast.success("Pedido cancelado exitosamente");
      await loadOrder();
    } catch (error) {
      console.error("Error cancelando pedido", error);
      toast.error("No se pudo cancelar el pedido");
    }
  };

  const handleDownloadPDF = async () => {
    if (!id) return;
    try {
      const response = await axiosInstance.get(`/pedidos/${id}/boleta`, { responseType: "blob" });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Boleta_Chantilly_${order?.codigoPedido || id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("¡Boleta descargada con éxito!");
    } catch (e) {
      console.error("Error descargando boleta", e);
      toast.error("Hubo un problema al descargar la boleta.");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
    </div>
  );

  if (!order) return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center" style={{ fontFamily: "Poppins" }}>
      <div className="text-center bg-white p-10 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-gray-800 font-bold text-2xl mb-4">Pedido no encontrado</h1>
        <p className="text-gray-500 mb-6">El pedido que buscas no existe o no tienes acceso a él.</p>
        <Link to="/mis-pedidos"><BtnPrimary>Volver a Mis Pedidos</BtnPrimary></Link>
      </div>
    </div>
  );

  const isCancelled = order.estado === "CANCELADO";

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("es-PE", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-10 px-4" style={{ fontFamily: "Poppins" }}>
      <div className="max-w-3xl mx-auto">
        <Link to="/mis-pedidos" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#D32F2F] transition-colors mb-6 font-semibold">
          <ArrowLeft className="w-5 h-5" /> Volver a mis pedidos
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          {/* Header Card */}
          <div className="bg-gray-50 border-b border-gray-100 p-6 sm:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Orden {order.modalidadEntrega}</p>
                <h1 className="text-gray-900 font-extrabold text-2xl md:text-3xl flex items-center gap-3">
                  {order.codigoPedido || `Pedido #${order.id}`}
                  <StatusBadge status={toUiStatus(order.estado)} />
                </h1>
                <p className="text-gray-500 text-sm mt-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> {formatDate(order.creadoEn)}
                </p>
              </div>
              {order.estado === "ENTREGADO" && (
                <button 
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 shadow-sm text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors"
                >
                  <Download className="w-4 h-4" /> Descargar Boleta
                </button>
              )}
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {/* Timeline */}
            {!isCancelled ? (
              <div className="mb-10">
                <h2 className="text-gray-900 font-bold text-lg mb-6 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-gray-400" /> Estado del Seguimiento
                </h2>
                <div className="relative pl-2 sm:pl-4">
                  {TIMELINE.map((step, i) => {
                    const done = i <= currentIdx;
                    const isCurrent = i === currentIdx;
                    return (
                      <div key={step.status} className="flex items-start gap-4 mb-8 last:mb-0 relative group">
                        {/* Linea vertical */}
                        {i < TIMELINE.length - 1 && (
                          <div className={`absolute top-10 left-6 w-0.5 h-10 -ml-px ${i < currentIdx ? "bg-green-500" : "bg-gray-200"}`} />
                        )}
                        
                        {/* Icono circular */}
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center z-10 shrink-0 transition-colors ${
                          done ? "bg-green-500 ring-4 ring-green-50 text-white" : "bg-gray-100 text-gray-400"
                        } ${isCurrent ? "animate-pulse ring-8" : ""}`}>
                          {done ? <Check className="w-6 h-6" /> : <step.icon className="w-5 h-5" />}
                        </div>
                        
                        {/* Textos */}
                        <div className="pt-2">
                          <p className={`font-bold ${done ? "text-gray-900" : "text-gray-400"}`}>{step.label}</p>
                          <p className={`text-sm ${done ? "text-gray-600" : "text-gray-400"}`}>
                            {isCurrent ? "Estado actual" : done ? "Completado" : "Pendiente"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 bg-red-50 border border-red-100 p-5 rounded-xl mb-10">
                <div className="bg-red-100 p-2 rounded-full shrink-0">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <h3 className="text-red-800 font-bold text-lg">Pedido Cancelado</h3>
                  <p className="text-red-700 text-sm">Este pedido fue cancelado y no será procesado.</p>
                </div>
              </div>
            )}

            {/* Resumen de Compra */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 px-5 py-4">
                <h2 className="text-gray-800 font-bold flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-gray-500" /> Resumen de Compra
                </h2>
              </div>
              
              <div className="p-5 space-y-4">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <span className="text-gray-700 font-medium flex items-center gap-3">
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold">x{item.cantidad}</span>
                      {item.nombreProducto}
                    </span>
                    <span className="text-gray-900 font-semibold">S/ {Number(item.subtotal || 0).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 p-5 border-t border-gray-200 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>S/ {Number(order.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Costo de Envío</span>
                  <span>S/ {Number(order.costoEnvio || 0).toFixed(2)}</span>
                </div>
                {Number(order.descuento || 0) > 0 && (
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span>Descuento Aplicado</span>
                    <span>- S/ {Number(order.descuento || 0).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-3 mt-3 border-t border-gray-200">
                  <span className="text-gray-900 font-bold text-base">Total a Pagar</span>
                  <span className="text-[#D32F2F] font-extrabold text-2xl">S/ {Number(order.total || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {order.estado === "PENDIENTE" && (
              <div className="mt-8 text-center">
                <button 
                  onClick={handleCancelar}
                  className="text-red-600 hover:text-red-800 font-semibold text-sm transition-colors hover:underline"
                >
                  Cancelar este pedido
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Card de Soporte */}
        {order.estado === "ENTREGADO" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h3 className="text-gray-900 font-bold">¿Tienes algún problema con tu pedido?</h3>
                <p className="text-gray-500 text-sm">Estamos aquí para ayudarte. Presenta un reclamo y lo revisaremos.</p>
              </div>
            </div>
            <Link to="/reclamo" className="w-full sm:w-auto shrink-0">
              <BtnSecondary className="w-full border-orange-200 text-orange-700 hover:bg-orange-50">
                Presentar Reclamo
              </BtnSecondary>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

