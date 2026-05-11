import React from "react";
import { Outlet } from "react-router";
import { Navbar, CartDrawer, CartFAB, Footer } from "../components/shared";

export default function ClientLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <CartDrawer />
      <CartFAB />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
