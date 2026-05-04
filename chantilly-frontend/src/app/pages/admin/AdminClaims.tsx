import React, { useEffect, useState } from "react";
import { reclamoService, ReclamoApi } from "../../../services/reclamoService";

const ESTADO_COLORS: Record<string, string> = {
  ABIERTO: "bg-red-100 text-red-700",
  EN_REVISION: "bg-yellow-100 text-yellow-700",
  RESUELTO: "bg-green-100 text-green-700",
  CERRADO: "bg-gray-100 text-gray-600",
};

export default function AdminClaims() {
  const [reclamos, setReclamos] = useState<ReclamoApi[]>([]);
  const [resolvingId, setResolvingId] = useState<number | null>(null);
  const [resolucion, setResolucion] = useState("");
  const [tipoSolucion, setTipoSolucion] = useState("SIN_ACCION");

  const load = async () => {
    try {
      const res = await reclamoService.getTodos();
      setReclamos(res.data);
    } catch (e) {
      console.error("Error cargando reclamos", e);
    }
  };

  useEffect(() => { load(); }, []);

  const handleResolver = async (id: number) => {
    if (!resolucion.trim()) return;
    try {
      await reclamoService.resolver(id, { resolucion, tipoSolucion });
      setResolvingId(null);
      setResolucion("");
      setTipoSolucion("SIN_ACCION");
      await load();
    } catch (e) {
      console.error("Error resolviendo reclamo", e);
      alert("No se pudo resolver el reclamo");
    }
  };

  return (
    <div style={{ fontFamily: "Poppins" }}>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" style={{ fontSize: 14 }}>
            <thead className="bg-[#F5F5F5]">
              <tr>
                <th className="text-left py-3 px-4 text-gray-500" style={{ fontWeight: 600 }}>ID</th>
                <th className="text-left py-3 px-4 text-gray-500" style={{ fontWeight: 600 }}>Pedido</th>
                <th className="text-left py-3 px-4 text-gray-500 hidden sm:table-cell" style={{ fontWeight: 600 }}>Tipo</th>
                <th className="text-left py-3 px-4 text-gray-500" style={{ fontWeight: 600 }}>Descripción</th>
                <th className="text-left py-3 px-4 text-gray-500" style={{ fontWeight: 600 }}>Estado</th>
                <th className="text-left py-3 px-4 text-gray-500 hidden md:table-cell" style={{ fontWeight: 600 }}>Fecha</th>
                <th className="text-left py-3 px-4 text-gray-500" style={{ fontWeight: 600 }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {reclamos.length === 0 && (
                <tr><td colSpan={7} className="py-12 text-center text-gray-400">No hay reclamos registrados.</td></tr>
              )}
              {reclamos.map(r => (
                <React.Fragment key={r.id}>
                  <tr className="border-t hover:bg-gray-50">
                    <td className="py-3 px-4" style={{ fontWeight: 600 }}>#{r.id}</td>
                    <td className="py-3 px-4 text-[#D32F2F]" style={{ fontWeight: 600 }}>Pedido #{r.pedidoId}</td>
                    <td className="py-3 px-4 text-gray-500 hidden sm:table-cell">{r.tipo?.replace(/_/g, " ")}</td>
                    <td className="py-3 px-4 text-gray-600 max-w-[200px] truncate">{r.descripcion}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${ESTADO_COLORS[r.estado || ""] || "bg-gray-100 text-gray-600"}`}>
                        {r.estado}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500 hidden md:table-cell">{r.creadoEn?.slice(0, 10)}</td>
                    <td className="py-3 px-4">
                      {r.estado === "ABIERTO" ? (
                        <button onClick={() => setResolvingId(resolvingId === r.id ? null : r.id!)}
                          className="px-3 py-1.5 bg-[#D32F2F] text-white rounded-lg text-xs font-semibold hover:bg-[#B71C1C] transition">
                          Resolver
                        </button>
                      ) : r.estado === "RESUELTO" ? (
                        <span className="text-green-600 text-xs font-semibold">{r.tipoSolucion?.replace(/_/g, " ")}</span>
                      ) : null}
                    </td>
                  </tr>
                  {resolvingId === r.id && (
                    <tr className="bg-red-50/50">
                      <td colSpan={7} className="p-4">
                        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
                          <div className="flex-1 w-full">
                            <label className="block text-[#333] mb-1" style={{ fontSize: 12, fontWeight: 600 }}>Resolución</label>
                            <textarea value={resolucion} onChange={e => setResolucion(e.target.value)} rows={2}
                              placeholder="Describa cómo se resolverá este reclamo..."
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-white focus:border-[#D32F2F] focus:outline-none resize-none" style={{ fontSize: 13 }} />
                          </div>
                          <div>
                            <label className="block text-[#333] mb-1" style={{ fontSize: 12, fontWeight: 600 }}>Tipo de Solución</label>
                            <select value={tipoSolucion} onChange={e => setTipoSolucion(e.target.value)}
                              className="border border-gray-200 rounded-lg px-3 py-2 bg-white focus:border-[#D32F2F] focus:outline-none" style={{ fontSize: 13 }}>
                              <option value="REEMBOLSO">Reembolso</option>
                              <option value="REPOSICION">Reposición</option>
                              <option value="SIN_ACCION">Sin acción</option>
                            </select>
                          </div>
                          <button onClick={() => handleResolver(r.id!)}
                            className="px-5 py-2 bg-[#4CAF50] text-white rounded-lg text-sm font-semibold hover:bg-[#388E3C] transition whitespace-nowrap">
                            Confirmar
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
