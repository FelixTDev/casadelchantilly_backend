import React, { useEffect, useMemo, useState, useRef } from "react";
import { Link, useSearchParams } from "react-router";
import { Search, X, ShoppingCart, Filter, PackageSearch } from "lucide-react";
import { BtnYellow, ProductSkeleton } from "../components/shared";
import { useApp } from "../context/AppContext";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { productoService, ProductoApi, CategoriaApi } from "../../services/productoService";
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

export default function Catalog() {
  const [params] = useSearchParams();
  const initialCat = params.get("cat") || "";
  const [categories, setCategories] = useState<CategoriaApi[]>([]);
  const [selectedCat, setSelectedCat] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<ViewProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const { addToCart } = useApp();
  const initialMount = useRef(true);

  useEffect(() => {
    const loadInitial = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          productoService.getAll(),
          productoService.getCategorias(),
        ]);
        setProducts(productsRes.data.map(mapProductoToView));
        setCategories(categoriesRes.data);
        setLoadError("");
        if (initialCat) {
          const match = categoriesRes.data.find((c) => c.nombre.toLowerCase() === initialCat.toLowerCase());
          if (match?.id) setSelectedCat(match.id);
        }
      } catch (error) {
        console.error("Error cargando catalogo", error);
        setLoadError("No pudimos cargar el catálogo en este momento.");
      } finally {
        setLoading(false);
      }
    };
    loadInitial();
  }, [initialCat]);

  useEffect(() => {
    if (initialMount.current) {
      initialMount.current = false;
      return;
    }
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        if (search.trim()) {
          const response = await productoService.getBuscar(search.trim());
          setProducts(response.data.map(mapProductoToView));
          setLoadError("");
          return;
        }
        if (selectedCat) {
          const response = await productoService.getByCategoria(selectedCat);
          setProducts(response.data.map(mapProductoToView));
          setLoadError("");
          return;
        }
        const response = await productoService.getAll();
        setProducts(response.data.map(mapProductoToView));
        setLoadError("");
      } catch (error) {
        console.error("Error consultando catalogo", error);
        setLoadError("No pudimos actualizar los productos. Intenta nuevamente.");
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search, selectedCat]);

  const filtered = useMemo(() => products, [products]);

  return (
    <div className="min-h-screen bg-[#F9FAFB]" style={{ fontFamily: "Poppins" }}>
      
      {/* Hero Banner del Catálogo */}
      <div className="bg-[#D32F2F] pt-12 pb-24 px-4 relative overflow-hidden">
        {/* Decoraciones de fondo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full blur-2xl transform -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-white mb-4" style={{ fontWeight: 800, fontSize: 40, lineHeight: 1.2 }}>Nuestro Menú</h1>
          <p className="text-red-100 mb-8 max-w-xl mx-auto text-lg">Descubre nuestra selección de tortas, postres y bocaditos horneados hoy mismo para ti.</p>
          
          {/* Buscador Integrado */}
          <div className="relative max-w-2xl mx-auto group">
            <Search className="absolute left-5 top-4 w-6 h-6 text-gray-400 group-focus-within:text-[#D32F2F] transition-colors z-10" />
            <input 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              placeholder="¿Qué se te antoja hoy? Ej: Torta de Fresa..."
              className="w-full pl-14 pr-12 py-4 bg-white rounded-2xl border-0 shadow-xl text-lg text-gray-800 placeholder-gray-400 focus:ring-4 focus:ring-white/30 focus:outline-none transition-all relative z-0" 
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-5 top-4 text-gray-400 hover:text-gray-600 transition-colors z-10">
                <X className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16 -mt-8 relative z-20">
        
        {/* Filtros Categorías */}
        <div className="bg-white rounded-2xl shadow-md p-2 flex items-center gap-2 mb-10 overflow-x-auto no-scrollbar border border-gray-100">
          <div className="flex items-center gap-2 px-3 text-gray-400 font-medium">
            <Filter className="w-5 h-5 shrink-0" />
            <span className="text-sm uppercase tracking-wider hidden sm:block">Filtros</span>
          </div>
          <div className="w-px h-8 bg-gray-200 mx-1 shrink-0"></div>
          
          <button onClick={() => setSelectedCat(null)}
            className={`px-6 py-2.5 rounded-xl transition-all whitespace-nowrap shrink-0 shadow-sm ${!selectedCat ? "bg-gray-900 text-white font-bold" : "bg-gray-50 text-gray-600 hover:bg-gray-100 font-semibold"}`}
            style={{ fontSize: 14 }}>
            Todos
          </button>
          
          {categories.map((c) => (
            <button key={c.id} onClick={() => setSelectedCat(selectedCat === c.id ? null : (c.id || null))}
              className={`px-6 py-2.5 rounded-xl transition-all whitespace-nowrap shrink-0 shadow-sm ${selectedCat === c.id ? "bg-yellow-400 text-gray-900 font-bold" : "bg-gray-50 text-gray-600 hover:bg-gray-100 font-semibold"}`}
              style={{ fontSize: 14 }}>
              {c.nombre}
            </button>
          ))}
        </div>

        {/* Grilla de Productos */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <ProductSkeleton key={i} />)}
          </div>
        ) : loadError ? (
          <div className="bg-white rounded-3xl shadow-sm border border-red-100 py-24 text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No pudimos cargar el catálogo</h3>
            <p className="text-gray-500">{loadError}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 py-24 text-center">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <PackageSearch className="w-12 h-12 text-gray-300" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No encontramos resultados</h3>
            <p className="text-gray-500">Prueba buscando con otros términos o seleccionando "Todos".</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filtered.map((p) => (
              <div key={p.id} className="bg-white rounded-3xl shadow-sm hover:shadow-xl border border-gray-100 overflow-hidden group flex flex-col transition-all duration-300 hover:-translate-y-1">
                <Link to={`/producto/${p.id}`} className="block relative overflow-hidden aspect-[4/3] bg-gray-50">
                  <ImageWithFallback 
                    src={p.image} 
                    alt={p.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                  {/* Etiqueta flotante */}
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase shadow-sm border border-white/20">
                      {p.category}
                    </span>
                  </div>
                  {/* Overlay oscuro sutil */}
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Link>
                
                <div className="p-6 flex flex-col flex-1">
                  <div className="mb-4 flex-1">
                    <Link to={`/producto/${p.id}`}>
                      <h3 className="text-gray-900 font-extrabold text-xl leading-tight line-clamp-2 hover:text-[#D32F2F] transition-colors">{p.name}</h3>
                    </Link>
                  </div>
                  
                  <div className="flex items-end justify-between mt-auto">
                    <div>
                      <p className="text-gray-500 text-xs font-medium mb-1">Stock: {p.stock} unid.</p>
                      <p className="text-[#D32F2F] font-extrabold text-2xl">S/ {p.price.toFixed(2)}</p>
                    </div>
                    
                    <button 
                      onClick={(e) => { e.preventDefault(); addToCart(p); toast.success("Agregado al carrito"); }}
                      className="w-12 h-12 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 rounded-full shadow-md shadow-yellow-400/20 flex items-center justify-center transform hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2"
                      title="Añadir al carrito"
                    >
                      <ShoppingCart className="w-5 h-5" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
