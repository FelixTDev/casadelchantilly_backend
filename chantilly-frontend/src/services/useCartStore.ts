import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, Product } from "../app/data/mock-data";
import { carritoService } from "./carritoService";
import { toast } from "sonner";
import { showRequestError } from "../lib/notifyError";

// Mismo tipo que usaba AppContext
interface CartState {
  cart: CartItem[];
  isCartOpen: boolean;

  // Acciones puras (sin API — para usuarios no logueados o admin)
  _setCart: (items: CartItem[]) => void;
  _addLocal: (p: Product, qty: number, customization?: string) => void;
  _removeLocal: (id: number) => void;
  _updateLocal: (id: number, qty: number) => void;
  _clearLocal: () => void;

  setCartOpen: (v: boolean) => void;

  // Acciones conectadas al backend
  syncFromApi: () => Promise<void>;
  addToCart: (p: Product, qty?: number, customization?: string, isLoggedIn?: boolean, isAdmin?: boolean) => Promise<void>;
  removeFromCart: (id: number, isLoggedIn?: boolean, isAdmin?: boolean) => Promise<void>;
  updateQty: (id: number, qty: number, isLoggedIn?: boolean, isAdmin?: boolean) => Promise<void>;
  clearCart: (isLoggedIn?: boolean, isAdmin?: boolean) => Promise<void>;
}

function mapApiToLocal(items: any[]): CartItem[] {
  return items.map((item) => ({
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

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],
      isCartOpen: false,

      _setCart: (items) => set({ cart: items }),

      _addLocal: (p, qty, customization) => {
        const prev = get().cart;
        const existing = prev.find((i) => i.id === p.id);
        const updated = existing
          ? prev.map((i) => (i.id === p.id ? { ...i, quantity: i.quantity + qty } : i))
          : [...prev, { ...p, quantity: qty, customization }];
        set({ cart: updated, isCartOpen: true });
      },

      _removeLocal: (id) =>
        set((s) => ({ cart: s.cart.filter((i) => i.id !== id) })),

      _updateLocal: (id, qty) => {
        if (qty <= 0) {
          set((s) => ({ cart: s.cart.filter((i) => i.id !== id) }));
        } else {
          set((s) => ({ cart: s.cart.map((i) => (i.id === id ? { ...i, quantity: qty } : i)) }));
        }
      },

      _clearLocal: () => set({ cart: [] }),

      setCartOpen: (v) => set({ isCartOpen: v }),

      syncFromApi: async () => {
        const res = await carritoService.getCarrito();
        set({ cart: mapApiToLocal(res.data.items || []) });
      },

      addToCart: async (p, qty = 1, customization, isLoggedIn = false, isAdmin = false) => {
        if (!isLoggedIn || isAdmin) {
          get()._addLocal(p, qty, customization);
          return;
        }
        try {
          const res = await carritoService.agregarItem({ productoId: p.id, cantidad: qty, notas: customization });
          set({ cart: mapApiToLocal(res.data.items || []), isCartOpen: true });
        } catch (e) {
          console.error("Error agregando al carrito", e);
          showRequestError(e, "No se pudo agregar el producto al carrito");
        }
      },

      removeFromCart: async (id, isLoggedIn = false, isAdmin = false) => {
        if (!isLoggedIn || isAdmin) {
          get()._removeLocal(id);
          return;
        }
        try {
          const res = await carritoService.eliminarItem(id);
          set({ cart: mapApiToLocal(res.data.items || []) });
        } catch (e) {
          console.error("Error eliminando item", e);
          showRequestError(e, "No se pudo eliminar el producto");
        }
      },

      updateQty: async (id, qty, isLoggedIn = false, isAdmin = false) => {
        if (!isLoggedIn || isAdmin) {
          get()._updateLocal(id, qty);
          return;
        }
        try {
          if (qty <= 0) {
            await get().removeFromCart(id, isLoggedIn, isAdmin);
          } else {
            const res = await carritoService.actualizarCantidad(id, qty);
            set({ cart: mapApiToLocal(res.data.items || []) });
          }
        } catch (e) {
          console.error("Error actualizando cantidad", e);
          showRequestError(e, "No se pudo actualizar la cantidad");
        }
      },

      clearCart: async (isLoggedIn = false, isAdmin = false) => {
        if (!isLoggedIn || isAdmin) {
          set({ cart: [] });
          return;
        }
        try {
          await carritoService.vaciarCarrito();
          set({ cart: [] });
        } catch (e) {
          console.error("Error vaciando carrito", e);
          showRequestError(e, "No se pudo vaciar el carrito");
        }
      },
    }),
    {
      name: "chantilly-cart",
      // Solo persiste el carrito (no el estado de apertura del drawer)
      partialize: (state) => ({ cart: state.cart }),
    }
  )
);
