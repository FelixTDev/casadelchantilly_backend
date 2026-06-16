import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import axios from "axios";
import { toast } from "sonner";
import { CartItem, Product } from "../data/mock-data";
import { authService, CurrentSessionResponse, RegisterData } from "../../services/authService";
import { carritoService, CarritoApi } from "../../services/carritoService";
import { useCartStore } from "../../services/useCartStore";
import { getUserErrorMessage } from "../../lib/apiError";

interface User {
  name: string;
  lastName: string;
  email: string;
  phone: string;
}

interface AppState {
  cart: CartItem[];
  isCartOpen: boolean;
  isLoggedIn: boolean;
  isAdmin: boolean;
  user: User;
  loading: boolean;
  authReady: boolean;
  addToCart: (p: Product, qty?: number, customization?: string) => Promise<void>;
  removeFromCart: (id: number) => Promise<void>;
  updateQty: (id: number, qty: number) => Promise<void>;
  clearCart: () => Promise<void>;
  setCartOpen: (v: boolean) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginAdmin: () => void;
  logout: () => void;
  setUser: (u: User) => void;
  register: (data: RegisterData) => Promise<{ mensaje: string }>;
  recuperarPassword: (email: string) => Promise<{ mensaje: string }>;
}

const AppContext = createContext<AppState>({} as AppState);
export const useApp = () => useContext(AppContext);

function mapCarritoApiToLocal(cartApi: CarritoApi): CartItem[] {
  return (cartApi.items || []).map((item) => ({
    id: item.id,
    name: item.nombreProducto,
    price: Number(item.precioUnitario ?? 0),
    category: "",
    image: item.imagenUrl || "",
    description: "",
    stock: 0,
    quantity: item.cantidad,
    customization: item.notas,
  }));
}

export function AppProvider({ children }: { children: ReactNode }) {
  const cartStore = useCartStore();
  const [isCartOpen, setCartOpen] = useState(false);
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState<User>({ name: "Maria", lastName: "Garcia", email: "maria@email.com", phone: "987654321" });
  const cartBounceTimeoutRef = useRef<number | null>(null);

  // Alias para que el resto del código siga funcionando igual
  const cart = cartStore.cart;

  const doLocalLogout = () => {
    setLoggedIn(false);
    setIsAdmin(false);
    cartStore._clearLocal();
    sessionStorage.removeItem("chantilly_user");
  };

  const syncCartFromApi = async () => {
    try {
      await cartStore.syncFromApi();
      return true;
    } catch {
      cartStore._clearLocal();
      return false;
    }
  };

  useEffect(() => {
    const init = async () => {
      const cachedUser = sessionStorage.getItem("chantilly_user");
      if (cachedUser) {
        try {
          const userData = JSON.parse(cachedUser) as CurrentSessionResponse;
          setUser({ name: userData.nombre, lastName: "", email: userData.email, phone: "" });
        } catch {
          sessionStorage.removeItem("chantilly_user");
        }
      }

      try {
        const { data } = await authService.getSession();
        setLoggedIn(true);
        setIsAdmin(data.rol === "ADMIN");
        setUser({ name: data.nombre, lastName: "", email: data.email, phone: "" });
        sessionStorage.setItem("chantilly_user", JSON.stringify(data));
        if (data.rol !== "ADMIN") {
          const ok = await syncCartFromApi();
          if (!ok) {
            doLocalLogout();
          }
        }
      } catch {
        doLocalLogout();
        setAuthReady(true);
        return;
      }
      setAuthReady(true);
    };

    init().finally(() => setAuthReady(true));
    return () => {
      if (cartBounceTimeoutRef.current) {
        window.clearTimeout(cartBounceTimeoutRef.current);
      }
    };
  }, []);

  const addToCart = async (p: Product, qty = 1, customization?: string) => {
    await cartStore.addToCart(p, qty, customization, isLoggedIn, isAdmin);
    toast.success(`${qty}x ${p.name} agregado a tu carrito 🍰`);
    
    // Add bounce animation to navbar cart icon
    const cartIcon = document.getElementById("nav-cart-icon");
    if (cartIcon) {
      cartIcon.classList.add("animate-bounce");
      if (cartBounceTimeoutRef.current) {
        window.clearTimeout(cartBounceTimeoutRef.current);
      }
      cartBounceTimeoutRef.current = window.setTimeout(() => cartIcon.classList.remove("animate-bounce"), 1000);
    }
  };

  const removeFromCart = async (id: number) => {
    await cartStore.removeFromCart(id, isLoggedIn, isAdmin);
  };

  const updateQty = async (id: number, qty: number) => {
    await cartStore.updateQty(id, qty, isLoggedIn, isAdmin);
  };

  const clearCart = async () => {
    await cartStore.clearCart(isLoggedIn, isAdmin);
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      const response = await authService.login({ email, password });
      const data = response.data;
      setLoggedIn(true);
      setIsAdmin(data.rol === "ADMIN");
      setUser({ name: data.nombre, lastName: "", email: data.email, phone: "" });
      sessionStorage.setItem("chantilly_user", JSON.stringify(data));
      if (data.rol !== "ADMIN") {
        await syncCartFromApi();
      }
      return { success: true };
    } catch (err) {
      let errorMsg = "Credenciales incorrectas. Intenta de nuevo.";
      if (axios.isAxiosError(err)) {
        errorMsg = getUserErrorMessage(err, errorMsg);
      }
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const loginAdmin = () => {
    setIsAdmin(true);
    setLoggedIn(true);
  };

  const logout = () => {
    authService.logout().catch(() => undefined);
    doLocalLogout();
  };

  const register = async (data: RegisterData) => {
    setLoading(true);
    try {
      const response = await authService.register(data);
      return response.data;
    } finally {
      setLoading(false);
    }
  };

  const recuperarPassword = async (email: string) => {
    setLoading(true);
    try {
      const response = await authService.recuperarPassword(email);
      return response.data;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppContext.Provider value={{ cart, isCartOpen, isLoggedIn, isAdmin, user, loading, authReady, addToCart, removeFromCart, updateQty, clearCart, setCartOpen, login, loginAdmin, logout, setUser, register, recuperarPassword }}>
      {children}
    </AppContext.Provider>
  );
}
