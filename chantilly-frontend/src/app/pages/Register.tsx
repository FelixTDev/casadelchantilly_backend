import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router";
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, ArrowLeft } from "lucide-react";
import { useApp } from "../context/AppContext";
import { IMAGES } from "../data/mock-data";

export default function Register() {
  const [form, setForm] = useState({ name: "", apellido: "", email: "", phone: "", password: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [error, setError] = useState("");
  const { register, loading } = useApp();
  const navigate = useNavigate();
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(form).some(v => !v)) { setError("Por favor, completa todos los campos"); return; }
    if (form.password !== form.confirm) { setError("Las contraseñas no coinciden"); return; }

    setError("");
    try {
      await register({
        nombre: form.name,
        apellido: form.apellido,
        email: form.email,
        password: form.password,
        telefono: form.phone,
      });
      navigate("/login");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.mensaje ?? "No se pudo registrar la cuenta. Intenta nuevamente.");
      } else {
        setError("No se pudo registrar la cuenta");
      }
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-row-reverse" style={{ fontFamily: "Poppins" }}>
      
      {/* Mitad Derecha (ahora izquierda): Formulario */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-8 sm:px-16 py-12 relative overflow-y-auto">
        <div className="absolute top-8 left-8">
          <Link to="/" className="text-gray-400 hover:text-gray-900 transition-colors flex items-center gap-2 font-medium text-sm">
            <ArrowLeft className="w-4 h-4" /> Volver al inicio
          </Link>
        </div>

        <div className="w-full max-w-md mt-10 lg:mt-0">
          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-gray-900 font-extrabold text-3xl sm:text-4xl mb-3 tracking-tight">Crea tu cuenta</h1>
            <p className="text-gray-500 text-base">Únete a La Casa del Chantilly y accede a promociones exclusivas.</p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-[#D32F2F] text-[#D32F2F] p-4 rounded-r-lg mb-8 font-medium text-sm shadow-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2 font-bold text-sm">Nombre</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400 group-focus-within:text-[#D32F2F] transition-colors" />
                  </div>
                  <input 
                    value={form.name} 
                    onChange={e => set("name", e.target.value)} 
                    placeholder="María" 
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#D32F2F] focus:bg-white transition-all" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 mb-2 font-bold text-sm">Apellido</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400 group-focus-within:text-[#D32F2F] transition-colors" />
                  </div>
                  <input 
                    value={form.apellido} 
                    onChange={e => set("apellido", e.target.value)} 
                    placeholder="García" 
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#D32F2F] focus:bg-white transition-all" 
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-2 font-bold text-sm">Correo electrónico</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-[#D32F2F] transition-colors" />
                </div>
                <input 
                  type="email" 
                  value={form.email} 
                  onChange={e => set("email", e.target.value)} 
                  placeholder="tu@correo.com" 
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#D32F2F] focus:bg-white transition-all" 
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-2 font-bold text-sm">Teléfono</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-[#D32F2F] transition-colors" />
                </div>
                <input 
                  value={form.phone} 
                  onChange={e => set("phone", e.target.value)} 
                  placeholder="987 654 321" 
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#D32F2F] focus:bg-white transition-all" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2 font-bold text-sm">Contraseña</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-[#D32F2F] transition-colors" />
                  </div>
                  <input 
                    type={showPw ? "text" : "password"} 
                    value={form.password} 
                    onChange={e => set("password", e.target.value)} 
                    placeholder="••••••••" 
                    className="w-full pl-12 pr-10 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#D32F2F] focus:bg-white transition-all" 
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition-colors">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-gray-700 mb-2 font-bold text-sm">Confirmar</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-[#D32F2F] transition-colors" />
                  </div>
                  <input 
                    type={showConfirmPw ? "text" : "password"} 
                    value={form.confirm} 
                    onChange={e => set("confirm", e.target.value)} 
                    placeholder="••••••••" 
                    className="w-full pl-12 pr-10 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#D32F2F] focus:bg-white transition-all" 
                  />
                  <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition-colors">
                    {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 bg-[#D32F2F] hover:bg-red-700 text-white font-bold py-4 rounded-full shadow-lg hover:shadow-red-900/20 transform hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-6"
            >
              {loading ? "Registrando..." : (
                <>Comenzar <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>

          <p className="text-center mt-10 text-gray-500 text-sm">
            ¿Ya tienes una cuenta? <Link to="/login" className="text-[#D32F2F] font-bold hover:underline">Inicia sesión</Link>
          </p>
        </div>
      </div>

      {/* Mitad Izquierda (ahora derecha): Imagen Inmersiva (Solo en Desktop) */}
      <div className="hidden lg:block lg:w-1/2 relative bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10" />
        <img 
          src={IMAGES.cupcakes} 
          alt="La Casa del Chantilly" 
          className="absolute inset-0 w-full h-full object-cover opacity-90 transform scale-105"
        />
        <div className="absolute bottom-0 left-0 right-0 p-16 z-20">
          <div className="w-16 h-1 bg-[#D32F2F] rounded-full mb-6"></div>
          <h2 className="text-white text-5xl font-extrabold mb-4 leading-tight">
            Únete a nuestra <br/>familia.
          </h2>
          <p className="text-gray-200 text-lg max-w-md">
            Crea tu cuenta hoy y descubre un mundo de dulzura, ofertas exclusivas y pedidos rápidos.
          </p>
        </div>
      </div>
      
    </div>
  );
}
