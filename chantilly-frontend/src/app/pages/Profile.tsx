import React, { useState, useEffect } from "react";
import { User, MapPin, Plus, Trash2, Edit2, Check, X, Lock, Mail, Phone, Building } from "lucide-react";
import { toast } from "sonner";
import { BtnPrimary, BtnSecondary } from "../components/shared";
import { useApp } from "../context/AppContext";
import { usuarioService, DireccionApi } from "../../services/usuarioService";

export default function Profile() {
  const { user, setUser, logout } = useApp();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", lastName: "", email: "", phone: "" });
  const [addresses, setAddresses] = useState<DireccionApi[]>([]);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [newAddress, setNewAddress] = useState({ etiqueta: "", direccion: "", telefono: "" });
  const [savingAddress, setSavingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ passwordActual: "", passwordNueva: "" });
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const [perfilRes, direccionesRes] = await Promise.all([
        usuarioService.getPerfil(),
        usuarioService.getDirecciones(),
      ]);

      const perfil = perfilRes.data;
      setForm({
        name: perfil.nombre || user.name,
        lastName: perfil.apellido || user.lastName,
        email: perfil.email || user.email,
        phone: perfil.telefono || "",
      });
      setAddresses(direccionesRes.data || []);
    } catch (err) {
      console.error("Error cargando perfil", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await usuarioService.updatePerfil({
        nombre: form.name,
        apellido: form.lastName,
        email: form.email,
        telefono: form.phone,
      });

      if (form.email !== user.email) {
        toast.success("Correo actualizado exitosamente. Por favor inicia sesión nuevamente.");
        logout();
        return;
      }

      setUser({ ...user, name: form.name, lastName: form.lastName, phone: form.phone, email: form.email });
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      console.error("Error guardando perfil", err);
      if (err.response?.data?.mensaje) {
        toast.error(err.response.data.mensaje);
      } else {
        toast.error("Hubo un error al guardar los cambios");
      }
    }
  };

  const handleSaveAddress = async () => {
    if (!newAddress.etiqueta || !newAddress.direccion) {
      toast.error("La etiqueta y dirección son obligatorias");
      return;
    }
    setSavingAddress(true);
    try {
      if (editingAddressId) {
        const { data } = await usuarioService.updateDireccion(editingAddressId, newAddress);
        setAddresses(addresses.map(a => a.id === editingAddressId ? data : a));
      } else {
        const { data } = await usuarioService.addDireccion(newAddress);
        setAddresses([...addresses, data]);
      }
      setShowModal(false);
      setNewAddress({ etiqueta: "", direccion: "", telefono: "" });
      setEditingAddressId(null);
    } catch (err) {
      console.error("Error guardando direccion", err);
      toast.error("Hubo un error al guardar la dirección");
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id: number) => {
    if (!confirm("Seguro que deseas eliminar esta direccion?")) return;
    try {
      await usuarioService.deleteDireccion(id);
      setAddresses(addresses.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Error eliminando direccion", err);
      toast.error("Error al eliminar la dirección");
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.passwordActual || !passwordForm.passwordNueva) {
      toast.error("Ambas contraseñas son obligatorias");
      return;
    }
    if (passwordForm.passwordNueva.length < 6) {
      toast.error("La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }
    setSavingPassword(true);
    try {
      await usuarioService.cambiarPassword(passwordForm);
      toast.success("Contraseña actualizada exitosamente");
      setShowPasswordModal(false);
      setPasswordForm({ passwordActual: "", passwordNueva: "" });
    } catch (err: any) {
      console.error("Error cambiando password", err);
      if (err.response?.data?.mensaje) {
        toast.error(err.response.data.mensaje);
      } else {
        toast.error("Error al actualizar la contraseña");
      }
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#F5F5F5] py-10 px-4 text-center">Cargando perfil...</div>;
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] py-12 px-4" style={{ fontFamily: "Poppins" }}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-gray-800 mb-8 font-bold text-3xl">Panel de Usuario</h1>

        {saved && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2 shadow-sm">
            <Check className="w-5 h-5" /> Datos de perfil actualizados correctamente
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Columna Izquierda: Tarjeta de Perfil */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
              {/* Banner */}
              <div className="h-32 bg-gradient-to-r from-red-600 to-red-500"></div>
              
              <div className="px-6 pb-6 relative">
                <div className="w-24 h-24 bg-white rounded-full p-1 absolute -top-12 shadow-md">
                  <div className="w-full h-full bg-yellow-400 rounded-full flex items-center justify-center">
                    <User className="w-10 h-10 text-red-700" />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button onClick={() => setEditing(!editing)} className="text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 p-2 rounded-full transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-2 mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">{user.name} {user.lastName}</h2>
                </div>

                {editing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-700 mb-1 text-xs font-bold uppercase tracking-wide">Nombre</label>
                      <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all text-sm" />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1 text-xs font-bold uppercase tracking-wide">Apellido</label>
                      <input value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all text-sm" />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1 text-xs font-bold uppercase tracking-wide">Correo Electrónico</label>
                      <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all text-sm" />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1 text-xs font-bold uppercase tracking-wide">Teléfono</label>
                      <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all text-sm" />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <BtnPrimary onClick={handleSave} className="flex-1 py-2 text-sm">Guardar</BtnPrimary>
                      <BtnSecondary onClick={() => { setEditing(false); fetchProfile(); }} className="flex-1 py-2 text-sm">Cancelar</BtnSecondary>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-gray-600">
                      <div className="bg-gray-50 p-2 rounded-lg text-gray-400"><Mail className="w-4 h-4" /></div>
                      <span className="text-sm font-medium truncate">{form.email || user.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <div className="bg-gray-50 p-2 rounded-lg text-gray-400"><Phone className="w-4 h-4" /></div>
                      <span className="text-sm font-medium">{form.phone || "No registrado"}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Lock className="w-5 h-5 text-gray-400" /> Seguridad</h3>
              <p className="text-sm text-gray-500 mb-4">Mantén tu cuenta segura actualizando tu contraseña regularmente.</p>
              <button onClick={() => setShowPasswordModal(true)} className="w-full border border-gray-200 text-gray-600 font-bold py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                Cambiar Contraseña
              </button>
            </div>
          </div>

          {/* Columna Derecha: Direcciones */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 min-h-full">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Mis Direcciones</h2>
                  <p className="text-gray-500 text-sm mt-1">Administra tus lugares de entrega frecuentes</p>
                </div>
                <button onClick={() => { setEditingAddressId(null); setNewAddress({ etiqueta: "", direccion: "", telefono: "" }); setShowModal(true); }} className="bg-red-50 text-red-600 hover:bg-red-100 font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm shadow-sm">
                  <Plus className="w-4 h-4" /> Nueva Dirección
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
                    <MapPin className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-gray-700 text-lg mb-2">No tienes direcciones</h3>
                  <p className="text-gray-500 text-sm mb-6 max-w-sm">Guarda la dirección de tu casa, trabajo o familiares para hacer tus pedidos más rápido.</p>
                  <BtnPrimary onClick={() => { setEditingAddressId(null); setNewAddress({ etiqueta: "", direccion: "", telefono: "" }); setShowModal(true); }}>Agregar Mi Primera Dirección</BtnPrimary>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((a) => (
                    <div key={a.id} className="border border-gray-100 bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative group">
                      <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => {
                            setEditingAddressId(a.id || null);
                            setNewAddress({ etiqueta: a.etiqueta, direccion: a.direccion, telefono: a.telefono || "" });
                            setShowModal(true);
                          }} className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDeleteAddress(a.id || 0)} className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0 text-red-600">
                          {a.etiqueta.toLowerCase().includes('trabajo') || a.etiqueta.toLowerCase().includes('oficina') ? <Building className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                        </div>
                        <div className="pr-12">
                          <p className="font-bold text-gray-800 text-lg mb-1">{a.etiqueta}</p>
                          <p className="text-gray-500 text-sm leading-relaxed mb-2">{a.direccion}</p>
                          {a.telefono && (
                            <p className="text-gray-400 text-xs font-medium bg-gray-50 inline-block px-2 py-1 rounded">Tel: {a.telefono}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal de Dirección (Glassmorphism) */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform scale-100 animate-in fade-in zoom-in duration-200">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h3 className="text-lg font-bold text-gray-800">{editingAddressId ? "Editar Dirección" : "Nueva Dirección"}</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-red-600 bg-white rounded-full p-1.5 shadow-sm transition-colors"><X className="w-5 h-5"/></button>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Etiqueta</label>
                  <input placeholder="Ej: Mi Casa, Oficina, Novia" value={newAddress.etiqueta} onChange={e => setNewAddress({...newAddress, etiqueta: e.target.value})} className="w-full border border-gray-200 bg-gray-50 px-4 py-2.5 rounded-lg focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Dirección Completa</label>
                  <textarea placeholder="Ingresa calle, número, distrito, referencias..." rows={3} value={newAddress.direccion} onChange={e => setNewAddress({...newAddress, direccion: e.target.value})} className="w-full border border-gray-200 bg-gray-50 px-4 py-2.5 rounded-lg focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all text-sm resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Teléfono (Quien recibe)</label>
                  <input placeholder="Opcional" value={newAddress.telefono} onChange={e => setNewAddress({...newAddress, telefono: e.target.value})} className="w-full border border-gray-200 bg-gray-50 px-4 py-2.5 rounded-lg focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all text-sm" />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                <button onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-800 transition-colors">Cancelar</button>
                <BtnPrimary onClick={handleSaveAddress} disabled={savingAddress} className="px-6 py-2.5 text-sm shadow-md">
                  {savingAddress ? "Guardando..." : "Guardar Dirección"}
                </BtnPrimary>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Cambiar Contraseña */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform scale-100 animate-in fade-in zoom-in duration-200">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><Lock className="w-5 h-5 text-gray-500"/> Cambiar Contraseña</h3>
                <button onClick={() => setShowPasswordModal(false)} className="text-gray-400 hover:text-red-600 bg-white rounded-full p-1.5 shadow-sm transition-colors"><X className="w-5 h-5"/></button>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Contraseña Actual</label>
                  <input type="password" placeholder="Tu contraseña actual" value={passwordForm.passwordActual} onChange={e => setPasswordForm({...passwordForm, passwordActual: e.target.value})} className="w-full border border-gray-200 bg-gray-50 px-4 py-2.5 rounded-lg focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Nueva Contraseña</label>
                  <input type="password" placeholder="Mínimo 6 caracteres" value={passwordForm.passwordNueva} onChange={e => setPasswordForm({...passwordForm, passwordNueva: e.target.value})} className="w-full border border-gray-200 bg-gray-50 px-4 py-2.5 rounded-lg focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all text-sm" />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                <button onClick={() => setShowPasswordModal(false)} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-800 transition-colors">Cancelar</button>
                <BtnPrimary onClick={handleChangePassword} disabled={savingPassword} className="px-6 py-2.5 text-sm shadow-md">
                  {savingPassword ? "Actualizando..." : "Actualizar Contraseña"}
                </BtnPrimary>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
