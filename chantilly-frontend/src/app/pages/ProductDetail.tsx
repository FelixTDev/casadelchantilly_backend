import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { ChevronRight, Home, ShoppingCart, Package, Minus, Plus, Truck, Snowflake, Award } from "lucide-react";
import { BtnPrimary } from "../components/shared";
import { useApp } from "../context/AppContext";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { productoService, ProductoApi } from "../../services/productoService";
import { validateDedication } from "../lib/validation";
import { toast } from "sonner";

type ViewProduct = {
  id: number;
  name: string;
  category: string;
  image: string;
  price: number;
  stock: number;
  description: string;
};

function mapProductoToView(p: ProductoApi): ViewProduct {
  return {
    id: p.id || 0,
    name: p.nombre,
    category: p.categoriaNombre || "Sin categoria",
    image: p.imagenUrl || "",
    price: Number(p.precio ?? 0),
    stock: p.stock ?? 0,
    description: p.descripcion || "",
  };
}

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState<ViewProduct | null>(null);
  const [qty, setQty] = useState(1);
  const [custom, setCustom] = useState("");
  const [loading, setLoading] = useState(true);
  const { addToCart } = useApp();

  const MAX_CUSTOM_LEN = 60;
  const dedicationError = validateDedication(custom, MAX_CUSTOM_LEN);
  const isOutOfStock = product?.stock === 0;

  useEffect(() => {
    const load = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        const response = await productoService.getById(Number(id));
        setProduct(mapProductoToView(response.data));
      } catch (error) {
        console.error("Error cargando producto", error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!product) return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center" style={{ fontFamily: "Poppins" }}>
      <div className="text-center bg-white p-10 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-gray-800 font-bold text-2xl mb-4">Producto no encontrado</h1>
        <p className="text-gray-500 mb-6">El producto que buscas ya no está disponible.</p>
        <Link to="/catalogo"><BtnPrimary>Volver al Catálogo</BtnPrimary></Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-10 px-4" style={{ fontFamily: "Poppins" }}>
      <div className="max-w-6xl mx-auto">
        
        {/* Breadcrumbs (Migas de pan) */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8 font-medium">
          <Link to="/" className="hover:text-[#D32F2F] transition-colors"><Home className="w-4 h-4" /></Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <Link to="/catalogo" className="hover:text-[#D32F2F] transition-colors">Catálogo</Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900">{product.category}</span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-[#D32F2F] font-bold truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            
            {/* Izquierda: Imagen Inmersiva */}
            <div className="relative aspect-square lg:aspect-auto lg:h-full bg-gray-50 overflow-hidden group">
              <ImageWithFallback 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              />
              {/* Sutil gradiente para integrar con el borde */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            
            {/* Derecha: Detalles del Producto */}
            <div className="p-8 md:p-12 flex flex-col justify-center">
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-[#D32F2F] bg-red-50 border border-red-100 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase">
                  {product.category}
                </span>
                
                {/* Stock dinámico */}
                <div className={`flex items-center gap-1.5 text-sm font-bold px-3 py-1 rounded-full ${product.stock > 5 ? "bg-green-50 text-green-700" : "bg-orange-50 text-orange-600"}`}>
                  <Package className="w-4 h-4" />
                  {product.stock > 5 ? `${product.stock} disponibles` : `¡Solo ${product.stock} restantes!`}
                </div>
              </div>

              <h1 className="text-gray-900 mb-3" style={{ fontWeight: 800, fontSize: 36, lineHeight: 1.1 }}>{product.name}</h1>
              <p className="text-[#D32F2F] mb-6" style={{ fontWeight: 800, fontSize: 32 }}>S/ {product.price.toFixed(2)}</p>
              
              <p className="text-gray-600 mb-8 text-base leading-relaxed">{product.description}</p>

              {/* Área de Personalización Inteligente */}
              <div className="mb-8">
                <div className="flex justify-between items-end mb-2">
                  <label className="text-gray-800 font-bold text-sm">Dedicatoria Especial (opcional)</label>
                  <span className={`text-xs font-semibold ${custom.length >= MAX_CUSTOM_LEN ? "text-red-500" : "text-gray-400"}`}>
                    {custom.length}/{MAX_CUSTOM_LEN}
                  </span>
                </div>
                <div className="relative">
                  <textarea 
                    value={custom} 
                    onChange={e => setCustom(e.target.value.slice(0, MAX_CUSTOM_LEN))} 
                    rows={2} 
                    placeholder="Ej: Feliz Cumpleaños María..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-50 focus:outline-none resize-none transition-all text-gray-700" 
                  />
                  {custom.length > 0 && (
                    <div className="absolute right-3 bottom-3 w-2 h-2 rounded-full bg-green-500"></div>
                  )}
                </div>
                <p className="mt-2 text-xs text-gray-500">Usa un mensaje corto. No se guardan textos vacíos o solo con espacios.</p>
                {dedicationError && <p className="mt-2 text-sm text-red-600">{dedicationError}</p>}
              </div>

              {/* Controles de Compra */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                {/* Selector de Cantidad Premium */}
                <div className="flex items-center justify-between border-2 border-gray-100 rounded-full bg-gray-50 overflow-hidden h-14 shrink-0 sm:w-36">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-12 h-full flex items-center justify-center hover:bg-gray-200 text-gray-600 transition-colors" disabled={qty <= 1}>
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="font-extrabold text-gray-900 text-lg w-8 text-center">{qty}</span>
                  <button onClick={() => setQty(Math.min(Math.max(1, product.stock), qty + 1))} className="w-12 h-full flex items-center justify-center hover:bg-gray-200 text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={qty >= Math.max(1, product.stock)}>
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                <button 
                  onClick={() => {
                    if (isOutOfStock) {
                      toast.error("Este producto está agotado");
                      return;
                    }
                    if (dedicationError) {
                      toast.error(dedicationError);
                      return;
                    }
                    addToCart(product, qty, custom.trim() ? custom.trim() : undefined);
                  }}
                  disabled={!!dedicationError || isOutOfStock}
                  className="flex-1 h-14 bg-[#D32F2F] hover:bg-red-700 text-white font-bold text-lg rounded-full shadow-lg shadow-red-200 flex items-center justify-center gap-2 transform hover:-translate-y-1 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <ShoppingCart className="w-6 h-6" /> {isOutOfStock ? "Producto Agotado" : "Añadir al Carrito"}
                </button>
              </div>

              {/* Value Props (Gatillos de Confianza) */}
              <div className="grid grid-cols-3 gap-2 pt-6 border-t border-gray-100">
                <div className="flex flex-col items-center text-center gap-1.5">
                  <div className="bg-blue-50 p-2.5 rounded-full text-blue-600"><Snowflake className="w-5 h-5" /></div>
                  <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wide">Fresco del Día</span>
                </div>
                <div className="flex flex-col items-center text-center gap-1.5">
                  <div className="bg-green-50 p-2.5 rounded-full text-green-600"><Truck className="w-5 h-5" /></div>
                  <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wide">Envío Seguro</span>
                </div>
                <div className="flex flex-col items-center text-center gap-1.5">
                  <div className="bg-yellow-50 p-2.5 rounded-full text-yellow-600"><Award className="w-5 h-5" /></div>
                  <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wide">Calidad Premium</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
