import React, { useEffect, useMemo, useState } from "react";
import { Calendar, Check, Clock, Copy, Edit2, Megaphone, Plus, Tag, Ticket, Trash2, X } from "lucide-react";
import { productoService, PromocionApi } from "../../../services/productoService";
import { AdminBooleanBadge, AdminEmptyState, AdminErrorState, AdminLoadingState, AdminPagination, AdminPanel } from "../../components/adminUi";
import { getLocalDateInputValue, normalizeText, validateDateRange, validatePositiveNumber, validateRequiredText } from "../../lib/validation";
import { toast } from "sonner";
import { showRequestError } from "../../../lib/notifyError";

type PromotionForm = {
  nombre: string;
  descripcion: string;
  tipo: string;
  valor: string;
  fechaInicio: string;
  fechaFin: string;
  codigoCupon: string;
};

type PromotionErrors = Partial<Record<keyof PromotionForm, string>> & { range?: string };

const PAGE_SIZE = 6;

const EMPTY_FORM: PromotionForm = {
  nombre: "",
  descripcion: "",
  tipo: "PORCENTAJE",
  valor: "",
  fechaInicio: getLocalDateInputValue(),
  fechaFin: getLocalDateInputValue(),
  codigoCupon: "",
};

function CouponCode({ code }: { code?: string }) {
  const [copied, setCopied] = useState(false);
  if (!code) return <span className="text-xs italic text-gray-400">Aplica automáticamente (sin cupón)</span>;

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      toast.success("Cupón copiado al portapapeles");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-amber-200/60 bg-amber-50/50 p-3 transition-colors hover:bg-amber-50">
      <div className="flex items-center gap-2 overflow-hidden">
        <Tag className="h-4 w-4 shrink-0 text-amber-500" />
        <span className="truncate text-sm font-black uppercase tracking-widest text-amber-800">{code}</span>
      </div>
      <button
        onClick={handleCopy}
        className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all ${
          copied ? "bg-green-500 text-white shadow-md shadow-green-500/20" : "border border-amber-200/60 bg-white text-gray-400 shadow-sm hover:bg-white hover:text-amber-600"
        }`}
        title="Copiar cupón"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
}

function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  return <p className="mt-2 text-xs font-semibold text-red-600">{error}</p>;
}

export default function Promotions() {
  const [promos, setPromos] = useState<PromocionApi[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [editingPromo, setEditingPromo] = useState<PromocionApi | null>(null);
  const [form, setForm] = useState<PromotionForm>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<PromotionErrors>({});
  const [promoToDeactivate, setPromoToDeactivate] = useState<PromocionApi | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const promoRes = await productoService.getPromocionesAdmin();
      setPromos(promoRes.data.sort((a, b) => (b.id || 0) - (a.id || 0)));
    } catch (loadError) {
      console.error("Error cargando promociones", loadError);
      setError("No se pudo cargar el módulo de promociones.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const pagedPromos = useMemo(() => promos.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [promos, page]);
  const totalPages = Math.max(1, Math.ceil(promos.length / PAGE_SIZE));
  const activePromos = promos.filter((p) => p.activo).length;

  useEffect(() => {
    setPage(1);
  }, [promos.length]);

  const openCreate = () => {
    setEditingPromo(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setShowForm(true);
  };

  const openEdit = (promo: PromocionApi) => {
    setEditingPromo(promo);
    setForm({
      nombre: promo.nombre,
      descripcion: promo.descripcion || "",
      tipo: promo.tipo,
      valor: String(promo.valor),
      fechaInicio: promo.fechaInicio,
      fechaFin: promo.fechaFin,
      codigoCupon: promo.codigoCupon || "",
    });
    setFormErrors({});
    setShowForm(true);
  };

  const closeForm = () => {
    setEditingPromo(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setShowForm(false);
  };

  const validateForm = () => {
    const nextErrors: PromotionErrors = {
      nombre: validateRequiredText(form.nombre, "El nombre", 4, 80),
      descripcion: form.descripcion ? validateRequiredText(form.descripcion, "La descripción", 8, 160) : "",
      valor: validatePositiveNumber(form.valor, "El descuento"),
      fechaInicio: form.fechaInicio ? "" : "La fecha inicial es obligatoria",
      fechaFin: form.fechaFin ? "" : "La fecha final es obligatoria",
      codigoCupon: form.codigoCupon && form.codigoCupon.trim().length < 4 ? "El cupón debe tener al menos 4 caracteres" : "",
      range: validateDateRange(form.fechaInicio, form.fechaFin),
    };

    if (!nextErrors.valor && form.tipo === "PORCENTAJE" && Number(form.valor) > 100) {
      nextErrors.valor = "El porcentaje no puede superar 100";
    }

    setFormErrors(nextErrors);
    return !Object.values(nextErrors).some(Boolean);
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Revisa los campos obligatorios de la promoción.");
      return;
    }

    const payload: PromocionApi = {
      nombre: normalizeText(form.nombre),
      descripcion: normalizeText(form.descripcion),
      tipo: form.tipo,
      valor: Number(form.valor),
      fechaInicio: form.fechaInicio,
      fechaFin: form.fechaFin,
      activo: editingPromo?.activo ?? true,
      codigoCupon: form.codigoCupon.trim().toUpperCase() || undefined,
    };

    try {
      setSaving(true);
      if (editingPromo?.id) {
        await productoService.actualizarPromocion(editingPromo.id, payload);
        toast.success("Promoción actualizada");
      } else {
        await productoService.crearPromocion(payload);
        toast.success("Promoción creada");
      }
      closeForm();
      await loadData();
    } catch (saveError) {
      showRequestError(saveError, "No se pudo guardar la promoción");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await productoService.desactivarPromocion(id);
      toast.success("Promoción desactivada");
      await loadData();
    } catch {
      toast.error("No se pudo desactivar la promoción");
    }
  };

  if (loading) {
    return <AdminLoadingState message="Cargando promociones..." />;
  }

  if (error) {
    return <AdminErrorState description={error} onRetry={loadData} />;
  }

  return (
    <div style={{ fontFamily: "Poppins" }}>
      {promoToDeactivate && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}>
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
              <Trash2 className="h-6 w-6 text-[#D32F2F]" />
            </div>
            <h3 className="text-center text-xl font-extrabold text-gray-900">¿Desactivar promoción?</h3>
            <p className="mt-3 text-center text-sm text-gray-500">
              La promoción <strong>{promoToDeactivate.nombre}</strong> dejará de estar disponible para nuevos pedidos.
            </p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setPromoToDeactivate(null)} className="flex-1 rounded-2xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50">
                Cancelar
              </button>
              <button
                onClick={async () => {
                  if (promoToDeactivate.id) {
                    await handleDelete(promoToDeactivate.id);
                  }
                  setPromoToDeactivate(null);
                }}
                className="flex-1 rounded-2xl bg-[#D32F2F] px-4 py-3 text-sm font-bold text-white transition hover:bg-red-700"
              >
                Sí, desactivar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">Promociones</h2>
          <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-gray-500">
            <Ticket className="h-4 w-4" />
            {activePromos} activas de {promos.length}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#D32F2F] px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-red-900/20 transition hover:-translate-y-0.5 hover:bg-red-700"
        >
          <Plus className="h-4 w-4" />
          Nueva Promoción
        </button>
      </div>

      {showForm && (
        <>
          <div className="fixed inset-0 z-40" style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }} onClick={closeForm} />
          <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col bg-white shadow-2xl" style={{ boxShadow: "-10px 0 40px rgba(0,0,0,0.1)" }}>
            <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-8 py-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-100 bg-white shadow-sm">
                  <Megaphone className="h-5 w-5 text-[#D32F2F]" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-gray-900">{editingPromo ? "Editar Promoción" : "Crear Promoción"}</h3>
                  <p className="text-xs font-semibold text-gray-500">Configura el incentivo y su vigencia.</p>
                </div>
              </div>
              <button onClick={closeForm} className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 shadow-sm transition hover:bg-gray-100 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              {formErrors.range && <div className="mb-6 rounded-2xl border border-red-100 bg-red-50/80 p-4 text-sm font-semibold text-red-600">{formErrors.range}</div>}

              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">Nombre de campaña *</label>
                  <input
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    placeholder="Ej: Promo Día de la Madre"
                    className={`w-full rounded-xl border px-4 py-3 text-sm text-gray-800 shadow-sm transition focus:outline-none focus:ring-4 ${
                      formErrors.nombre ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : "border-gray-200 hover:border-gray-300 focus:border-[#D32F2F] focus:ring-red-500/10"
                    }`}
                  />
                  <FieldError error={formErrors.nombre} />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">Descripción corta</label>
                  <input
                    value={form.descripcion}
                    onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                    placeholder="Engancha a tus clientes..."
                    className={`w-full rounded-xl border px-4 py-3 text-sm text-gray-800 shadow-sm transition focus:outline-none focus:ring-4 ${
                      formErrors.descripcion ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : "border-gray-200 hover:border-gray-300 focus:border-[#D32F2F] focus:ring-red-500/10"
                    }`}
                  />
                  <FieldError error={formErrors.descripcion} />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-gray-700">Tipo *</label>
                    <select
                      value={form.tipo}
                      onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                      className="w-full appearance-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-sm transition hover:border-gray-300 focus:border-[#D32F2F] focus:outline-none focus:ring-4 focus:ring-red-500/10"
                    >
                      <option value="PORCENTAJE">Porcentaje (%)</option>
                      <option value="MONTO_FIJO">Monto fijo (S/)</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold text-gray-700">Descuento *</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        value={form.valor}
                        onChange={(e) => setForm({ ...form, valor: e.target.value })}
                        placeholder={form.tipo === "PORCENTAJE" ? "20" : "10.00"}
                        className={`w-full rounded-xl border py-3 pl-4 pr-10 text-sm text-gray-800 shadow-sm transition focus:outline-none focus:ring-4 ${
                          formErrors.valor ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : "border-gray-200 hover:border-gray-300 focus:border-[#D32F2F] focus:ring-red-500/10"
                        }`}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">{form.tipo === "PORCENTAJE" ? "%" : "S/"}</span>
                    </div>
                    <FieldError error={formErrors.valor} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-gray-700">Vigencia desde *</label>
                    <input
                      type="date"
                      value={form.fechaInicio}
                      onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })}
                      className={`w-full rounded-xl border px-4 py-3 text-sm text-gray-800 shadow-sm transition focus:outline-none focus:ring-4 ${
                        formErrors.fechaInicio ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : "border-gray-200 hover:border-gray-300 focus:border-[#D32F2F] focus:ring-red-500/10"
                      }`}
                    />
                    <FieldError error={formErrors.fechaInicio} />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold text-gray-700">Vigencia hasta *</label>
                    <input
                      type="date"
                      value={form.fechaFin}
                      onChange={(e) => setForm({ ...form, fechaFin: e.target.value })}
                      className={`w-full rounded-xl border px-4 py-3 text-sm text-gray-800 shadow-sm transition focus:outline-none focus:ring-4 ${
                        formErrors.fechaFin ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : "border-gray-200 hover:border-gray-300 focus:border-[#D32F2F] focus:ring-red-500/10"
                      }`}
                    />
                    <FieldError error={formErrors.fechaFin} />
                  </div>
                </div>

                <div className="rounded-2xl border border-amber-200/50 bg-amber-50/50 p-5">
                  <label className="mb-2 block text-sm font-bold text-amber-900">
                    Código de cupón <span className="font-normal opacity-70">(opcional)</span>
                  </label>
                  <input
                    value={form.codigoCupon}
                    onChange={(e) => setForm({ ...form, codigoCupon: e.target.value.toUpperCase() })}
                    placeholder="Ej: VERANO20"
                    maxLength={50}
                    className={`w-full rounded-xl border px-4 py-3 text-sm font-black uppercase tracking-widest text-amber-900 shadow-sm transition focus:outline-none focus:ring-4 ${
                      formErrors.codigoCupon ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : "border-amber-200 bg-white placeholder-amber-300 focus:border-amber-500 focus:ring-amber-500/20"
                    }`}
                  />
                  <FieldError error={formErrors.codigoCupon} />
                  <p className="mt-3 text-xs font-medium leading-relaxed text-amber-700/70">
                    Si dejas esto vacío, el descuento se aplicará de forma automática durante la vigencia.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 border-t border-gray-100 bg-gray-50/50 p-6">
              <button onClick={closeForm} className="flex-1 rounded-xl border border-gray-200 bg-white px-6 py-3.5 text-sm font-bold text-gray-600 shadow-sm transition hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving} className="flex-1 rounded-xl bg-[#D32F2F] px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-red-900/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70">
                {saving ? "Guardando..." : editingPromo ? "Actualizar Promoción" : "Crear Promoción"}
              </button>
            </div>
          </div>
        </>
      )}

      {promos.length === 0 ? (
        <AdminPanel>
          <AdminEmptyState title="No hay promociones" description="Crea tu primera promoción para atraer más clientes." />
        </AdminPanel>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {pagedPromos.map((p) => (
              <AdminPanel key={p.id} className="relative overflow-hidden transition-all duration-300 hover:-translate-y-1">
                <div className="h-1.5 w-full bg-gradient-to-r from-red-500 to-amber-500"></div>
                <div className="p-6 sm:p-8">
                  <div className="mb-6 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-[#D32F2F]">
                        <Megaphone className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="line-clamp-1 text-lg font-extrabold leading-tight text-gray-900" title={p.nombre}>
                          {p.nombre}
                        </h3>
                      </div>
                    </div>
                    <AdminBooleanBadge active={!!p.activo} activeLabel="Activa" inactiveLabel="Inactiva" />
                  </div>

                  <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                      {p.tipo === "PORCENTAJE" ? (
                        <>
                          <span className="text-4xl font-black text-gray-900">{p.valor}</span>
                          <span className="text-2xl font-extrabold text-[#D32F2F]">% OFF</span>
                        </>
                      ) : (
                        <>
                          <span className="text-2xl font-extrabold text-[#D32F2F]">S/</span>
                          <span className="text-4xl font-black text-gray-900">{p.valor}</span>
                          <span className="ml-1 text-lg font-bold text-gray-400">OFF</span>
                        </>
                      )}
                    </div>
                    {p.descripcion && <p className="mt-2 line-clamp-2 text-sm font-medium leading-snug text-gray-500">{p.descripcion}</p>}
                  </div>

                  <div className="mb-2 flex items-center gap-4 border-y border-gray-50 py-4 text-xs font-semibold text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-gray-300" />
                      {p.fechaInicio}
                    </div>
                    <div className="text-gray-300">→</div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-gray-300" />
                      {p.fechaFin}
                    </div>
                  </div>

                  <CouponCode code={p.codigoCupon} />
                </div>

                <div className="flex justify-end gap-2 border-t border-gray-50 bg-gray-50/50 px-6 py-4">
                  <button onClick={() => openEdit(p)} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-500 transition hover:bg-blue-50 hover:text-blue-600">
                    <Edit2 className="h-4 w-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => setPromoToDeactivate(p)}
                    disabled={!p.activo}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      p.activo ? "text-gray-500 hover:bg-red-50 hover:text-red-600" : "cursor-not-allowed text-gray-300"
                    }`}
                  >
                    <Trash2 className="h-4 w-4" />
                    {p.activo ? "Desactivar" : "Inactiva"}
                  </button>
                </div>
              </AdminPanel>
            ))}
          </div>
          <div className="mt-6">
            <AdminPanel>
              <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </AdminPanel>
          </div>
        </>
      )}
    </div>
  );
}
