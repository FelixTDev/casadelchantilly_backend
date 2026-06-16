import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Eye, EyeOff, Mail, Lock, ArrowRight, ArrowLeft } from "lucide-react";
import { useApp } from "../context/AppContext";
import { IMAGES } from "../data/mock-data";
import { validateEmail, validatePassword } from "../lib/validation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "" });
  const { login, loading } = useApp();
  const navigate = useNavigate();

  const validateForm = () => {
    const nextErrors = {
      email: validateEmail(email),
      password: validatePassword(password),
    };
    setFieldErrors(nextErrors);
    return !nextErrors.email && !nextErrors.password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      setError("Corrige los campos marcados antes de continuar");
      return;
    }

    setError("");
    const result = await login(email, password);
    if (!result.success) {
      setError(result.error || "Credenciales incorrectas. Intenta de nuevo.");
      return;
    }
    navigate(responseRoleRoute());
  };

  const responseRoleRoute = () => {
    const userRaw = sessionStorage.getItem("chantilly_user");
    const rol = userRaw ? JSON.parse(userRaw).rol : "CLIENTE";
    return rol === "ADMIN" ? "/admin" : "/catalogo";
  };

  const isSubmitDisabled =
    loading ||
    !email.trim() ||
    !password ||
    !!validateEmail(email) ||
    !!validatePassword(password);

  return (
    <div className="min-h-screen bg-white flex" style={{ fontFamily: "Poppins" }}>
      
      {/* Mitad Izquierda: Formulario */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-8 sm:px-16 py-12 relative">
        <div className="absolute top-8 left-8">
          <Link to="/" className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2 font-medium text-sm">
            <ArrowLeft aria-hidden="true" className="w-4 h-4" /> Volver al inicio
          </Link>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-gray-900 font-extrabold text-3xl sm:text-4xl mb-3 tracking-tight">Bienvenido de vuelta</h1>
            <p className="text-gray-600 text-base">Ingresa a tu cuenta de La Casa del Chantilly y continúa disfrutando.</p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-[#D32F2F] text-[#D32F2F] p-4 rounded-r-lg mb-8 font-medium text-sm shadow-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="login-email" className="block text-gray-700 mb-2 font-bold text-sm">Correo electrónico</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-[#D32F2F] transition-colors" />
                </div>
                <input 
                  id="login-email"
                  type="email" 
                  value={email} 
                  onChange={e => {
                    setEmail(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, email: "" }));
                  }}
                  onBlur={() => setFieldErrors((prev) => ({ ...prev, email: validateEmail(email) }))}
                  placeholder="tu@correo.com"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#D32F2F] focus:bg-white transition-all transition-colors" 
                  aria-invalid={!!fieldErrors.email}
                />
              </div>
              {fieldErrors.email && <p className="mt-2 text-sm text-red-600">{fieldErrors.email}</p>}
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="login-password" className="block text-gray-700 font-bold text-sm">Contraseña</label>
                <Link to="/recuperar" className="text-[#D32F2F] hover:text-red-700 hover:underline text-sm font-semibold transition-colors">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-[#D32F2F] transition-colors" />
                </div>
                <input 
                  id="login-password"
                  type={showPw ? "text" : "password"} 
                  value={password} 
                  onChange={e => {
                    setPassword(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, password: "" }));
                  }}
                  onBlur={() => setFieldErrors((prev) => ({ ...prev, password: validatePassword(password) }))}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#D32F2F] focus:bg-white transition-all transition-colors" 
                  aria-invalid={!!fieldErrors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  aria-label={showPw ? "Ocultar contraseña" : "Mostrar contraseña"}
                  title={showPw ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPw ? <EyeOff aria-hidden="true" className="w-5 h-5" /> : <Eye aria-hidden="true" className="w-5 h-5" />}
                </button>
              </div>
              {fieldErrors.password && <p className="mt-2 text-sm text-red-600">{fieldErrors.password}</p>}
            </div>
            
            <button 
              type="submit" 
              disabled={isSubmitDisabled}
              className="w-full flex justify-center items-center gap-2 bg-[#D32F2F] hover:bg-red-700 text-white font-bold py-4 rounded-full shadow-lg hover:shadow-red-900/20 transform hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              {loading ? "Cargando..." : (
                <>Ingresar <ArrowRight aria-hidden="true" className="w-5 h-5" /></>
              )}
            </button>
          </form>

          <p className="text-center mt-10 text-gray-500 text-sm">
            ¿Aún no tienes una cuenta? <Link to="/registro" className="text-[#D32F2F] font-bold hover:underline">Regístrate aquí</Link>
          </p>

          <div className="mt-12 pt-6 border-t border-gray-100 flex flex-col gap-1 items-center justify-center">
            <span className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">Acceso seguro</span>
            <p className="text-gray-600 text-xs bg-gray-50 px-3 py-1 rounded-full">Usa tu correo y contraseña registrados</p>
          </div>
        </div>
      </div>

      {/* Mitad Derecha: Imagen Inmersiva (Solo en Desktop) */}
      <div className="hidden lg:block lg:w-1/2 relative bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
        <img 
          src={IMAGES.chocolate} 
          alt="La Casa del Chantilly" 
          className="absolute inset-0 w-full h-full object-cover opacity-90 transform scale-105"
        />
        <div className="absolute bottom-0 left-0 right-0 p-16 z-20">
          <div className="w-16 h-1 bg-yellow-400 rounded-full mb-6"></div>
          <h2 className="text-white text-5xl font-extrabold mb-4 leading-tight">
            El lado más dulce <br/>de la vida.
          </h2>
          <p className="text-gray-200 text-lg max-w-md">
            Horneamos historias y recuerdos en cada una de nuestras recetas, desde 1998.
          </p>
        </div>
      </div>
      
    </div>
  );
}
