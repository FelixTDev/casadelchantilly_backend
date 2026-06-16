import { Building, Lock, MapPin, X } from "lucide-react";
import { BtnPrimary } from "../../components/shared";
import type { DireccionApi } from "../../../services/usuarioService";

type AddressForm = {
  etiqueta: string;
  direccion: string;
  telefono: string;
};

type PasswordForm = {
  passwordActual: string;
  passwordNueva: string;
  confirmPasswordNueva: string;
};

export function ProfileAddressModal({
  open,
  editingAddressId,
  form,
  errors,
  saving,
  onClose,
  onChange,
  onSubmit,
}: {
  open: boolean;
  editingAddressId: number | null;
  form: AddressForm;
  errors: Record<string, string>;
  saving: boolean;
  onClose: () => void;
  onChange: (field: keyof AddressForm, value: string) => void;
  onSubmit: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4 backdrop-blur-sm transition-all">
      <div className="w-full max-w-md animate-in zoom-in rounded-2xl bg-white shadow-2xl duration-200 fade-in">
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-4">
          <h3 className="text-lg font-bold text-gray-800">{editingAddressId ? "Editar Dirección" : "Nueva Dirección"}</h3>
          <button onClick={onClose} className="rounded-full bg-white p-1.5 text-gray-400 shadow-sm transition-colors hover:text-red-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-5 p-6">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-700">Etiqueta</label>
            <input placeholder="Ej: Casa, Trabajo, Otro" value={form.etiqueta} onChange={(e) => onChange("etiqueta", e.target.value)} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500" />
            {errors.etiqueta && <p className="mt-2 text-sm text-red-600">{errors.etiqueta}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-700">Dirección Completa</label>
            <textarea placeholder="Ingresa calle, número, distrito y referencias..." rows={3} value={form.direccion} onChange={(e) => onChange("direccion", e.target.value)} className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500" />
            {errors.direccion && <p className="mt-2 text-sm text-red-600">{errors.direccion}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-700">Teléfono (Quien recibe)</label>
            <input placeholder="Opcional" value={form.telefono} onChange={(e) => onChange("telefono", e.target.value)} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500" inputMode="numeric" />
            {errors.telefono && <p className="mt-2 text-sm text-red-600">{errors.telefono}</p>}
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-gray-600 transition-colors hover:text-gray-800">Cancelar</button>
          <BtnPrimary onClick={onSubmit} disabled={saving} className="px-6 py-2.5 text-sm shadow-md">
            {saving ? "Guardando..." : "Guardar Dirección"}
          </BtnPrimary>
        </div>
      </div>
    </div>
  );
}

export function ProfilePasswordModal({
  open,
  form,
  errors,
  saving,
  onClose,
  onChange,
  onSubmit,
}: {
  open: boolean;
  form: PasswordForm;
  errors: Record<string, string>;
  saving: boolean;
  onClose: () => void;
  onChange: (field: keyof PasswordForm, value: string) => void;
  onSubmit: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4 backdrop-blur-sm transition-all">
      <div className="w-full max-w-md animate-in zoom-in rounded-2xl bg-white shadow-2xl duration-200 fade-in">
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-4">
          <h3 className="flex items-center gap-2 text-lg font-bold text-gray-800"><Lock className="h-5 w-5 text-gray-500" /> Cambiar Contraseña</h3>
          <button onClick={onClose} className="rounded-full bg-white p-1.5 text-gray-400 shadow-sm transition-colors hover:text-red-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-5 p-6">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-700">Contraseña Actual</label>
            <input type="password" placeholder="Tu contraseña actual" value={form.passwordActual} onChange={(e) => onChange("passwordActual", e.target.value)} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500" />
            {errors.passwordActual && <p className="mt-2 text-sm text-red-600">{errors.passwordActual}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-700">Nueva Contraseña</label>
            <input type="password" placeholder="Mínimo 6 caracteres" value={form.passwordNueva} onChange={(e) => onChange("passwordNueva", e.target.value)} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500" />
            <p className="mt-2 text-xs text-gray-500">Debe tener al menos 6 caracteres.</p>
            {errors.passwordNueva && <p className="mt-2 text-sm text-red-600">{errors.passwordNueva}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-700">Confirmar Nueva Contraseña</label>
            <input type="password" placeholder="Repite la nueva contraseña" value={form.confirmPasswordNueva} onChange={(e) => onChange("confirmPasswordNueva", e.target.value)} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500" />
            {errors.confirmPasswordNueva && <p className="mt-2 text-sm text-red-600">{errors.confirmPasswordNueva}</p>}
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-gray-600 transition-colors hover:text-gray-800">Cancelar</button>
          <BtnPrimary onClick={onSubmit} disabled={saving} className="px-6 py-2.5 text-sm shadow-md">
            {saving ? "Actualizando..." : "Actualizar Contraseña"}
          </BtnPrimary>
        </div>
      </div>
    </div>
  );
}

export function ProfileDeleteAddressModal({
  address,
  onCancel,
  onConfirm,
}: {
  address: DireccionApi | null;
  onCancel: () => void;
  onConfirm: (id: number) => void;
}) {
  if (!address) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4 backdrop-blur-sm transition-all">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="border-b border-gray-100 px-6 py-4">
          <h3 className="text-lg font-bold text-gray-800">Eliminar dirección</h3>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-600">Se eliminará la dirección <strong>{address.etiqueta}</strong>. Esta acción no se puede deshacer.</p>
        </div>
        <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">
          <button onClick={onCancel} className="px-5 py-2.5 text-sm font-bold text-gray-600 transition-colors hover:text-gray-800">Cancelar</button>
          <BtnPrimary onClick={() => onConfirm(address.id || 0)} className="px-6 py-2.5 text-sm shadow-md">Eliminar</BtnPrimary>
        </div>
      </div>
    </div>
  );
}

export function AddressIcon({ etiqueta }: { etiqueta: string }) {
  return etiqueta.toLowerCase().includes("trabajo") || etiqueta.toLowerCase().includes("oficina")
    ? <Building className="h-5 w-5" />
    : <MapPin className="h-5 w-5" />;
}
