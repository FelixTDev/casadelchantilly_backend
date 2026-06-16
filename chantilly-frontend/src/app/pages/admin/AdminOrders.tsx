import React, { useEffect, useMemo, useState } from "react";
import { Calendar, ChevronDown, CreditCard, Hash, MapPin, PackageSearch, Receipt, ScrollText, User, Wallet } from "lucide-react";
import { PaymentStatusBadge, StatusBadge, toUiStatus } from "../../components/shared";
import { pedidoService, PedidoApi } from "../../../services/pedidoService";
import { toast } from "sonner";
import { showRequestError } from "../../../lib/notifyError";

const ALL_STATUSES = ["PENDIENTE", "EN_PREPARACION", "LISTO", "EN_RUTA", "ENTREGADO", "CANCELADO", "RECHAZADO"];

function formatStatusName(status: string) {
  return status.split("_").map((word) => word.charAt(0) + word.slice(1).toLowerCase()).join(" ");
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<PedidoApi[]>([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [selected, setSelected] = useState<PedidoApi | null>(null);

  const loadOrders = async () => {
    try {
      const response = await pedidoService.getTodos();
      setOrders(response.data.sort((a, b) => b.id - a.id));
    } catch (error) {
      console.error("Error cargando pedidos admin", error);
      showRequestError(error, "No se pudieron cargar los pedidos");
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filtered = useMemo(() => orders.filter((order) => !filterStatus || order.estado === filterStatus), [orders, filterStatus]);

  const changeStatus = async (id: number, newStatus: string) => {
    try {
      await pedidoService.cambiarEstado(id, newStatus);
      await loadOrders();
      if (selected?.id === id) {
        const response = await pedidoService.getById(id);
        setSelected(response.data);
      }
      toast.success("Estado del pedido actualizado");
    } catch (error) {
      console.error("Error cambiando estado", error);
      showRequestError(error, "No se pudo cambiar el estado del pedido");
    }
  };

  return (
    <div style={{ fontFamily: "Poppins" }}>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="mb-1 text-2xl font-extrabold tracking-tight text-gray-900">Gestión de Pedidos</h2>
          <p className="flex items-center gap-1.5 text-sm font-medium text-gray-500">
            <Receipt className="h-4 w-4" />
            {orders.length} pedidos registrados en total
          </p>
        </div>
      </div>

      <div className="mb-8 overflow-x-auto pb-2" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        <div className="inline-flex items-center gap-1.5 rounded-2xl border border-gray-200 bg-gray-100/80 p-1.5">
          <button
            onClick={() => setFilterStatus("")}
            className={`rounded-xl px-5 py-2.5 text-sm font-bold transition-all whitespace-nowrap ${!filterStatus ? "border border-gray-200/50 bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:bg-gray-200/50 hover:text-gray-700"}`}
          >
            Todos los pedidos
          </button>
          <div className="mx-1 h-6 w-px bg-gray-300" />
          {ALL_STATUSES.map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(filterStatus === status ? "" : status)}
              className={`rounded-xl px-4 py-2.5 text-sm font-bold transition-all whitespace-nowrap ${filterStatus === status ? "border border-gray-200/50 bg-white text-[#D32F2F] shadow-sm" : "text-gray-500 hover:bg-gray-200/50 hover:text-gray-700"}`}
            >
              {formatStatusName(status)}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full" style={{ fontSize: 14 }}>
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Orden</th>
                <th className="hidden px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500 sm:table-cell">Cliente</th>
                <th className="hidden px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500 md:table-cell">Fecha</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Total</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Pedido</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Pago</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Acción</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50">
                        <PackageSearch className="h-7 w-7 text-gray-300" />
                      </div>
                      <p className="font-medium text-gray-400">No se encontraron pedidos con este estado</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.map((order) => (
                <tr key={order.id} className="group border-b border-gray-50 transition-colors hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <div className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-100 px-2.5 py-1.5 text-xs font-bold text-gray-700 shadow-sm">
                      <Hash className="h-3.5 w-3.5 text-gray-400" />
                      {order.codigoPedido}
                    </div>
                  </td>
                  <td className="hidden px-6 py-4 sm:table-cell">
                    <div>
                      <p className="font-semibold text-gray-800">{order.clienteNombre || "Cliente"}</p>
                      <p className="text-xs text-gray-500">{order.clienteEmail || "-"}</p>
                    </div>
                  </td>
                  <td className="hidden px-6 py-4 font-medium text-gray-500 md:table-cell">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {order.creadoEn ? order.creadoEn.slice(0, 10) : "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-extrabold text-gray-900">S/ {Number(order.total || 0).toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={toUiStatus(order.estado)} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2">
                      <PaymentStatusBadge status={order.pago?.estadoPago} />
                      {order.pago?.metodoPago && <span className="text-xs font-bold text-gray-500">{order.pago.metodoPago}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2">
                      <div className="relative inline-block w-full min-w-[140px] max-w-[180px]">
                        <select
                          value={order.estado}
                          onChange={(event) => changeStatus(order.id, event.target.value)}
                          className="w-full appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-3 pr-8 text-xs font-bold text-gray-700 shadow-sm transition-all hover:border-gray-300 focus:border-[#D32F2F] focus:outline-none focus:ring-4 focus:ring-red-500/10"
                        >
                          {ALL_STATUSES.map((status) => (
                            <option key={status} value={status}>{formatStatusName(status)}</option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-400">
                          <ChevronDown className="h-4 w-4" />
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          const response = await pedidoService.getById(order.id);
                          setSelected(response.data);
                        }}
                        className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
                      >
                        Ver detalle
                      </button>
                    </div>
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
          <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl" style={{ fontFamily: "Poppins" }}>
            <div className="border-b border-gray-100 px-6 py-5">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Pedido</p>
              <h3 className="mt-1 text-xl font-extrabold text-gray-900">{selected.codigoPedido}</h3>
              <div className="mt-3 flex flex-wrap gap-3">
                <StatusBadge status={toUiStatus(selected.estado)} />
                <PaymentStatusBadge status={selected.pago?.estadoPago} />
              </div>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-gray-700">
                    <User className="h-4 w-4 text-gray-400" />
                    <p className="font-bold">Cliente</p>
                  </div>
                  <p className="font-semibold text-gray-800">{selected.clienteNombre || "-"}</p>
                  <p className="text-sm text-gray-500">{selected.clienteEmail || "-"}</p>
                  <p className="text-sm text-gray-500">{selected.clienteTelefono || "-"}</p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-gray-700">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <p className="font-bold">Entrega</p>
                  </div>
                  <p className="font-semibold text-gray-800">{selected.modalidadEntrega}</p>
                  <p className="text-sm text-gray-500">{selected.direccionDetalle || "Sin dirección asociada"}</p>
                  {selected.fechaEntrega && <p className="mt-2 text-sm text-gray-500">Fecha: {selected.fechaEntrega}</p>}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <div className="mb-3 flex items-center gap-2 text-gray-700">
                  <CreditCard className="h-4 w-4 text-gray-400" />
                  <p className="font-bold">Pago</p>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Método</p>
                    <p className="mt-1 text-sm font-semibold text-gray-800">{selected.pago?.metodoPago || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Estado</p>
                    <div className="mt-1"><PaymentStatusBadge status={selected.pago?.estadoPago} /></div>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Referencia</p>
                    <p className="mt-1 text-sm font-semibold text-gray-800">{selected.pago?.referencia || "Sin referencia"}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <div className="mb-3 flex items-center gap-2 text-gray-700">
                  <Receipt className="h-4 w-4 text-gray-400" />
                  <p className="font-bold">Ítems</p>
                </div>
                <div className="space-y-3">
                  {selected.items.map((item) => (
                    <div key={item.id} className="rounded-xl bg-white px-4 py-3 shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-gray-800">{item.cantidad}x {item.nombreProducto}</p>
                          {item.personalizacion && <p className="mt-1 text-xs text-gray-500">Dedicatoria: {item.personalizacion}</p>}
                        </div>
                        <p className="font-bold text-gray-900">S/ {Number(item.subtotal || 0).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <div className="mb-3 flex items-center gap-2 text-gray-700">
                  <ScrollText className="h-4 w-4 text-gray-400" />
                  <p className="font-bold">Historial</p>
                </div>
                <div className="space-y-3">
                  {selected.historialEstados.map((history) => (
                    <div key={history.id} className="rounded-xl bg-white px-4 py-3 shadow-sm">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <p className="font-semibold text-gray-800">{history.comentario || history.estado}</p>
                        <span className="text-xs text-gray-400">{history.creadoEn ? new Date(history.creadoEn).toLocaleString("es-PE") : "-"}</span>
                      </div>
                      {history.cambiadoPorNombre && <p className="mt-1 text-xs text-gray-500">Por: {history.cambiadoPorNombre}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 bg-gray-50 px-6 py-5">
              <button
                onClick={() => setSelected(null)}
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
              >
                Cerrar detalle
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
