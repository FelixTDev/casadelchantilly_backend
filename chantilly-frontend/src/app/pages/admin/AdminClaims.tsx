import React, { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, ChevronRight, Clock, MessageSquareWarning, Package, Search, ShieldCheck, X } from "lucide-react";
import { reclamoService, ReclamoApi } from "../../../services/reclamoService";
import { AdminEmptyState, AdminErrorState, AdminFilterChip, AdminLoadingState, AdminPagination, AdminPanel } from "../../components/adminUi";
import { getLocalDateInputValue } from "../../lib/validation";
import { toast } from "sonner";
import { showRequestError } from "../../../lib/notifyError";

const PAGE_SIZE = 8;

function formatDate(value?: string) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("es-PE");
}

function getClaimPriority(claim: ReclamoApi) {
  const createdAt = claim.creadoEn ? new Date(claim.creadoEn).getTime() : Date.now();
  const hoursOpen = Math.max(0, (Date.now() - createdAt) / 3600000);

  if (claim.estado === "ABIERTO" && (claim.tipo === "CALIDAD" || claim.tipo === "COBRO_INCORRECTO" || hoursOpen >= 72)) {
    return { label: "Alta", className: "border-red-200 bg-red-50 text-red-700" };
  }
  if (claim.estado === "ABIERTO" && (claim.tipo === "RETRASO" || hoursOpen >= 24)) {
    return { label: "Media", className: "border-amber-200 bg-amber-50 text-amber-700" };
  }
  return { label: "Baja", className: "border-emerald-200 bg-emerald-50 text-emerald-700" };
}

function getClaimSla(claim: ReclamoApi) {
  const createdAt = claim.creadoEn ? new Date(claim.creadoEn).getTime() : Date.now();
  const closedAt = claim.resueltoEn ? new Date(claim.resueltoEn).getTime() : Date.now();
  const hours = Math.max(0, Math.round((closedAt - createdAt) / 3600000));

  if (claim.estado === "RESUELTO") {
    return { label: `Resuelto en ${hours}h`, className: "border-blue-200 bg-blue-50 text-blue-700" };
  }
  if (hours > 48) {
    return { label: `Vencido ${hours}h`, className: "border-red-200 bg-red-50 text-red-700" };
  }
  return { label: `${hours}h en cola`, className: "border-gray-200 bg-gray-50 text-gray-600" };
}

export default function AdminClaims() {
  const [reclamos, setReclamos] = useState<ReclamoApi[]>([]);
  const [resolvingClaim, setResolvingClaim] = useState<ReclamoApi | null>(null);
  const [resolucion, setResolucion] = useState("");
  const [tipoSolucion, setTipoSolucion] = useState("SIN_ACCION");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [typeFilter, setTypeFilter] = useState("TODOS");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState(getLocalDateInputValue());
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await reclamoService.getTodos();
      setReclamos(res.data.sort((a, b) => (b.id || 0) - (a.id || 0)));
    } catch (e) {
      console.error("Error cargando reclamos", e);
      setError("No se pudo cargar la bandeja de reclamos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const claimTypes = useMemo(() => {
    return ["TODOS", ...Array.from(new Set(reclamos.map((r) => r.tipo).filter(Boolean)))];
  }, [reclamos]);

  const filtered = useMemo(() => {
    return reclamos.filter((r) => {
      const createdDate = r.creadoEn?.slice(0, 10) || "";
      const matchesSearch =
        !search.trim() ||
        `${r.id} ${r.pedidoId} ${r.descripcion} ${r.tipo}`.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "TODOS" || r.estado === statusFilter;
      const matchesType = typeFilter === "TODOS" || r.tipo === typeFilter;
      const matchesFrom = !fromDate || createdDate >= fromDate;
      const matchesTo = !toDate || createdDate <= toDate;
      return matchesSearch && matchesStatus && matchesType && matchesFrom && matchesTo;
    });
  }, [reclamos, search, statusFilter, typeFilter, fromDate, toDate]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, typeFilter, fromDate, toDate]);

  const pagedClaims = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const openClaimsCount = reclamos.filter((r) => r.estado === "ABIERTO").length;

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
      showRequestError(e, "No se pudo resolver el reclamo");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <AdminLoadingState message="Cargando buzón de reclamos..." />;
  }

  if (error) {
    return <AdminErrorState description={error} onRetry={load} />;
  }

  return (
    <div style={{ fontFamily: "Poppins" }}>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">Centro de Reclamos</h2>
          <p className="mt-1 text-sm font-medium text-gray-500">Filtra por estado, motivo y fecha. Incluye prioridad y SLA operativo.</p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
          <MessageSquareWarning className="h-4 w-4 text-red-500" />
          <span className="text-sm font-bold text-red-700">{openClaimsCount} abiertos</span>
        </div>
      </div>

      <AdminPanel className="mb-6 p-4 sm:p-5">
        <div className="flex flex-col gap-4">
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por ticket, pedido, tipo o detalle..."
              className="w-full rounded-2xl border border-gray-200 bg-white py-3.5 pl-12 pr-4 text-sm font-medium text-gray-800 placeholder-gray-400 shadow-sm transition focus:border-[#D32F2F] focus:outline-none focus:ring-4 focus:ring-red-500/10"
            />
          </div>
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap gap-2">
              {["TODOS", "ABIERTO", "RESUELTO"].map((status) => (
                <AdminFilterChip
                  key={status}
                  label={status === "TODOS" ? "Todos" : status === "ABIERTO" ? "Abiertos" : "Resueltos"}
                  active={statusFilter === status}
                  onClick={() => setStatusFilter(status)}
                />
              ))}
              {claimTypes.map((type) => (
                <AdminFilterChip
                  key={type}
                  label={type === "TODOS" ? "Todos los tipos" : type.replace(/_/g, " ")}
                  active={typeFilter === type}
                  onClick={() => setTypeFilter(type)}
                />
              ))}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition focus:border-[#D32F2F] focus:outline-none focus:ring-4 focus:ring-red-500/10"
              />
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition focus:border-[#D32F2F] focus:outline-none focus:ring-4 focus:ring-red-500/10"
              />
            </div>
          </div>
        </div>
      </AdminPanel>

      {resolvingClaim && (
        <>
          <div className="fixed inset-0 z-40" style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }} onClick={closeDrawer} />
          <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col bg-white shadow-2xl" style={{ boxShadow: "-10px 0 40px rgba(0,0,0,0.1)" }}>
            <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-8 py-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-100 bg-white shadow-sm">
                  <ShieldCheck className="h-5 w-5 text-[#D32F2F]" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold leading-tight text-gray-900">Resolver Reclamo</h3>
                  <p className="text-xs font-semibold text-gray-500">Ticket #{resolvingClaim.id}</p>
                </div>
              </div>
              <button onClick={closeDrawer} className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 shadow-sm transition hover:bg-gray-100 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              <div className="mb-8 rounded-2xl border border-gray-100 bg-gray-50 p-5">
                <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-400">Detalles del problema</h4>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-bold text-gray-700 shadow-sm">
                    <Package className="h-3.5 w-3.5 text-gray-400" />
                    Pedido #{resolvingClaim.pedidoId}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-bold text-gray-700 shadow-sm">
                    <AlertCircle className="h-3.5 w-3.5 text-red-400" />
                    {resolvingClaim.tipo?.replace(/_/g, " ")}
                  </span>
                </div>
                <p className="rounded-xl border border-gray-100 bg-white p-3 text-sm font-medium leading-relaxed text-gray-800">"{resolvingClaim.descripcion}"</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-900">Respuesta / Solución *</label>
                  <textarea
                    value={resolucion}
                    onChange={(e) => setResolucion(e.target.value)}
                    rows={5}
                    placeholder="Escribe la respuesta formal o la solución aplicada..."
                    className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 shadow-sm transition hover:border-gray-300 focus:border-[#D32F2F] focus:outline-none focus:ring-4 focus:ring-red-500/10"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-900">Tipo de Acción Tomada *</label>
                  <select
                    value={tipoSolucion}
                    onChange={(e) => setTipoSolucion(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 shadow-sm transition hover:border-gray-300 focus:border-[#D32F2F] focus:outline-none focus:ring-4 focus:ring-red-500/10"
                  >
                    <option value="REEMBOLSO">Reembolso al cliente</option>
                    <option value="REPOSICION">Reposición de producto</option>
                    <option value="SIN_ACCION">Explicación / Sin acción material</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 border-t border-gray-100 bg-gray-50/50 p-6">
              <button onClick={closeDrawer} className="flex-1 rounded-xl border border-gray-200 bg-white px-6 py-3.5 text-sm font-bold text-gray-600 shadow-sm transition hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={handleResolver} disabled={saving} className="flex-1 rounded-xl bg-[#D32F2F] px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70">
                {saving ? "Guardando..." : "Confirmar Resolución"}
              </button>
            </div>
          </div>
        </>
      )}

      <AdminPanel className="overflow-hidden">
        <div className="grid gap-4 p-4 lg:hidden">
          {pagedClaims.length === 0 ? (
            <AdminEmptyState title="Sin reclamos en este filtro" description="Prueba otro rango, estado o tipo de reclamo." />
          ) : (
            pagedClaims.map((r) => {
              const isOpen = r.estado === "ABIERTO";
              const priority = getClaimPriority(r);
              const sla = getClaimSla(r);
              return (
                <div key={r.id} className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Ticket #{r.id}</p>
                      <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-100 px-2.5 py-1.5 text-xs font-bold text-gray-700 shadow-sm">
                        <Package className="h-3.5 w-3.5 text-gray-400" />#{r.pedidoId}
                      </div>
                    </div>
                    {isOpen ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700">
                        <span className="relative flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
                        </span>
                        Abierto
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        Resuelto
                      </span>
                    )}
                  </div>

                  <div className="mt-4 space-y-3 rounded-2xl bg-gray-50/80 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold capitalize text-gray-700">
                      {r.tipo === "RETRASO" ? <Clock className="h-4 w-4 text-orange-400" /> : <AlertCircle className="h-4 w-4 text-red-400" />}
                      {r.tipo?.replace(/_/g, " ").toLowerCase()}
                    </div>
                    <p className="text-sm leading-relaxed text-gray-600">{r.descripcion}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-bold ${priority.className}`}>{priority.label}</span>
                      <span className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-bold ${sla.className}`}>{sla.label}</span>
                      <span className="inline-flex rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-500">
                        {formatDate(r.creadoEn)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    {isOpen ? (
                      <button
                        onClick={() => openDrawer(r)}
                        className="inline-flex items-center justify-center gap-1 rounded-2xl border-2 border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-600 shadow-sm transition hover:border-[#D32F2F] hover:text-[#D32F2F]"
                      >
                        Resolver <ChevronRight className="h-3 w-3" />
                      </button>
                    ) : (
                      <span className="text-xs font-semibold capitalize text-gray-600">
                        Solución: {r.tipoSolucion?.replace(/_/g, " ").toLowerCase()}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Ticket</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Pedido</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Motivo</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Detalle</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Prioridad</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">SLA</th>
                <th className="hidden px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500 lg:table-cell">Fecha</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Estado</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Acción</th>
              </tr>
            </thead>
            <tbody>
              {pagedClaims.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <AdminEmptyState title="Sin reclamos en este filtro" description="Prueba otro rango, estado o tipo de reclamo." />
                  </td>
                </tr>
              ) : (
                pagedClaims.map((r) => {
                  const isOpen = r.estado === "ABIERTO";
                  const priority = getClaimPriority(r);
                  const sla = getClaimSla(r);
                  return (
                    <tr key={r.id} className="border-b border-gray-50 transition-colors hover:bg-gray-50/50">
                      <td className="px-6 py-4 text-xs font-bold text-gray-400">#{r.id}</td>
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-100 px-2.5 py-1.5 text-xs font-bold text-gray-700 shadow-sm">
                          <Package className="h-3.5 w-3.5 text-gray-400" />#{r.pedidoId}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs font-semibold capitalize text-gray-700">
                          {r.tipo === "RETRASO" ? <Clock className="h-4 w-4 text-orange-400" /> : <AlertCircle className="h-4 w-4 text-red-400" />}
                          {r.tipo?.replace(/_/g, " ").toLowerCase()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="max-w-[260px] truncate text-sm font-medium text-gray-600" title={r.descripcion}>
                          {r.descripcion}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-bold ${priority.className}`}>{priority.label}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-bold ${sla.className}`}>{sla.label}</span>
                      </td>
                      <td className="hidden px-6 py-4 text-sm font-medium text-gray-500 lg:table-cell">{formatDate(r.creadoEn)}</td>
                      <td className="px-6 py-4">
                        {isOpen ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700">
                            <span className="relative flex h-2 w-2">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
                            </span>
                            Abierto
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700">
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                            Resuelto
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isOpen ? (
                          <button
                            onClick={() => openDrawer(r)}
                            className="inline-flex items-center justify-center gap-1 rounded-xl border-2 border-gray-200 bg-white px-4 py-1.5 text-xs font-bold text-gray-600 shadow-sm transition hover:border-[#D32F2F] hover:text-[#D32F2F]"
                          >
                            Resolver <ChevronRight className="h-3 w-3" />
                          </button>
                        ) : (
                          <div className="flex flex-col items-end">
                            <span className="mb-0.5 text-xs font-bold uppercase tracking-wider text-gray-400">Solución</span>
                            <span className="text-xs font-semibold capitalize text-gray-700">{r.tipoSolucion?.replace(/_/g, " ").toLowerCase()}</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </AdminPanel>
    </div>
  );
}
