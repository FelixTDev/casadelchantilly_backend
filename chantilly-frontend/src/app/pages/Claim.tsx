import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, CheckCircle, Package, AlertTriangle, MessageSquare, Clock, Send, Headphones } from "lucide-react";
import { BtnPrimary } from "../components/shared";
import { pedidoService, PedidoApi } from "../../services/pedidoService";
import { reclamoService } from "../../services/reclamoService";
import { toast } from "sonner";
import { showRequestError } from "../../lib/notifyError";

export default function Claim() {
  const [type, setType] = useState("");
  const [desc, setDesc] = useState("");
  const [pedidoId, setPedidoId] = useState<number | null>(null);
  const [pedidos, setPedidos] = useState<PedidoApi[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await pedidoService.getMisPedidos();
        const entregados = response.data.filter((p) => p.estado === "ENTREGADO");
        setPedidos(entregados);
        if (entregados.length > 0) {
          setPedidoId(entregados[0].id);
        }
      } catch (error) {
        console.error("Error cargando pedidos", error);
      }
    };
    load();
  }, []);

  const handleSubmit = async () => {
    if (!pedidoId || !type || !desc) return;
    setIsSubmitting(true);
    try {
      await reclamoService.crear({ pedidoId, tipo: type, descripcion: desc });
      setSubmitted(true);
    } catch (error) {
      console.error("Error creando reclamo", error);
      showRequestError(error, "No se pudo registrar el reclamo. Por favor, intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center px-4" style={{ fontFamily: "Poppins" }}>
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 max-w-md w-full p-10 text-center">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="text-gray-900 mb-3" style={{ fontWeight: 800, fontSize: 26 }}>Reclamo Enviado</h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Hemos recibido tu mensaje. Nuestro equipo de atención al cliente lo está revisando y te contactaremos a la brevedad.
        </p>
        <Link to="/mis-pedidos">
          <button className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3.5 rounded-full shadow-lg transition-all">
            Volver a Mis Pedidos
          </button>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-10 px-4" style={{ fontFamily: "Poppins" }}>
      <div className="max-w-2xl mx-auto">
        <Link to="/mis-pedidos" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors mb-8 font-medium">
          <ArrowLeft className="w-4 h-4" /> Volver a mis pedidos
        </Link>
        
        <div className="bg-white rounded-3xl shadow-xl shadow-red-900/5 border border-gray-100 overflow-hidden">
          {/* Header Empático */}
          <div className="bg-[#D32F2F] p-8 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
              <Headphones className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-extrabold text-3xl mb-2">Centro de Ayuda</h1>
            <p className="text-red-100 text-sm max-w-sm mx-auto">
              Lamentamos que tu experiencia no haya sido perfecta. Cuéntanos qué pasó y nuestro equipo lo resolverá lo antes posible.
            </p>
          </div>

          <div className="p-8 sm:p-10 space-y-6">
            
            {/* Campo: Pedido */}
            <div>
              <label className="block text-gray-800 mb-2 font-bold text-sm">¿Con qué pedido tuviste el problema?</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Package className="h-5 w-5 text-gray-400" />
                </div>
                <select 
                  value={pedidoId ?? ""} 
                  onChange={e => setPedidoId(Number(e.target.value))}
                  className="w-full pl-12 pr-10 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all appearance-none"
                >
                  {pedidos.length === 0 && <option value="">No tienes pedidos entregados</option>}
                  {pedidos.map((p) => <option key={p.id} value={p.id}>Pedido #{p.codigoPedido}</option>)}
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            {/* Campo: Tipo de Problema */}
            <div>
              <label className="block text-gray-800 mb-2 font-bold text-sm">¿De qué tipo de problema se trata?</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <AlertTriangle className="h-5 w-5 text-gray-400" />
                </div>
                <select 
                  value={type} 
                  onChange={e => setType(e.target.value)} 
                  className="w-full pl-12 pr-10 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all appearance-none"
                >
                  <option value="">Selecciona una categoría...</option>
                  <option value="PRODUCTO_DANADO">El producto llegó dañado</option>
                  <option value="PRODUCTO_INCORRECTO">Recibí un producto incorrecto</option>
                  <option value="RETRASO">Hubo una demora excesiva en la entrega</option>
                  <option value="OTRO">Otro inconveniente</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            {/* Campo: Descripción */}
            <div>
              <label className="block text-gray-800 mb-2 font-bold text-sm">Detalles adicionales</label>
              <div className="relative">
                <div className="absolute top-3.5 left-4 pointer-events-none">
                  <MessageSquare className="h-5 w-5 text-gray-400" />
                </div>
                <textarea 
                  value={desc} 
                  onChange={e => setDesc(e.target.value)} 
                  rows={4} 
                  placeholder="Por favor, describe el problema con el mayor detalle posible para poder ayudarte mejor..."
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none" 
                />
              </div>
            </div>

            {/* Botón y Promesa */}
            <div className="pt-4 border-t border-gray-100">
              <button 
                onClick={handleSubmit} 
                disabled={!type || !desc || !pedidoId || isSubmitting} 
                className={`w-full flex items-center justify-center gap-2 font-bold py-4 rounded-full transition-all shadow-lg ${(!type || !desc || !pedidoId || isSubmitting) ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none" : "bg-[#D32F2F] hover:bg-red-700 text-white hover:shadow-red-900/20 hover:-translate-y-0.5"}`}
              >
                {isSubmitting ? "Enviando..." : (
                  <>
                    <Send className="w-5 h-5" /> Enviar Reclamo
                  </>
                )}
              </button>
              
              <div className="flex items-center justify-center gap-1.5 mt-4 text-gray-500 text-xs font-medium">
                <Clock className="w-3.5 h-3.5" />
                <span>Te daremos una respuesta en un plazo máximo de 24 horas laborables.</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

