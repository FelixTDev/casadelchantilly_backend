import { createBrowserRouter } from "react-router";
import React from "react";

import RootLayout from "./layouts/RootLayout";
import ClientLayout from "./layouts/ClientLayout";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Recovery from "./pages/Recovery";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const Landing = React.lazy(() => import("./pages/Landing"));
const Catalog = React.lazy(() => import("./pages/Catalog"));
const ProductDetail = React.lazy(() => import("./pages/ProductDetail"));
const Checkout = React.lazy(() => import("./pages/Checkout"));
const Confirmation = React.lazy(() => import("./pages/Confirmation"));
const MyOrders = React.lazy(() => import("./pages/MyOrders"));
const OrderDetail = React.lazy(() => import("./pages/OrderDetail"));
const Profile = React.lazy(() => import("./pages/Profile"));
const Claim = React.lazy(() => import("./pages/Claim"));
const Terms = React.lazy(() => import("./pages/Terms"));
const AdminLayout = React.lazy(() => import("./pages/admin/AdminLayout"));
const Dashboard = React.lazy(() => import("./pages/admin/Dashboard"));
const AdminProducts = React.lazy(() => import("./pages/admin/AdminProducts"));
const AdminOrders = React.lazy(() => import("./pages/admin/AdminOrders"));
const AdminPayments = React.lazy(() => import("./pages/admin/AdminPayments"));
const Promotions = React.lazy(() => import("./pages/admin/Promotions"));
const Reports = React.lazy(() => import("./pages/admin/Reports"));
const StockAlerts = React.lazy(() => import("./pages/admin/StockAlerts"));
const AdminClaims = React.lazy(() => import("./pages/admin/AdminClaims"));
const AdminUsers = React.lazy(() => import("./pages/admin/AdminUsers"));

function withSuspense(element: React.ReactNode) {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center bg-[#F7F5F3] px-4 py-10 text-sm font-semibold text-gray-600">
          Cargando vista...
        </div>
      }
    >
      {element}
    </React.Suspense>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      {
        Component: ClientLayout,
        children: [
          { index: true, element: withSuspense(<Landing />) },
          { path: "catalogo", element: withSuspense(<Catalog />) },
          { path: "producto/:id", element: withSuspense(<ProductDetail />) },
          { path: "checkout", element: withSuspense(<ProtectedRoute><Checkout /></ProtectedRoute>) },
          { path: "confirmacion", element: withSuspense(<ProtectedRoute><Confirmation /></ProtectedRoute>) },
          { path: "mis-pedidos", element: withSuspense(<ProtectedRoute><MyOrders /></ProtectedRoute>) },
          { path: "pedido/:id", element: withSuspense(<ProtectedRoute><OrderDetail /></ProtectedRoute>) },
          { path: "perfil", element: withSuspense(<ProtectedRoute clientOnly={true}><Profile /></ProtectedRoute>) },
          { path: "reclamo", element: withSuspense(<ProtectedRoute><Claim /></ProtectedRoute>) },
          { path: "terminos", element: withSuspense(<Terms />) },
        ],
      },
      { path: "login", Component: Login },
      { path: "registro", Component: Register },
      { path: "recuperar", Component: Recovery },
      { path: "reset-password/:token", Component: ResetPassword },
      {
        path: "admin",
        element: withSuspense(<ProtectedRoute adminOnly={true}><AdminLayout /></ProtectedRoute>),
        children: [
          { index: true, element: withSuspense(<Dashboard />) },
          { path: "productos", element: withSuspense(<AdminProducts />) },
          { path: "pedidos", element: withSuspense(<AdminOrders />) },
          { path: "pagos", element: withSuspense(<AdminPayments />) },
          { path: "promociones", element: withSuspense(<Promotions />) },
          { path: "reportes", element: withSuspense(<Reports />) },
          { path: "alertas", element: withSuspense(<StockAlerts />) },
          { path: "reclamos", element: withSuspense(<AdminClaims />) },
          { path: "usuarios", element: withSuspense(<AdminUsers />) },
        ],
      },
      { path: "*", Component: NotFound },
    ],
  },
]);
