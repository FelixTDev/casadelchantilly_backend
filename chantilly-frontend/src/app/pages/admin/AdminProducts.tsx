import React, { useEffect, useMemo, useState } from "react";
import { Plus, Edit2, Trash2, Search, AlertTriangle, X, Package } from "lucide-react";
import { BtnPrimary } from "../../components/shared";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import { productoService, ProductoApi, CategoriaApi } from "../../../services/productoService";

type ViewProduct = {
  id: number;
  nombre: string;
  categoriaId: number;
  categoriaNombre: string;
  precio: number;
  stock: number;
  descripcion: string;
  imagenUrl: string;
};

const emptyForm = {
  nombre: "",
  categoriaId: "",
  precio: "",
  stock: "",
  descripcion: "",
  imagenUrl: "",
};

// Colores por categoría
const CAT_COLORS: Record<string, { bg: string; text: string }> = {
  Tortas:      { bg: "#fef3c7", text: "#92400e" },
  Cupcakes:    { bg: "#fce7f3", text: "#9d174d" },
  Cheesecakes: { bg: "#ede9fe", text: "#5b21b6" },
  Especiales:  { bg: "#d1fae5", text: "#065f46" },
  Combos:      { bg: "#dbeafe", text: "#1e40af" },
  Pasteles:    { bg: "#ffedd5", text: "#9a3412" },
};

function getCatStyle(nombre: string) {
  return CAT_COLORS[nombre] || { bg: "#f3f4f6", text: "#374151" };
}

function StockBadge({ stock }: { stock: number }) {
  if (stock <= 0)  return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border border-red-100" style={{ background: "#fef2f2", color: "#dc2626" }}><span className="w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>Agotado</span>;
  if (stock <= 5)  return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border border-amber-100" style={{ background: "#fffbeb", color: "#d97706" }}><span className="w-1.5 h-1.5 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span>{stock} unid.</span>;
  return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border border-green-100" style={{ background: "#f0fdf4", color: "#16a34a" }}><span className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>{stock} unid.</span>;
}

// Modal de confirmación de eliminación
function DeleteModal({ product, onConfirm, onCancel }: { product: ViewProduct; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-fade-in-up" style={{ fontFamily: "Poppins" }}>
        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-7 h-7 text-[#D32F2F]" />
        </div>
        <h3 className="text-gray-900 font-extrabold text-xl text-center mb-2">¿Eliminar producto?</h3>
        <p className="text-gray-500 text-sm text-center mb-1">Estás a punto de desactivar:</p>
        <p className="text-gray-800 font-bold text-center mb-6">"{product.nombre}"</p>
        <p className="text-gray-400 text-xs text-center mb-6">Esta acción desactivará el producto del catálogo. Podrás reactivarlo desde la base de datos si es necesario.</p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-all">
            Cancelar
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-3 rounded-xl bg-[#D32F2F] hover:bg-red-700 text-white font-bold text-sm transition-all shadow-lg shadow-red-900/20">
            Sí, eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminProducts() {
  const [products, setProducts] = useState<ViewProduct[]>([]);
  const [categories, setCategories] = useState<CategoriaApi[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<ViewProduct | null>(null);

  const loadData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        productoService.getAll(),
        productoService.getCategorias(),
      ]);
      setProducts(productsRes.data.map((p) => ({
        id: p.id || 0,
        nombre: p.nombre,
        categoriaId: p.categoriaId,
        categoriaNombre: p.categoriaNombre || "Sin categoria",
        precio: Number(p.precio ?? 0),
        stock: p.stock ?? 0,
        descripcion: p.descripcion || "",
        imagenUrl: p.imagenUrl || "",
      })));
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error("Error cargando productos admin", error);
    }
  };

  useEffect(() => { loadData(); }, []);

  const filtered = useMemo(
    () => products.filter((p) => p.nombre.toLowerCase().includes(search.toLowerCase())),
    [products, search]
  );

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    if (!form.nombre || !form.categoriaId || !form.precio || !form.stock) return;

    const payload: ProductoApi = {
      nombre: form.nombre,
      descripcion: form.descripcion,
      precio: Number(form.precio),
      precioOferta: null,
      stock: Number(form.stock),
      stockMinimo: 5,
      imagenUrl: form.imagenUrl,
      disponible: true,
      enOferta: false,
      tiempoPreparacion: 0,
      categoriaId: Number(form.categoriaId),
    };

    try {
      if (editingId) {
        await productoService.actualizar(editingId, payload);
      } else {
        await productoService.crear(payload);
      }
      await loadData();
      resetForm();
    } catch (error) {
      console.error("Error guardando producto", error);
      alert("No se pudo guardar el producto");
    }
  };

  const handleEdit = (product: ViewProduct) => {
    setEditingId(product.id);
    setForm({
      nombre: product.nombre,
      categoriaId: String(product.categoriaId),
      precio: String(product.precio),
      stock: String(product.stock),
      descripcion: product.descripcion,
      imagenUrl: product.imagenUrl,
    });
    setShowForm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await productoService.desactivar(deleteTarget.id);
      await loadData();
    } catch (error) {
      console.error("Error desactivando producto", error);
      alert("No se pudo desactivar el producto");
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div style={{ fontFamily: "Poppins" }}>
      {/* Modal de confirmación */}
      {deleteTarget && (
        <DeleteModal
          product={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Header: buscador + botón */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        {/* Buscador Premium */}
        <div className="relative flex-1 max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#D32F2F] transition-colors" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar producto por nombre..."
            className="w-full pl-12 pr-12 py-3.5 rounded-2xl border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-[#D32F2F] transition-all shadow-sm focus:shadow-md"
            style={{ fontSize: 14 }}
          />
          {search ? (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-4 h-4" />
            </button>
          ) : (
            <div className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 items-center justify-center px-2 py-1 bg-gray-100 rounded-lg text-gray-400 font-bold text-xs border border-gray-200 pointer-events-none">
              ⌘K
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {search && (
            <span className="text-gray-400 text-sm font-medium">
              {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
            </span>
          )}
          <button
            onClick={() => { if (showForm && editingId) resetForm(); else setShowForm(!showForm); }}
            className="flex items-center gap-2 bg-[#D32F2F] hover:bg-red-700 text-white font-bold py-3.5 px-6 rounded-2xl transition-all shadow-md shadow-red-900/20 hover:shadow-lg hover:-translate-y-0.5"
            style={{ fontSize: 14 }}>
            <Plus className="w-4 h-4" />
            {editingId ? "Editar Producto" : "Nuevo Producto"}
          </button>
        </div>
      </div>
      {/* Formulario Slide-over */}
      {showForm && (
        <>
          <div className="fixed inset-0 z-40 transition-opacity" style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }} onClick={resetForm} />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col" style={{ boxShadow: "-10px 0 40px rgba(0,0,0,0.1)" }}>
            
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center">
                  <Package className="w-5 h-5 text-[#D32F2F]" />
                </div>
                <h3 className="text-gray-900 font-extrabold text-xl">{editingId ? "Editar Producto" : "Nuevo Producto"}</h3>
              </div>
              <button onClick={resetForm} className="w-8 h-8 rounded-full bg-white border border-gray-200 hover:bg-gray-100 flex items-center justify-center transition-colors text-gray-400 hover:text-gray-600 shadow-sm">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-700 mb-2 font-bold text-sm">Nombre del producto</label>
                  <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    placeholder="Ej: Torta de Chocolate"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-[#D32F2F] transition-all shadow-sm hover:border-gray-300"
                    style={{ fontSize: 14 }} />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-gray-700 mb-2 font-bold text-sm">Categoría</label>
                    <select value={form.categoriaId} onChange={(e) => setForm({ ...form, categoriaId: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white text-gray-800 focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-[#D32F2F] transition-all appearance-none shadow-sm hover:border-gray-300"
                      style={{ fontSize: 14 }}>
                      <option value="">Seleccione...</option>
                      {categories.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2 font-bold text-sm">Stock disponible</label>
                    <input value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })}
                      placeholder="Ej: 10" type="number"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-[#D32F2F] transition-all shadow-sm hover:border-gray-300"
                      style={{ fontSize: 14 }} />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2 font-bold text-sm">Precio de venta (S/)</label>
                  <input value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })}
                    placeholder="Ej: 45.50" type="number" step="0.01"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-[#D32F2F] transition-all shadow-sm hover:border-gray-300"
                    style={{ fontSize: 14 }} />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2 font-bold text-sm">URL de imagen</label>
                  <div className="flex gap-4 items-start">
                    <div className="w-16 h-16 rounded-xl border border-gray-200 bg-gray-50 shrink-0 overflow-hidden shadow-sm flex items-center justify-center">
                      {form.imagenUrl ? (
                        <ImageWithFallback src={form.imagenUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-6 h-6 text-gray-300" />
                      )}
                    </div>
                    <input value={form.imagenUrl} onChange={(e) => setForm({ ...form, imagenUrl: e.target.value })}
                      placeholder="https://ejemplo.com/imagen.jpg"
                      className="flex-1 w-full border border-gray-200 rounded-xl px-4 py-3 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-[#D32F2F] transition-all shadow-sm hover:border-gray-300"
                      style={{ fontSize: 14 }} />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2 font-bold text-sm">Descripción del producto</label>
                  <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                    placeholder="Describa brevemente el producto..." rows={4}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-[#D32F2F] transition-all shadow-sm hover:border-gray-300 resize-none"
                    style={{ fontSize: 14 }} />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50/50 shrink-0 flex gap-3">
              <button onClick={resetForm}
                className="flex-1 text-gray-600 bg-white border border-gray-200 font-bold py-3.5 px-6 rounded-xl hover:bg-gray-50 transition-all shadow-sm"
                style={{ fontSize: 14 }}>
                Cancelar
              </button>
              <button onClick={handleSubmit}
                className="flex-1 bg-[#D32F2F] hover:bg-red-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md shadow-red-900/20"
                style={{ fontSize: 14 }}>
                {editingId ? "Actualizar" : "Guardar Producto"}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Tabla de productos */}
      <div className="bg-white rounded-3xl overflow-hidden" style={{ boxShadow: "0 10px 40px -10px rgba(0,0,0,0.08)" }}>
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <div>
            <h3 className="text-gray-900 font-extrabold text-base">Catálogo de Productos</h3>
            <p className="text-gray-400 text-xs font-medium mt-0.5">{products.length} productos registrados</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ fontSize: 14 }}>
            <thead>
              <tr className="bg-gray-50/80" style={{ borderBottom: "1px solid #f3f4f6" }}>
                <th className="text-left py-4 px-6 text-gray-500 font-bold text-xs uppercase tracking-wider">Producto</th>
                <th className="text-left py-4 px-6 text-gray-500 font-bold text-xs uppercase tracking-wider hidden sm:table-cell">Categoría</th>
                <th className="text-left py-4 px-6 text-gray-500 font-bold text-xs uppercase tracking-wider">Precio</th>
                <th className="text-left py-4 px-6 text-gray-500 font-bold text-xs uppercase tracking-wider">Stock</th>
                <th className="text-right py-4 px-6 text-gray-500 font-bold text-xs uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center">
                        <Package className="w-7 h-7 text-gray-300" />
                      </div>
                      <p className="text-gray-400 font-medium">No se encontraron productos</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.map((p) => {
                const catStyle = getCatStyle(p.categoriaNombre);
                return (
                  <tr key={p.id} className="group transition-colors" style={{ borderBottom: "1px solid #f9fafb" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#fafafa"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>

                    {/* Producto */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                          <ImageWithFallback src={p.imagenUrl} alt={p.nombre} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-gray-900 font-bold">{p.nombre}</span>
                      </div>
                    </td>

                    {/* Categoría badge */}
                    <td className="py-4 px-6 hidden sm:table-cell">
                      <span className="px-3 py-1.5 rounded-full text-xs font-bold border" style={{ background: catStyle.bg, color: catStyle.text, borderColor: "rgba(0,0,0,0.05)" }}>
                        {p.categoriaNombre}
                      </span>
                    </td>

                    {/* Precio */}
                    <td className="py-4 px-6">
                      <span className="text-gray-900 font-extrabold">S/ {p.precio.toFixed(2)}</span>
                    </td>

                    {/* Stock semáforo */}
                    <td className="py-4 px-6">
                      <StockBadge stock={p.stock} />
                    </td>

                    {/* Acciones */}
                    <td className="py-4 px-6">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(p)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                          title="Editar">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteTarget(p)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all text-gray-400 hover:text-red-600 hover:bg-red-50"
                          title="Eliminar">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
