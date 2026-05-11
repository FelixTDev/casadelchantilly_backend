import React, { useEffect, useState } from "react";
import { Tag, Plus, Trash2, Copy, Check, X, Ticket, Calendar, Clock, Megaphone } from "lucide-react";
import { TableSkeleton } from "../../components/shared";
import { productoService, PromocionApi } from "../../../services/productoService";
import { toast } from "sonner";

const EMPTY_FORM = {
  nombre: "",
  descripcion: "",
  tipo: "PORCENTAJE",
  valor: "",
  fechaInicio: "",
  fechaFin: "",
  codigoCupon: "",
};

function CouponCode({ code }: { code?: string }) {
  const [copied, setCopied] = useState(false);
  if (!code) return <span className="text-xs text-gray-400 italic">Aplica automáticamente (Sin cupón)</span>;

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      toast.success("Cupón copiado al portapapeles");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex items-center justify-between gap-3 mt-4 p-3 bg-amber-50/50 rounded-2xl border border-amber-200/60 transition-colors hover:bg-amber-50">
      <div className="flex items-center gap-2 overflow-hidden">
        <Tag className="w-4 h-4 text-amber-500 shrink-0" />
        <span className="text-amber-800 font-black text-sm tracking-widest uppercase truncate">
          {code}
        </span>
      </div>
      <button
        onClick={handleCopy}
        className={`flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-300 shrink-0 ${
          copied
            ? "bg-green-500 text-white shadow-md shadow-green-500/20"
            : "bg-white text-gray-400 hover:text-amber-600 hover:bg-white shadow-sm border border-amber-200/60"
        }`}
        title="Copiar cupón"
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
}

export default function Promotions() {
  const [promos, setPromos] = useState<PromocionApi[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");

  const loadData = async () => {
    try {
      const promoRes = await productoService.getPromociones();
      // Ordenar más recientes primero
      setPromos(promoRes.data.sort((a, b) => (b.id || 0) - (a.id || 0)));
    } catch (error) {
      console.error("Error cargando promociones", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleAdd = async () => {
    setFormError("");
    if (!form.nombre || !form.valor || !form.fechaInicio || !form.fechaFin) {
      setFormError("Completa los campos obligatorios: nombre, descuento, fechas.");
      return;
    }
    try {
      setSaving(true);
      await productoService.crearPromocion({
        nombre: form.nombre,
        descripcion: form.descripcion,
        tipo: form.tipo,
        valor: Number(form.valor),
        fechaInicio: form.fechaInicio,
        fechaFin: form.fechaFin,
        codigoCupon: form.codigoCupon.trim().toUpperCase() || undefined,
      });
      setForm(EMPTY_FORM);
      setShowForm(false);
      await loadData();
    } catch (error) {
      const msg = (error as any)?.response?.data?.mensaje || "No se pudo crear la promoción";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Desactivar esta promoción?")) return;
    try {
      await productoService.desactivarPromocion(id);
      await loadData();
      toast.success("Promoción desactivada");
    } catch {
      toast.error("No se pudo desactivar la promoción");
    }
  };

  if (loading) return (
    <div className="py-10">
      <TableSkeleton />
    </div>
  );

  const activePromos = promos.filter(p => p.activo).length;

  return (
    <div style={{ fontFamily: "Poppins" }}>
      {/* Header Premium */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-gray-900 font-extrabold text-3xl tracking-tight mb-1">Promociones</h2>
          <p className="text-gray-500 text-sm font-medium flex items-center gap-1.5">
            <Ticket className="w-4 h-4" />
            {activePromos} {activePromos === 1 ? "promoción activa" : "promociones activas"} de {promos.length}
          </p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setFormError(""); }}
          className="flex items-center justify-center gap-2 bg-[#D32F2F] hover:bg-red-700 text-white font-bold py-3.5 px-6 rounded-2xl transition-all shadow-md shadow-red-900/20 hover:shadow-lg hover:-translate-y-0.5"
          style={{ fontSize: 14 }}>
          <Plus className="w-4 h-4" />
          Nueva Promoción
        </button>
      </div>

      {/* Formulario Slide-over */}
      {showForm && (
        <>
          <div className="fixed inset-0 z-40 transition-opacity" style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }} onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }} />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col" style={{ boxShadow: "-10px 0 40px rgba(0,0,0,0.1)" }}>
            
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center">
                  <Megaphone className="w-5 h-5 text-[#D32F2F]" />
                </div>
                <h3 className="text-gray-900 font-extrabold text-xl">Crear Promoción</h3>
              </div>
              <button onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }} className="w-8 h-8 rounded-full bg-white border border-gray-200 hover:bg-gray-100 flex items-center justify-center transition-colors text-gray-400 hover:text-gray-600 shadow-sm">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              {formError && (
                <div className="bg-red-50/80 border border-red-100 text-red-600 text-sm font-semibold p-4 rounded-2xl mb-6 flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></div>
                  {formError}
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="block text-gray-700 mb-2 font-bold text-sm">Nombre de campaña *</label>
                  <input
                    value={form.nombre}
                    onChange={e => setForm({ ...form, nombre: e.target.value })}
                    placeholder="Ej: Promo Día de la Madre"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-[#D32F2F] transition-all shadow-sm hover:border-gray-300"
                    style={{ fontSize: 14 }}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2 font-bold text-sm">Descripción corta</label>
                  <input
                    value={form.descripcion}
                    onChange={e => setForm({ ...form, descripcion: e.target.value })}
                    placeholder="Engancha a tus clientes..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-[#D32F2F] transition-all shadow-sm hover:border-gray-300"
                    style={{ fontSize: 14 }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-gray-700 mb-2 font-bold text-sm">Tipo *</label>
                    <select
                      value={form.tipo}
                      onChange={e => setForm({ ...form, tipo: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white text-gray-800 focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-[#D32F2F] transition-all shadow-sm hover:border-gray-300 appearance-none"
                      style={{ fontSize: 14 }}
                    >
                      <option value="PORCENTAJE">Porcentaje (%)</option>
                      <option value="MONTO_FIJO">Monto fijo (S/)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2 font-bold text-sm">Descuento *</label>
                    <div className="relative">
                      <input
                        type="number" min="0"
                        value={form.valor}
                        onChange={e => setForm({ ...form, valor: e.target.value })}
                        placeholder={form.tipo === "PORCENTAJE" ? "20" : "10.00"}
                        className="w-full border border-gray-200 rounded-xl pl-4 pr-10 py-3 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-[#D32F2F] transition-all shadow-sm hover:border-gray-300"
                        style={{ fontSize: 14 }}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                        {form.tipo === "PORCENTAJE" ? "%" : "S/"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-gray-700 mb-2 font-bold text-sm">Vigencia desde *</label>
                    <input
                      type="date"
                      value={form.fechaInicio}
                      onChange={e => setForm({ ...form, fechaInicio: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-[#D32F2F] transition-all shadow-sm hover:border-gray-300"
                      style={{ fontSize: 14 }}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2 font-bold text-sm">Vigencia hasta *</label>
                    <input
                      type="date"
                      value={form.fechaFin}
                      onChange={e => setForm({ ...form, fechaFin: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-[#D32F2F] transition-all shadow-sm hover:border-gray-300"
                      style={{ fontSize: 14 }}
                    />
                  </div>
                </div>

                <div className="p-5 bg-amber-50/50 border border-amber-200/50 rounded-2xl">
                  <label className="block text-amber-900 mb-2 font-bold text-sm">
                    Código de cupón <span className="font-normal opacity-70">(opcional)</span>
                  </label>
                  <input
                    value={form.codigoCupon}
                    onChange={e => setForm({ ...form, codigoCupon: e.target.value.toUpperCase() })}
                    placeholder="Ej: VERANO20"
                    maxLength={50}
                    className="w-full border border-amber-200 rounded-xl px-4 py-3 bg-white text-amber-900 placeholder-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-sm uppercase tracking-widest font-black"
                    style={{ fontSize: 14 }}
                  />
                  <p className="text-xs text-amber-700/70 mt-3 font-medium leading-relaxed">
                    Si dejas esto vacío, el descuento se aplicará de forma automática en todos los pedidos durante la vigencia.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50/50 shrink-0 flex gap-3">
              <button onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}
                className="flex-1 text-gray-600 bg-white border border-gray-200 font-bold py-3.5 px-6 rounded-xl hover:bg-gray-50 transition-all shadow-sm"
                style={{ fontSize: 14 }}>
                Cancelar
              </button>
              <button onClick={handleAdd} disabled={saving}
                className="flex-1 bg-[#D32F2F] hover:bg-red-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md shadow-red-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
                style={{ fontSize: 14 }}>
                {saving ? "Creando..." : "Crear Promoción"}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Listado de promociones */}
      {promos.length === 0 ? (
        <div className="bg-white rounded-3xl overflow-hidden p-16 text-center border border-gray-100" style={{ boxShadow: "0 10px 40px -10px rgba(0,0,0,0.08)" }}>
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-5 border border-gray-100">
            <Ticket className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-gray-900 font-extrabold text-xl mb-2">No hay promociones</h3>
          <p className="text-gray-400 font-medium">Crea tu primera promoción para atraer más clientes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {promos.map(p => (
            <div key={p.id} className="bg-white rounded-3xl overflow-hidden relative group transition-all duration-300 hover:-translate-y-1" style={{ boxShadow: "0 10px 40px -10px rgba(0,0,0,0.08)" }}>
              {/* Borde superior decorativo */}
              <div className="h-1.5 w-full bg-gradient-to-r from-red-500 to-amber-500"></div>
              
              <div className="p-6 sm:p-8">
                {/* Cabecera del Ticket */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-[#D32F2F]">
                      <Megaphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-gray-900 font-extrabold text-lg leading-tight line-clamp-1" title={p.nombre}>{p.nombre}</h3>
                    </div>
                  </div>
                  {/* Status Ping Badge */}
                  {p.activo ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border border-green-200 bg-green-50 text-green-700">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      En Vivo
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border border-gray-200 bg-gray-50 text-gray-500">
                      Terminada
                    </span>
                  )}
                </div>

                {/* Monto Hero */}
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
                        <span className="text-lg font-bold text-gray-400 ml-1">OFF</span>
                      </>
                    )}
                  </div>
                  {p.descripcion && <p className="text-gray-500 text-sm font-medium mt-2 leading-snug line-clamp-2">{p.descripcion}</p>}
                </div>

                {/* Fechas */}
                <div className="flex items-center gap-4 py-4 mb-2 border-y border-gray-50 text-xs font-semibold text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-gray-300" />
                    {p.fechaInicio}
                  </div>
                  <div className="text-gray-300">→</div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-gray-300" />
                    {p.fechaFin}
                  </div>
                </div>

                {/* Cupón */}
                <CouponCode code={p.codigoCupon} />

              </div>
              
              {/* Pie del Ticket (Acciones) */}
              <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-50 flex justify-end">
                <button
                  onClick={() => p.id && handleDelete(p.id)}
                  disabled={!p.activo}
                  className={`flex items-center gap-1.5 text-xs font-bold transition-all px-3 py-1.5 rounded-lg ${
                    p.activo 
                      ? "text-gray-400 hover:text-red-600 hover:bg-red-50" 
                      : "text-gray-300 cursor-not-allowed"
                  }`}
                >
                  <Trash2 className="w-4 h-4" /> 
                  {p.activo ? "Desactivar promo" : "Inactiva"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
