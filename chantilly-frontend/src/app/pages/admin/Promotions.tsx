import React, { useEffect, useState } from "react";
import { Tag, Plus, Trash2, Copy, Check } from "lucide-react";
import { BtnPrimary } from "../../components/shared";
import { productoService, PromocionApi } from "../../../services/productoService";

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
  if (!code) return <span className="text-xs text-gray-400 italic">Sin código de cupón</span>;

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex items-center gap-2 mt-2">
      <span className="bg-yellow-50 border border-dashed border-yellow-400 text-yellow-700 font-bold text-xs px-3 py-1 rounded-lg tracking-widest uppercase">
        {code}
      </span>
      <button
        onClick={handleCopy}
        className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg border transition-all duration-200 ${
          copied
            ? "bg-green-50 border-green-400 text-green-600"
            : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
        }`}
      >
        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
        {copied ? "¡Copiado!" : "Copiar"}
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
      setPromos(promoRes.data);
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
      console.error("Error creando promocion", error);
      const msg = (error as any)?.response?.data?.mensaje || "No se pudo crear la promoción";
      setFormError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Desactivar esta promoción?")) return;
    try {
      await productoService.desactivarPromocion(id);
      await loadData();
    } catch {
      alert("No se pudo desactivar la promoción");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <p className="text-gray-500">Cargando promociones...</p>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-gray-800 font-bold text-xl">Promociones</h2>
        <BtnPrimary className="flex items-center gap-2 py-2.5" onClick={() => { setShowForm(!showForm); setFormError(""); }}>
          <Plus className="w-4 h-4" /> Nueva Promoción
        </BtnPrimary>
      </div>

      {/* Formulario de creación */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-gray-800 font-bold mb-4">Crear Promoción</h3>

          {formError && (
            <p className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{formError}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-xs font-semibold mb-1">Nombre *</label>
              <input
                value={form.nombre}
                onChange={e => setForm({ ...form, nombre: e.target.value })}
                placeholder="Ej: Promo Día de la Madre"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50 focus:border-red-600 focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-xs font-semibold mb-1">Descripción</label>
              <input
                value={form.descripcion}
                onChange={e => setForm({ ...form, descripcion: e.target.value })}
                placeholder="Descripción breve de la promo"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50 focus:border-red-600 focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-xs font-semibold mb-1">Tipo de descuento *</label>
              <select
                value={form.tipo}
                onChange={e => setForm({ ...form, tipo: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50 focus:border-red-600 focus:outline-none text-sm"
              >
                <option value="PORCENTAJE">Porcentaje (%)</option>
                <option value="MONTO_FIJO">Monto fijo (S/)</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 text-xs font-semibold mb-1">
                Valor del descuento * {form.tipo === "PORCENTAJE" ? "(%)" : "(S/)"}
              </label>
              <input
                type="number"
                min="0"
                value={form.valor}
                onChange={e => setForm({ ...form, valor: e.target.value })}
                placeholder={form.tipo === "PORCENTAJE" ? "20" : "10.00"}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50 focus:border-red-600 focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-xs font-semibold mb-1">Fecha inicio *</label>
              <input
                type="date"
                value={form.fechaInicio}
                onChange={e => setForm({ ...form, fechaInicio: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50 focus:border-red-600 focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-xs font-semibold mb-1">Fecha fin *</label>
              <input
                type="date"
                value={form.fechaFin}
                onChange={e => setForm({ ...form, fechaFin: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50 focus:border-red-600 focus:outline-none text-sm"
              />
            </div>

            {/* Código de cupón — fila completa */}
            <div className="sm:col-span-2">
              <label className="block text-gray-700 text-xs font-semibold mb-1">
                Código de cupón <span className="text-gray-400 font-normal">(opcional — dejar vacío si aplica automáticamente)</span>
              </label>
              <input
                value={form.codigoCupon}
                onChange={e => setForm({ ...form, codigoCupon: e.target.value.toUpperCase() })}
                placeholder="Ej: VERANO20, MAMÁ50..."
                maxLength={50}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50 focus:border-red-600 focus:outline-none text-sm uppercase tracking-widest font-semibold"
              />
              <p className="text-xs text-gray-400 mt-1">
                Si ingresas un código, el cliente deberá escribirlo en el checkout para aplicar el descuento.
              </p>
            </div>
          </div>

          <div className="flex gap-3 mt-5">
            <BtnPrimary className="py-2" onClick={handleAdd} disabled={saving}>
              {saving ? "Creando..." : "Crear Promoción"}
            </BtnPrimary>
            <button
              onClick={() => { setShowForm(false); setFormError(""); setForm(EMPTY_FORM); }}
              className="text-gray-500 hover:text-gray-700 text-sm font-medium transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Listado de promociones */}
      {promos.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-10 text-center">
          <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-700 font-semibold">No hay promociones activas</p>
          <p className="text-gray-400 text-sm">Crea una nueva promoción para empezar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {promos.map(p => (
            <div key={p.id} className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Tag className="w-5 h-5 text-yellow-400 shrink-0" />
                  <h3 className="text-gray-800 font-bold leading-tight">{p.nombre}</h3>
                </div>
                <span className={`shrink-0 ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${p.activo ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {p.activo ? "Activa" : "Inactiva"}
                </span>
              </div>

              <p className="text-red-600 font-bold text-2xl mb-1">
                {p.tipo === "PORCENTAJE" ? `${p.valor}%` : `S/ ${p.valor}`} OFF
              </p>

              {p.descripcion && <p className="text-gray-500 text-xs mb-1">{p.descripcion}</p>}
              <p className="text-gray-400 text-xs mb-2">{p.fechaInicio} → {p.fechaFin}</p>

              {/* Código de cupón con copia */}
              <CouponCode code={p.codigoCupon} />

              <div className="flex justify-end mt-3 pt-3 border-t">
                <button
                  onClick={() => p.id && handleDelete(p.id)}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-600 transition font-medium"
                >
                  <Trash2 className="w-4 h-4" /> Desactivar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
