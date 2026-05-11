import React, { useEffect, useState } from "react";
import { AlertTriangle, Package, Check, ShieldCheck, ArrowRight, BellRing } from "lucide-react";
import { reporteService, AlertaStockApi } from "../../../services/reporteService";
import { toast } from "sonner";

export default function StockAlerts() {
  const [alertas, setAlertas] = useState<AlertaStockApi[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAlertas = async () => {
    try {
      const response = await reporteService.getAlertasStock();
      setAlertas(response.data);
    } catch (error) {
      console.error("Error cargando alertas", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlertas();
  }, []);

  const marcarAtendida = async (id: number) => {
    try {
      await reporteService.marcarAlertaAtendida(id);
      setAlertas(prev => prev.filter(a => a.id !== id));
      toast.success("Alerta resuelta. ¡Buen trabajo!");
    } catch (error) {
      console.error("Error marcando alerta", error);
      toast.error("No se pudo marcar la alerta");
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32" style={{ fontFamily: "Poppins" }}>
      <div className="w-12 h-12 border-4 border-gray-200 border-t-red-500 rounded-full animate-spin mb-4"></div>
      <p className="text-gray-400 font-medium">Buscando alertas...</p>
    </div>
  );

  return (
    <div style={{ fontFamily: "Poppins" }}>
      
      {/* Header Premium */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-gray-900 font-extrabold text-3xl tracking-tight mb-1">Alertas de Inventario</h2>
          <p className="text-gray-500 text-sm font-medium flex items-center gap-1.5">
            <BellRing className="w-4 h-4" />
            Vigila tus productos y evita quedarte sin stock.
          </p>
        </div>
        {alertas.length > 0 && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 px-4 py-2 rounded-xl">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <span className="text-red-700 font-bold text-sm">
              {alertas.length} {alertas.length === 1 ? "alerta pendiente" : "alertas pendientes"}
            </span>
          </div>
        )}
      </div>

      {alertas.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 transition-all duration-500 hover:shadow-xl" style={{ boxShadow: "0 10px 40px -10px rgba(0,0,0,0.08)" }}>
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-sm ring-1 ring-green-100">
            <ShieldCheck className="w-12 h-12 text-green-500" />
          </div>
          <h3 className="text-gray-900 font-extrabold text-2xl mb-2">¡Todo en orden!</h3>
          <p className="text-gray-500 font-medium max-w-sm mx-auto leading-relaxed">
            Tu inventario está operando a la perfección. Ningún producto está por debajo de su límite crítico.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {alertas.map(a => {
            const critical = a.stockActual <= 0;
            return (
              <div 
                key={a.id} 
                className="bg-white rounded-3xl p-6 relative overflow-hidden group transition-all duration-300 hover:-translate-y-1" 
                style={{ boxShadow: "0 10px 40px -10px rgba(0,0,0,0.08)" }}
              >
                {/* Acento lateral */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${critical ? "bg-red-500" : "bg-orange-500"}`}></div>

                <div className="flex flex-col sm:flex-row gap-5">
                  <div className="flex-1 flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${critical ? "bg-red-50 text-red-500 border border-red-100" : "bg-orange-50 text-orange-500 border border-orange-100"}`}>
                      {critical ? <AlertTriangle className="w-6 h-6" /> : <Package className="w-6 h-6" />}
                    </div>
                    <div>
                      <h3 className="text-gray-900 font-bold text-lg leading-tight mb-1">{a.nombreProducto}</h3>
                      <p className="text-gray-400 text-sm font-medium">Mínimo ideal: {a.stockMinimo} unid.</p>
                      
                      <div className="mt-3 inline-flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                        <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Stock Actual:</span>
                        <span className={`font-black text-lg ${critical ? "text-red-500" : "text-orange-500"}`}>{a.stockActual}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md ml-1 ${critical ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`}>
                          {critical ? "Agotado" : "Bajo"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-end border-t sm:border-t-0 sm:border-l border-gray-100 pt-4 sm:pt-0 sm:pl-5 shrink-0">
                    <p className="text-xs text-gray-400 font-medium mb-2 text-center sm:text-left">
                      ¿Ya actualizaste <br className="hidden sm:block" />el inventario?
                    </p>
                    <button 
                      onClick={() => marcarAtendida(a.id)}
                      className="group/btn relative flex items-center justify-center gap-2 bg-white border-2 border-gray-200 hover:border-green-500 text-gray-500 hover:text-green-600 font-bold py-2.5 px-4 rounded-xl transition-all shadow-sm w-full"
                    >
                      <Check className="w-4 h-4 transition-transform group-hover/btn:scale-125" />
                      <span>Resuelta</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
