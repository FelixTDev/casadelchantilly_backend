import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router";
import { AlertTriangle, ArrowLeft, Check, CheckCircle, Clock, Download, FileText, Package, Receipt, Truck, Wallet, XCircle } from "lucide-react";
import { BtnPrimary, BtnSecondary, PaymentStatusBadge, StatusBadge, toUiStatus } from "../components/shared";
import { pedidoService, PedidoApi } from "../../services/pedidoService";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { AuthBreadcrumbs } from "../components/AuthBreadcrumbs";
import { showRequestError } from "../../lib/notifyError";

const TIMELINE = [
  { status: "PENDIENTE", label: "Pedido recibido" },
  { status: "EN_PREPARACION", label: "En preparación" },
  { status: "LISTO", label: "Listo para envío" },
  { status: "EN_RUTA", label: "En camino" },
  { status: "ENTREGADO", label: "Entregado" },
];

const STATUS_ORDER = ["PENDIENTE", "EN_PREPARACION", "LISTO", "EN_RUTA", "ENTREGADO"];

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState<PedidoApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);

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
    try {
      await pedidoService.cancelar(id);
      toast.success("Pedido cancelado exitosamente");
      setConfirmCancelOpen(false);
      await loadOrder();
    } catch (error) {
      console.error("Error cancelando pedido", error);
      showRequestError(error, "No se pudo cancelar el pedido");
    }
  };

  const handleDownloadPDF = async () => {
    if (!id) return;
    try {
      const response = await pedidoService.descargarBoleta(id);
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Boleta_Chantilly_${order?.codigoPedido || id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Boleta descargada con éxito");
    } catch (error) {
      console.error("Error descargando boleta", error);
      showRequestError(error, "Hubo un problema al descargar la boleta.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F9FAFB]">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-red-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F9FAFB]" style={{ fontFamily: "Poppins" }}>
        <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-sm">
          <h1 className="mb-4 text-2xl font-bold text-gray-800">Pedido no encontrado</h1>
          <p className="mb-6 text-gray-500">El pedido que buscas no existe o no tienes acceso a él.</p>
          <Link to="/mis-pedidos"><BtnPrimary>Volver a Mis Pedidos</BtnPrimary></Link>
        </div>
      </div>
    );
  }

  const isCancelled = order.estado === "CANCELADO";

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("es-PE", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] px-4 py-10" style={{ fontFamily: "Poppins" }}>
      <div className="mx-auto max-w-4xl">
        <AuthBreadcrumbs items={[{ label: "Inicio", to: "/" }, { label: "Mis pedidos", to: "/mis-pedidos" }, { label: order.codigoPedido || "Detalle" }]} />
        <Link to="/mis-pedidos" className="mb-6 inline-flex items-center gap-2 font-semibold text-gray-500 transition-colors hover:text-[#D32F2F]">
          <ArrowLeft className="h-5 w-5" /> Volver a mis pedidos
        </Link>

        <div className="mb-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 bg-gray-50 p-6 sm:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-gray-500">Orden {order.modalidadEntrega}</p>
                <h1 className="flex flex-wrap items-center gap-3 text-2xl font-extrabold text-gray-900 md:text-3xl">
                  {order.codigoPedido || `Pedido #${order.id}`}
                  <StatusBadge status={toUiStatus(order.estado)} />
                </h1>
                <p className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" /> {formatDate(order.creadoEn)}
                </p>
              </div>
              {order.estado === "ENTREGADO" && (
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-sm transition hover:bg-gray-50"
                >
                  <Download className="h-4 w-4" /> Descargar Boleta
                </button>
              )}
            </div>
          </div>

          <div className="space-y-8 p-6 sm:p-8">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                <div className="mb-2 flex items-center gap-2 text-gray-700">
                  <Wallet className="h-5 w-5 text-gray-400" />
                  <h3 className="font-bold">Pago</h3>
                </div>
                <div className="mb-3"><PaymentStatusBadge status={order.pago?.estadoPago} /></div>
                <p className="text-sm text-gray-600">Método: <span className="font-semibold text-gray-800">{order.pago?.metodoPago || "No registrado"}</span></p>
                {order.pago?.referencia && <p className="mt-2 text-sm text-gray-600">Referencia: <span className="font-semibold text-gray-800">{order.pago.referencia}</span></p>}
              </div>
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                <div className="mb-2 flex items-center gap-2 text-gray-700">
                  <Truck className="h-5 w-5 text-gray-400" />
                  <h3 className="font-bold">Entrega</h3>
                </div>
                <p className="text-sm text-gray-600">{order.modalidadEntrega === "DELIVERY" ? order.direccionDetalle || "Delivery con dirección registrada" : "Recojo en tienda"}</p>
                {order.direccionEtiqueta && <p className="mt-2 text-sm text-gray-600">Etiqueta: <span className="font-semibold text-gray-800">{order.direccionEtiqueta}</span></p>}
                {order.fechaEntrega && <p className="mt-2 text-sm text-gray-600">Fecha: <span className="font-semibold text-gray-800">{order.fechaEntrega}</span></p>}
              </div>
            </div>

            {!isCancelled ? (
              <div>
                <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-gray-900">
                  <Truck className="h-5 w-5 text-gray-400" />
                  Estado del seguimiento
                </h2>
                <div className="relative pl-2 sm:pl-4">
                  {TIMELINE.map((step, index) => {
                    const done = index <= currentIdx;
                    const isCurrent = index === currentIdx;
                    return (
                      <div key={step.status} className="relative mb-8 flex items-start gap-4 last:mb-0">
                        {index < TIMELINE.length - 1 && (
                          <div className={`absolute left-6 top-10 h-10 w-0.5 -ml-px ${index < currentIdx ? "bg-green-500" : "bg-gray-200"}`} />
                        )}
                        <div className={`z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-colors ${done ? "bg-green-500 text-white ring-4 ring-green-50" : "bg-gray-100 text-gray-400"} ${isCurrent ? "animate-pulse ring-8" : ""}`}>
                          {done ? <Check className="h-6 w-6" /> : <Package className="h-5 w-5" />}
                        </div>
                        <div className="pt-2">
                          <p className={`font-bold ${done ? "text-gray-900" : "text-gray-400"}`}>{step.label}</p>
                          <p className={`text-sm ${done ? "text-gray-600" : "text-gray-400"}`}>{isCurrent ? "Estado actual" : done ? "Completado" : "Pendiente"}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 rounded-xl border border-red-100 bg-red-50 p-5">
                <div className="rounded-full bg-red-100 p-2">
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-red-800">Pedido cancelado</h3>
                  <p className="text-sm text-red-700">Este pedido fue cancelado y no será procesado.</p>
                </div>
              </div>
            )}

            <div className="overflow-hidden rounded-xl border border-gray-200">
              <div className="border-b border-gray-200 bg-gray-50 px-5 py-4">
                <h2 className="flex items-center gap-2 font-bold text-gray-800">
                  <Receipt className="h-5 w-5 text-gray-500" /> Resumen de compra
                </h2>
              </div>

              <div className="space-y-4 p-5">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-4 text-sm">
                    <div>
                      <span className="flex items-center gap-3 font-medium text-gray-700">
                        <span className="rounded bg-gray-100 px-2 py-1 text-xs font-bold text-gray-600">x{item.cantidad}</span>
                        {item.nombreProducto}
                      </span>
                      {item.personalizacion && <p className="mt-1 pl-11 text-xs text-gray-500">Dedicatoria: {item.personalizacion}</p>}
                    </div>
                    <span className="font-semibold text-gray-900">S/ {Number(item.subtotal || 0).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t border-gray-200 bg-gray-50 p-5 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>S/ {Number(order.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Costo de envío</span>
                  <span>S/ {Number(order.costoEnvio || 0).toFixed(2)}</span>
                </div>
                {Number(order.descuento || 0) > 0 && (
                  <div className="flex justify-between font-semibold text-green-600">
                    <span>Descuento aplicado</span>
                    <span>- S/ {Number(order.descuento || 0).toFixed(2)}</span>
                  </div>
                )}
                <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3">
                  <span className="text-base font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-extrabold text-[#D32F2F]">S/ {Number(order.total || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {order.historialEstados?.length > 0 && (
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                <h3 className="mb-3 flex items-center gap-2 font-bold text-gray-800">
                  <FileText className="h-4 w-4 text-gray-500" />
                  Historial
                </h3>
                <div className="space-y-3">
                  {order.historialEstados.map((item) => (
                    <div key={item.id} className="rounded-xl bg-white px-4 py-3 text-sm shadow-sm">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <p className="font-semibold text-gray-800">{item.comentario || item.estado}</p>
                        <span className="text-xs text-gray-400">{item.creadoEn ? new Date(item.creadoEn).toLocaleString("es-PE") : "-"}</span>
                      </div>
                      {item.cambiadoPorNombre && <p className="mt-1 text-xs text-gray-500">Por: {item.cambiadoPorNombre}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {order.estado === "PENDIENTE" && (
              <div className="text-center">
                <button onClick={() => setConfirmCancelOpen(true)} className="text-sm font-semibold text-red-600 transition hover:text-red-800 hover:underline">
                  Cancelar este pedido
                </button>
              </div>
            )}
          </div>
        </div>

        {order.estado === "ENTREGADO" && (
          <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:flex-row">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-50">
                <AlertTriangle className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">¿Tienes algún problema con tu pedido?</h3>
                <p className="text-sm text-gray-500">Presenta un reclamo y el equipo lo revisará.</p>
              </div>
            </div>
            <Link to="/reclamo" className="w-full sm:w-auto">
              <BtnSecondary className="w-full border-orange-200 text-orange-700 hover:bg-orange-50">Presentar Reclamo</BtnSecondary>
            </Link>
          </div>
        )}
      </div>

      <AlertDialog open={confirmCancelOpen} onOpenChange={setConfirmCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar pedido</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción solo está permitida para pedidos pendientes. El stock será repuesto y el pedido pasará a estado cancelado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelar}>Sí, cancelar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
