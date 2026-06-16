import React, { useEffect, useMemo, useState } from "react";
import { CreditCard, Filter, RefreshCcw, Search, Wallet } from "lucide-react";
import { PaymentStatusBadge } from "../../components/shared";
import { pagoService, PagoApi } from "../../../services/pagoService";
import { toast } from "sonner";
import { showRequestError } from "../../../lib/notifyError";

const PAYMENT_STATUSES = ["PENDIENTE", "CONFIRMADO", "RECHAZADO", "EXPIRADO", "REEMBOLSADO"];
const PAYMENT_METHODS = ["EFECTIVO", "YAPE", "PLIN", "TRANSFERENCIA"];

function isManualMethod(method?: string) {
  return ["YAPE", "PLIN", "TRANSFERENCIA"].includes((method || "").toUpperCase());
}

export default function AdminPayments() {
  const [payments, setPayments] = useState<PagoApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [selected, setSelected] = useState<PagoApi | null>(null);
  const [nextStatus, setNextStatus] = useState("PENDIENTE");
  const [reference, setReference] = useState("");
  const [saving, setSaving] = useState(false);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const response = await pagoService.getTodos({
        estado: statusFilter || undefined,
        metodo: methodFilter || undefined,
      });
      setPayments(response.data);
    } catch (error) {
      console.error("Error cargando pagos", error);
      showRequestError(error, "No se pudieron cargar los pagos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [statusFilter, methodFilter]);

  useEffect(() => {
    if (!selected) return;
    setNextStatus(selected.estadoPago || "PENDIENTE");
    setReference(selected.referencia || "");
  }, [selected]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return payments;
    return payments.filter((payment) =>
      [payment.codigoPedido, payment.clienteNombre, payment.referencia, payment.metodoPago]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(term))
    );
  }, [payments, search]);

  const handleSave = async () => {
    if (!selected?.id) return;
    if (isManualMethod(selected.metodoPago) && !reference.trim()) {
      toast.error("Ingresa la referencia o comprobante antes de guardar");
      return;
    }
    try {
      setSaving(true);
      await pagoService.actualizarEstado(selected.id, {
        estadoPago: nextStatus,
        referencia: reference.trim() || undefined,
      });
      toast.success("Pago actualizado correctamente");
      setSelected(null);
      await loadPayments();
    } catch (error) {
      console.error("Error actualizando pago", error);
      showRequestError(error, "No se pudo actualizar el pago");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ fontFamily: "Poppins" }}>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">Gestión de Pagos</h2>
          <p className="mt-1 flex items-center gap-2 text-sm font-medium text-gray-500">
            <Wallet className="h-4 w-4" />
            {payments.length} pagos cargados
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative min-w-[250px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por pedido, cliente o referencia"
              className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm shadow-sm outline-none transition focus:border-[#D32F2F] focus:ring-4 focus:ring-red-500/10"
            />
          </div>
          <button
            onClick={loadPayments}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
          >
            <RefreshCcw className="h-4 w-4" />
            Actualizar
          </button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 rounded-3xl bg-white p-5 shadow-sm md:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Pendientes</p>
          <p className="mt-2 text-2xl font-extrabold text-gray-900">{payments.filter((payment) => payment.estadoPago === "PENDIENTE").length}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Confirmados</p>
          <p className="mt-2 text-2xl font-extrabold text-gray-900">{payments.filter((payment) => payment.estadoPago === "CONFIRMADO").length}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Con referencia</p>
          <p className="mt-2 text-2xl font-extrabold text-gray-900">{payments.filter((payment) => payment.referencia).length}</p>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-3 rounded-3xl bg-white p-5 shadow-sm md:flex-row md:items-center">
        <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
          <Filter className="h-4 w-4" />
          Filtros
        </div>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 outline-none transition focus:border-[#D32F2F] focus:ring-4 focus:ring-red-500/10"
        >
          <option value="">Todos los estados</option>
          {PAYMENT_STATUSES.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        <select
          value={methodFilter}
          onChange={(event) => setMethodFilter(event.target.value)}
          className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 outline-none transition focus:border-[#D32F2F] focus:ring-4 focus:ring-red-500/10"
        >
          <option value="">Todos los métodos</option>
          {PAYMENT_METHODS.map((method) => (
            <option key={method} value={method}>{method}</option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Pedido</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Cliente</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Método</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Estado</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Monto</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Referencia</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Acción</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-sm text-gray-500">Cargando pagos...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-sm text-gray-500">No se encontraron pagos con esos filtros.</td>
                </tr>
              ) : filtered.map((payment) => (
                <tr key={payment.id} className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/60">
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900">{payment.codigoPedido || `#${payment.pedidoId}`}</p>
                    <p className="text-xs text-gray-500">{payment.modalidadEntrega || "-"}</p>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-700">{payment.clienteNombre || "-"}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-700">{payment.metodoPago}</td>
                  <td className="px-6 py-4"><PaymentStatusBadge status={payment.estadoPago} /></td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">S/ {Number(payment.monto || 0).toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{payment.referencia || "Sin referencia"}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelected(payment)}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#D32F2F] px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700"
                    >
                      <CreditCard className="h-4 w-4" />
                      Gestionar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col bg-white shadow-2xl" style={{ fontFamily: "Poppins" }}>
            <div className="border-b border-gray-100 px-6 py-5">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Pago</p>
              <h3 className="mt-1 text-xl font-extrabold text-gray-900">{selected.codigoPedido || `#${selected.pedidoId}`}</h3>
              <p className="mt-1 text-sm text-gray-500">{selected.clienteNombre || "Cliente"} • {selected.metodoPago}</p>
            </div>
            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Estado actual</p>
                <div className="mt-3">
                  <PaymentStatusBadge status={selected.estadoPago} />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">Nuevo estado</label>
                <select
                  value={nextStatus}
                  onChange={(event) => setNextStatus(event.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 outline-none transition focus:border-[#D32F2F] focus:ring-4 focus:ring-red-500/10"
                >
                  {PAYMENT_STATUSES.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">Referencia o comprobante</label>
                <textarea
                  value={reference}
                  onChange={(event) => setReference(event.target.value)}
                  rows={4}
                  placeholder="N° de operación, banco, observación o referencia validada"
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-[#D32F2F] focus:ring-4 focus:ring-red-500/10"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Obligatorio para Yape, Plin y transferencia.
                </p>
              </div>
            </div>
            <div className="flex gap-3 border-t border-gray-100 bg-gray-50 px-6 py-5">
              <button
                onClick={() => setSelected(null)}
                className="flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
              >
                Cerrar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 rounded-2xl bg-[#D32F2F] px-4 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
