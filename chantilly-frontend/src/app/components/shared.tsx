import React from "react";
import { Link, useNavigate } from "react-router";
import { ShoppingCart, User, Menu, X, Home, Bell } from "lucide-react";
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

const STATUS_COLORS: Record<UiOrderStatus, { bg: string; text: string }> = {
  Pendiente: { bg: "#F5C518", text: "#333333" },
  "En preparación": { bg: "#1976D2", text: "#FFFFFF" },
  Listo: { bg: "#4CAF50", text: "#FFFFFF" },
  "En ruta": { bg: "#FF9800", text: "#FFFFFF" },
  Entregado: { bg: "#2E7D32", text: "#FFFFFF" },
  Cancelado: { bg: "#D32F2F", text: "#FFFFFF" },
  Rechazado: { bg: "#6B7280", text: "#FFFFFF" },
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
    <span className="px-3 py-1 rounded-full inline-block whitespace-nowrap" style={{ backgroundColor: c.bg, color: c.text, fontFamily: "Poppins", fontSize: 13 }}>
      {status}
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
          {isLoggedIn && <Link to="/mis-pedidos" className="hover:text-[#F5C518] transition-colors">Mis Pedidos</Link>}
        </div>

        <div className="flex items-center gap-4 relative">
          {isLoggedIn && (
            <button onClick={abrirNotificaciones} className="relative hover:text-[#F5C518] transition-colors">
              <Bell className="w-6 h-6" />
              {noLeidas > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#F5C518] text-[#333] w-5 h-5 rounded-full flex items-center justify-center" style={{ fontSize: 11, fontWeight: 700 }}>{noLeidas}</span>
              )}
            </button>
          )}

          <button onClick={() => setCartOpen(true)} className="relative hover:text-[#F5C518] transition-colors">
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#F5C518] text-[#333] w-5 h-5 rounded-full flex items-center justify-center" style={{ fontSize: 11, fontWeight: 700 }}>{cartCount}</span>
            )}
          </button>

          {isLoggedIn ? (
            <div className="hidden md:flex items-center gap-3">
              <Link to="/perfil" className="hover:text-[#F5C518]"><User className="w-6 h-6" /></Link>
              <button onClick={() => { logout(); navigate("/"); }} className="hover:text-[#F5C518]" style={{ fontSize: 14 }}>Salir</button>
            </div>
          ) : (
            <Link to="/login" className="hidden md:block bg-[#F5C518] text-[#333] px-4 py-1.5 rounded-lg hover:bg-[#e0b415] transition" style={{ fontWeight: 600, fontSize: 14 }}>
              Ingresar
            </Link>
          )}

          <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
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
                    <p className="text-gray-500" style={{ fontSize: 13 }}>{n.mensaje}</p>
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

  if (!isCartOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setCartOpen(false)} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col" style={{ fontFamily: "Poppins" }}>
        <div className="bg-[#D32F2F] text-white p-4 flex justify-between items-center">
          <h2 style={{ fontWeight: 700 }}>Mi Carrito ({cart.length})</h2>
          <button onClick={() => setCartOpen(false)}><X className="w-6 h-6" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <p className="text-center text-gray-500 mt-10">Tu carrito está vacío</p>
          ) : cart.map(item => (
            <div key={item.id} className="flex gap-3 border-b pb-3">
              <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
              <div className="flex-1">
                <p className="text-[#333]" style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</p>
                <p className="text-[#D32F2F]" style={{ fontWeight: 700 }}>S/ {item.price.toFixed(2)}</p>
                <div className="flex items-center gap-2 mt-1">
                  <button onClick={() => updateQty(item.id, item.quantity - 1)} className="w-7 h-7 rounded bg-gray-200 flex items-center justify-center">-</button>
                  <span style={{ fontWeight: 600 }}>{item.quantity}</span>
                  <button onClick={() => updateQty(item.id, item.quantity + 1)} className="w-7 h-7 rounded bg-gray-200 flex items-center justify-center">+</button>
                  <button onClick={() => removeFromCart(item.id)} className="ml-auto text-[#D32F2F]" style={{ fontSize: 13 }}>Eliminar</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <div className="p-4 border-t">
            <div className="flex justify-between mb-4">
              <span style={{ fontWeight: 600 }}>Subtotal:</span>
              <span className="text-[#D32F2F]" style={{ fontWeight: 700, fontSize: 18 }}>S/ {subtotal.toFixed(2)}</span>
            </div>
            <BtnPrimary className="w-full" onClick={() => { setCartOpen(false); navigate("/checkout"); }}>
              Ir al Pago
            </BtnPrimary>
          </div>
        )}
      </div>
    </>
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
      <div className="max-w-7xl mx-auto px-4 mt-8 pt-6 border-t border-gray-600 text-center text-gray-500" style={{ fontSize: 13 }}>
        © 2026 La Casa del Chantilly. Todos los derechos reservados.
      </div>
    </footer>
  );
}

