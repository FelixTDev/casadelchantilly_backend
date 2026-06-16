import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { ArrowRight, Download, FileText, MapPin, PartyPopper, Wallet } from "lucide-react";
import { BtnPrimary, BtnSecondary, PaymentStatusBadge, StatusBadge, toUiStatus } from "../components/shared";
import { pedidoService, PedidoApi } from "../../services/pedidoService";
import { toast } from "sonner";
import { AuthBreadcrumbs } from "../components/AuthBreadcrumbs";
import { showRequestError } from "../../lib/notifyError";

export default function Confirmation() {
  const location = useLocation();
  const pedidoId = location.state?.pedidoId as number | undefined;
  const [pedido, setPedido] = useState<PedidoApi | null>(null);
  const [loading, setLoading] = useState(!!pedidoId);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!pedidoId) {
        setLoading(false);
        setLoadError("No encontramos una orden reciente para mostrar.");
        return;
      }
      try {
        const response = await pedidoService.getById(pedidoId);
        setPedido(response.data);
      } catch (error) {
        console.error("Error cargando pedido", error);
        setLoadError("No se pudo cargar el detalle del pedido.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [pedidoId]);

  const handleDownloadPDF = async () => {
    if (!pedidoId) return;
    try {
      const response = await pedidoService.descargarBoleta(pedidoId);
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Boleta_Chantilly_${pedido?.codigoPedido || pedidoId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Boleta descargada con éxito");
    } catch (error) {
      console.error("Error al descargar boleta", error);
      showRequestError(error, "Hubo un problema al descargar la boleta.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F3] px-4 py-12" style={{ fontFamily: "Poppins" }}>
      <div className="mx-auto max-w-3xl">
        <AuthBreadcrumbs items={[{ label: "Inicio", to: "/" }, { label: "Mis pedidos", to: "/mis-pedidos" }, { label: "Confirmación" }]} />
        <div className="overflow-hidden rounded-t-3xl bg-[#B83A3A] p-8 text-center text-white relative">
          <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-xl" />
          <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-[#F5C518]/20 blur-xl" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg">
              <PartyPopper className="h-10 w-10 text-[#B83A3A]" />
            </div>
            <p className="rounded-full bg-white/10 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] text-white/80">Compra registrada</p>
            <h1 className="mt-4 text-3xl font-extrabold">Tu celebración ya está en marcha</h1>
            <p className="mt-2 max-w-md text-sm text-red-100">
              Registramos tu pedido, asociamos el pago y dejamos listo el seguimiento. Desde aquí puedes descargar la boleta y revisar el avance cuando quieras.
            </p>
          </div>
        </div>

        <div className="rounded-b-3xl bg-white p-6 shadow-xl md:p-8">
          {pedido ? (
            <div className="space-y-8">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <span className="block text-xs font-bold uppercase tracking-wider text-gray-500">Orden</span>
                  <span className="mt-1 block text-lg font-bold text-gray-800">{pedido.codigoPedido}</span>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <span className="block text-xs font-bold uppercase tracking-wider text-gray-500">Estado del pedido</span>
                  <div className="mt-2"><StatusBadge status={toUiStatus(pedido.estado)} /></div>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <span className="block text-xs font-bold uppercase tracking-wider text-gray-500">Estado del pago</span>
                  <div className="mt-2"><PaymentStatusBadge status={pedido.pago?.estadoPago} /></div>
                </div>
              </div>

              <div className="rounded-3xl border border-gray-200 overflow-hidden">
                <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-5 py-4">
                  <h3 className="flex items-center gap-2 font-bold text-gray-700">
                    <FileText className="h-4 w-4" />
                    Resumen de compra
                  </h3>
                  {pedido.pago?.metodoPago && (
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      {pedido.pago.metodoPago}
                    </span>
                  )}
                </div>

                <div className="space-y-3 p-5">
                  {pedido.items.map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">
                          <span className="mr-2 text-gray-400">{item.cantidad}x</span>
                          {item.nombreProducto}
                        </span>
                        {item.personalizacion && (
                          <p className="mt-1 text-xs text-gray-500">Dedicatoria: {item.personalizacion}</p>
                        )}
                      </div>
                      <span className="font-semibold text-gray-800">S/ {Number(item.subtotal || 0).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 border-t border-gray-200 bg-gray-50 p-5 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>S/ {Number(pedido.subtotal || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery</span>
                    <span>S/ {Number(pedido.costoEnvio || 0).toFixed(2)}</span>
                  </div>
                  {Number(pedido.descuento || 0) > 0 && (
                    <div className="flex justify-between font-semibold text-green-600">
                      <span>Descuento</span>
                      <span>- S/ {Number(pedido.descuento || 0).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="mt-2 flex items-center justify-between border-t border-gray-200 pt-3">
                    <span className="text-base font-bold text-gray-800">Total</span>
                    <span className="text-xl font-bold text-[#D32F2F]">S/ {Number(pedido.total || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-yellow-100 p-2 text-yellow-700">
                      <Wallet className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-yellow-800">Pago registrado</h4>
                      <p className="mt-1 text-sm text-yellow-700">
                        Estado actual: <strong>{pedido.pago?.estadoPago || "PENDIENTE"}</strong>. Si pagaste con Yape, Plin o transferencia, el equipo lo validará con tu referencia.
                      </p>
                      {pedido.pago?.referencia && (
                        <p className="mt-2 text-xs font-semibold text-yellow-800">Referencia: {pedido.pago.referencia}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-white p-2 text-gray-600">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">Entrega</h4>
                      <p className="mt-1 text-sm text-gray-600">
                        {pedido.modalidadEntrega === "DELIVERY" ? pedido.direccionDetalle || "Delivery con dirección registrada" : "Recojo en tienda"}
                      </p>
                      {pedido.fechaEntrega && (
                        <p className="mt-2 text-xs font-semibold text-gray-500">Programado para: {pedido.fechaEntrega}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleDownloadPDF}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-900 py-3.5 font-bold text-white shadow-md transition hover:bg-black"
              >
                <Download className="h-5 w-5" />
                Descargar boleta (PDF)
              </button>
            </div>
          ) : loading ? (
            <div className="flex justify-center p-10"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#D32F2F]" /></div>
          ) : (
            <div className="space-y-4 py-10 text-center">
              <p className="text-gray-600">{loadError}</p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Link to="/mis-pedidos"><BtnSecondary>Ver Mis Pedidos</BtnSecondary></Link>
                <Link to="/catalogo"><BtnPrimary>Ir al Catálogo</BtnPrimary></Link>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-4 border-t border-gray-100 pt-6 sm:flex-row">
            <Link to="/mis-pedidos" className="flex-1">
              <BtnSecondary className="h-12 w-full">Ver Mis Pedidos</BtnSecondary>
            </Link>
            <Link to="/catalogo" className="flex-1">
              <BtnPrimary className="flex h-12 w-full items-center justify-center gap-2">
                Seguir Comprando <ArrowRight className="h-4 w-4" />
              </BtnPrimary>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
