import React, { useEffect, useMemo, useState } from "react";
import { Edit2, ImageIcon, Package, Plus, Search, Trash2, X } from "lucide-react";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import { productoService, CategoriaApi, ProductoApi } from "../../../services/productoService";
import { AdminBooleanBadge, AdminEmptyState, AdminErrorState, AdminFilterChip, AdminLoadingState, AdminPagination, AdminPanel } from "../../components/adminUi";
import { normalizeText } from "../../lib/validation";
import { toast } from "sonner";
import { BulkConfirmModal, DeleteProductModal, FieldError, getProductCategoryStyle, ProductStockBadge } from "../../features/admin-products/productDisplay";
import { emptyProductForm, normalizeProductPayload, PAGE_SIZE, validateProductForm } from "../../features/admin-products/productForm";
import type { BulkConfirmState, ProductErrors, ProductForm, ProductStatusFilter, ViewProduct } from "../../features/admin-products/types";

export default function AdminProducts() {
  const [products, setProducts] = useState<ViewProduct[]>([]);
  const [categories, setCategories] = useState<CategoriaApi[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProductStatusFilter>("TODOS");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyProductForm);
  const [errors, setErrors] = useState<ProductErrors>({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ViewProduct | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkCategoryId, setBulkCategoryId] = useState("");
  const [stockAdjustment, setStockAdjustment] = useState("");
  const [bulkConfirm, setBulkConfirm] = useState<BulkConfirmState>(null);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [productsRes, categoriesRes] = await Promise.all([productoService.getAdminAll(), productoService.getCategorias()]);
      setProducts(
        productsRes.data.map((p) => ({
          id: p.id || 0,
          nombre: p.nombre,
          categoriaId: p.categoriaId,
          categoriaNombre: p.categoriaNombre || "Sin categoría",
          precio: Number(p.precio ?? 0),
          stock: p.stock ?? 0,
          descripcion: p.descripcion || "",
          imagenUrl: p.imagenUrl || "",
          disponible: p.disponible !== false,
        })),
      );
      setCategories(categoriesRes.data);
    } catch (loadError) {
      console.error("Error cargando productos admin", loadError);
      setError("No se pudo cargar el catálogo administrativo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.nombre.toLowerCase().includes(search.toLowerCase());
      const matchesState =
        statusFilter === "TODOS" ||
        (statusFilter === "ACTIVOS" && p.disponible) ||
        (statusFilter === "INACTIVOS" && !p.disponible);
      return matchesSearch && matchesState;
    });
  }, [products, search, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    setSelectedIds((prev) => prev.filter((id) => filtered.some((product) => product.id === id)));
  }, [filtered]);

  const pagedProducts = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const selectedProducts = useMemo(() => products.filter((product) => selectedIds.includes(product.id)), [products, selectedIds]);
  const selectedActiveCount = selectedProducts.filter((product) => product.disponible).length;
  const selectedInactiveCount = selectedProducts.filter((product) => !product.disponible).length;

  const toProductPayload = (product: ViewProduct, overrides?: Partial<ProductoApi>): ProductoApi => ({
    nombre: product.nombre,
    descripcion: product.descripcion,
    precio: product.precio,
    precioOferta: null,
    stock: product.stock,
    stockMinimo: 5,
    imagenUrl: product.imagenUrl,
    disponible: product.disponible,
    enOferta: false,
    tiempoPreparacion: 0,
    categoriaId: product.categoriaId,
    ...overrides,
  });

  const resetForm = () => {
    setForm(emptyProductForm);
    setErrors({});
    setEditingId(null);
    setShowForm(false);
  };

  const validateForm = () => {
    const { errors: nextErrors, isValid } = validateProductForm(form);
    setErrors(nextErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Revisa los campos marcados antes de guardar.");
      return;
    }

    const payload: ProductoApi = {
      ...normalizeProductPayload(form),
      precioOferta: null,
      stockMinimo: 5,
      disponible: true,
      enOferta: false,
      tiempoPreparacion: 0,
    };

    try {
      setSaving(true);
      if (editingId) {
        await productoService.actualizar(editingId, payload);
        toast.success("Producto actualizado");
      } else {
        await productoService.crear(payload);
        toast.success("Producto creado");
      }
      await loadData();
      resetForm();
    } catch (submitError) {
      console.error("Error guardando producto", submitError);
      toast.error("No se pudo guardar el producto");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product: ViewProduct) => {
    setEditingId(product.id);
    setErrors({});
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
      toast.success("Producto desactivado");
      await loadData();
    } catch (deleteError) {
      console.error("Error desactivando producto", deleteError);
      toast.error("No se pudo desactivar el producto");
    } finally {
      setDeleteTarget(null);
    }
  };

  const toggleSelection = (productId: number) => {
    setSelectedIds((prev) => (prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]));
  };

  const handleBulkDeactivate = async () => {
    const targets = selectedProducts.filter((product) => product.disponible);
    if (targets.length === 0) {
      toast.error("Selecciona productos activos para aplicar la acción masiva.");
      return;
    }
    try {
      await Promise.all(targets.map((product) => productoService.desactivar(product.id)));
      toast.success(`${targets.length} producto(s) desactivados`);
      setSelectedIds([]);
      await loadData();
    } catch (bulkError) {
      console.error("Error en acción masiva", bulkError);
      toast.error("No se pudo completar la acción masiva.");
    }
  };

  const handleBulkActivate = async () => {
    const targets = selectedProducts.filter((product) => !product.disponible);
    if (targets.length === 0) {
      toast.error("Selecciona productos inactivos para reactivarlos.");
      return;
    }
    try {
      await Promise.all(
        targets.map((product) =>
          productoService.actualizar(product.id, toProductPayload(product, { disponible: true })),
        ),
      );
      toast.success(`${targets.length} producto(s) activados`);
      setSelectedIds([]);
      await loadData();
    } catch (bulkError) {
      console.error("Error activando productos", bulkError);
      toast.error("No se pudo activar la selección.");
    }
  };

  const handleBulkCategoryUpdate = async () => {
    if (!bulkCategoryId) {
      toast.error("Selecciona una categoría para aplicar.");
      return;
    }
    if (selectedProducts.length === 0) {
      toast.error("Selecciona al menos un producto.");
      return;
    }
    try {
      await Promise.all(
        selectedProducts.map((product) =>
          productoService.actualizar(product.id, toProductPayload(product, { categoriaId: Number(bulkCategoryId) })),
        ),
      );
      toast.success(`Categoría actualizada en ${selectedProducts.length} producto(s)`);
      setBulkCategoryId("");
      setSelectedIds([]);
      await loadData();
    } catch (bulkError) {
      console.error("Error cambiando categoría en lote", bulkError);
      toast.error("No se pudo actualizar la categoría.");
    }
  };

  const handleBulkStockAdjust = async () => {
    const delta = Number(stockAdjustment);
    if (!Number.isFinite(delta) || delta === 0) {
      toast.error("Ingresa un ajuste de stock válido.");
      return;
    }
    if (selectedProducts.length === 0) {
      toast.error("Selecciona al menos un producto.");
      return;
    }
    try {
      await Promise.all(
        selectedProducts.map((product) =>
          productoService.actualizar(
            product.id,
            toProductPayload(product, {
              stock: Math.max(0, product.stock + delta),
            }),
          ),
        ),
      );
      toast.success(`Stock ajustado en ${selectedProducts.length} producto(s)`);
      setStockAdjustment("");
      setSelectedIds([]);
      await loadData();
    } catch (bulkError) {
      console.error("Error ajustando stock", bulkError);
      toast.error("No se pudo ajustar el stock seleccionado.");
    }
  };

  const handleBulkExport = () => {
    if (selectedProducts.length === 0) {
      toast.error("Selecciona productos para exportar.");
      return;
    }
    const headers = ["ID", "Nombre", "Categoria", "Precio", "Stock", "Estado"];
    const rows = selectedProducts.map((product) => [
      product.id,
      `"${product.nombre.replace(/"/g, '""')}"`,
      `"${product.categoriaNombre.replace(/"/g, '""')}"`,
      product.precio.toFixed(2),
      product.stock,
      product.disponible ? "Activo" : "Inactivo",
    ]);
    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `productos-seleccionados-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Selección exportada correctamente");
  };

  const handleToggleAvailability = async (product: ViewProduct) => {
    try {
      await productoService.actualizar(product.id, toProductPayload(product, { disponible: !product.disponible }));
      toast.success(product.disponible ? "Producto desactivado" : "Producto activado");
      await loadData();
    } catch (toggleError) {
      console.error("Error actualizando estado del producto", toggleError);
      toast.error("No se pudo actualizar el estado del producto.");
    }
  };

  if (loading) {
    return <AdminLoadingState message="Cargando productos..." />;
  }

  if (error) {
    return <AdminErrorState description={error} onRetry={loadData} />;
  }

  return (
    <div style={{ fontFamily: "Poppins" }}>
      {deleteTarget && <DeleteProductModal product={deleteTarget} onConfirm={handleDeleteConfirm} onCancel={() => setDeleteTarget(null)} />}
      <BulkConfirmModal config={bulkConfirm} onClose={() => setBulkConfirm(null)} />

      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">Catálogo de Productos</h2>
          <p className="mt-1 text-sm font-medium text-gray-500">Validación visual, preview ampliado y control de estado del catálogo.</p>
        </div>
        <button
          onClick={() => {
            if (showForm && editingId) resetForm();
            else setShowForm(!showForm);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#D32F2F] px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-red-900/20 transition hover:-translate-y-0.5 hover:bg-red-700"
        >
          <Plus className="h-4 w-4" />
          {editingId ? "Editar Producto" : "Nuevo Producto"}
        </button>
      </div>

      <AdminPanel className="mb-6 p-4 sm:p-5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <AdminFilterChip label="Todos" active={statusFilter === "TODOS"} onClick={() => setStatusFilter("TODOS")} />
            <AdminFilterChip label="Activos" active={statusFilter === "ACTIVOS"} onClick={() => setStatusFilter("ACTIVOS")} />
            <AdminFilterChip label="Inactivos" active={statusFilter === "INACTIVOS"} onClick={() => setStatusFilter("INACTIVOS")} />
          </div>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar producto por nombre..."
              className="w-full rounded-2xl border border-gray-200 bg-white py-3.5 pl-12 pr-12 text-sm text-gray-800 placeholder-gray-400 shadow-sm transition focus:border-[#D32F2F] focus:outline-none focus:ring-4 focus:ring-red-500/10"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              {selectedIds.length} seleccionados · {selectedActiveCount} activos · {selectedInactiveCount} inactivos
            </span>
            <button
              onClick={() =>
                setBulkConfirm({
                  title: "Activar productos seleccionados",
                  description: `Se reactivarán ${selectedInactiveCount} producto(s) de la selección actual.`,
                  confirmLabel: "Activar",
                  onConfirm: handleBulkActivate,
                })
              }
              disabled={selectedInactiveCount === 0}
              className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Activar seleccionados
            </button>
            <button
              onClick={() =>
                setBulkConfirm({
                  title: "Desactivar productos seleccionados",
                  description: `Se desactivarán ${selectedActiveCount} producto(s) de la selección actual.`,
                  confirmLabel: "Desactivar",
                  onConfirm: handleBulkDeactivate,
                })
              }
              disabled={selectedActiveCount === 0}
              className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Desactivar seleccionados
            </button>
            <button onClick={handleBulkExport} disabled={selectedProducts.length === 0} className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50">
              Exportar selección
            </button>
          </div>
          </div>
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="flex flex-1 flex-col gap-2 sm:flex-row">
              <select
                value={bulkCategoryId}
                onChange={(e) => setBulkCategoryId(e.target.value)}
                className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700"
              >
                <option value="">Cambiar categoría...</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.nombre}
                  </option>
                ))}
              </select>
              <button
                onClick={() =>
                  setBulkConfirm({
                    title: "Actualizar categoría en lote",
                    description: `Se aplicará la nueva categoría a ${selectedProducts.length} producto(s) seleccionados.`,
                    confirmLabel: "Aplicar categoría",
                    onConfirm: handleBulkCategoryUpdate,
                  })
                }
                disabled={!bulkCategoryId || selectedProducts.length === 0}
                className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Aplicar categoría
              </button>
            </div>
            <div className="flex flex-1 flex-col gap-2 sm:flex-row">
              <input
                value={stockAdjustment}
                onChange={(e) => setStockAdjustment(e.target.value)}
                placeholder="Ajuste stock: +5 o -3"
                className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700"
              />
              <button
                onClick={() =>
                  setBulkConfirm({
                    title: "Ajustar stock en lote",
                    description: `Se aplicará el ajuste indicado a ${selectedProducts.length} producto(s) seleccionados.`,
                    confirmLabel: "Ajustar stock",
                    onConfirm: handleBulkStockAdjust,
                  })
                }
                disabled={!stockAdjustment || selectedProducts.length === 0}
                className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Ajustar stock
              </button>
            </div>
          </div>
        </div>
      </AdminPanel>

      {showForm && (
        <>
          <div className="fixed inset-0 z-40" style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }} onClick={resetForm} />
          <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-2xl flex-col bg-white shadow-2xl" style={{ boxShadow: "-10px 0 40px rgba(0,0,0,0.1)" }}>
            <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-8 py-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-100 bg-white shadow-sm">
                  <Package className="h-5 w-5 text-[#D32F2F]" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-gray-900">{editingId ? "Editar Producto" : "Nuevo Producto"}</h3>
                  <p className="text-xs font-semibold text-gray-500">Completa los campos y valida la imagen antes de guardar.</p>
                </div>
              </div>
              <button onClick={resetForm} className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 shadow-sm transition hover:bg-gray-100 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid flex-1 gap-0 overflow-hidden lg:grid-cols-[1.2fr_0.8fr]">
              <div className="overflow-y-auto p-8">
                <div className="space-y-6">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-gray-700">Nombre del producto *</label>
                    <input
                      value={form.nombre}
                      onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                      placeholder="Ej: Torta de Chocolate"
                      className={`w-full rounded-xl border px-4 py-3 text-sm text-gray-800 shadow-sm transition focus:outline-none focus:ring-4 ${
                        errors.nombre ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : "border-gray-200 hover:border-gray-300 focus:border-[#D32F2F] focus:ring-red-500/10"
                      }`}
                    />
                    <FieldError error={errors.nombre} />
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="mb-2 block text-sm font-bold text-gray-700">Categoría *</label>
                      <select
                        value={form.categoriaId}
                        onChange={(e) => setForm({ ...form, categoriaId: e.target.value })}
                        className={`w-full appearance-none rounded-xl border px-4 py-3 text-sm text-gray-800 shadow-sm transition focus:outline-none focus:ring-4 ${
                          errors.categoriaId ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : "border-gray-200 hover:border-gray-300 focus:border-[#D32F2F] focus:ring-red-500/10"
                        }`}
                      >
                        <option value="">Seleccione...</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nombre}
                          </option>
                        ))}
                      </select>
                      <FieldError error={errors.categoriaId} />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-bold text-gray-700">Stock disponible *</label>
                      <input
                        value={form.stock}
                        onChange={(e) => setForm({ ...form, stock: e.target.value })}
                        placeholder="Ej: 10"
                        type="number"
                        min="0"
                        className={`w-full rounded-xl border px-4 py-3 text-sm text-gray-800 shadow-sm transition focus:outline-none focus:ring-4 ${
                          errors.stock ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : "border-gray-200 hover:border-gray-300 focus:border-[#D32F2F] focus:ring-red-500/10"
                        }`}
                      />
                      <FieldError error={errors.stock} />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-gray-700">Precio de venta (S/) *</label>
                    <input
                      value={form.precio}
                      onChange={(e) => setForm({ ...form, precio: e.target.value })}
                      placeholder="Ej: 45.50"
                      type="number"
                      step="0.01"
                      min="0.01"
                      className={`w-full rounded-xl border px-4 py-3 text-sm text-gray-800 shadow-sm transition focus:outline-none focus:ring-4 ${
                        errors.precio ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : "border-gray-200 hover:border-gray-300 focus:border-[#D32F2F] focus:ring-red-500/10"
                      }`}
                    />
                    <FieldError error={errors.precio} />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-gray-700">URL de imagen</label>
                    <input
                      value={form.imagenUrl}
                      onChange={(e) => setForm({ ...form, imagenUrl: e.target.value })}
                      placeholder="https://ejemplo.com/imagen.jpg"
                      className={`w-full rounded-xl border px-4 py-3 text-sm text-gray-800 shadow-sm transition focus:outline-none focus:ring-4 ${
                        errors.imagenUrl ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : "border-gray-200 hover:border-gray-300 focus:border-[#D32F2F] focus:ring-red-500/10"
                      }`}
                    />
                    <FieldError error={errors.imagenUrl} />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-gray-700">Descripción del producto</label>
                    <textarea
                      value={form.descripcion}
                      onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                      placeholder="Describe el sabor, tamaño o presentación..."
                      rows={5}
                      className={`w-full resize-none rounded-xl border px-4 py-3 text-sm text-gray-800 shadow-sm transition focus:outline-none focus:ring-4 ${
                        errors.descripcion ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : "border-gray-200 hover:border-gray-300 focus:border-[#D32F2F] focus:ring-red-500/10"
                      }`}
                    />
                    <FieldError error={errors.descripcion} />
                  </div>
                </div>
              </div>

              <div className="border-l border-gray-100 bg-gray-50/70 p-8">
                <h4 className="mb-4 text-sm font-extrabold text-gray-900">Preview de imagen</h4>
                <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
                  <div className="aspect-[4/5] bg-gray-100">
                    {form.imagenUrl ? (
                      <ImageWithFallback src={form.imagenUrl} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-3 text-gray-300">
                        <ImageIcon className="h-12 w-12" />
                        <p className="text-sm font-semibold">Sin imagen cargada</p>
                      </div>
                    )}
                  </div>
                  <div className="border-t border-gray-100 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Vista operativa</p>
                    <p className="mt-2 text-lg font-extrabold text-gray-900">{form.nombre || "Nombre del producto"}</p>
                    <p className="mt-1 text-sm font-medium text-gray-500">{form.descripcion || "La descripción aparecerá aquí para validación rápida."}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 border-t border-gray-100 bg-gray-50/50 p-6">
              <button onClick={resetForm} className="flex-1 rounded-xl border border-gray-200 bg-white px-6 py-3.5 text-sm font-bold text-gray-600 shadow-sm transition hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={handleSubmit} disabled={saving} className="flex-1 rounded-xl bg-[#D32F2F] px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-red-900/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70">
                {saving ? "Guardando..." : editingId ? "Actualizar" : "Guardar Producto"}
              </button>
            </div>
          </div>
        </>
      )}

      <AdminPanel className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-50 px-6 py-4">
          <div>
            <h3 className="text-base font-extrabold text-gray-900">Inventario visible</h3>
            <p className="mt-0.5 text-xs font-medium text-gray-400">{filtered.length} productos en resultado</p>
          </div>
        </div>
        <div className="grid gap-4 p-4 md:hidden">
          {pagedProducts.length === 0 ? (
            <AdminEmptyState title="No se encontraron productos" description="Prueba con otro término de búsqueda o crea un nuevo producto." />
          ) : (
            pagedProducts.map((p) => {
              const catStyle = getProductCategoryStyle(p.categoriaNombre);
              return (
                <div key={p.id} className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
                  <div className="flex items-start gap-4">
                    <input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => toggleSelection(p.id)} className="mt-1 h-4 w-4 rounded border-gray-300 text-[#D32F2F]" />
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-gray-100 bg-gray-50">
                      <ImageWithFallback src={p.imagenUrl} alt={p.nombre} className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-extrabold text-gray-900">{p.nombre}</p>
                          <p className="mt-1 line-clamp-2 text-xs text-gray-500">{p.descripcion || "Sin descripción"}</p>
                        </div>
                        <AdminBooleanBadge active={p.disponible} activeLabel="Activo" inactiveLabel="Inactivo" />
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full border px-3 py-1 text-xs font-bold" style={{ background: catStyle.bg, color: catStyle.text, borderColor: "rgba(0,0,0,0.05)" }}>
                          {p.categoriaNombre}
                        </span>
                        <ProductStockBadge stock={p.stock} />
                        <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-bold text-gray-700">S/ {p.precio.toFixed(2)}</span>
                      </div>
                      <div className="mt-4 flex justify-end gap-2">
                        <button onClick={() => handleEdit(p)} className="rounded-xl bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700">Editar</button>
                        <button
                          onClick={() => (p.disponible ? setDeleteTarget(p) : handleToggleAvailability(p))}
                          className={`rounded-xl px-3 py-2 text-xs font-bold ${p.disponible ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}
                        >
                          {p.disponible ? "Desactivar" : "Activar"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/80" style={{ borderBottom: "1px solid #f3f4f6" }}>
                <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                  <input
                    type="checkbox"
                    checked={pagedProducts.length > 0 && pagedProducts.every((product) => selectedIds.includes(product.id))}
                    onChange={(e) =>
                      setSelectedIds((prev) =>
                        e.target.checked
                          ? Array.from(new Set([...prev, ...pagedProducts.map((product) => product.id)]))
                          : prev.filter((id) => !pagedProducts.some((product) => product.id === id)),
                      )
                    }
                    className="h-4 w-4 rounded border-gray-300 text-[#D32F2F]"
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Producto</th>
                <th className="hidden px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500 sm:table-cell">Categoría</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Precio</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Stock</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Estado</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pagedProducts.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <AdminEmptyState title="No se encontraron productos" description="Prueba con otro término de búsqueda o crea un nuevo producto." />
                  </td>
                </tr>
              ) : (
                pagedProducts.map((p) => {
                  const catStyle = getProductCategoryStyle(p.categoriaNombre);
                  return (
                    <tr key={p.id} className="border-b border-gray-50 transition-colors hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => toggleSelection(p.id)} className="h-4 w-4 rounded border-gray-300 text-[#D32F2F]" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-gray-100 bg-gray-50">
                            <ImageWithFallback src={p.imagenUrl} alt={p.nombre} className="h-full w-full object-cover" />
                          </div>
                          <div>
                            <span className="font-bold text-gray-900">{p.nombre}</span>
                            <p className="mt-0.5 max-w-[280px] truncate text-xs font-medium text-gray-400">{p.descripcion || "Sin descripción"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-6 py-4 sm:table-cell">
                        <span className="rounded-full border px-3 py-1.5 text-xs font-bold" style={{ background: catStyle.bg, color: catStyle.text, borderColor: "rgba(0,0,0,0.05)" }}>
                          {p.categoriaNombre}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-extrabold text-gray-900">S/ {p.precio.toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <ProductStockBadge stock={p.stock} />
                      </td>
                      <td className="px-6 py-4">
                        <AdminBooleanBadge active={p.disponible} activeLabel="Activo" inactiveLabel="Inactivo" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleEdit(p)} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-blue-50 hover:text-blue-600" title="Editar">
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => (p.disponible ? setDeleteTarget(p) : handleToggleAvailability(p))}
                            className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                              p.disponible ? "text-gray-400 hover:bg-red-50 hover:text-red-600" : "text-emerald-500 hover:bg-emerald-50 hover:text-emerald-700"
                            }`}
                            title={p.disponible ? "Desactivar" : "Activar"}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
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
