import React, { useState, useEffect } from "react";
import { User, MapPin, Plus, Trash2, Edit2, Check, Lock, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import { BtnPrimary, BtnSecondary } from "../components/shared";
import { useApp } from "../context/AppContext";
import { usuarioService, DireccionApi } from "../../services/usuarioService";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import {
  normalizePhone,
  normalizePersonName,
  normalizeText,
  sanitizeNameInput,
  validateAddress,
  validateAddressLabel,
  validateEmail,
  validateName,
  validatePassword,
  validatePasswordConfirmation,
  validatePhone,
} from "../lib/validation";
import { AuthBreadcrumbs } from "../components/AuthBreadcrumbs";
import { FieldFeedback } from "../components/forms/FieldFeedback";
import { showRequestError } from "../../lib/notifyError";
import { AddressIcon, ProfileAddressModal, ProfileDeleteAddressModal, ProfilePasswordModal } from "../features/profile/ProfileModals";

export default function Profile() {
  const { user, setUser, logout } = useApp();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", lastName: "", email: "", phone: "" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [addresses, setAddresses] = useState<DireccionApi[]>([]);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [newAddress, setNewAddress] = useState({ etiqueta: "", direccion: "", telefono: "" });
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});
  const [savingAddress, setSavingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [addressToDelete, setAddressToDelete] = useState<DireccionApi | null>(null);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ passwordActual: "", passwordNueva: "", confirmPasswordNueva: "" });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [savingPassword, setSavingPassword] = useState(false);
  const [showEmailConfirm, setShowEmailConfirm] = useState(false);

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

  const saveProfile = async () => {
    const nextEmail = form.email.trim();
    const nextName = normalizePersonName(form.name);
    const nextLastName = normalizePersonName(form.lastName);
    const nextPhone = normalizePhone(form.phone);

    await usuarioService.updatePerfil({
      nombre: nextName,
      apellido: nextLastName,
      email: nextEmail,
      telefono: nextPhone,
    });

    if (nextEmail !== user.email) {
      toast.success("Correo actualizado exitosamente. Por favor inicia sesión nuevamente.");
      logout();
      return;
    }

    setUser({ ...user, name: nextName, lastName: nextLastName, phone: nextPhone, email: nextEmail });
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSave = async () => {
    const nextErrors = {
      name: validateName(form.name, "El nombre"),
      lastName: validateName(form.lastName, "El apellido"),
      email: validateEmail(form.email),
      phone: validatePhone(form.phone),
    };
    setFieldErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      toast.error("Corrige los campos marcados antes de guardar");
      return;
    }

    try {
      if (form.email.trim() !== user.email) {
        setShowEmailConfirm(true);
        return;
      }
      await saveProfile();
    } catch (err) {
      console.error("Error guardando perfil", err);
      showRequestError(err, "Hubo un error al guardar los cambios");
    }
  };

  const handleNameFieldChange = (key: "name" | "lastName", value: string, label: string) => {
    const sanitized = sanitizeNameInput(value);
    setForm((prev) => ({ ...prev, [key]: sanitized }));
    setTouched((prev) => ({ ...prev, [key]: true }));
    setFieldErrors((prev) => ({
      ...prev,
      [key]: sanitized !== value ? "Solo se permiten letras" : "",
    }));
  };

  const handleSaveAddress = async () => {
    const nextErrors = {
      etiqueta: validateAddressLabel(newAddress.etiqueta),
      direccion: validateAddress(newAddress.direccion),
      telefono: validatePhone(newAddress.telefono, false),
    };
    setAddressErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      toast.error("Corrige los campos de dirección antes de guardar");
      return;
    }
    setSavingAddress(true);
    try {
      const payload = {
        etiqueta: normalizeText(newAddress.etiqueta),
        direccion: normalizeText(newAddress.direccion),
        telefono: normalizePhone(newAddress.telefono),
      };
      if (editingAddressId) {
        const { data } = await usuarioService.updateDireccion(editingAddressId, payload);
        setAddresses(addresses.map(a => a.id === editingAddressId ? data : a));
      } else {
        const { data } = await usuarioService.addDireccion(payload);
        setAddresses([...addresses, data]);
      }
      setShowModal(false);
      setNewAddress({ etiqueta: "", direccion: "", telefono: "" });
      setAddressErrors({});
      setEditingAddressId(null);
    } catch (err) {
      console.error("Error guardando direccion", err);
      showRequestError(err, "Hubo un error al guardar la dirección");
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id: number) => {
    try {
      await usuarioService.deleteDireccion(id);
      setAddresses(addresses.filter((a) => a.id !== id));
      setAddressToDelete(null);
    } catch (err) {
      console.error("Error eliminando direccion", err);
      showRequestError(err, "Error al eliminar la dirección");
    }
  };

  const handleChangePassword = async () => {
    const nextErrors = {
      passwordActual: validatePassword(passwordForm.passwordActual),
      passwordNueva: validatePassword(passwordForm.passwordNueva),
      confirmPasswordNueva: validatePasswordConfirmation(passwordForm.passwordNueva, passwordForm.confirmPasswordNueva),
    };
    setPasswordErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      toast.error("Corrige los campos de contraseña antes de continuar");
      return;
    }
    setSavingPassword(true);
    try {
      await usuarioService.cambiarPassword({
        passwordActual: passwordForm.passwordActual,
        passwordNueva: passwordForm.passwordNueva,
      });
      toast.success("Contraseña actualizada exitosamente");
      setShowPasswordModal(false);
      setPasswordForm({ passwordActual: "", passwordNueva: "", confirmPasswordNueva: "" });
      setPasswordErrors({});
    } catch (err) {
      console.error("Error cambiando password", err);
      showRequestError(err, "Error al actualizar la contraseña");
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
        <AuthBreadcrumbs items={[{ label: "Inicio", to: "/" }, { label: "Mi cuenta" }]} />
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
                      <input
                        value={form.name}
                        onChange={e => handleNameFieldChange("name", e.target.value, "El nombre")}
                        onPaste={(e) => {
                          const pasted = e.clipboardData.getData("text");
                          e.preventDefault();
                          handleNameFieldChange("name", `${form.name} ${pasted}`.trim(), "El nombre");
                        }}
                        onBlur={() => {
                          const normalized = normalizePersonName(form.name);
                          setForm((prev) => ({ ...prev, name: normalized }));
                          setTouched((prev) => ({ ...prev, name: true }));
                          setFieldErrors((prev) => ({ ...prev, name: validateName(normalized, "El nombre") }));
                        }}
                        className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all ${
                          fieldErrors.name
                            ? "border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                            : touched.name && form.name && !validateName(form.name, "El nombre")
                              ? "border-emerald-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-400"
                              : "border-gray-200 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        }`}
                      />
                      <FieldFeedback error={fieldErrors.name} success={!!touched.name && !!form.name && !validateName(form.name, "El nombre")} successMessage="Nombre válido" />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1 text-xs font-bold uppercase tracking-wide">Apellido</label>
                      <input
                        value={form.lastName}
                        onChange={e => handleNameFieldChange("lastName", e.target.value, "El apellido")}
                        onPaste={(e) => {
                          const pasted = e.clipboardData.getData("text");
                          e.preventDefault();
                          handleNameFieldChange("lastName", `${form.lastName} ${pasted}`.trim(), "El apellido");
                        }}
                        onBlur={() => {
                          const normalized = normalizePersonName(form.lastName);
                          setForm((prev) => ({ ...prev, lastName: normalized }));
                          setTouched((prev) => ({ ...prev, lastName: true }));
                          setFieldErrors((prev) => ({ ...prev, lastName: validateName(normalized, "El apellido") }));
                        }}
                        className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all ${
                          fieldErrors.lastName
                            ? "border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                            : touched.lastName && form.lastName && !validateName(form.lastName, "El apellido")
                              ? "border-emerald-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-400"
                              : "border-gray-200 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        }`}
                      />
                      <FieldFeedback error={fieldErrors.lastName} success={!!touched.lastName && !!form.lastName && !validateName(form.lastName, "El apellido")} successMessage="Apellido válido" />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1 text-xs font-bold uppercase tracking-wide">Correo Electrónico</label>
                      <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all text-sm" />
                      <p className="mt-2 text-xs text-gray-500">Si cambias tu correo, deberás iniciar sesión nuevamente.</p>
                      {fieldErrors.email && <p className="mt-2 text-sm text-red-600">{fieldErrors.email}</p>}
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1 text-xs font-bold uppercase tracking-wide">Teléfono</label>
                      <input value={form.phone} onChange={e => setForm({ ...form, phone: normalizePhone(e.target.value) })} className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all text-sm" inputMode="numeric" />
                      {fieldErrors.phone && <p className="mt-2 text-sm text-red-600">{fieldErrors.phone}</p>}
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
                            setAddressErrors({});
                            setShowModal(true);
                          }} className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setAddressToDelete(a)} className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0 text-red-600">
                          <AddressIcon etiqueta={a.etiqueta} />
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
        <ProfileAddressModal
          open={showModal}
          editingAddressId={editingAddressId}
          form={newAddress}
          errors={addressErrors}
          saving={savingAddress}
          onClose={() => { setShowModal(false); setAddressErrors({}); }}
          onChange={(field, value) => {
            setNewAddress((prev) => ({
              ...prev,
              [field]: field === "telefono" ? normalizePhone(value) : value,
            }));
            setAddressErrors((prev) => ({ ...prev, [field]: "" }));
          }}
          onSubmit={handleSaveAddress}
        />

        <ProfilePasswordModal
          open={showPasswordModal}
          form={passwordForm}
          errors={passwordErrors}
          saving={savingPassword}
          onClose={() => { setShowPasswordModal(false); setPasswordErrors({}); }}
          onChange={(field, value) => {
            setPasswordForm((prev) => ({ ...prev, [field]: value }));
            setPasswordErrors((prev) => ({
              ...prev,
              [field]: "",
              ...(field === "passwordNueva" ? { confirmPasswordNueva: "" } : {}),
            }));
          }}
          onSubmit={handleChangePassword}
        />

        <ProfileDeleteAddressModal
          address={addressToDelete}
          onCancel={() => setAddressToDelete(null)}
          onConfirm={handleDeleteAddress}
        />
      </div>

      <AlertDialog open={showEmailConfirm} onOpenChange={setShowEmailConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar cambio de correo</AlertDialogTitle>
            <AlertDialogDescription>
              Si cambias tu correo deberás iniciar sesión nuevamente para proteger tu cuenta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                try {
                  await saveProfile();
                } catch (err) {
                  console.error("Error guardando perfil", err);
                  showRequestError(err, "Hubo un error al guardar los cambios");
                } finally {
                  setShowEmailConfirm(false);
                }
              }}
            >
              Continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
