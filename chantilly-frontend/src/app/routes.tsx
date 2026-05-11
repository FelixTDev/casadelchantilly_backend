import { createBrowserRouter } from "react-router";
import React from "react";

import RootLayout from "./layouts/RootLayout";
import ClientLayout from "./layouts/ClientLayout";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Recovery from "./pages/Recovery";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import Catalog from "./pages/Catalog";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import Confirmation from "./pages/Confirmation";
import MyOrders from "./pages/MyOrders";
import OrderDetail from "./pages/OrderDetail";
import Claim from "./pages/Claim";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";

import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import Promotions from "./pages/admin/Promotions";
import Reports from "./pages/admin/Reports";
import StockAlerts from "./pages/admin/StockAlerts";
import AdminClaims from "./pages/admin/AdminClaims";
import AdminUsers from "./pages/admin/AdminUsers";
import ProtectedRoute from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      {
        Component: ClientLayout,
        children: [
          { index: true, Component: Landing },
          { path: "catalogo", Component: Catalog },
          { path: "producto/:id", Component: ProductDetail },
          { path: "checkout", element: <ProtectedRoute><Checkout /></ProtectedRoute> },
          { path: "confirmacion", Component: Confirmation },
          { path: "mis-pedidos", element: <ProtectedRoute><MyOrders /></ProtectedRoute> },
          { path: "pedido/:id", Component: OrderDetail },
          { path: "perfil", element: <ProtectedRoute clientOnly={true}><Profile /></ProtectedRoute> },
          { path: "reclamo", element: <ProtectedRoute><Claim /></ProtectedRoute> },
          { path: "terminos", Component: Terms },
        ],
      },
      { path: "login", Component: Login },
      { path: "registro", Component: Register },
      { path: "recuperar", Component: Recovery },
      { path: "reset-password/:token", Component: ResetPassword },
      {
        path: "admin",
        element: <ProtectedRoute adminOnly={true}><AdminLayout /></ProtectedRoute>,
        children: [
          { index: true, Component: Dashboard },
          { path: "productos", Component: AdminProducts },
          { path: "pedidos", Component: AdminOrders },
          { path: "promociones", Component: Promotions },
          { path: "reportes", Component: Reports },
          { path: "alertas", Component: StockAlerts },
          { path: "reclamos", Component: AdminClaims },
          { path: "usuarios", Component: AdminUsers },
        ],
      },
      { path: "*", Component: NotFound },
    ],
  },
]);
