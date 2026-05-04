import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { Home, Cake, Gift, Truck, Star, ChevronRight, Copy, Check, Tag } from "lucide-react";
import { BtnPrimary, BtnYellow } from "../components/shared";
import { PRODUCTS, IMAGES } from "../data/mock-data";
import { useApp } from "../context/AppContext";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { productoService, PromocionApi } from "../../services/productoService";

const FEATURED_CATS = [
  { name: "Tortas", icon: Cake, img: IMAGES.birthday },
  { name: "Cupcakes", icon: Gift, img: IMAGES.cupcakes },
  { name: "Postres", icon: Star, img: IMAGES.cheesecake },
  { name: "Panes", icon: Home, img: IMAGES.bread },
];

function CouponCard({ promo }: { promo: PromocionApi }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!promo.codigoCupon) return;
    navigator.clipboard.writeText(promo.codigoCupon).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const descuentoLabel =
    promo.tipo === "PORCENTAJE"
      ? `${promo.valor}% de descuento`
      : `S/ ${Number(promo.valor).toFixed(2)} de descuento`;

  return (
    <div className="relative bg-white rounded-2xl shadow-md overflow-hidden flex flex-col sm:flex-row">
      {/* Franja lateral roja */}
      <div className="bg-red-600 text-white flex flex-col items-center justify-center px-5 py-6 sm:py-0 min-w-[100px]">
        <Tag className="w-7 h-7 mb-1" />
        <span className="text-xs font-semibold uppercase tracking-wider text-center leading-tight">
          {promo.tipo === "PORCENTAJE" ? "% OFF" : "DESCUENTO"}
        </span>
      </div>

      {/* Separador punteado */}
      <div className="hidden sm:flex flex-col justify-between py-3 px-0">
        <div className="w-5 h-5 rounded-full bg-gray-100 -ml-2.5 -mt-2.5" />
        <div className="border-l-2 border-dashed border-gray-200 flex-1 mx-auto" style={{ width: 1 }} />
        <div className="w-5 h-5 rounded-full bg-gray-100 -ml-2.5 -mb-2.5" />
      </div>

      {/* Contenido */}
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
  const { addToCart } = useApp();
  const featured = PRODUCTS.slice(0, 4);
  const [promociones, setPromociones] = useState<PromocionApi[]>([]);

  useEffect(() => {
    productoService.getPromociones().then(res => {
      const activas = res.data.filter(p => p.activo);
      setPromociones(activas);
    }).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-red-600 text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 text-center md:text-left">
            <p className="text-yellow-400 mb-2 font-semibold">Pastelería Artesanal Peruana</p>
            <h1 className="text-3xl md:text-5xl mb-4 font-bold leading-tight">
              Endulzamos tus <span className="text-yellow-400">momentos</span> más especiales
            </h1>
            <p className="text-white/80 mb-8 max-w-lg text-base">
              Desde 1998 horneamos con amor tortas, pasteles y bocaditos para toda ocasión. Ingredientes de primera calidad y recetas tradicionales peruanas.
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <Link to="/catalogo">
                <BtnYellow>Ver Catálogo <ChevronRight className="w-4 h-4 inline ml-1" /></BtnYellow>
              </Link>
              <Link to="/registro">
                <button className="border-2 border-white text-white px-6 py-3 rounded-lg hover:bg-white hover:text-red-600 transition font-semibold">
                  Crear Cuenta
                </button>
              </Link>
            </div>
          </div>
          <div className="flex-1 max-w-md">
            <ImageWithFallback src={IMAGES.wedding} alt="Torta especial" className="rounded-2xl shadow-2xl w-full object-cover aspect-square" />
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-center text-gray-800 font-bold text-3xl mb-2">Nuestras Categorías</h2>
          <div className="w-16 h-1 bg-yellow-400 mx-auto mb-10 rounded" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {FEATURED_CATS.map(cat => (
              <Link to={`/catalogo?cat=${cat.name}`} key={cat.name} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow group">
                <div className="aspect-square overflow-hidden">
                  <ImageWithFallback src={cat.img} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-4 text-center">
                  <cat.icon className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
                  <p className="text-gray-800 font-semibold">{cat.name}</p>
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
              ¡Copia el código y úsalo al finalizar tu compra!
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map(p => (
              <div key={p.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                <Link to={`/producto/${p.id}`}>
                  <div className="aspect-square overflow-hidden">
                    <ImageWithFallback src={p.image} alt={p.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                  </div>
                </Link>
                <div className="p-4">
                  <p className="text-gray-800 font-semibold mb-1">{p.name}</p>
                  <p className="text-red-600 font-bold text-xl mb-3">S/ {p.price.toFixed(2)}</p>
                  <BtnYellow className="w-full py-2" onClick={() => addToCart(p)}>Agregar</BtnYellow>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/catalogo"><BtnPrimary>Ver Todo el Catálogo</BtnPrimary></Link>
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Truck, title: "Delivery Lima", desc: "Envío a todo Lima Metropolitana. Llega fresco a tu puerta." },
            { icon: Star, title: "Calidad Premium", desc: "Ingredientes seleccionados y recetas artesanales de tradición." },
            { icon: Gift, title: "Personalización", desc: "Diseñamos tu torta soñada. Consulta sin compromiso." },
          ].map(f => (
            <div key={f.title} className="bg-white rounded-xl p-8 text-center shadow-md">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <f.icon className="w-8 h-8 text-yellow-400" />
              </div>
              <h3 className="text-gray-800 font-bold mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
