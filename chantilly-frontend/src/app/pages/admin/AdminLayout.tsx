import React, { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { LayoutDashboard, Package, ShoppingBag, Tag, BarChart3, AlertTriangle, Menu, LogOut, Home, MessageSquare, Users, Wallet } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "../../components/ui/breadcrumb";

const NAV = [
  { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/productos", label: "Productos", icon: Package },
  { path: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag },
  { path: "/admin/pagos", label: "Pagos", icon: Wallet },
  { path: "/admin/promociones", label: "Promociones", icon: Tag },
  { path: "/admin/reportes", label: "Reportes", icon: BarChart3 },
  { path: "/admin/alertas", label: "Alertas Stock", icon: AlertTriangle },
  { path: "/admin/reclamos", label: "Reclamos", icon: MessageSquare },
  { path: "/admin/usuarios", label: "Usuarios", icon: Users },
];

const NAV_GROUPS = [
  { label: "Principal", items: NAV.slice(0, 1) },
  { label: "Gestión", items: NAV.slice(1, 5) },
  { label: "Análisis", items: NAV.slice(5, 7) },
  { label: "Soporte", items: NAV.slice(7) },
];

export default function AdminLayout() {
  const location = useLocation();
  const { logout } = useApp();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentPage = NAV.find(n => n.path === location.pathname);
  const breadcrumbItems = [
    { label: "Panel", path: "/admin" },
    ...(location.pathname !== "/admin" && currentPage ? [{ label: currentPage.label }] : []),
  ];

  const sidebar = (
    <div className="flex flex-col h-full bg-[#121722]" style={{ backgroundImage: "linear-gradient(180deg, #18202d 0%, #121722 100%)" }}>
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#D32F2F] rounded-xl flex items-center justify-center shadow-lg shadow-red-900/20">
            <Home className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-extrabold text-sm leading-tight" style={{ fontFamily: "Poppins" }}>La Casa del</p>
            <p className="text-[#F5C518] font-extrabold text-sm leading-tight" style={{ fontFamily: "Poppins" }}>Chantilly</p>
          </div>
        </div>
        <div className="mt-3 px-2 py-1.5 rounded-lg" style={{ background: "rgba(255,255,255,0.04)" }}>
          <p className="text-xs font-bold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.25)" }}>Panel Administrativo</p>
        </div>
      </div>

      {/* Nav Groups */}
      <nav className="flex-1 px-4 py-4 space-y-5 overflow-y-auto">
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            <p className="text-xs font-bold uppercase tracking-widest mb-2 px-3" style={{ color: "rgba(255,255,255,0.5)" }}>{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map(item => {
                const active = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative"
                    style={{
                      background: active ? "linear-gradient(90deg, rgba(211,47,47,0.15) 0%, transparent 100%)" : "transparent",
                    }}
                    onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)"; }}
                    onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >
                    {active && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#D32F2F] rounded-r-full" />
                    )}
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                      style={{ background: active ? "#D32F2F" : "rgba(255,255,255,0.05)" }}>
                      <item.icon className="w-4 h-4" style={{ color: active ? "white" : "rgba(255,255,255,0.6)" }} />
                    </div>
                    <span className="text-sm font-semibold" style={{ fontFamily: "Poppins", color: active ? "white" : "rgba(255,255,255,0.85)" }}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Actions */}
      <div className="px-4 py-4 border-t space-y-0.5" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
          style={{ color: "rgba(255,255,255,0.6)", fontFamily: "Poppins", fontSize: 14 }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)"; (e.currentTarget as HTMLElement).style.color = "white"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.6)"; }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.05)" }}>
            <Home className="w-4 h-4" />
          </div>
          <span className="text-sm font-semibold">Ir a la tienda</span>
        </Link>
        <button onClick={() => { logout(); navigate("/"); }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all w-full"
          style={{ color: "rgba(255,255,255,0.7)", fontFamily: "Poppins", fontSize: 14 }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.15)"; (e.currentTarget as HTMLElement).style.color = "#fca5a5"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.7)"; }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.05)" }}>
            <LogOut className="w-4 h-4" />
          </div>
          <span className="text-sm font-semibold">Cerrar sesión</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen" style={{ background: "#F6F7F9", fontFamily: "Poppins" }}>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 shrink-0" style={{ boxShadow: "4px 0 24px rgba(15,23,42,0.18)" }}>{sidebar}</aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 z-40 lg:hidden" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} onClick={() => setSidebarOpen(false)} />
          <aside className="fixed left-0 top-0 h-full w-64 z-50 lg:hidden" style={{ boxShadow: "8px 0 32px rgba(0,0,0,0.3)" }}>{sidebar}</aside>
        </>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white/95 px-6 h-20 flex items-center justify-between shrink-0" style={{ borderBottom: "1px solid #eef0f3", boxShadow: "0 1px 10px rgba(15,23,42,0.04)" }}>
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-gray-900 font-extrabold text-lg leading-tight">
                {currentPage?.label || "Admin"}
              </h1>
              <div className="hidden sm:block mt-1">
                <Breadcrumb>
                  <BreadcrumbList className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    {breadcrumbItems.map((item, index) => (
                      <React.Fragment key={`${item.label}-${index}`}>
                        <BreadcrumbItem>
                          {"path" in item ? (
                            <BreadcrumbLink asChild>
                              <Link to={item.path} className="text-gray-500 transition hover:text-[#D32F2F]">{item.label}</Link>
                            </BreadcrumbLink>
                          ) : (
                            <BreadcrumbPage className="font-bold text-gray-500">{item.label}</BreadcrumbPage>
                          )}
                        </BreadcrumbItem>
                        {index < breadcrumbItems.length - 1 && <BreadcrumbSeparator className="text-gray-300" />}
                      </React.Fragment>
                    ))}
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-gray-900 font-bold text-sm">Administrador</p>
              <p className="text-gray-600 text-xs">admin@chantilly.com</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#D32F2F] flex items-center justify-center" style={{ boxShadow: "0 4px 12px rgba(211,47,47,0.25)" }}>
              <span className="text-white font-bold text-sm">A</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
