import React, { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { LayoutDashboard, Package, ShoppingBag, Tag, BarChart3, AlertTriangle, Menu, X, LogOut, Home, MessageSquare, Users } from "lucide-react";
import { useApp } from "../../context/AppContext";

const NAV = [
  { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/productos", label: "Productos", icon: Package },
  { path: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag },
  { path: "/admin/promociones", label: "Promociones", icon: Tag },
  { path: "/admin/reportes", label: "Reportes", icon: BarChart3 },
  { path: "/admin/alertas", label: "Alertas Stock", icon: AlertTriangle },
  { path: "/admin/reclamos", label: "Reclamos", icon: MessageSquare },
  { path: "/admin/usuarios", label: "Usuarios", icon: Users },
];

export default function AdminLayout() {
  const location = useLocation();
  const { logout } = useApp();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="p-5 flex items-center gap-2">
        <Home className="w-7 h-7 text-[#F5C518]" />
        <span className="text-white" style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 16 }}>Admin Panel</span>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {NAV.map(item => {
          const active = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${active ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"}`}
              style={{ fontFamily: "Poppins", fontSize: 14, fontWeight: active ? 600 : 400 }}>
              <item.icon className={`w-5 h-5 ${active ? "text-[#F5C518]" : ""}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-white/10">
        <Link to="/" className="flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition" style={{ fontFamily: "Poppins", fontSize: 14 }}>
          <Home className="w-5 h-5" /> Ir a la tienda
        </Link>
        <button onClick={() => { logout(); navigate("/"); }} className="flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition w-full" style={{ fontFamily: "Poppins", fontSize: 14 }}>
          <LogOut className="w-5 h-5" /> Cerrar sesión
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F5F5F5]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 bg-[#B71C1C] shrink-0">{sidebar}</aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed left-0 top-0 h-full w-64 bg-[#B71C1C] z-50 lg:hidden">{sidebar}</aside>
        </>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm px-4 h-14 flex items-center gap-4 shrink-0">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6 text-[#333]" />
          </button>
          <h1 className="text-[#333]" style={{ fontFamily: "Poppins", fontWeight: 700 }}>
            {NAV.find(n => n.path === location.pathname)?.label || "Admin"}
          </h1>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
