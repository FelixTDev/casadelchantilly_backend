import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { Banknote, Building, Check, CreditCard, FileCheck2, Lock, MapPin, ShieldCheck, Smartphone, Tag, Truck, Wallet, X } from "lucide-react";
import { BtnPrimary, PaymentStatusBadge } from "../components/shared";
import { useApp } from "../context/AppContext";
import { usuarioService, DireccionApi } from "../../services/usuarioService";
import { pedidoService } from "../../services/pedidoService";
import { pagoService } from "../../services/pagoService";
import { productoService, PromocionApi } from "../../services/productoService";
import { useCartStore } from "../../services/useCartStore";
import { toast } from "sonner";
import { getLocalDateInputValue } from "../lib/validation";
import { AuthBreadcrumbs } from "../components/AuthBreadcrumbs";
import { FriendlyDatePicker } from "../features/checkout/components/FriendlyDatePicker";
import { CheckoutStatusOverview } from "../features/checkout/components/CheckoutStatusOverview";
import { showRequestError } from "../../lib/notifyError";

const PAYMENT_OPTIONS = [
  { value: "EFECTIVO", label: "Efectivo", icon: Banknote, description: "Pago contra entrega o en tienda." },
  { value: "YAPE", label: "Yape", icon: Smartphone, description: "Comparte tu número de operación para validar más rápido." },
  { value: "PLIN", label: "Plin", icon: Smartphone, description: "Registra tu comprobante o referencia de pago." },
  { value: "TRANSFERENCIA", label: "Transferencia", icon: Building, description: "Ingresa banco, operación o referencia bancaria." },
];

function requiresReference(method: string) {
  return ["YAPE", "PLIN", "TRANSFERENCIA"].includes(method);
}

export default function Checkout() {
  const { cart, clearCart } = useApp();
  const syncCartFromApi = useCartStore((state) => state.syncFromApi);
  const navigate = useNavigate();

  const [direcciones, setDirecciones] = useState<DireccionApi[]>([]);
  const [modalidad, setModalidad] = useState<"DELIVERY" | "RECOJO_TIENDA">("DELIVERY");
  const [direccionId, setDireccionId] = useState<number | null>(null);
  const minDate = getLocalDateInputValue();
  const [date, setDate] = useState(minDate);
  const [payment, setPayment] = useState("EFECTIVO");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [dateError, setDateError] = useState("");
  const [referenceError, setReferenceError] = useState("");
  const [checkoutBlocked, setCheckoutBlocked] = useState(false);

  const [promociones, setPromociones] = useState<PromocionApi[]>([]);
  const [codigoCupon, setCodigoCupon] = useState("");
  const [cuponAplicado, setCuponAplicado] = useState<PromocionApi | null>(null);
  const [cuponError, setCuponError] = useState("");

  useEffect(() => {
    void syncCartFromApi();

    const loadDirecciones = async () => {
      try {
        const response = await usuarioService.getDirecciones();
        setDirecciones(response.data);
        if (response.data.length > 0) setDireccionId(response.data[0].id || null);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          setCheckoutBlocked(true);
          return;
        }
        showRequestError(error, "No se pudieron cargar tus direcciones");
      }
    };

    const loadPromociones = async () => {
      try {
        const response = await productoService.getPromociones();
        setPromociones(response.data.filter((promo) => promo.activo && promo.codigoCupon));
      } catch {
        setPromociones([]);
      }
    };

    loadDirecciones();
    loadPromociones();
  }, [syncCartFromApi]);

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const delivery = modalidad === "DELIVERY" ? 5 : 0;

  const descuento = useMemo(() => {
    if (!cuponAplicado) return 0;
    if (cuponAplicado.tipo === "PORCENTAJE") {
      return (subtotal * cuponAplicado.valor) / 100;
    }
    return Math.min(cuponAplicado.valor, subtotal);
  }, [cuponAplicado, subtotal]);

  const total = subtotal + delivery - descuento;
  const deliveryReady = modalidad === "RECOJO_TIENDA" ? !!date : !!date && !!direccionId;
  const paymentReady = requiresReference(payment) ? reference.trim().length > 0 : true;
  const orderReady = deliveryReady && paymentReady && cart.length > 0;

  const handleAplicarCupon = () => {
    setCuponError("");
    const codigo = codigoCupon.trim().toUpperCase();
    if (!codigo) {
      setCuponError("Ingresa un código de cupón.");
      return;
    }

    const hoy = getLocalDateInputValue();
    const promo = promociones.find(
      (item) => item.codigoCupon?.toUpperCase() === codigo && item.fechaInicio <= hoy && item.fechaFin >= hoy
    );

    if (!promo) {
      setCuponAplicado(null);
      setCuponError("Cupón no encontrado o vencido.");
      return;
    }

    if (subtotal <= 0) {
      setCuponError("Agrega productos al carrito antes de aplicar un cupón.");
      return;
    }

    setCuponAplicado(promo);
  };

  const handleQuitarCupon = () => {
    setCuponAplicado(null);
    setCodigoCupon("");
    setCuponError("");
  };

  const handleOrder = async () => {
    if (checkoutBlocked) {
      toast.error("Tu sesión ya no es válida. Vuelve a iniciar sesión para continuar.");
      navigate("/login");
      return;
    }

    if (!date || date < minDate) {
      setDateError("Selecciona una fecha válida a partir de hoy.");
      return;
    }
    if (modalidad === "DELIVERY" && !direccionId) {
      toast.error("Selecciona una dirección para el delivery.");
      return;
    }
    if (requiresReference(payment) && !reference.trim()) {
      setReferenceError("Ingresa la referencia o comprobante para este método de pago.");
      return;
    }

    try {
      setLoading(true);
      await syncCartFromApi();
      if (useCartStore.getState().cart.length === 0) {
        toast.error("Tu carrito cambió y ya no tiene productos disponibles. Revísalo antes de continuar.");
        navigate("/catalogo");
        return;
      }

      const pedidoRes = await pedidoService.crear({
        modalidadEntrega: modalidad,
        idDireccion: modalidad === "DELIVERY" ? direccionId : null,
        fechaEntrega: date,
        horaEntrega: null,
        notasCliente: notes.trim(),
        codigoCupon: cuponAplicado?.codigoCupon ?? undefined,
      });

      await pagoService.registrar(pedidoRes.data.id, {
        metodoPago: payment,
        referencia: reference.trim() || undefined,
      });

      await clearCart();
      navigate("/confirmacion", { state: { pedidoId: pedidoRes.data.id } });
    } catch (error) {
      await syncCartFromApi();
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setCheckoutBlocked(true);
        toast.error("Tu sesión ha expirado. Vuelve a iniciar sesión.");
        navigate("/login");
        return;
      }
      showRequestError(error, "No se pudo confirmar el pedido");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-800">Tu carrito está vacío</h1>
          <BtnPrimary onClick={() => navigate("/catalogo")}>Ir al Catálogo</BtnPrimary>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F5F3] px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <AuthBreadcrumbs items={[{ label: "Inicio", to: "/" }, { label: "Mis pedidos", to: "/mis-pedidos" }, { label: "Checkout" }]} />
        <h1 className="mb-2 text-3xl font-bold text-gray-800">Finalizar Compra</h1>
        <p className="mb-6 text-sm text-gray-600">Confirma entrega, método de pago y observaciones. El sistema registrará tu pedido y te llevará a una confirmación completa con boleta y seguimiento.</p>

        <CheckoutStatusOverview deliveryReady={deliveryReady} paymentReady={paymentReady} orderReady={orderReady} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <section id="entrega" className="rounded-3xl bg-white p-6 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.18)]">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-2xl bg-red-50 p-3 text-red-600"><MapPin className="h-5 w-5" /></div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-red-600">Bloque de entrega</p>
                  <h2 className="font-bold text-gray-800">Entrega</h2>
                  <p className="mt-1 text-sm text-gray-500">Define modalidad, dirección y fecha en la misma sección.</p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <label className={`cursor-pointer rounded-2xl border p-4 transition ${modalidad === "DELIVERY" ? "border-red-600 bg-red-50 ring-1 ring-red-600" : "border-gray-200 hover:border-red-300"}`}>
                  <input type="radio" checked={modalidad === "DELIVERY"} onChange={() => setModalidad("DELIVERY")} className="sr-only" />
                  <div className="flex items-center gap-3">
                    <Truck className={`h-5 w-5 ${modalidad === "DELIVERY" ? "text-red-600" : "text-gray-400"}`} />
                    <div>
                      <p className="font-bold text-gray-800">Delivery</p>
                      <p className="text-sm text-gray-600">Ideal si quieres recibir todo listo en casa u oficina.</p>
                    </div>
                  </div>
                </label>
                <label className={`cursor-pointer rounded-2xl border p-4 transition ${modalidad === "RECOJO_TIENDA" ? "border-red-600 bg-red-50 ring-1 ring-red-600" : "border-gray-200 hover:border-red-300"}`}>
                  <input type="radio" checked={modalidad === "RECOJO_TIENDA"} onChange={() => setModalidad("RECOJO_TIENDA")} className="sr-only" />
                  <div className="flex items-center gap-3">
                    <Wallet className={`h-5 w-5 ${modalidad === "RECOJO_TIENDA" ? "text-red-600" : "text-gray-400"}`} />
                    <div>
                      <p className="font-bold text-gray-800">Recojo en tienda</p>
                      <p className="text-sm text-gray-500">Más rápido si ya estás cerca o quieres evitar el envío.</p>
                    </div>
                  </div>
                </label>
              </div>

              {modalidad === "DELIVERY" && (
                <div className="mt-5 space-y-3">
                  {direcciones.length === 0 ? (
                    <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
                      No tienes direcciones registradas. Agrega una para continuar con delivery.
                    </div>
                  ) : (
                    <div className="grid gap-3 md:grid-cols-2">
                      {direcciones.map((direccion) => (
                        <button
                          key={direccion.id}
                          onClick={() => setDireccionId(direccion.id || null)}
                          className={`rounded-2xl border p-4 text-left transition ${direccionId === direccion.id ? "border-red-600 bg-red-50 ring-1 ring-red-600" : "border-gray-200 hover:border-red-300"}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-bold text-gray-800">{direccion.etiqueta}</p>
                              <p className="mt-1 text-sm text-gray-500">{direccion.direccion}</p>
                              {direccion.telefono && <p className="mt-2 text-xs font-semibold text-gray-400">Tel: {direccion.telefono}</p>}
                            </div>
                            {direccionId === direccion.id && <Check className="h-4 w-4 shrink-0 text-red-600" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  <button onClick={() => navigate("/perfil")} className="text-sm font-semibold text-red-600 transition hover:text-red-800">
                    + Administrar direcciones
                  </button>
                </div>
              )}

              <div className="mt-6">
                <label className="mb-2 block text-sm font-bold text-gray-700">Fecha de entrega</label>
                <FriendlyDatePicker
                  value={date}
                  minDate={minDate}
                  modalidad={modalidad}
                  error={dateError}
                  onChange={(nextDate) => {
                    setDate(nextDate);
                    setDateError("");
                  }}
                />
              </div>
            </section>

            <section id="pago" className="rounded-3xl bg-white p-6 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.18)]">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-2xl bg-red-50 p-3 text-red-600"><CreditCard className="h-5 w-5" /></div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-red-600">Bloque de pago</p>
                  <h2 className="font-bold text-gray-800">Pago</h2>
                  <p className="mt-1 text-sm text-gray-500">Selecciona el método y deja la referencia si necesita validación manual.</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {PAYMENT_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const active = payment === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => {
                        setPayment(option.value);
                        setReferenceError("");
                      }}
                      className={`relative rounded-2xl border p-4 text-left transition ${active ? "border-red-600 bg-red-50 ring-1 ring-red-600" : "border-gray-200 hover:border-red-300 hover:shadow-sm"}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`rounded-xl p-2.5 ${active ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500"}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                      <p className={`font-bold ${active ? "text-red-800" : "text-gray-700"}`}>{option.label}</p>
                      <p className="mt-1 text-xs text-gray-600">{option.description}</p>
                        </div>
                      </div>
                      {active && <Check className="absolute right-4 top-4 h-5 w-5 text-red-600" />}
                    </button>
                  );
                })}
              </div>

              {requiresReference(payment) && (
                <div className="mt-5">
                <label className="mb-2 block text-sm font-bold text-gray-700">Referencia / comprobante</label>
                <textarea
                    rows={3}
                    value={reference}
                    onChange={(event) => {
                      setReference(event.target.value);
                      setReferenceError("");
                    }}
                    placeholder="Ej: Operación 004582, Yape 987654321 o transferencia BCP 124578..."
                    className="w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 text-gray-700 outline-none transition focus:border-red-600"
                  />
                  <p className="mt-2 text-xs text-gray-500">Este dato será visible para validación manual desde el panel admin.</p>
                  {referenceError && <p className="mt-2 text-sm text-red-600">{referenceError}</p>}
                </div>
              )}

              <div className="mt-5">
                <label className="mb-2 block text-sm font-bold text-gray-700">Indicaciones para el pedido</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Ej: entregar en portería, tocar timbre, agregar vela o evitar llamadas..."
                  className="w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 text-gray-700 outline-none transition focus:border-red-600"
                />
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section id="resumen" className="sticky top-20 rounded-3xl bg-white p-6 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.18)]">
              <div className="mb-4 flex items-center gap-3 border-b pb-4">
                <div className="rounded-2xl bg-red-50 p-3 text-red-600"><FileCheck2 className="h-5 w-5" /></div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-red-600">Resumen y confirmación</p>
                  <h2 className="text-lg font-bold text-gray-800">Resumen del pedido</h2>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between gap-4 text-sm">
                    <span className="text-gray-600">{item.name} x{item.quantity}</span>
                    <span className="font-semibold text-gray-800">S/ {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Estado inicial del pago</p>
                    <p className="mt-1 text-sm text-gray-600">Quedará registrado apenas cierres el pedido.</p>
                  </div>
                  <PaymentStatusBadge status="PENDIENTE" />
                </div>
              </div>

              <div className="mt-5 border-t pt-4">
                <p className="mb-2 flex items-center gap-1 text-sm font-semibold text-gray-700">
                  <Tag className="h-4 w-4 text-red-600" />
                  Código de cupón
                </p>

                {cuponAplicado ? (
                  <div className="flex items-center justify-between rounded-2xl border border-green-300 bg-green-50 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-semibold tracking-wider text-green-700">{cuponAplicado.codigoCupon}</span>
                    </div>
                    <button onClick={handleQuitarCupon} className="text-gray-400 transition hover:text-red-600">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={codigoCupon}
                      onChange={(event) => {
                        setCodigoCupon(event.target.value.toUpperCase());
                        setCuponError("");
                      }}
                      placeholder="CODIGO10"
                      className="flex-1 rounded-2xl border border-gray-300 bg-gray-50 px-3 py-2 text-sm uppercase tracking-wider outline-none transition focus:border-red-600"
                    />
                    <button onClick={handleAplicarCupon} className="rounded-2xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700">
                      Aplicar
                    </button>
                  </div>
                )}
                {cuponError && <p className="mt-2 text-xs text-red-600">{cuponError}</p>}
              </div>

              <div className="mt-5 space-y-2 border-t pt-4 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span className="text-gray-800">S/ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span className="flex items-center gap-1"><Truck className="h-4 w-4" /> Delivery</span>
                  <span className="text-gray-800">S/ {delivery.toFixed(2)}</span>
                </div>
                {cuponAplicado && (
                  <div className="flex justify-between font-semibold text-green-600">
                    <span>Descuento</span>
                    <span>- S/ {descuento.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between border-t pt-4">
                <span className="text-lg font-bold text-gray-800">Total estimado</span>
                <span className="text-2xl font-bold text-red-600">S/ {total.toFixed(2)}</span>
              </div>

              <BtnPrimary
                className="mt-5 w-full py-3.5 text-lg shadow-md"
                onClick={handleOrder}
                disabled={loading || !orderReady || checkoutBlocked}
              >
                {loading ? "Procesando..." : "Registrar pedido"}
              </BtnPrimary>

              {checkoutBlocked ? (
                <p className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  Debes iniciar sesión nuevamente para completar el pedido.
                </p>
              ) : !orderReady && (
                <p className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                  Completa entrega y pago para habilitar el registro final del pedido.
                </p>
              )}

              <div className="mt-5 flex items-center justify-center gap-5 border-t border-gray-100 pt-5">
                <div className="flex flex-col items-center gap-1 text-center">
                  <ShieldCheck className="h-5 w-5 text-green-600" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Pago seguro</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-center">
                  <Lock className="h-5 w-5 text-blue-600" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Validación manual</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
