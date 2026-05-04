import React, { useEffect, useState } from "react";
import { Search, Users, Pencil, X, Check } from "lucide-react";
import axiosInstance from "../../../lib/axiosInstance";
import { usuarioService, UsuarioAdminUpdateApi } from "../../../services/usuarioService";

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

function ToggleSwitch({ active, onChange }: { active: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!active)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
        active ? "bg-green-500" : "bg-gray-300"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
          active ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function EditModal({
  usuario,
  onClose,
  onSaved,
}: {
  usuario: UsuarioAdmin;
  onClose: () => void;
  onSaved: (updated: UsuarioAdminUpdateApi & { id: number }) => void;
}) {
  const [form, setForm] = useState<UsuarioAdminUpdateApi>({
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    telefono: usuario.telefono || "",
    idRol: ROL_OPTIONS.find(r => r.nombre === usuario.rol)?.id ?? 2,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    try {
      setSaving(true);
      await usuarioService.adminUpdate(usuario.id, form);
      onSaved({ ...form, id: usuario.id });
      onClose();
    } catch {
      setError("No se pudo guardar. Verifica los datos.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-gray-800 font-bold text-lg">Editar Usuario</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && <p className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</p>}

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Nombre</label>
              <input
                value={form.nombre}
                onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-red-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Apellido</label>
              <input
                value={form.apellido}
                onChange={e => setForm(f => ({ ...f, apellido: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-red-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Teléfono</label>
            <input
              value={form.telefono}
              onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-red-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Rol</label>
            <select
              value={form.idRol}
              onChange={e => setForm(f => ({ ...f, idRol: Number(e.target.value) }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-red-600 focus:outline-none bg-gray-50"
            >
              {ROL_OPTIONS.map(r => (
                <option key={r.id} value={r.id}>{r.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-red-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-red-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving ? "Guardando..." : <><Check className="w-4 h-4" /> Guardar</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [search, setSearch] = useState("");
  const [editTarget, setEditTarget] = useState<UsuarioAdmin | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axiosInstance.get<UsuarioAdmin[]>("/usuarios/admin/listado");
        setUsuarios(res.data);
      } catch (e) {
        console.error("Error cargando usuarios", e);
      }
    };
    load();
  }, []);

  const filtered = usuarios.filter(u =>
    `${u.nombre} ${u.apellido} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleEstado = async (u: UsuarioAdmin) => {
    try {
      await usuarioService.adminCambiarEstado(u.id, !u.activo);
      setUsuarios(prev => prev.map(x => x.id === u.id ? { ...x, activo: !u.activo } : x));
    } catch {
      alert("No se pudo cambiar el estado del usuario.");
    }
  };

  const handleSaved = (updated: UsuarioAdminUpdateApi & { id: number }) => {
    const rolNombre = ROL_OPTIONS.find(r => r.id === updated.idRol)?.nombre ?? "CLIENTE";
    setUsuarios(prev => prev.map(x =>
      x.id === updated.id
        ? { ...x, nombre: updated.nombre, apellido: updated.apellido, telefono: updated.telefono || "", rol: rolNombre }
        : x
    ));
  };

  return (
    <>
      {editTarget && (
        <EditModal
          usuario={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={handleSaved}
        />
      )}

      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar usuarios..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white focus:border-red-600 focus:outline-none text-sm"
            />
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Users className="w-5 h-5" />
            <span className="font-semibold">{usuarios.length} usuarios registrados</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-gray-500 font-semibold">ID</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-semibold">Nombre</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-semibold hidden sm:table-cell">Email</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-semibold hidden md:table-cell">Teléfono</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-semibold">Rol</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-semibold hidden lg:table-cell">Registro</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-semibold">Estado</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="py-12 text-center text-gray-400">No se encontraron usuarios.</td></tr>
                )}
                {filtered.map(u => (
                  <tr key={u.id} className="border-t hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-gray-400">#{u.id}</td>
                    <td className="py-3 px-4 font-semibold text-gray-800">{u.nombre} {u.apellido}</td>
                    <td className="py-3 px-4 text-gray-500 hidden sm:table-cell">{u.email}</td>
                    <td className="py-3 px-4 text-gray-500 hidden md:table-cell">{u.telefono || "—"}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${u.rol === "ADMIN" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                        {u.rol}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500 hidden lg:table-cell">{u.creadoEn?.slice(0, 10)}</td>
                    <td className="py-3 px-4">
                      <ToggleSwitch active={u.activo} onChange={() => handleToggleEstado(u)} />
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => setEditTarget(u)}
                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-600 border border-gray-200 hover:border-red-300 px-3 py-1.5 rounded-lg transition font-semibold"
                      >
                        <Pencil className="w-3.5 h-3.5" /> Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
