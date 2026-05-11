import React from "react";
import { Link } from "react-router";
import { Shield, CreditCard, Truck, RefreshCcw, Lock } from "lucide-react";

export default function Terms() {
  const blocks = [
    {
      id: "general",
      icon: Shield,
      title: "1. Consideraciones Generales",
      content: "Al acceder y realizar compras en La Casa del Chantilly, aceptas nuestros términos y condiciones. Nuestros productos son artesanales, por lo que las imágenes son referenciales y pueden presentar ligeras variaciones. Nos reservamos el derecho de modificar precios y disponibilidad sin previo aviso.",
    },
    {
      id: "pagos",
      icon: CreditCard,
      title: "2. Políticas de Pedido y Pago",
      content: "Todos los pedidos deben realizarse con al menos 24 horas de anticipación para garantizar su frescura. Aceptamos tarjetas de crédito, débito, Yape, Plin y transferencias bancarias. El pedido se confirmará únicamente tras la validación del pago al 100%.",
    },
    {
      id: "entregas",
      icon: Truck,
      title: "3. Entregas y Delivery",
      content: "El servicio de delivery abarca zonas específicas de Lima Metropolitana y tiene un costo adicional. Los rangos horarios de entrega son estimados (margen de 1 hora). Es responsabilidad del cliente asegurar que alguien reciba el pedido en la dirección indicada.",
    },
    {
      id: "cambios",
      icon: RefreshCcw,
      title: "4. Cambios y Devoluciones",
      content: "Dada la naturaleza perecedera de nuestros productos, no se aceptan devoluciones por cambio de opinión. Si el producto llega en mal estado o no corresponde a lo solicitado, debes reportarlo dentro de la primera hora de recepción adjuntando fotografías para proceder con el reemplazo o reembolso.",
    },
    {
      id: "privacidad",
      icon: Lock,
      title: "5. Políticas de Privacidad",
      content: "Protegemos tus datos personales conforme a la Ley de Protección de Datos Personales. La información ingresada en nuestra plataforma (nombres, correos, direcciones) se utiliza exclusivamente para el procesamiento de tus pedidos y envíos de promociones (si has dado tu consentimiento). Nunca compartiremos tus datos con terceros.",
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-16" style={{ fontFamily: "Poppins" }}>
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-gray-800 font-bold text-4xl mb-4">Términos y Condiciones</h1>
          <div className="w-20 h-1.5 bg-red-600 mx-auto rounded-full mb-6" />
          <p className="text-gray-600 text-lg">Por favor lee cuidadosamente nuestras normativas antes de realizar una compra. Tu transparencia y seguridad son nuestra prioridad.</p>
        </div>

        <div className="space-y-8">
          {blocks.map((block) => (
            <div key={block.id} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-5">
                <div className="bg-red-50 p-4 rounded-xl text-red-600 flex-shrink-0">
                  <block.icon className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-3">{block.title}</h2>
                  <p className="text-gray-600 leading-relaxed">{block.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-500 mb-6">¿Tienes alguna duda sobre nuestras políticas?</p>
          <Link to="/" className="inline-flex items-center justify-center bg-yellow-400 text-gray-900 font-bold px-8 py-3 rounded-lg hover:bg-yellow-500 transition-colors shadow-sm">
            Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
