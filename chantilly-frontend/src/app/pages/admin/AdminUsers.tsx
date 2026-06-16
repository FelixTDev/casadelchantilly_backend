import React, { useEffect, useMemo, useState } from "react";
import { Mail, Pencil, Phone, Search, Settings, Shield, User, Users, X } from "lucide-react";
import axiosInstance from "../../../lib/axiosInstance";
import { usuarioService, UsuarioAdminUpdateApi } from "../../../services/usuarioService";
import { AdminBooleanBadge, AdminEmptyState, AdminErrorState, AdminFilterChip, AdminLoadingState, AdminPagination, AdminPanel } from "../../components/adminUi";
import { toast } from "sonner";
import { normalizePersonName, normalizePhone, sanitizeNameInput, validateName, validatePhone } from "../../lib/validation";
import { FieldFeedback } from "../../components/forms/FieldFeedback";

interface UsuarioAdmin {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  rol: string;
  activo: boolean;
  creadoEn: string;
}

const ROL_OPTIONS = [
  { id: 1, nombre: "ADMIN" },
  { id: 2, nombre: "CLIENTE" },
];

const PAGE_SIZE = 8;

function getInitials(nombre: string, apellido: string) {
  const n = nombre ? nombre.charAt(0).toUpperCase() : "";
  const a = apellido ? apellido.charAt(0).toUpperCase() : "";
  return `${n}${a}` || "?";
}

function getAvatarColor(name: string) {
  const colors = [
    "bg-red-100 text-red-700",
    "bg-blue-100 text-blue-700",
    "bg-green-100 text-green-700",
    "bg-amber-100 text-amber-700",
    "bg-purple-100 text-purple-700",
    "bg-pink-100 text-pink-700",
    "bg-indigo-100 text-indigo-700",
    "bg-teal-100 text-teal-700",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function ToggleSwitch({ active, onChange }: { active: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!active)}
      className={`relative inline-flex h-7 w-12 items-center rounded-full border transition-all ${
        active ? "border-green-500 bg-green-500" : "border-gray-200 bg-gray-200"
      }`}
      title={active ? "Desactivar usuario" : "Activar usuario"}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
          active ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export default function AdminUsers() {
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("TODOS");
  const [stateFilter, setStateFilter] = useState("TODOS");
  const [page, setPage] = useState(1);
  const [editTarget, setEditTarget] = useState<UsuarioAdmin | null>(null);
  const [form, setForm] = useState<UsuarioAdminUpdateApi>({ nombre: "", apellido: "", telefono: "", idRol: 2 });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axiosInstance.get<UsuarioAdmin[]>("/usuarios/admin/listado");
      setUsuarios(res.data.sort((a, b) => b.id - a.id));
    } catch (e) {
      console.error("Error cargando usuarios", e);
      setError("No se pudo cargar el directorio de usuarios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return usuarios.filter((u) => {
      const matchesSearch = `${u.nombre} ${u.apellido} ${u.email}`.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === "TODOS" || u.rol === roleFilter;
      const matchesState =
        stateFilter === "TODOS" ||
        (stateFilter === "ACTIVOS" && u.activo) ||
        (stateFilter === "INACTIVOS" && !u.activo);
      return matchesSearch && matchesRole && matchesState;
    });
  }, [usuarios, search, roleFilter, stateFilter]);

  useEffect(() => {
    setPage(1);
  }, [search, roleFilter, stateFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pagedUsers = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleToggleEstado = async (u: UsuarioAdmin) => {
    try {
      await usuarioService.adminCambiarEstado(u.id, !u.activo);
      setUsuarios((prev) => prev.map((x) => (x.id === u.id ? { ...x, activo: !u.activo } : x)));
      toast.success(u.activo ? "Usuario desactivado" : "Usuario activado");
    } catch {
      toast.error("No se pudo cambiar el estado del usuario.");
    }
  };

  const openDrawer = (u: UsuarioAdmin) => {
    setEditTarget(u);
    setFormErrors({});
    setTouched({});
    setForm({
      nombre: u.nombre,
      apellido: u.apellido,
      telefono: u.telefono || "",
      idRol: ROL_OPTIONS.find((r) => r.nombre === u.rol)?.id ?? 2,
    });
  };

  const closeDrawer = () => setEditTarget(null);

  const handleNameChange = (key: "nombre" | "apellido", value: string, label: string) => {
    const sanitized = sanitizeNameInput(value);
    setForm((prev) => ({ ...prev, [key]: sanitized }));
    setTouched((prev) => ({ ...prev, [key]: true }));
    setFormErrors((prev) => ({
      ...prev,
      [key]: sanitized !== value ? "Solo se permiten letras" : "",
    }));
  };

  const handleSaveEdit = async () => {
    if (!editTarget) return;
    const nextErrors = {
      nombre: validateName(form.nombre, "El nombre"),
      apellido: validateName(form.apellido, "El apellido"),
      telefono: validatePhone(form.telefono || "", false),
    };
    setFormErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      toast.error("Corrige los campos marcados antes de guardar.");
      return;
    }
    try {
      setSaving(true);
      await usuarioService.adminUpdate(editTarget.id, {
        ...form,
        nombre: normalizePersonName(form.nombre),
        apellido: normalizePersonName(form.apellido),
        telefono: normalizePhone(form.telefono || ""),
      });
      const rolNombre = ROL_OPTIONS.find((r) => r.id === form.idRol)?.nombre ?? "CLIENTE";
      setUsuarios((prev) =>
        prev.map((x) =>
          x.id === editTarget.id
            ? { ...x, nombre: normalizePersonName(form.nombre), apellido: normalizePersonName(form.apellido), telefono: normalizePhone(form.telefono || ""), rol: rolNombre }
            : x,
        ),
      );
      toast.success("Usuario actualizado correctamente");
      closeDrawer();
    } catch {
      toast.error("Error al actualizar usuario. Verifica los datos.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <AdminLoadingState message="Cargando usuarios..." />;
  }

  if (error) {
    return <AdminErrorState description={error} onRetry={load} />;
  }

  return (
    <div style={{ fontFamily: "Poppins" }}>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">Directorio de Usuarios</h2>
          <p className="mt-1 text-sm font-medium text-gray-500">Gestiona roles, accesos y estados con filtros rápidos.</p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
          <Users className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-bold text-blue-700">{filtered.length} visibles</span>
        </div>
      </div>

      <AdminPanel className="mb-6 p-4 sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative max-w-xl flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, apellido o correo..."
              className="w-full rounded-2xl border border-gray-200 bg-white py-3.5 pl-12 pr-4 text-sm font-medium text-gray-800 placeholder-gray-400 shadow-sm transition focus:border-[#D32F2F] focus:outline-none focus:ring-4 focus:ring-red-500/10"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {["TODOS", "ADMIN", "CLIENTE"].map((role) => (
              <AdminFilterChip key={role} label={role} active={roleFilter === role} onClick={() => setRoleFilter(role)} />
            ))}
            {["TODOS", "ACTIVOS", "INACTIVOS"].map((status) => (
              <AdminFilterChip
                key={status}
                label={status === "ACTIVOS" ? "Activos" : status === "INACTIVOS" ? "Inactivos" : "Todos"}
                active={stateFilter === status}
                onClick={() => setStateFilter(status)}
              />
            ))}
          </div>
        </div>
      </AdminPanel>

      {editTarget && (
        <>
          <div className="fixed inset-0 z-40" style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }} onClick={closeDrawer} />
          <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl" style={{ boxShadow: "-10px 0 40px rgba(0,0,0,0.1)" }}>
            <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-8 py-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-100 bg-white shadow-sm">
                  <Settings className="h-5 w-5 text-gray-700" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold leading-tight text-gray-900">Editar Perfil</h3>
                  <p className="text-xs font-semibold text-gray-500">{editTarget.email}</p>
                </div>
              </div>
              <button onClick={closeDrawer} className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 shadow-sm transition hover:bg-gray-100 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto p-8">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="mb-2 block text-sm font-bold text-gray-700">Nombre *</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <User className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      value={form.nombre}
                      onChange={(e) => handleNameChange("nombre", e.target.value, "El nombre")}
                      onPaste={(e) => {
                        const pasted = e.clipboardData.getData("text");
                        e.preventDefault();
                        handleNameChange("nombre", `${form.nombre} ${pasted}`.trim(), "El nombre");
                      }}
                      onBlur={() => {
                        const normalized = normalizePersonName(form.nombre);
                        setForm((prev) => ({ ...prev, nombre: normalized }));
                        setTouched((prev) => ({ ...prev, nombre: true }));
                        setFormErrors((prev) => ({ ...prev, nombre: validateName(normalized, "El nombre") }));
                      }}
                      className={`w-full rounded-xl border bg-white py-3 pl-10 pr-4 text-sm font-medium text-gray-800 shadow-sm transition focus:outline-none focus:ring-4 ${
                        formErrors.nombre
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                          : touched.nombre && form.nombre && !validateName(form.nombre, "El nombre")
                            ? "border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500/10"
                            : "border-gray-200 focus:border-[#D32F2F] focus:ring-red-500/10"
                      }`}
                    />
                  </div>
                  <FieldFeedback error={formErrors.nombre} success={!!touched.nombre && !!form.nombre && !validateName(form.nombre, "El nombre")} successMessage="Nombre válido" />
                </div>
                <div className="flex-1">
                  <label className="mb-2 block text-sm font-bold text-gray-700">Apellido *</label>
                  <input
                    value={form.apellido}
                    onChange={(e) => handleNameChange("apellido", e.target.value, "El apellido")}
                    onPaste={(e) => {
                      const pasted = e.clipboardData.getData("text");
                      e.preventDefault();
                      handleNameChange("apellido", `${form.apellido} ${pasted}`.trim(), "El apellido");
                    }}
                    onBlur={() => {
                      const normalized = normalizePersonName(form.apellido);
                      setForm((prev) => ({ ...prev, apellido: normalized }));
                      setTouched((prev) => ({ ...prev, apellido: true }));
                      setFormErrors((prev) => ({ ...prev, apellido: validateName(normalized, "El apellido") }));
                    }}
                    className={`w-full rounded-xl border bg-white px-4 py-3 text-sm font-medium text-gray-800 shadow-sm transition focus:outline-none focus:ring-4 ${
                      formErrors.apellido
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                        : touched.apellido && form.apellido && !validateName(form.apellido, "El apellido")
                          ? "border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500/10"
                          : "border-gray-200 focus:border-[#D32F2F] focus:ring-red-500/10"
                    }`}
                  />
                  <FieldFeedback error={formErrors.apellido} success={!!touched.apellido && !!form.apellido && !validateName(form.apellido, "El apellido")} successMessage="Apellido válido" />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">Teléfono</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    value={form.telefono}
                    onChange={(e) => {
                      setForm({ ...form, telefono: normalizePhone(e.target.value) });
                      setFormErrors((prev) => ({ ...prev, telefono: "" }));
                    }}
                    placeholder="Ej: 987654321"
                    className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm font-medium text-gray-800 shadow-sm transition focus:border-[#D32F2F] focus:outline-none focus:ring-4 focus:ring-red-500/10"
                  />
                </div>
                <FieldFeedback error={formErrors.telefono} />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">Asignación de Rol *</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Shield className={`h-4 w-4 ${form.idRol === 1 ? "text-purple-500" : "text-blue-500"}`} />
                  </div>
                  <select
                    value={form.idRol}
                    onChange={(e) => setForm({ ...form, idRol: Number(e.target.value) })}
                    className="w-full cursor-pointer appearance-none rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm font-bold text-gray-800 shadow-sm transition focus:border-[#D32F2F] focus:outline-none focus:ring-4 focus:ring-red-500/10"
                  >
                    {ROL_OPTIONS.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 border-t border-gray-100 bg-gray-50/50 p-6">
              <button onClick={closeDrawer} className="flex-1 rounded-xl border border-gray-200 bg-white px-6 py-3.5 text-sm font-bold text-gray-600 shadow-sm transition hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={handleSaveEdit} disabled={saving} className="flex-1 rounded-xl bg-gray-900 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-70">
                {saving ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </div>
        </>
      )}

      <AdminPanel className="overflow-hidden">
        <div className="grid gap-4 p-4 md:hidden">
          {pagedUsers.length === 0 ? (
            <AdminEmptyState
              title="Sin coincidencias"
              description="Ajusta la búsqueda o los filtros para encontrar usuarios."
            />
          ) : (
            pagedUsers.map((u) => (
              <div key={u.id} className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-bold ${getAvatarColor(u.nombre + u.apellido)}`}>
                      {getInitials(u.nombre, u.apellido)}
                    </div>
                    <div>
                      <p className="font-extrabold text-gray-900">
                        {u.nombre} {u.apellido}
                      </p>
                      <p className="text-xs font-semibold text-gray-400">#{u.id}</p>
                    </div>
                  </div>
                  <AdminBooleanBadge active={u.activo} />
                </div>

                <div className="mt-4 space-y-2 rounded-2xl bg-gray-50/80 p-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="truncate">{u.email}</span>
                  </div>
                  {u.telefono && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{u.telefono}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    {u.rol === "ADMIN" ? <Shield className="h-4 w-4 text-purple-500" /> : <User className="h-4 w-4 text-blue-500" />}
                    <span className="font-bold">{u.rol}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <ToggleSwitch active={u.activo} onChange={() => handleToggleEstado(u)} />
                  <button
                    onClick={() => openDrawer(u)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-600 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                  >
                    <Pencil className="h-4 w-4" />
                    Editar usuario
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Usuario</th>
                <th className="hidden px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500 md:table-cell">Contacto</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Rol</th>
                <th className="hidden px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500 lg:table-cell">Registro</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-500">Estado</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pagedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <AdminEmptyState
                      title="Sin coincidencias"
                      description="Ajusta la búsqueda o los filtros para encontrar usuarios."
                    />
                  </td>
                </tr>
              ) : (
                pagedUsers.map((u) => (
                  <tr key={u.id} className="border-b border-gray-50 transition-colors hover:bg-gray-50/60">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold shrink-0 ${getAvatarColor(u.nombre + u.apellido)}`}>
                          {getInitials(u.nombre, u.apellido)}
                        </div>
                        <div>
                          <p className="font-bold leading-tight text-gray-900">
                            {u.nombre} {u.apellido}
                          </p>
                          <div className="mt-0.5 flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-gray-400">#{u.id}</span>
                            <span className="hidden text-xs text-gray-300 sm:inline">•</span>
                            <span className="hidden max-w-[150px] truncate text-xs font-medium text-gray-500 sm:inline" title={u.email}>
                              {u.email}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-6 py-4 md:table-cell">
                      <div className="flex flex-col gap-1 text-xs">
                        <div className="flex items-center gap-1.5 font-medium text-gray-600">
                          <Mail className="h-3.5 w-3.5 text-gray-400" />
                          {u.email}
                        </div>
                        {u.telefono && (
                          <div className="flex items-center gap-1.5 font-medium text-gray-600">
                            <Phone className="h-3.5 w-3.5 text-gray-400" />
                            {u.telefono}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold ${
                          u.rol === "ADMIN" ? "border-purple-100 bg-purple-50 text-purple-700" : "border-blue-100 bg-blue-50 text-blue-700"
                        }`}
                      >
                        {u.rol === "ADMIN" ? <Shield className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                        {u.rol}
                      </span>
                    </td>
                    <td className="hidden px-6 py-4 text-xs font-medium text-gray-500 lg:table-cell">{u.creadoEn?.slice(0, 10)}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <AdminBooleanBadge active={u.activo} />
                        <ToggleSwitch active={u.activo} onChange={() => handleToggleEstado(u)} />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openDrawer(u)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-400 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                        title="Editar usuario"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </AdminPanel>
    </div>
  );
}
