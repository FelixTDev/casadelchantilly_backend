import React, { useEffect, useState } from "react";
import { reclamoService, ReclamoApi } from "../../../services/reclamoService";
import { toast } from "sonner";
import { 
  MessageSquareWarning, Hash, Package, Clock, 
  AlertCircle, CheckCircle2, X, ShieldCheck, 
  ChevronRight, Inbox
} from "lucide-react";

export default function AdminClaims() {
  const [reclamos, setReclamos] = useState<ReclamoApi[]>([]);
  const [resolvingClaim, setResolvingClaim] = useState<ReclamoApi | null>(null);
  const [resolucion, setResolucion] = useState("");
  const [tipoSolucion, setTipoSolucion] = useState("SIN_ACCION");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await reclamoService.getTodos();
      // Ordenar recientes primero
      setReclamos(res.data.sort((a, b) => (b.id || 0) - (a.id || 0)));
    } catch (e) {
      console.error("Error cargando reclamos", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openDrawer = (reclamo: ReclamoApi) => {
    setResolvingClaim(reclamo);
    setResolucion("");
    setTipoSolucion("SIN_ACCION");
  };

  const closeDrawer = () => {
    setResolvingClaim(null);
    setResolucion("");
  };

  const handleResolver = async () => {
    if (!resolvingClaim || !resolucion.trim()) {
      toast.error("Debes ingresar una resolución detallada.");
      return;
    }
    setSaving(true);
    try {
      await reclamoService.resolver(resolvingClaim.id!, { resolucion, tipoSolucion });
      toast.success("Reclamo resuelto con éxito");
      closeDrawer();
      await load();
    } catch (e) {
      console.error("Error resolviendo reclamo", e);
      toast.error("No se pudo resolver el reclamo");
    } finally {
      setSaving(false);
    }
  };

  const openClaimsCount = reclamos.filter(r => r.estado === "ABIERTO").length;

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32" style={{ fontFamily: "Poppins" }}>
      <div className="w-12 h-12 border-4 border-gray-200 border-t-red-500 rounded-full animate-spin mb-4"></div>
      <p className="text-gray-400 font-medium">Cargando buzón de reclamos...</p>
    </div>
  );

  return (
    <div style={{ fontFamily: "Poppins" }}>
      
      {/* Header Premium */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-gray-900 font-extrabold text-3xl tracking-tight mb-1">Centro de Reclamos</h2>
          <p className="text-gray-500 text-sm font-medium flex items-center gap-1.5">
            <MessageSquareWarning className="w-4 h-4" />
            Atención y resolución de problemas de clientes.
          </p>
        </div>
        
        {openClaimsCount > 0 && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 px-4 py-2 rounded-xl">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <span className="text-red-700 font-bold text-sm">
              {openClaimsCount} sin resolver
            </span>
          </div>
        )}
      </div>

      {/* Slide-over Drawer para Resolver Reclamo */}
      {resolvingClaim && (
        <>
          <div className="fixed inset-0 z-40 transition-opacity" style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }} onClick={closeDrawer} />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col" style={{ boxShadow: "-10px 0 40px rgba(0,0,0,0.1)" }}>
            
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-[#D32F2F]" />
                </div>
                <div>
                  <h3 className="text-gray-900 font-extrabold text-xl leading-tight">Resolver Reclamo</h3>
                  <p className="text-gray-500 text-xs font-semibold">Ticket #{resolvingClaim.id}</p>
                </div>
              </div>
              <button onClick={closeDrawer} className="w-8 h-8 rounded-full bg-white border border-gray-200 hover:bg-gray-100 flex items-center justify-center transition-colors text-gray-400 hover:text-gray-600 shadow-sm">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              {/* Contexto del Reclamo */}
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 mb-8">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Detalles del problema</h4>
                
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-gray-700 font-bold text-xs shadow-sm">
                    <Package className="w-3.5 h-3.5 text-gray-400" />
                    Pedido #{resolvingClaim.pedidoId}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-gray-700 font-bold text-xs shadow-sm">
                    <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                    {resolvingClaim.tipo?.replace(/_/g, " ")}
                  </span>
                </div>
                
                <p className="text-gray-800 text-sm font-medium leading-relaxed bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                  "{resolvingClaim.descripcion}"
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-gray-900 mb-2 font-bold text-sm">Respuesta / Solución *</label>
                  <textarea
                    value={resolucion}
                    onChange={e => setResolucion(e.target.value)}
                    rows={5}
                    placeholder="Escribe la respuesta formal que se le dará al cliente o cómo se solucionó internamente..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-[#D32F2F] transition-all shadow-sm hover:border-gray-300 resize-none"
                    style={{ fontSize: 14 }}
                  />
                </div>

                <div>
                  <label className="block text-gray-900 mb-2 font-bold text-sm">Tipo de Acción Tomada *</label>
                  <select
                    value={tipoSolucion}
                    onChange={e => setTipoSolucion(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white text-gray-800 focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-[#D32F2F] transition-all shadow-sm hover:border-gray-300"
                    style={{ fontSize: 14 }}
                  >
                    <option value="REEMBOLSO">Reembolso al cliente</option>
                    <option value="REPOSICION">Reposición de producto</option>
                    <option value="SIN_ACCION">Explicación / Sin acción material</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50/50 shrink-0 flex gap-3">
              <button onClick={closeDrawer}
                className="flex-1 text-gray-600 bg-white border border-gray-200 font-bold py-3.5 px-6 rounded-xl hover:bg-gray-50 transition-all shadow-sm"
                style={{ fontSize: 14 }}>
                Cancelar
              </button>
              <button onClick={handleResolver} disabled={saving}
                className="flex-1 bg-[#D32F2F] hover:bg-red-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md shadow-red-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
                style={{ fontSize: 14 }}>
                {saving ? "Guardando..." : "Confirmar Resolución"}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Tabla Premium o Estado Vacío */}
      {reclamos.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 transition-all duration-500 hover:shadow-xl" style={{ boxShadow: "0 10px 40px -10px rgba(0,0,0,0.08)" }}>
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-sm ring-1 ring-green-100">
            <Inbox className="w-12 h-12 text-green-500" />
          </div>
          <h3 className="text-gray-900 font-extrabold text-2xl mb-2">Buzón impecable</h3>
          <p className="text-gray-500 font-medium max-w-sm mx-auto leading-relaxed">
            ¡Excelente servicio! No tienes ningún reclamo pendiente de atención en este momento.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl overflow-hidden" style={{ boxShadow: "0 10px 40px -10px rgba(0,0,0,0.08)" }}>
          <div className="overflow-x-auto">
            <table className="w-full" style={{ fontSize: 14 }}>
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="text-left py-4 px-6 text-gray-500 font-bold text-xs uppercase tracking-wider">Ticket</th>
                  <th className="text-left py-4 px-6 text-gray-500 font-bold text-xs uppercase tracking-wider">Pedido</th>
                  <th className="text-left py-4 px-6 text-gray-500 font-bold text-xs uppercase tracking-wider hidden sm:table-cell">Motivo</th>
                  <th className="text-left py-4 px-6 text-gray-500 font-bold text-xs uppercase tracking-wider">Detalle</th>
                  <th className="text-left py-4 px-6 text-gray-500 font-bold text-xs uppercase tracking-wider hidden md:table-cell">Fecha</th>
                  <th className="text-left py-4 px-6 text-gray-500 font-bold text-xs uppercase tracking-wider">Estado</th>
                  <th className="text-right py-4 px-6 text-gray-500 font-bold text-xs uppercase tracking-wider">Acción</th>
                </tr>
              </thead>
              <tbody>
                {reclamos.map(r => {
                  const isOpen = r.estado === "ABIERTO";
                  return (
                    <tr key={r.id} className="group border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      {/* Ticket ID */}
                      <td className="py-4 px-6">
                        <span className="text-gray-400 font-bold text-xs">#{r.id}</span>
                      </td>

                      {/* Pedido */}
                      <td className="py-4 px-6">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-100 border border-gray-200 text-gray-700 font-bold text-xs shadow-sm">
                          <Package className="w-3.5 h-3.5 text-gray-400" />
                          #{r.pedidoId}
                        </div>
                      </td>

                      {/* Motivo */}
                      <td className="py-4 px-6 hidden sm:table-cell">
                        <div className="flex items-center gap-1.5 text-gray-700 font-semibold text-xs capitalize">
                          {r.tipo === "RETRASO" ? <Clock className="w-4 h-4 text-orange-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
                          {r.tipo?.replace(/_/g, " ").toLowerCase()}
                        </div>
                      </td>

                      {/* Detalle */}
                      <td className="py-4 px-6">
                        <p className="text-gray-600 font-medium text-sm max-w-[200px] xl:max-w-[300px] truncate" title={r.descripcion}>
                          {r.descripcion}
                        </p>
                      </td>

                      {/* Fecha */}
                      <td className="py-4 px-6 text-gray-500 font-medium text-sm hidden md:table-cell">
                        {r.creadoEn?.slice(0, 10)}
                      </td>

                      {/* Estado */}
                      <td className="py-4 px-6">
                        {isOpen ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border border-red-200 bg-red-50 text-red-700">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                            Abierto
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border border-green-200 bg-green-50 text-green-700">
                            <CheckCircle2 className="w-3 h-3 text-green-500" />
                            {r.estado}
                          </span>
                        )}
                      </td>

                      {/* Acción */}
                      <td className="py-4 px-6 text-right">
                        {isOpen ? (
                          <button 
                            onClick={() => openDrawer(r)}
                            className="inline-flex items-center justify-center gap-1 bg-white border-2 border-gray-200 text-gray-600 hover:text-[#D32F2F] hover:border-[#D32F2F] font-bold py-1.5 px-4 rounded-xl transition-all shadow-sm text-xs"
                          >
                            Resolver <ChevronRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <div className="flex flex-col items-end">
                            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-0.5">Solución:</span>
                            <span className="text-gray-700 font-semibold text-xs capitalize">{r.tipoSolucion?.replace(/_/g, " ").toLowerCase()}</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
