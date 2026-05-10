import React, { useEffect, useMemo, useState, useRef } from "react";
import { Link, useSearchParams } from "react-router";
import { Search, X } from "lucide-react";
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
        if (initialCat) {
          const match = categoriesRes.data.find((c) => c.nombre.toLowerCase() === initialCat.toLowerCase());
          if (match?.id) setSelectedCat(match.id);
        }
      } catch (error) {
        console.error("Error cargando catalogo", error);
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
          return;
        }
        if (selectedCat) {
          const response = await productoService.getByCategoria(selectedCat);
          setProducts(response.data.map(mapProductoToView));
          return;
        }
        const response = await productoService.getAll();
        setProducts(response.data.map(mapProductoToView));
      } catch (error) {
        console.error("Error consultando catalogo", error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search, selectedCat]);

  const filtered = useMemo(() => products, [products]);

  return (
    <div className="min-h-screen bg-[#F5F5F5]" style={{ fontFamily: "Poppins" }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-[#333] mb-6" style={{ fontWeight: 700, fontSize: 28 }}>Nuestro Catalogo</h1>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar productos..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-[#D32F2F] focus:outline-none shadow-sm" />
          {search && <button onClick={() => setSearch("")} className="absolute right-4 top-3.5 text-gray-400"><X className="w-5 h-5" /></button>}
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          <button onClick={() => setSelectedCat(null)}
            className={`px-4 py-2 rounded-full transition ${!selectedCat ? "bg-[#D32F2F] text-white" : "bg-white text-[#333] border border-gray-200 hover:border-[#D32F2F]"}`}
            style={{ fontSize: 14, fontWeight: 600 }}>
            Todos
          </button>
          {categories.map((c) => (
            <button key={c.id} onClick={() => setSelectedCat(selectedCat === c.id ? null : (c.id || null))}
              className={`px-4 py-2 rounded-full transition ${selectedCat === c.id ? "bg-[#F5C518] text-[#333]" : "bg-white text-[#333] border border-gray-200 hover:border-[#F5C518]"}`}
              style={{ fontSize: 14, fontWeight: 600 }}>
              {c.nombre}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <ProductSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-500 py-20">No se encontraron productos</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-100 overflow-hidden hover:-translate-y-1 transition-all duration-300">
                <Link to={`/producto/${p.id}`}>
                  <div className="aspect-square overflow-hidden relative group">
                    <ImageWithFallback src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {/* Badge de Oferta (Si existiera) */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">Ver Detalle</span>
                    </div>
                  </div>
                </Link>
                <div className="p-5 flex flex-col justify-between h-44">
                  <div>
                    <span className="text-red-600 bg-red-50 border border-red-100 px-2.5 py-0.5 rounded-md text-xs font-semibold tracking-wide uppercase">{p.category}</span>
                    <p className="text-gray-800 mt-3 mb-1 font-bold text-lg leading-tight line-clamp-2">{p.name}</p>
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    <div>
                      <p className="text-red-600 font-bold text-xl">S/ {p.price.toFixed(2)}</p>
                      <p className="text-gray-400 text-xs font-medium mt-0.5">Stock: {p.stock}</p>
                    </div>
                    <BtnYellow className="py-2.5 px-4 shadow-sm hover:shadow-md transition-all text-sm font-bold" onClick={() => { addToCart(p); toast.success("Agregado al carrito"); }}>
                      Añadir
                    </BtnYellow>
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
