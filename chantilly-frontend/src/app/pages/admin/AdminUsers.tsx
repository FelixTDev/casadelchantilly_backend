import React, { useEffect, useState } from "react";
import { Search, Users, Pencil, X, Shield, User, Mail, Phone, Settings, Hash } from "lucide-react";
import axiosInstance from "../../../lib/axiosInstance";
import { usuarioService, UsuarioAdminUpdateApi } from "../../../services/usuarioService";
import { toast } from "sonner";

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

// Utilidad para extraer iniciales
function getInitials(nombre: string, apellido: string) {
  const n = nombre ? nombre.charAt(0).toUpperCase() : "";
  const a = apellido ? apellido.charAt(0).toUpperCase() : "";
  return `${n}${a}` || "?";
}

// Utilidad para color de avatar determinista
function getAvatarColor(name: string) {
  const colors = [
    "bg-red-100 text-red-700", "bg-blue-100 text-blue-700", 
    "bg-green-100 text-green-700", "bg-amber-100 text-amber-700", 
    "bg-purple-100 text-purple-700", "bg-pink-100 text-pink-700",
    "bg-indigo-100 text-indigo-700", "bg-teal-100 text-teal-700"
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
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 ease-in-out focus:outline-none shadow-inner border ${
        active ? "bg-green-500 border-green-500" : "bg-gray-200 border-gray-200"
      }`}
      title={active ? "Desactivar usuario" : "Activar usuario"}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-300 ease-in-out ${
          active ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export default function AdminUsers() {
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [search, setSearch] = useState("");
  const [editTarget, setEditTarget] = useState<UsuarioAdmin | null>(null);
  
  // Estado para el formulario del Drawer
  const [form, setForm] = useState<UsuarioAdminUpdateApi>({ nombre: "", apellido: "", telefono: "", idRol: 2 });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axiosInstance.get<UsuarioAdmin[]>("/usuarios/admin/listado");
        setUsuarios(res.data.sort((a, b) => a.id - b.id)); // Ordenar por ID ascendente
      } catch (e) {
        console.error("Error cargando usuarios", e);
      } finally {
        setLoading(false);
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
      toast.success(u.activo ? "Usuario desactivado" : "Usuario activado");
    } catch {
      toast.error("No se pudo cambiar el estado del usuario.");
    }
  };

  const openDrawer = (u: UsuarioAdmin) => {
    setEditTarget(u);
    setForm({
      nombre: u.nombre,
      apellido: u.apellido,
      telefono: u.telefono || "",
      idRol: ROL_OPTIONS.find(r => r.nombre === u.rol)?.id ?? 2,
    });
  };

  const closeDrawer = () => {
    setEditTarget(null);
  };

  const handleSaveEdit = async () => {
    if (!editTarget) return;
    try {
      setSaving(true);
      await usuarioService.adminUpdate(editTarget.id, form);
      const rolNombre = ROL_OPTIONS.find(r => r.id === form.idRol)?.nombre ?? "CLIENTE";
      setUsuarios(prev => prev.map(x =>
        x.id === editTarget.id
          ? { ...x, nombre: form.nombre, apellido: form.apellido, telefono: form.telefono || "", rol: rolNombre }
          : x
      ));
      toast.success("Usuario actualizado correctamente");
      closeDrawer();
    } catch {
      toast.error("Error al actualizar usuario. Verifica los datos.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32" style={{ fontFamily: "Poppins" }}>
      <div className="w-12 h-12 border-4 border-gray-200 border-t-red-500 rounded-full animate-spin mb-4"></div>
      <p className="text-gray-400 font-medium">Cargando usuarios...</p>
    </div>
  );

  return (
    <div style={{ fontFamily: "Poppins" }}>
      
      {/* Header Premium */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-gray-900 font-extrabold text-3xl tracking-tight mb-1">Directorio de Usuarios</h2>
          <p className="text-gray-500 text-sm font-medium">Gestiona roles, accesos e información de tu comunidad.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 px-4 py-2 rounded-xl">
          <Users className="w-4 h-4 text-blue-500" />
          <span className="text-blue-700 font-bold text-sm">
            {usuarios.length} registrados
          </span>
        </div>
      </div>

      {/* Buscador Power User */}
      <div className="mb-6 relative max-w-xl group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-gray-400 group-focus-within:text-[#D32F2F] transition-colors" />
        </div>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre o correo electrónico..."
          className="w-full pl-12 pr-12 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-[#D32F2F] transition-all shadow-sm"
        />
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
          <span className="hidden sm:inline-flex items-center justify-center px-2 py-1 text-xs font-bold text-gray-400 bg-gray-100 rounded-md">
            ⌘K
          </span>
        </div>
      </div>

      {/* Slide-over Drawer para Edición */}
      {editTarget && (
        <>
          <div className="fixed inset-0 z-40 transition-opacity" style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }} onClick={closeDrawer} />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col" style={{ boxShadow: "-10px 0 40px rgba(0,0,0,0.1)" }}>
            
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-gray-700" />
                </div>
                <div>
                  <h3 className="text-gray-900 font-extrabold text-xl leading-tight">Editar Perfil</h3>
                  <p className="text-gray-500 text-xs font-semibold">{editTarget.email}</p>
                </div>
              </div>
              <button onClick={closeDrawer} className="w-8 h-8 rounded-full bg-white border border-gray-200 hover:bg-gray-100 flex items-center justify-center transition-colors text-gray-400 hover:text-gray-600 shadow-sm">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-gray-700 mb-2 font-bold text-sm">Nombre *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      value={form.nombre}
                      onChange={e => setForm({ ...form, nombre: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-[#D32F2F] transition-all shadow-sm"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-gray-700 mb-2 font-bold text-sm">Apellido *</label>
                  <input
                    value={form.apellido}
                    onChange={e => setForm({ ...form, apellido: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-[#D32F2F] transition-all shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-bold text-sm">Teléfono</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    value={form.telefono}
                    onChange={e => setForm({ ...form, telefono: e.target.value })}
                    placeholder="Ej: 987654321"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-[#D32F2F] transition-all shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-bold text-sm">Asignación de Rol *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Shield className={`w-4 h-4 ${form.idRol === 1 ? "text-purple-500" : "text-blue-500"}`} />
                  </div>
                  <select
                    value={form.idRol}
                    onChange={e => setForm({ ...form, idRol: Number(e.target.value) })}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-[#D32F2F] transition-all shadow-sm appearance-none cursor-pointer"
                  >
                    {ROL_OPTIONS.map(r => (
                      <option key={r.id} value={r.id}>{r.nombre}</option>
                    ))}
                  </select>
                </div>
                <p className="text-xs text-gray-400 mt-2 font-medium">
                  {form.idRol === 1 ? "Los administradores tienen acceso total al panel." : "Los clientes solo pueden hacer compras en la tienda."}
                </p>
              </div>

            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50/50 shrink-0 flex gap-3">
              <button onClick={closeDrawer}
                className="flex-1 text-gray-600 bg-white border border-gray-200 font-bold py-3.5 px-6 rounded-xl hover:bg-gray-50 transition-all shadow-sm text-sm">
                Cancelar
              </button>
              <button onClick={handleSaveEdit} disabled={saving}
                className="flex-1 bg-gray-900 hover:bg-black text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed text-sm">
                {saving ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Tabla Soft-UI */}
      <div className="bg-white rounded-3xl overflow-hidden border border-gray-50" style={{ boxShadow: "0 10px 40px -10px rgba(0,0,0,0.08)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="text-left py-4 px-6 text-gray-500 font-bold text-xs uppercase tracking-wider">Usuario</th>
                <th className="text-left py-4 px-6 text-gray-500 font-bold text-xs uppercase tracking-wider hidden md:table-cell">Contacto</th>
                <th className="text-left py-4 px-6 text-gray-500 font-bold text-xs uppercase tracking-wider">Rol</th>
                <th className="text-left py-4 px-6 text-gray-500 font-bold text-xs uppercase tracking-wider hidden lg:table-cell">Registro</th>
                <th className="text-center py-4 px-6 text-gray-500 font-bold text-xs uppercase tracking-wider">Estado</th>
                <th className="text-right py-4 px-6 text-gray-500 font-bold text-xs uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center">
                      <Users className="w-12 h-12 text-gray-200 mb-3" />
                      <p className="text-gray-500 font-medium">No se encontraron usuarios que coincidan con la búsqueda.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(u => (
                  <tr key={u.id} className="group border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    
                    {/* Usuario (Avatar + Nombre + ID) */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${getAvatarColor(u.nombre + u.apellido)}`}>
                          {getInitials(u.nombre, u.apellido)}
                        </div>
                        <div>
                          <p className="text-gray-900 font-bold leading-tight">{u.nombre} {u.apellido}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-gray-400 text-xs font-semibold">#{u.id}</span>
                            <span className="text-gray-300 text-xs hidden sm:inline">•</span>
                            <span className="text-gray-500 text-xs font-medium hidden sm:inline truncate max-w-[150px]" title={u.email}>{u.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Contacto (Email visible en desktop + Telefono) */}
                    <td className="py-4 px-6 hidden md:table-cell">
                      <div className="flex flex-col gap-1 text-xs">
                        <div className="flex items-center gap-1.5 text-gray-600 font-medium">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          {u.email}
                        </div>
                        {u.telefono && (
                          <div className="flex items-center gap-1.5 text-gray-600 font-medium">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            {u.telefono}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Rol */}
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${
                        u.rol === "ADMIN" 
                          ? "bg-purple-50 text-purple-700 border-purple-100" 
                          : "bg-blue-50 text-blue-700 border-blue-100"
                      }`}>
                        {u.rol === "ADMIN" ? <Shield className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                        {u.rol}
                      </span>
                    </td>

                    {/* Registro */}
                    <td className="py-4 px-6 text-gray-500 font-medium text-xs hidden lg:table-cell">
                      {u.creadoEn?.slice(0, 10)}
                    </td>

                    {/* Estado (Toggle) */}
                    <td className="py-4 px-6 text-center">
                      <ToggleSwitch active={u.activo} onChange={() => handleToggleEstado(u)} />
                    </td>

                    {/* Acciones */}
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => openDrawer(u)}
                        className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-white border border-gray-200 text-gray-400 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all shadow-sm"
                        title="Editar usuario"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
