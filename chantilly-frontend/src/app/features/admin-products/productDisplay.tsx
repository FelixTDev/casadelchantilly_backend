import { Trash2 } from "lucide-react";
import type { BulkConfirmState, ViewProduct } from "./types";

const CAT_COLORS: Record<string, { bg: string; text: string }> = {
  Tortas: { bg: "#fef3c7", text: "#92400e" },
  Cupcakes: { bg: "#fce7f3", text: "#9d174d" },
  Cheesecakes: { bg: "#ede9fe", text: "#5b21b6" },
  Especiales: { bg: "#d1fae5", text: "#065f46" },
  Combos: { bg: "#dbeafe", text: "#1e40af" },
  Pasteles: { bg: "#ffedd5", text: "#9a3412" },
};

export function getProductCategoryStyle(nombre: string) {
  return CAT_COLORS[nombre] || { bg: "#f3f4f6", text: "#374151" };
}

export function ProductStockBadge({ stock }: { stock: number }) {
  if (stock <= 0) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>Agotado
      </span>
    );
  }

  if (stock <= 5) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-100 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-600">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span>{stock} unid.
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-green-100 bg-green-50 px-3 py-1.5 text-xs font-bold text-green-600">
      <span className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>{stock} unid.
    </span>
  );
}

export function DeleteProductModal({
  product,
  onConfirm,
  onCancel,
}: {
  product: ViewProduct;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)" }}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl" style={{ fontFamily: "Poppins" }}>
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
          <Trash2 className="h-7 w-7 text-[#D32F2F]" />
        </div>
        <h3 className="mb-2 text-center text-xl font-extrabold text-gray-900">¿Desactivar producto?</h3>
        <p className="mb-1 text-center text-sm text-gray-500">Se marcará como inactivo:</p>
        <p className="mb-6 text-center font-bold text-gray-800">"{product.nombre}"</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 rounded-xl border-2 border-gray-200 py-3 text-sm font-bold text-gray-600 transition hover:bg-gray-50">
            Cancelar
          </button>
          <button onClick={onConfirm} className="flex-1 rounded-xl bg-[#D32F2F] py-3 text-sm font-bold text-white shadow-lg shadow-red-900/20 transition hover:bg-red-700">
            Sí, desactivar
          </button>
        </div>
      </div>
    </div>
  );
}

export function BulkConfirmModal({
  config,
  onClose,
}: {
  config: BulkConfirmState;
  onClose: () => void;
}) {
  if (!config) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)" }}>
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl" style={{ fontFamily: "Poppins" }}>
        <h3 className="text-xl font-extrabold text-gray-900">{config.title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-gray-500">{config.description}</p>
        <div className="mt-6 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-2xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50">
            Cancelar
          </button>
          <button
            onClick={async () => {
              await config.onConfirm();
              onClose();
            }}
            className="flex-1 rounded-2xl bg-[#D32F2F] px-4 py-3 text-sm font-bold text-white transition hover:bg-red-700"
          >
            {config.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  return <p className="mt-2 text-xs font-semibold text-red-600">{error}</p>;
}
