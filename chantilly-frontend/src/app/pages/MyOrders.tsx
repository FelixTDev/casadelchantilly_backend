import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { ChevronRight, Clock, Download, FileText, ShoppingBag } from "lucide-react";
import { PaymentStatusBadge, StatusBadge, toUiStatus } from "../components/shared";
import { pedidoService, PedidoApi } from "../../services/pedidoService";
import { AuthBreadcrumbs } from "../components/AuthBreadcrumbs";
import { showRequestError } from "../../lib/notifyError";

export default function MyOrders() {
  const [orders, setOrders] = useState<PedidoApi[]>([]);
  const [filter, setFilter] = useState<"TODOS" | "EN_CURSO" | "COMPLETADOS">("TODOS");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const descargarBoleta = async (id: number) => {
    try {
      const response = await pedidoService.descargarBoleta(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `boleta-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error descargando boleta", error);
      showRequestError(error, "No se pudo descargar la boleta");
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const response = await pedidoService.getMisPedidos();
        const sorted = response.data.sort((a, b) => new Date(b.creadoEn || 0).getTime() - new Date(a.creadoEn || 0).getTime());
        setOrders(sorted);
      } catch (error) {
        console.error("Error cargando pedidos", error);
        setLoadError("No se pudieron cargar tus pedidos en este momento.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredOrders = useMemo(() => {
    if (filter === "EN_CURSO") {
      return orders.filter((order) => ["PENDIENTE", "EN_PREPARACION", "LISTO", "EN_RUTA"].includes(order.estado));
    }
    if (filter === "COMPLETADOS") {
      return orders.filter((order) => ["ENTREGADO", "CANCELADO", "RECHAZADO"].includes(order.estado));
    }
    return orders;
  }, [orders, filter]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" }).replace(".", "");
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] px-4 py-10" style={{ fontFamily: "Poppins" }}>
      <div className="mx-auto max-w-5xl">
        <AuthBreadcrumbs items={[{ label: "Inicio", to: "/" }, { label: "Mi cuenta", to: "/perfil" }, { label: "Mis pedidos" }]} />
        <h1 className="mb-8 text-3xl font-extrabold text-gray-900">Mis Pedidos</h1>

        <div className="mb-6 flex gap-2 overflow-x-auto border-b border-gray-200 pb-2">
          {(["TODOS", "EN_CURSO", "COMPLETADOS"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${filter === tab ? "bg-gray-900 text-white shadow-md" : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-100"}`}
            >
              {tab === "TODOS" ? "Todos los pedidos" : tab === "EN_CURSO" ? "En curso" : "Completados"}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center p-12">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-red-600" />
            </div>
          ) : loadError ? (
            <div className="rounded-2xl border border-red-100 bg-white p-12 text-center shadow-sm">
              <h3 className="mb-2 text-xl font-bold text-gray-800">No pudimos cargar tus pedidos</h3>
              <p className="mb-6 text-gray-500">{loadError}</p>
              <Link to="/catalogo" className="inline-block rounded-xl bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700">
                Volver al Catálogo
              </Link>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-50">
                <ShoppingBag className="h-10 w-10 text-gray-300" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-800">No hay pedidos aquí</h3>
              <p className="mb-6 text-gray-500">Aún no tienes pedidos en esta categoría.</p>
              <Link to="/catalogo" className="inline-block rounded-xl bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700">
                Ir al Catálogo
              </Link>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <Link to={`/pedido/${order.id}`} key={order.id} className="block group">
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:border-red-200 group-hover:shadow-lg">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <p className="text-lg font-bold text-gray-900">{order.codigoPedido || `Pedido #${order.id}`}</p>
                        <StatusBadge status={toUiStatus(order.estado)} />
                      </div>
                      <p className="text-sm font-medium text-gray-500">
                        {formatDate(order.creadoEn)} <span className="mx-1">•</span> {order.items?.length || 0} producto(s)
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4 text-gray-400" />
                          Pago: <PaymentStatusBadge status={order.pago?.estadoPago} />
                        </div>
                        {order.pago?.metodoPago && (
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">
                            {order.pago.metodoPago}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-5 border-t border-gray-100 pt-4 sm:border-t-0 sm:pt-0">
                      <div className="flex flex-col gap-2 sm:items-end">
                        <span className="text-lg font-extrabold text-gray-900">S/ {Number(order.total || 0).toFixed(2)}</span>
                        {order.estado === "ENTREGADO" && (
                          <button
                            onClick={(event) => {
                              event.preventDefault();
                              descargarBoleta(order.id);
                            }}
                            className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-bold text-gray-700 transition hover:bg-gray-100 hover:text-gray-900 sm:w-auto"
                          >
                            <Download className="h-3.5 w-3.5" />
                            Descargar Boleta
                          </button>
                        )}
                      </div>
                      <ChevronRight className="hidden h-5 w-5 text-gray-300 transition-colors group-hover:text-red-500 sm:block" />
                    </div>
                  </div>

                  {order.pago?.referencia && (
                    <div className="mt-4 rounded-2xl bg-gray-50 px-4 py-3 text-xs text-gray-500">
                      <FileText className="mr-2 inline h-3.5 w-3.5" />
                      Referencia registrada: <span className="font-semibold text-gray-700">{order.pago.referencia}</span>
                    </div>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
