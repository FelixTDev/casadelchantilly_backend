import React from "react";
import { AlertCircle, ChevronLeft, ChevronRight, Inbox, Loader2 } from "lucide-react";

export function AdminPanel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-3xl border border-white/70 bg-white/95 ${className}`}
      style={{ boxShadow: "0 18px 45px -22px rgba(15, 23, 42, 0.18)" }}
    >
      {children}
    </div>
  );
}

export function AdminLoadingState({ message = "Cargando..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-[#D32F2F]">
        <Loader2 className="h-7 w-7 animate-spin" />
      </div>
      <p className="text-sm font-semibold text-gray-500">{message}</p>
    </div>
  );
}

export function AdminEmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 text-gray-300">
        <Inbox className="h-10 w-10" />
      </div>
      <h3 className="text-xl font-extrabold text-gray-900">{title}</h3>
      <p className="mt-2 max-w-md text-sm font-medium leading-relaxed text-gray-500">{description}</p>
    </div>
  );
}

export function AdminErrorState({
  title = "No se pudo cargar la información",
  description = "Intenta nuevamente en unos segundos.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-[#D32F2F]">
        <AlertCircle className="h-10 w-10" />
      </div>
      <h3 className="text-xl font-extrabold text-gray-900">{title}</h3>
      <p className="mt-2 max-w-md text-sm font-medium leading-relaxed text-gray-500">{description}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-6 rounded-2xl bg-gray-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-black"
        >
          Reintentar
        </button>
      )}
    </div>
  );
}

export function AdminFilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-2 text-xs font-bold transition ${
        active
          ? "border-[#D32F2F] bg-red-50 text-[#D32F2F]"
          : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700"
      }`}
    >
      {label}
    </button>
  );
}

export function AdminBooleanBadge({
  active,
  activeLabel = "Activo",
  inactiveLabel = "Inactivo",
}: {
  active: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
}) {
  return active ? (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
      </span>
      {activeLabel}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-bold text-gray-500">
      {inactiveLabel}
    </span>
  );
}

export function AdminPagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
        Página {page} de {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
