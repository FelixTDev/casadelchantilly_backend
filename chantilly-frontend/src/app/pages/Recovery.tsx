import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router";
import { CheckCircle, ArrowLeft, Mail, ArrowRight, KeyRound } from "lucide-react";
import { useApp } from "../context/AppContext";
import { IMAGES } from "../data/mock-data";
import { validateEmail } from "../lib/validation";
import { getUserErrorMessage } from "../../lib/apiError";

export default function Recovery() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [fieldError, setFieldError] = useState("");
  const { recuperarPassword, loading } = useApp();
  const isMockToken = /^[0-9a-fA-F-]{20,}$/.test(successMessage);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextFieldError = validateEmail(email);
    setFieldError(nextFieldError);
    if (nextFieldError) {
      setError("Corrige el correo antes de continuar.");
      return;
    }

    setError("");
    setSuccessMessage("");

    try {
      const response = await recuperarPassword(email);
      setSuccessMessage(response.mensaje);
      setSent(true);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(getUserErrorMessage(err, "No se pudo procesar la solicitud"));
      } else {
        setError("No se pudo procesar la solicitud");
      }
      setSent(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex" style={{ fontFamily: "Poppins" }}>
      
      {/* Mitad Izquierda: Formulario */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-8 sm:px-16 py-12 relative">
        <div className="absolute top-8 left-8">
          <Link to="/login" className="text-gray-400 hover:text-gray-900 transition-colors flex items-center gap-2 font-medium text-sm">
            <ArrowLeft className="w-4 h-4" /> Volver al Login
          </Link>
        </div>

        <div className="w-full max-w-md">
          {sent ? (
            <div className="text-center animate-fade-in-up">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-gray-900 font-extrabold text-3xl mb-4">¡Correo enviado!</h2>
              <p className="text-gray-500 text-base mb-8">
                Hemos procesado la solicitud para <strong>{email}</strong>. Revisa tu bandeja de entrada y la carpeta de spam.
              </p>
              
              {isMockToken && (
                <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-left">
                  <p className="text-yellow-800 text-xs font-bold uppercase mb-2">Modo Demo Local Activo</p>
                  <p className="text-yellow-700 text-sm mb-3">En desarrollo no se envía correo. Haz clic abajo para simularlo:</p>
                  <Link to={`/reset-password/${successMessage}`} className="block">
                    <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold py-3 rounded-full transition-all">
                      Ir al Enlace del Correo
                    </button>
                  </Link>
                </div>
              )}
              
              <Link to="/login">
                <button className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 rounded-full transition-all shadow-lg hover:shadow-xl">
                  Volver al Login
                </button>
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-10 text-center lg:text-left">
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6 mx-auto lg:mx-0">
                  <KeyRound className="w-8 h-8 text-[#D32F2F]" />
                </div>
                <h1 className="text-gray-900 font-extrabold text-3xl sm:text-4xl mb-3 tracking-tight">Recuperar Acceso</h1>
                <p className="text-gray-500 text-base">Ingresa tu correo y te enviaremos un enlace seguro para restablecer tu contraseña.</p>
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-[#D32F2F] text-[#D32F2F] p-4 rounded-r-lg mb-8 font-medium text-sm shadow-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="recovery-email" className="block text-gray-700 mb-2 font-bold text-sm">Correo electrónico</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-[#D32F2F] transition-colors" />
                    </div>
                    <input 
                      id="recovery-email"
                      type="email" 
                      value={email} 
                      onChange={e => {
                        setEmail(e.target.value);
                        setFieldError("");
                      }}
                      onBlur={() => setFieldError(validateEmail(email))}
                      placeholder="tu@correo.com" 
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#D32F2F] focus:bg-white transition-all" 
                      aria-invalid={!!fieldError}
                    />
                  </div>
                  {fieldError && <p className="mt-2 text-sm text-red-600">{fieldError}</p>}
                </div>
                
                <button 
                  type="submit" 
                  disabled={loading || !!validateEmail(email)}
                  className="w-full flex justify-center items-center gap-2 bg-[#D32F2F] hover:bg-red-700 text-white font-bold py-4 rounded-full shadow-lg hover:shadow-red-900/20 transform hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                >
                  {loading ? "Procesando..." : (
                    <>Enviar Enlace <ArrowRight className="w-5 h-5" /></>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Mitad Derecha: Imagen Inmersiva (Solo en Desktop) */}
      <div className="hidden lg:block lg:w-1/2 relative bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
        <img 
          src={IMAGES.tresLeches} 
          alt="La Casa del Chantilly" 
          className="absolute inset-0 w-full h-full object-cover opacity-90 transform scale-105"
        />
        <div className="absolute bottom-0 left-0 right-0 p-16 z-20">
          <div className="w-16 h-1 bg-yellow-400 rounded-full mb-6"></div>
          <h2 className="text-white text-5xl font-extrabold mb-4 leading-tight">
            Siempre hay <br/>solución.
          </h2>
          <p className="text-gray-200 text-lg max-w-md">
            No te preocupes por olvidar tu contraseña, recupera tu acceso y sigue disfrutando.
          </p>
        </div>
      </div>
      
    </div>
  );
}
