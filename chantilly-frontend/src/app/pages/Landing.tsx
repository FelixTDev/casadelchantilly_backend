import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { Home, Cake, Gift, Truck, ChevronRight, Copy, Check, Tag, Heart, Award, Clock, Croissant, IceCream, Star } from "lucide-react";
import { BtnPrimary, BtnYellow } from "../components/shared";
import { IMAGES } from "../data/mock-data";
import { useApp } from "../context/AppContext";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { productoService, PromocionApi, ProductoApi } from "../../services/productoService";
import { toast } from "sonner";

const FEATURED_CATS = [
  { name: "Tortas", icon: Cake, img: IMAGES.birthday },
  { name: "Cupcakes", icon: Gift, img: IMAGES.cupcakes },
  { name: "Cheesecakes", icon: IceCream, img: IMAGES.cheesecake },
  { name: "Especiales", icon: Star, img: IMAGES.wedding },
];

function mapProductoToView(p: ProductoApi) {
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

function CouponCard({ promo }: { promo: PromocionApi }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!promo.codigoCupon) return;
    navigator.clipboard.writeText(promo.codigoCupon).then(() => {
      setCopied(true);
      toast.success("Cupón copiado al portapapeles");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const descuentoLabel =
    promo.tipo === "PORCENTAJE"
      ? `${promo.valor}% de descuento`
      : `S/ ${Number(promo.valor).toFixed(2)} de descuento`;

  return (
    <div className="relative bg-white rounded-2xl shadow-md overflow-hidden flex flex-col sm:flex-row">
      <div className="bg-red-600 text-white flex flex-col items-center justify-center px-5 py-6 sm:py-0 min-w-[100px]">
        <Tag className="w-7 h-7 mb-1" />
        <span className="text-xs font-semibold uppercase tracking-wider text-center leading-tight">
          {promo.tipo === "PORCENTAJE" ? "% OFF" : "DESCUENTO"}
        </span>
      </div>

      <div className="hidden sm:flex flex-col justify-between py-3 px-0">
        <div className="w-5 h-5 rounded-full bg-gray-100 -ml-2.5 -mt-2.5" />
        <div className="border-l-2 border-dashed border-gray-200 flex-1 mx-auto" style={{ width: 1 }} />
        <div className="w-5 h-5 rounded-full bg-gray-100 -ml-2.5 -mb-2.5" />
      </div>

      <div className="flex-1 p-5 flex flex-col gap-2">
        <h3 className="font-bold text-gray-800 text-base leading-tight">{promo.nombre}</h3>
        {promo.descripcion && (
          <p className="text-gray-500 text-sm leading-snug">{promo.descripcion}</p>
        )}
        <p className="text-red-600 font-bold text-lg">{descuentoLabel}</p>

        {promo.codigoCupon ? (
          <div className="flex items-center gap-2 mt-1">
            <span className="bg-yellow-50 border border-dashed border-yellow-400 text-yellow-700 font-bold text-sm px-4 py-1.5 rounded-lg tracking-widest uppercase">
              {promo.codigoCupon}
            </span>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all duration-200 ${
                copied
                  ? "bg-green-50 border-green-400 text-green-600"
                  : "bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "¡Copiado!" : "Copiar"}
            </button>
          </div>
        ) : (
          <span className="text-xs text-gray-400 italic">Aplica automáticamente</span>
        )}

        <p className="text-xs text-gray-400 mt-1">
          Válido: {promo.fechaInicio} → {promo.fechaFin}
        </p>
      </div>
    </div>
  );
}

export default function Landing() {
  const { addToCart, isLoggedIn } = useApp();
  const [promociones, setPromociones] = useState<PromocionApi[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    productoService.getPromociones().then(res => {
      const activas = res.data.filter(p => p.activo);
      setPromociones(activas);
    }).catch(() => {
      setLoadError("Parte del catálogo no está disponible en este momento.");
    });

    productoService.getAll().then(res => {
      setProductos(res.data.map(mapProductoToView));
    }).catch(() => {
      setLoadError("Parte del catálogo no está disponible en este momento.");
    });
  }, []);

  const combos = productos.filter(p => p.category?.toLowerCase() === "combos");
  const featured = productos.length > 0 ? productos.slice(0, 4) : [];

  return (
    <div>
      {/* Hero */}
      <section className="bg-[#B83A3A] text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 text-center md:text-left">
            <p className="text-yellow-300 mb-2 font-semibold">Pastelería Artesanal Peruana</p>
            <h1 className="text-3xl md:text-5xl mb-4 font-bold leading-tight">
              Diseñamos postres que convierten una fecha importante en un recuerdo que sí se comenta
            </h1>
            <p className="text-white/80 mb-8 max-w-lg text-base">
              Tortas, bocaditos y mesas dulces con acabado cuidado, sabor consistente y entrega confiable. Ideal para cumpleaños, oficina, aniversario o una celebración que no admite improvisaciones.
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <Link to="/catalogo">
                <BtnYellow>Ver Catálogo <ChevronRight className="w-4 h-4 inline ml-1" /></BtnYellow>
              </Link>
              {!isLoggedIn && (
                <Link to="/registro">
                    <button className="border-2 border-white text-white px-6 py-3 rounded-lg hover:bg-white hover:text-[#B83A3A] transition font-semibold">
                      Crear Cuenta
                    </button>
                </Link>
              )}
            </div>
          </div>
          <div className="flex-1 max-w-md">
            <ImageWithFallback src={IMAGES.wedding} alt="Torta especial" className="rounded-2xl shadow-2xl w-full object-cover aspect-square" />
          </div>
        </div>
      </section>

      {loadError && (
        <section className="bg-amber-50 border-y border-amber-200">
          <div className="max-w-7xl mx-auto px-4 py-3 text-sm text-amber-800">
            {loadError}
          </div>
        </section>
      )}

      {/* Combos Irresistibles */}
      {combos.length > 0 && (
        <section id="combos" className="py-16 bg-red-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-10">
              <span className="bg-[#B83A3A] text-white px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider inline-flex items-center gap-2 mb-4">
                <Gift className="w-4 h-4" /> Oferta Especial
              </span>
              <h2 className="text-gray-800 font-bold text-3xl md:text-4xl mb-4">Combos Irresistibles</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">Paquetes listos para resolver una celebración completa con menos decisiones y mejor costo por pedido.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {combos.map(combo => {
                const ahorro = combo.price * 0.20; // 20% de descuento ficticio
                const precioOriginal = combo.price + ahorro;
                
                return (
                  <div key={combo.id} className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col sm:flex-row border border-red-100 group">
                    <div className="sm:w-2/5 relative overflow-hidden">
                      <ImageWithFallback src={combo.image} alt={combo.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 min-h-[200px]" />
                      <div className="absolute top-0 left-0 bg-red-600 text-white font-bold px-4 py-1.5 rounded-br-2xl text-sm shadow-md">Ahorras S/ {ahorro.toFixed(2)}</div>
                    </div>
                    <div className="sm:w-3/5 p-6 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-xl text-gray-800 leading-tight mb-2">{combo.name}</h3>
                        <p className="text-gray-500 text-sm mb-4 line-clamp-3">{combo.description}</p>
                      </div>
                      <div className="flex items-end justify-between mt-auto">
                        <div>
                          <p className="text-gray-400 text-sm line-through mb-0.5">S/ {precioOriginal.toFixed(2)}</p>
                          <p className="text-red-600 font-bold text-2xl">S/ {combo.price.toFixed(2)}</p>
                        </div>
                        <BtnYellow className="px-5 py-2.5 font-bold shadow-md hover:-translate-y-1 transition-transform" onClick={() => { addToCart(combo); toast.success("Combo agregado al carrito"); }}>
                          Añadir
                        </BtnYellow>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Categorías (Rediseño Premium) */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-gray-900 font-extrabold text-3xl md:text-4xl mb-4">Explora Nuestro Menú</h2>
            <div className="w-20 h-1.5 bg-[#D32F2F] mx-auto rounded-full mb-4" />
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">
              Encuentra el dulce perfecto para cada ocasión especial. Horneados a diario con pasión.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {FEATURED_CATS.map(cat => (
              <Link to={`/catalogo?cat=${cat.name}`} key={cat.name} className="relative group rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 block h-80 lg:h-96 transform hover:-translate-y-2">
                <ImageWithFallback 
                  src={cat.img} 
                  alt={cat.name} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                />
                
                {/* Gradiente oscuro inferior para legibilidad del texto */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
                
                {/* Contenido sobre la imagen */}
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 border border-white/30 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <cat.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-extrabold text-2xl tracking-wide">{cat.name}</h3>
                      <div className="w-10 h-10 rounded-full bg-[#D32F2F] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transform -translate-x-4 group-hover:translate-x-0 transition-all duration-300 shadow-lg">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                    {/* Subtítulo dinámico que aparece en hover */}
                    <p className="text-white/80 text-sm mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                      Ver colección completa
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Promociones Especiales */}
      {promociones.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-center text-gray-800 font-bold text-3xl mb-2">Promociones Especiales</h2>
            <div className="w-16 h-1 bg-red-600 mx-auto mb-3 rounded" />
            <p className="text-center text-gray-500 text-sm mb-10">
              Activa un cupón o aprovecha descuentos automáticos para cerrar tu compra con mejor ticket.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {promociones.map(promo => (
                <CouponCard key={promo.id} promo={promo} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Productos Destacados */}
      <section className={`py-16 ${promociones.length > 0 ? "bg-gray-50" : "bg-white"}`}>
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-center text-gray-800 font-bold text-3xl mb-2">Productos Destacados</h2>
          <div className="w-16 h-1 bg-yellow-400 mx-auto mb-10 rounded" />
          {featured.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Aún no hay productos destacados</h3>
              <p className="text-gray-500">Vuelve más tarde o revisa el catálogo completo.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map(p => (
                <div key={p.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-100 overflow-hidden hover:-translate-y-1 transition-all duration-300">
                  <Link to={`/producto/${p.id}`}>
                    <div className="aspect-square overflow-hidden relative group">
                      <ImageWithFallback src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">Ver Detalle</span>
                      </div>
                    </div>
                  </Link>
                  <div className="p-5 flex flex-col justify-between h-40">
                    <p className="text-gray-800 font-bold text-lg leading-tight line-clamp-2">{p.name}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <p className="text-red-600 font-bold text-xl">S/ {p.price.toFixed(2)}</p>
                      <BtnYellow className="py-2 px-4 shadow-sm hover:shadow-md transition-all text-sm font-bold" onClick={() => { addToCart(p); toast.success("Agregado al carrito"); }}>
                        Añadir
                      </BtnYellow>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="text-center mt-10">
            <Link to="/catalogo"><BtnPrimary>Ver Todo el Catálogo</BtnPrimary></Link>
          </div>
        </div>
      </section>

      {/* Nosotros */}
      <section className="bg-red-600 py-20 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-bold text-3xl md:text-4xl mb-4">Conoce La Casa del Chantilly</h2>
            <div className="w-20 h-1.5 bg-yellow-400 mx-auto rounded-full mb-6" />
            <p className="text-white/80 max-w-2xl mx-auto text-lg">Más de 25 años endulzando los momentos más especiales de las familias peruanas con nuestra auténtica receta tradicional.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { icon: Clock, title: "Nuestra Historia", desc: "Desde 1998, nacimos con la pasión de hornear postres que unen a las familias. Cada receta lleva consigo décadas de perfeccionamiento y amor." },
              { icon: Award, title: "Calidad Artesanal", desc: "No usamos preservantes industriales. Seleccionamos los mejores ingredientes frescos para garantizar un sabor verdaderamente casero y premium." },
              { icon: Heart, title: "Nuestro Compromiso", desc: "Tu felicidad es nuestra prioridad. Cuidamos cada detalle, desde el horneado hasta la entrega, para que tu celebración sea absolutamente inolvidable." },
            ].map(f => (
              <div key={f.title} className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-2 text-center">
                <div className="w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3 hover:rotate-6 transition-transform shadow-lg">
                  <f.icon className="w-8 h-8 text-red-700" />
                </div>
                <h3 className="font-bold text-xl mb-3 text-white">{f.title}</h3>
                <p className="text-white/80 leading-relaxed text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
