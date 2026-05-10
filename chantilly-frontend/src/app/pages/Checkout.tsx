import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { MapPin, CreditCard, Calendar, Truck, Tag, Check, X } from "lucide-react";
import { BtnPrimary } from "../components/shared";
import { useApp } from "../context/AppContext";
import { usuarioService, DireccionApi } from "../../services/usuarioService";
import { pedidoService } from "../../services/pedidoService";
import { pagoService } from "../../services/pagoService";
import { productoService, PromocionApi } from "../../services/productoService";
import { toast } from "sonner";

const PAYMENT_OPTIONS = [
  { value: "EFECTIVO", label: "Efectivo" },
  { value: "YAPE", label: "Yape" },
  { value: "PLIN", label: "Plin" },
  { value: "TRANSFERENCIA", label: "Transferencia Bancaria" },
];

export default function Checkout() {
  const { cart, clearCart } = useApp();
  const navigate = useNavigate();

  const [direcciones, setDirecciones] = useState<DireccionApi[]>([]);
  const [modalidad, setModalidad] = useState<"DELIVERY" | "RECOJO_TIENDA">("DELIVERY");
  const [direccionId, setDireccionId] = useState<number | null>(null);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [payment, setPayment] = useState("EFECTIVO");
  const [loading, setLoading] = useState(false);

  // ── Cupón ──────────────────────────────────────────────
  const [promociones, setPromociones] = useState<PromocionApi[]>([]);
  const [codigoCupon, setCodigoCupon] = useState("");
  const [cuponAplicado, setCuponAplicado] = useState<PromocionApi | null>(null);
  const [cuponError, setCuponError] = useState("");

  useEffect(() => {
    const loadDirecciones = async () => {
      try {
        const response = await usuarioService.getDirecciones();
        setDirecciones(response.data);
        if (response.data.length > 0) setDireccionId(response.data[0].id || null);
      } catch (error) {
        console.error("Error cargando direcciones", error);
      }
    };

    const loadPromociones = async () => {
      try {
        const res = await productoService.getPromociones();
        setPromociones(res.data.filter(p => p.activo && p.codigoCupon));
      } catch { /* silencioso */ }
    };

    loadDirecciones();
    loadPromociones();
  }, []);

  const subtotal = useMemo(() => cart.reduce((s, i) => s + i.price * i.quantity, 0), [cart]);
  const delivery = modalidad === "DELIVERY" ? 5 : 0;

  const descuento = useMemo(() => {
    if (!cuponAplicado) return 0;
    if (cuponAplicado.tipo === "PORCENTAJE") {
      return (subtotal * cuponAplicado.valor) / 100;
    }
    return Math.min(cuponAplicado.valor, subtotal);
  }, [cuponAplicado, subtotal]);

  const total = subtotal + delivery - descuento;

  const handleAplicarCupon = () => {
    setCuponError("");
    const codigo = codigoCupon.trim().toUpperCase();
    if (!codigo) { setCuponError("Ingresa un código de cupón."); return; }

    const hoy = new Date().toISOString().slice(0, 10);
    const promo = promociones.find(
      p => p.codigoCupon?.toUpperCase() === codigo &&
           p.fechaInicio <= hoy &&
           p.fechaFin >= hoy
    );

    if (!promo) {
      setCuponError("Cupón no encontrado o vencido.");
      setCuponAplicado(null);
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
    try {
      setLoading(true);
      const pedidoRes = await pedidoService.crear({
        modalidadEntrega: modalidad,
        idDireccion: modalidad === "DELIVERY" ? direccionId : null,
        fechaEntrega: date,
        horaEntrega: null,
        notasCliente: "",
        codigoCupon: cuponAplicado?.codigoCupon ?? undefined,
      });

      await pagoService.registrar(pedidoRes.data.id, { metodoPago: payment });
      await clearCart();
      navigate("/confirmacion", { state: { pedidoId: pedidoRes.data.id } });
    } catch (error) {
      console.error("Error creando pedido", error);
      const msg = (error as any)?.response?.data?.mensaje || "No se pudo confirmar el pedido";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-gray-800 mb-4 font-bold text-2xl">Tu carrito está vacío</h1>
        <BtnPrimary onClick={() => navigate("/catalogo")}>Ir al Catálogo</BtnPrimary>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-gray-800 mb-6 font-bold text-3xl">Finalizar Compra</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Columna izquierda ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Entrega */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-red-600" />
                <h2 className="text-gray-800 font-bold">Entrega</h2>
              </div>
              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={modalidad === "DELIVERY"} onChange={() => setModalidad("DELIVERY")} className="accent-red-600" />
                  <span className="text-gray-700 font-medium">Delivery</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={modalidad === "RECOJO_TIENDA"} onChange={() => setModalidad("RECOJO_TIENDA")} className="accent-red-600" />
                  <span className="text-gray-700 font-medium">Recojo en tienda</span>
                </label>
              </div>

              {modalidad === "DELIVERY" && (
                <select
                  value={direccionId ?? ""}
                  onChange={e => setDireccionId(Number(e.target.value))}
                  className="w-full mt-4 border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 focus:border-red-600 focus:outline-none text-gray-700"
                >
                  {direcciones.map(d => <option key={d.id} value={d.id}>{d.etiqueta} - {d.direccion}</option>)}
                </select>
              )}
            </div>

            {/* Fecha de entrega */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-red-600" />
                <h2 className="text-gray-800 font-bold">Fecha de Entrega</h2>
              </div>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 focus:border-red-600 focus:outline-none text-gray-700" />
            </div>

            {/* Método de pago */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-red-600" />
                <h2 className="text-gray-800 font-bold">Método de Pago</h2>
              </div>
              <div className="space-y-3">
                {PAYMENT_OPTIONS.map(m => (
                  <label key={m.value} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition ${payment === m.value ? "border-red-600 bg-red-50" : "border-gray-200 hover:bg-gray-50"}`}>
                    <input type="radio" name="payment" value={m.value} checked={payment === m.value} onChange={() => setPayment(m.value)} className="accent-red-600" />
                    <span className={`text-sm ${payment === m.value ? "font-semibold text-red-700" : "text-gray-700"}`}>{m.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* ── Columna derecha: Resumen ── */}
          <div className="bg-white rounded-xl shadow-md p-6 h-fit sticky top-20 space-y-4">
            <h2 className="text-gray-800 pb-4 border-b font-bold text-lg">Resumen del Pedido</h2>

            {/* Items */}
            <div className="space-y-3">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.name} x{item.quantity}</span>
                  <span className="text-gray-800 font-semibold">S/ {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Cupón */}
            <div className="border-t pt-4">
              <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                <Tag className="w-4 h-4 text-red-600" /> Código de cupón
              </p>

              {cuponAplicado ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-300 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-green-700 font-semibold text-sm tracking-wider">{cuponAplicado.codigoCupon}</span>
                  </div>
                  <button onClick={handleQuitarCupon} className="text-gray-400 hover:text-red-600 transition">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={codigoCupon}
                    onChange={e => { setCodigoCupon(e.target.value.toUpperCase()); setCuponError(""); }}
                    placeholder="CODIGO10"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:border-red-600 focus:outline-none uppercase tracking-wider"
                  />
                  <button
                    onClick={handleAplicarCupon}
                    className="bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-red-700 transition whitespace-nowrap"
                  >
                    Aplicar
                  </button>
                </div>
              )}

              {cuponError && (
                <p className="text-red-600 text-xs mt-1.5">{cuponError}</p>
              )}
            </div>

            {/* Totales */}
            <div className="border-t pt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-800">S/ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 flex items-center gap-1"><Truck className="w-4 h-4" /> Delivery</span>
                <span className="text-gray-800">S/ {delivery.toFixed(2)}</span>
              </div>
              {cuponAplicado && (
                <div className="flex justify-between text-green-600 font-semibold">
                  <span className="flex items-center gap-1"><Tag className="w-4 h-4" /> Descuento</span>
                  <span>- S/ {descuento.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="border-t pt-3 flex justify-between items-center">
              <span className="text-gray-800 font-bold text-lg">Total</span>
              <span className="text-red-600 font-bold text-2xl">S/ {total.toFixed(2)}</span>
            </div>

            <BtnPrimary
              className="w-full mt-2"
              onClick={handleOrder}
              disabled={loading || (modalidad === "DELIVERY" && !direccionId)}
            >
              {loading ? "Procesando..." : "Confirmar Pedido"}
            </BtnPrimary>
          </div>
        </div>
      </div>
    </div>
  );
}
