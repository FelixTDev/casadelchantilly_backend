import React from "react";
import { Outlet } from "react-router";
import { AppProvider } from "../context/AppContext";
import { Toaster } from "sonner";

export default function RootLayout() {
  return (
    <AppProvider>
      <Toaster position="top-right" richColors closeButton />
      <Outlet />
    </AppProvider>
  );
}
