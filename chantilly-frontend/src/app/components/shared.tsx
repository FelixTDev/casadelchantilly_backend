import React from "react";
import { Link, useNavigate } from "react-router";
import { ShoppingCart, User, Menu, X, Home, Bell, Gift, ShoppingBag, Trash2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import { notificacionService, NotificacionApi } from "../../services/notificacionService";

export function ProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col animate-pulse">
      <div className="h-48 bg-gray-200 w-full" />
      <div className="p-4 flex flex-col flex-1 gap-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="mt-auto flex items-center justify-between">
          <div className="h-6 bg-gray-200 rounded w-1/4" />
          <div className="h-10 bg-gray-200 rounded-xl w-10" />
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="animate-pulse flex flex-col gap-4 w-full">
      <div className="h-10 bg-gray-200 rounded w-full" />
      <div className="h-12 bg-gray-200 rounded w-full" />
      <div className="h-12 bg-gray-200 rounded w-full" />
      <div className="h-12 bg-gray-200 rounded w-full" />
    </div>
  );
}

export type UiOrderStatus = "Pendiente" | "En preparación" | "Listo" | "En ruta" | "Entregado" | "Cancelado" | "Rechazado";
export type UiPaymentStatus = "Pendiente" | "Confirmado" | "Rechazado" | "Expirado" | "Reembolsado";

const STATUS_COLORS: Record<UiOrderStatus, { bg: string; text: string }> = {
  Pendiente: { bg: "#fef3c7", text: "#d97706" },
  "En preparación": { bg: "#eff6ff", text: "#2563eb" },
  Listo: { bg: "#f0fdf4", text: "#16a34a" },
  "En ruta": { bg: "#fff7ed", text: "#ea580c" },
  Entregado: { bg: "#dcfce7", text: "#15803d" },
  Cancelado: { bg: "#fef2f2", text: "#dc2626" },
  Rechazado: { bg: "#f3f4f6", text: "#4b5563" },
};

const PAYMENT_STATUS_COLORS: Record<UiPaymentStatus, { bg: string; text: string }> = {
  Pendiente: { bg: "#fef3c7", text: "#b45309" },
  Confirmado: { bg: "#dcfce7", text: "#15803d" },
  Rechazado: { bg: "#fee2e2", text: "#b91c1c" },
  Expirado: { bg: "#f3f4f6", text: "#4b5563" },
  Reembolsado: { bg: "#ede9fe", text: "#6d28d9" },
};

export function toUiStatus(status: string): UiOrderStatus {
  switch ((status || "").toUpperCase()) {
    case "PENDIENTE": return "Pendiente";
    case "EN_PREPARACION": return "En preparación";
    case "LISTO": return "Listo";
    case "EN_RUTA": return "En ruta";
    case "ENTREGADO": return "Entregado";
    case "CANCELADO": return "Cancelado";
    case "RECHAZADO": return "Rechazado";
    default: return "Pendiente";
  }
}

export function StatusBadge({ status }: { status: UiOrderStatus }) {
  const c = STATUS_COLORS[status];
  return (
    <span className="px-3 py-1 rounded-full inline-block whitespace-nowrap font-bold border" style={{ backgroundColor: c.bg, color: c.text, borderColor: "rgba(0,0,0,0.05)", fontFamily: "Poppins", fontSize: 12 }}>
      {status}
    </span>
  );
}

export function toUiPaymentStatus(status?: string): UiPaymentStatus {
  switch ((status || "").toUpperCase()) {
    case "CONFIRMADO": return "Confirmado";
    case "RECHAZADO": return "Rechazado";
    case "EXPIRADO": return "Expirado";
    case "REEMBOLSADO": return "Reembolsado";
    default: return "Pendiente";
  }
}

export function PaymentStatusBadge({ status }: { status?: string }) {
  const mapped = toUiPaymentStatus(status);
  const c = PAYMENT_STATUS_COLORS[mapped];
  return (
    <span className="px-3 py-1 rounded-full inline-block whitespace-nowrap font-bold border" style={{ backgroundColor: c.bg, color: c.text, borderColor: "rgba(0,0,0,0.05)", fontFamily: "Poppins", fontSize: 12 }}>
      {mapped}
    </span>
  );
}

export function BtnPrimary({ children, className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`bg-[#D32F2F] text-white px-6 py-3 rounded-lg hover:bg-[#B71C1C] transition-colors disabled:opacity-50 ${className}`} style={{ fontFamily: "Poppins" }} {...props}>
      {children}
    </button>
  );
}

export function BtnSecondary({ children, className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`border-2 border-[#D32F2F] text-[#D32F2F] px-6 py-3 rounded-lg hover:bg-[#D32F2F] hover:text-white transition-colors ${className}`} style={{ fontFamily: "Poppins" }} {...props}>
      {children}
    </button>
  );
}

export function BtnYellow({ children, className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`bg-[#F5C518] text-[#333333] px-6 py-3 rounded-lg hover:bg-[#e0b415] transition-colors ${className}`} style={{ fontFamily: "Poppins" }} {...props}>
      {children}
    </button>
  );
}

export function Navbar() {
  const { cart, setCartOpen, isLoggedIn, logout } = useApp();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [notifOpen, setNotifOpen] = React.useState(false);
  const [notificaciones, setNotificaciones] = React.useState<NotificacionApi[]>([]);
  const [noLeidas, setNoLeidas] = React.useState(0);
  const navigate = useNavigate();
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const loadNoLeidas = React.useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const response = await notificacionService.getNoLeidas();
      setNoLeidas(response.data.total || 0);
    } catch {
      setNoLeidas(0);
    }
  }, [isLoggedIn]);

  React.useEffect(() => {
    loadNoLeidas();
  }, [loadNoLeidas]);

  const abrirNotificaciones = async () => {
    setNotifOpen(!notifOpen);
    if (!notifOpen) {
      try {
        const response = await notificacionService.getNotificaciones();
        setNotificaciones(response.data);
        await notificacionService.marcarTodasLeidas();
        setNoLeidas(0);
      } catch (error) {
        console.error("Error cargando notificaciones", error);
      }
    }
  };

  return (
    <nav className="bg-[#D32F2F] text-white sticky top-0 z-50 shadow-lg" style={{ fontFamily: "Poppins" }}>
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <Home className="w-7 h-7 text-[#F5C518]" />
          <span className="text-xl" style={{ fontWeight: 700 }}>La Casa del Chantilly</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="hover:text-[#F5C518] transition-colors">Inicio</Link>
          <Link to="/catalogo" className="hover:text-[#F5C518] transition-colors">Catálogo</Link>
          <a href="/#combos" className="text-white font-bold hover:text-[#FFE082] transition-colors flex items-center gap-1">
            <Gift className="w-4 h-4" /> Combos
          </a>
          {isLoggedIn && <Link to="/mis-pedidos" className="hover:text-[#F5C518] transition-colors">Mis Pedidos</Link>}
        </div>

        <div className="flex items-center gap-4 relative">
          {isLoggedIn && (
            <button
              onClick={abrirNotificaciones}
              aria-label={notifOpen ? "Cerrar notificaciones" : "Abrir notificaciones"}
              title={notifOpen ? "Cerrar notificaciones" : "Abrir notificaciones"}
              className="relative hover:text-[#FFE082] transition-colors"
            >
              <Bell className="w-6 h-6" />
              {noLeidas > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#F5C518] text-[#333] w-5 h-5 rounded-full flex items-center justify-center" style={{ fontSize: 11, fontWeight: 700 }}>{noLeidas}</span>
              )}
            </button>
          )}

          <button
            id="nav-cart-icon"
            onClick={() => setCartOpen(true)}
            aria-label={`Abrir carrito${cartCount > 0 ? `, ${cartCount} productos` : ""}`}
            title="Abrir carrito"
            className="relative hover:text-[#FFE082] transition-colors"
          >
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#F5C518] text-[#333] w-5 h-5 rounded-full flex items-center justify-center" style={{ fontSize: 11, fontWeight: 700 }}>{cartCount}</span>
            )}
          </button>

          {isLoggedIn ? (
            <div className="hidden md:flex items-center gap-3">
              <Link to="/perfil" aria-label="Ir a mi perfil" title="Ir a mi perfil" className="hover:text-[#FFE082]"><User className="w-6 h-6" /></Link>
              <button onClick={() => { logout(); navigate("/"); }} className="hover:text-[#F5C518]" style={{ fontSize: 14 }}>Salir</button>
            </div>
          ) : (
            <Link to="/login" className="hidden md:block bg-[#F5C518] text-[#333] px-4 py-1.5 rounded-lg hover:bg-[#e0b415] transition" style={{ fontWeight: 600, fontSize: 14 }}>
              Ingresar
            </Link>
          )}

          <button
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
            title={mobileOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-12 bg-white text-[#333] rounded-lg shadow-lg w-80 max-h-96 overflow-y-auto z-50">
              <div className="p-3 border-b" style={{ fontWeight: 700 }}>Notificaciones</div>
              {notificaciones.length === 0 ? (
                <div className="p-3 text-gray-500" style={{ fontSize: 14 }}>Sin notificaciones</div>
              ) : (
                notificaciones.map((n) => (
                  <div key={n.id} className="p-3 border-b last:border-b-0">
                    <p style={{ fontWeight: 600, fontSize: 14 }}>{n.titulo}</p>
                    <p className="text-gray-600" style={{ fontSize: 13 }}>{n.mensaje}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-[#B71C1C] px-4 pb-4 space-y-3">
          <Link to="/" onClick={() => setMobileOpen(false)} className="block py-2 hover:text-[#F5C518]">Inicio</Link>
          <Link to="/catalogo" onClick={() => setMobileOpen(false)} className="block py-2 hover:text-[#F5C518]">Catálogo</Link>
          {isLoggedIn && <Link to="/mis-pedidos" onClick={() => setMobileOpen(false)} className="block py-2 hover:text-[#F5C518]">Mis Pedidos</Link>}
          {isLoggedIn ? (
            <>
              <Link to="/perfil" onClick={() => setMobileOpen(false)} className="block py-2 hover:text-[#F5C518]">Mi Perfil</Link>
              <button onClick={() => { logout(); navigate("/"); setMobileOpen(false); }} className="block py-2 hover:text-[#F5C518]">Salir</button>
            </>
          ) : (
            <Link to="/login" onClick={() => setMobileOpen(false)} className="block py-2 hover:text-[#F5C518]">Ingresar</Link>
          )}
        </div>
      )}
    </nav>
  );
}

export function CartDrawer() {
  const { cart, isCartOpen, setCartOpen, updateQty, removeFromCart } = useApp();
  const navigate = useNavigate();
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300 ${isCartOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`} 
        onClick={() => setCartOpen(false)} 
      />
      
      {/* Sliding Drawer */}
      <div 
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isCartOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'}`} 
        style={{ fontFamily: "Poppins" }}
      >
        <div className="bg-[#D32F2F] text-white p-5 flex justify-between items-center shadow-md z-10">
          <h2 className="text-xl flex items-center gap-2" style={{ fontWeight: 700 }}>
            <ShoppingCart className="w-6 h-6" /> Mi Carrito ({cart.length})
          </h2>
          <button
            onClick={() => setCartOpen(false)}
            aria-label="Cerrar carrito"
            title="Cerrar carrito"
            className="hover:bg-red-700 p-1.5 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50/50">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-70">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                <ShoppingBag className="w-12 h-12 text-gray-400" />
              </div>
              <p className="text-xl font-bold text-gray-600">¡Tu carrito está vacío!</p>
              <p className="text-gray-500 text-sm max-w-[250px]">Parece que aún no has agregado ninguna de nuestras delicias.</p>
              <BtnPrimary onClick={() => setCartOpen(false)} className="mt-4 shadow-md">
                Seguir Comprando
              </BtnPrimary>
            </div>
          ) : cart.map(item => (
            <div key={item.id} className="flex gap-4 bg-white p-3 rounded-xl shadow-sm border border-gray-100 relative group">
              <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-lg shadow-sm" />
              <div className="flex-1 flex flex-col justify-between">
                <div className="pr-6">
                  <p className="text-gray-800 leading-tight" style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</p>
                  <p className="text-[#D32F2F] mt-1" style={{ fontWeight: 700 }}>S/ {item.price.toFixed(2)}</p>
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center border border-gray-200 rounded-full bg-gray-50 overflow-hidden shadow-sm">
                    <button onClick={() => updateQty(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 transition-colors text-gray-600 font-bold" aria-label={`Disminuir cantidad de ${item.name}`}>-</button>
                    <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                    <button onClick={() => updateQty(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 transition-colors text-gray-600 font-bold" aria-label={`Aumentar cantidad de ${item.name}`}>+</button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="w-8 h-8 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-full flex items-center justify-center transition-colors absolute top-3 right-3 opacity-100 sm:opacity-0 sm:group-hover:opacity-100" aria-label={`Eliminar ${item.name} del carrito`}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <div className="p-5 bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
            <div className="flex justify-between items-center mb-5">
              <span className="text-gray-600" style={{ fontWeight: 600 }}>Total a Pagar:</span>
              <span className="text-[#D32F2F]" style={{ fontWeight: 800, fontSize: 22 }}>S/ {subtotal.toFixed(2)}</span>
            </div>
            <BtnPrimary className="w-full py-3.5 text-lg shadow-lg" onClick={() => { setCartOpen(false); navigate("/checkout"); }}>
              Ir a Pagar de Forma Segura
            </BtnPrimary>
          </div>
        )}
      </div>
    </>
  );
}

export function CartFAB() {
  const { cart, setCartOpen } = useApp();
  
  if (cart.length === 0) return null;

  return (
    <button 
      onClick={() => setCartOpen(true)}
      className="fixed bottom-6 right-6 z-40 bg-[#D32F2F] hover:bg-red-700 text-white p-4 rounded-full shadow-2xl flex items-center justify-center transform hover:scale-110 transition-all duration-300 animate-bounce group"
      style={{ animationDuration: '2s' }}
    >
      <ShoppingCart className="w-7 h-7" />
      <span className="absolute -top-2 -right-2 bg-[#F5C518] text-gray-900 font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
        {cart.length}
      </span>
      {/* Tooltip on hover */}
      <span className="absolute right-full mr-3 bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        Ver mi pedido
      </span>
    </button>
  );
}

export function Footer() {
  return (
    <footer className="bg-[#333333] text-white py-10" style={{ fontFamily: "Poppins" }}>
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Home className="w-6 h-6 text-[#F5C518]" />
            <h3 style={{ fontWeight: 700 }}>La Casa del Chantilly</h3>
          </div>
          <p className="text-gray-400" style={{ fontSize: 14 }}>Pastelería artesanal peruana desde 1998. Endulzamos tus momentos especiales.</p>
        </div>
        <div>
          <h4 className="text-[#F5C518] mb-3" style={{ fontWeight: 600 }}>Enlaces</h4>
          <div className="space-y-2 text-gray-400" style={{ fontSize: 14 }}>
            <p><Link to="/catalogo" className="hover:text-[#F5C518]">Catálogo</Link></p>
            <p><Link to="/terminos" className="hover:text-[#F5C518]">Términos y Condiciones</Link></p>
            <p><Link to="/login" className="hover:text-[#F5C518]">Mi Cuenta</Link></p>
            <p><Link to="/mis-pedidos" className="hover:text-[#F5C518]">Mis Pedidos</Link></p>
          </div>
        </div>
        <div>
          <h4 className="text-[#F5C518] mb-3" style={{ fontWeight: 600 }}>Contacto</h4>
          <div className="space-y-2 text-gray-400" style={{ fontSize: 14 }}>
            <p>Av. La Molina 1234, Lima</p>
            <p>(01) 555-0123</p>
            <p>info@casadelchantilly.pe</p>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 mt-8 pt-6 border-t border-gray-600 text-center text-gray-300" style={{ fontSize: 13 }}>
        © 2026 La Casa del Chantilly. Todos los derechos reservados.
      </div>
    </footer>
  );
}

