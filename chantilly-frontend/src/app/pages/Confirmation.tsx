import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { CheckCircle, Package, Download, Gift, FileText, ArrowRight, Wallet, PartyPopper } from "lucide-react";
import { BtnPrimary, BtnSecondary, StatusBadge, toUiStatus } from "../components/shared";
import { pedidoService, PedidoApi } from "../../services/pedidoService";
import { toast } from "sonner";

export default function Confirmation() {
  const location = useLocation();
  const pedidoId = location.state?.pedidoId as number | undefined;
  const [pedido, setPedido] = useState<PedidoApi | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!pedidoId) return;
      try {
        const response = await pedidoService.getById(pedidoId);
        setPedido(response.data);
      } catch (error) {
        console.error("Error cargando pedido", error);
      }
    };
    load();
  }, [pedidoId]);

  const handleDownloadPDF = async () => {
    if (!pedidoId) return;
    try {
      const response = await pedidoService.descargarBoleta(pedidoId);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Boleta_Chantilly_${pedido?.codigoPedido || pedidoId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("¡Boleta descargada con éxito!");
    } catch (error) {
      console.error("Error al descargar boleta", error);
      toast.error("Hubo un problema al descargar la boleta. Inténtalo más tarde.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-12 px-4" style={{ fontFamily: "Poppins" }}>
      <div className="max-w-2xl mx-auto">
        
        {/* Banner de Celebración */}
        <div className="bg-[#D32F2F] text-white rounded-t-2xl p-8 text-center relative overflow-hidden">
          {/* Círculos decorativos en el fondo */}
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-white opacity-10 rounded-full blur-xl"></div>
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white opacity-10 rounded-full blur-xl"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-5 shadow-lg transform hover:scale-110 transition-transform">
              <PartyPopper className="w-10 h-10 text-[#D32F2F]" />
            </div>
            <h1 className="text-3xl mb-2" style={{ fontWeight: 800 }}>¡Pedido Confirmado!</h1>
            <p className="text-red-100 text-sm md:text-base max-w-md">
              Tu pedido ha sido registrado exitosamente y ya lo estamos procesando con mucho amor.
            </p>
          </div>
        </div>

        {/* Tarjeta Principal */}
        <div className="bg-white rounded-b-2xl shadow-xl p-6 md:p-8 border-t-0">
          
          {pedido ? (
            <div className="space-y-8">
              {/* Info Resumen */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <span className="text-xs text-gray-500 uppercase tracking-wider font-bold block mb-1">Orden N°</span>
                  <span className="text-gray-800 font-bold text-lg">{pedido.codigoPedido}</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <span className="text-xs text-gray-500 uppercase tracking-wider font-bold block mb-1">Fecha</span>
                  <span className="text-gray-800 font-bold text-lg">{pedido.creadoEn?.slice(0, 10)}</span>
                </div>
              </div>

              {/* Boleta Digital */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200 px-5 py-3 flex items-center justify-between">
                  <h3 className="font-bold text-gray-700 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Resumen de Compra
                  </h3>
                  <StatusBadge status={toUiStatus(pedido.estado)} />
                </div>
                
                <div className="p-5 space-y-3">
                  {pedido.items.map(item => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 font-medium">
                        <span className="text-gray-400 mr-2">{item.cantidad}x</span>
                        {item.nombreProducto}
                      </span>
                      <span className="text-gray-800 font-semibold">S/ {item.subtotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-gray-50 p-5 border-t border-gray-200 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>S/ {pedido.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery</span>
                    <span>S/ {pedido.costoEnvio.toFixed(2)}</span>
                  </div>
                  {pedido.descuento > 0 && (
                    <div className="flex justify-between text-green-600 font-semibold">
                      <span>Descuento</span>
                      <span>- S/ {pedido.descuento.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-200">
                    <span className="font-bold text-gray-800 text-base">Total a Pagar</span>
                    <span className="font-bold text-[#D32F2F] text-xl">S/ {pedido.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Instrucciones de Pago / Notificación */}
              <div className="bg-yellow-50 border border-yellow-200 p-5 rounded-xl flex gap-4 items-start">
                <div className="bg-yellow-100 p-2 rounded-full shrink-0">
                  <Wallet className="w-6 h-6 text-yellow-700" />
                </div>
                <div>
                  <h4 className="font-bold text-yellow-800 mb-1">Prepara tu pago</h4>
                  <p className="text-sm text-yellow-700 leading-relaxed">
                    Si elegiste Yape o Transferencia, recuerda tener a la mano tu comprobante. Nuestro equipo verificará tu orden pronto y <strong>te notificaremos cuando cambie de estado.</strong>
                  </p>
                </div>
              </div>

              {/* Botón Descargar Boleta */}
              <button 
                onClick={handleDownloadPDF}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gray-900 hover:bg-black text-white font-bold rounded-xl transition-colors shadow-md"
              >
                <Download className="w-5 h-5" />
                Descargar Boleta (PDF)
              </button>

            </div>
          ) : (
            <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D32F2F]"></div></div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-4">
            <Link to="/mis-pedidos" className="flex-1">
              <BtnSecondary className="w-full h-12 flex items-center justify-center gap-2">
                Ver Mis Pedidos
              </BtnSecondary>
            </Link>
            <Link to="/catalogo" className="flex-1">
              <BtnPrimary className="w-full h-12 flex items-center justify-center gap-2">
                Seguir Comprando <ArrowRight className="w-4 h-4" />
              </BtnPrimary>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

