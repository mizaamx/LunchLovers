import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff, Leaf, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login', 'register', or 'forgot'
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const { login, register, loginWithGoogle, resetPassword } = useAuth();

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError('');
    setSuccess('');
    setPassword('');
    setName('');
    setPhone('');
    setVerificationSent(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    setVerificationSent(false);

    try {
      if (activeTab === 'login') {
        // Firebase login (calls the AuthContext login method)
        await login(email, password);
        onClose(); // Close modal upon success
      } else if (activeTab === 'register') {
        if (!name.trim()) {
          setError('El nombre completo es requerido.');
          setLoading(false);
          return;
        }
        if (!phone.trim()) {
          setError('El teléfono de contacto es requerido.');
          setLoading(false);
          return;
        }
        // Firebase register (sends email verification inside AuthContext)
        await register(name, email, password, phone);
        setVerificationSent(true); // Show verification screen instead of closing
      } else if (activeTab === 'forgot') {
        if (!email) {
          setError('El correo electrónico es requerido.');
          setLoading(false);
          return;
        }
        await resetPassword(email);
        setSuccess('¡Enlace de recuperación enviado! Revisa tu bandeja de entrada para restablecer tu contraseña.');
        setActiveTab('login');
      }
    } catch (err) {
      setError(err.message || 'Ocurrió un error. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err) {
      setError(err.message || 'Ocurrió un error al iniciar sesión con Google.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative z-10 border border-retro-terracota/10 overflow-hidden"
      >
        {/* Background decorative bubble */}
        <div className="absolute top-[-30px] right-[-30px] w-24 h-24 bg-retro-crema/40 rounded-full blur-xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-retro-terracota/40 hover:text-retro-terracota/70 rounded-full hover:bg-retro-crema/40 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Logo header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-retro-crema/60 flex items-center justify-center text-retro-terracota mb-3 shadow-inner">
            <Leaf className="w-6 h-6 fill-current" />
          </div>
          <h3 className="text-2xl font-black text-retro-terracota font-sans">Lunch Lovers GDL</h3>
          <p className="text-retro-terracota/60 text-xs mt-1 font-bold">Comida sana directo a tu puerta</p>
        </div>

        {verificationSent ? (
          /* Email Verification Screen */
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-retro-crema/60 text-retro-terracota rounded-full flex items-center justify-center mx-auto mb-4 border border-retro-terracota/10">
              <Mail className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-black text-retro-terracota mb-2">¡Verifica tu cuenta!</h4>
            <p className="text-retro-terracota/70 text-xs font-semibold leading-relaxed mb-6">
              Hemos enviado un enlace de verificación a <span className="text-retro-terracota font-black">{email}</span>. Por favor, revisa tu bandeja de entrada y confirma tu cuenta para poder realizar pedidos.
            </p>
            <button
              onClick={() => {
                onClose();
                setVerificationSent(false);
              }}
              className="w-full py-3 bg-retro-terracota hover:bg-retro-terracota/90 text-white font-black text-xs rounded-xl uppercase tracking-wider shadow-md transition-all"
            >
              Entendido
            </button>
          </div>
        ) : (
          /* Authentication Forms */
          <>
            {/* Tabs switcher */}
            {activeTab !== 'forgot' ? (
              <div className="flex border-b border-retro-terracota/10 mb-6 relative">
                <button
                  type="button"
                  onClick={() => handleTabChange('login')}
                  className={`w-1/2 pb-3 text-sm font-bold text-center transition-colors relative ${
                    activeTab === 'login' ? 'text-retro-terracota font-black' : 'text-retro-terracota/50 hover:text-retro-terracota/80'
                  }`}
                >
                  Iniciar Sesión
                  {activeTab === 'login' && (
                    <motion.div
                      layoutId="authTabIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-retro-terracota"
                    />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange('register')}
                  className={`w-1/2 pb-3 text-sm font-bold text-center transition-colors relative ${
                    activeTab === 'register' ? 'text-retro-terracota font-black' : 'text-retro-terracota/50 hover:text-retro-terracota/80'
                  }`}
                >
                  Registrarse
                  {activeTab === 'register' && (
                    <motion.div
                      layoutId="authTabIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-retro-terracota"
                    />
                  )}
                </button>
              </div>
            ) : (
              <div className="text-left mb-6">
                <h4 className="text-lg font-black text-retro-terracota">Recuperar Contraseña</h4>
                <p className="text-retro-terracota/60 text-xs mt-1 font-bold">Ingresa tu correo y te enviaremos un enlace de recuperación.</p>
              </div>
            )}

            {/* Error Alert */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-rose-50 border-l-4 border-rose-500 text-rose-700 p-3 rounded-r-xl text-xs font-bold mb-4 text-left"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success Alert */}
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 p-3 rounded-r-xl text-xs font-bold mb-4 text-left"
                >
                  {success}
                </motion.div>
              )}
            </AnimatePresence>

            {activeTab !== 'forgot' && (
              <>
                {/* Google Sign In Button */}
                <div className="mb-4 flex justify-center">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="py-2 px-5 rounded-xl border border-retro-terracota/20 hover:border-retro-terracota bg-retro-crema/10 hover:bg-retro-crema/25 text-retro-terracota text-[11px] font-black uppercase tracking-wider flex items-center gap-2 transition-all disabled:opacity-50 shadow-sm"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Google</span>
                  </motion.button>
                </div>

                {/* Separator */}
                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-retro-terracota/10"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase">
                    <span className="bg-white px-3 text-retro-terracota/40 font-bold">o continuar con correo</span>
                  </div>
                </div>
              </>
            )}

            {/* Forms */}
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              {activeTab === 'register' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-bold text-retro-terracota/80 uppercase tracking-wider mb-1.5">Nombre Completo</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="Tu nombre completo"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-retro-terracota/20 focus:outline-none focus:ring-2 focus:ring-retro-terracota/25 focus:border-retro-terracota text-retro-terracota placeholder-retro-terracota/30 text-sm transition-all font-bold"
                      />
                      <User className="w-4 h-4 text-retro-terracota/40 absolute left-3.5 top-3.5" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-retro-terracota/80 uppercase tracking-wider mb-1.5">Teléfono de Contacto (WhatsApp)</label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        placeholder="Ej. 3312345678"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-retro-terracota/20 focus:outline-none focus:ring-2 focus:ring-retro-terracota/25 focus:border-retro-terracota text-retro-terracota placeholder-retro-terracota/30 text-sm transition-all font-bold"
                      />
                      <Phone className="w-4 h-4 text-retro-terracota/40 absolute left-3.5 top-3.5" />
                    </div>
                  </div>
                </motion.div>
              )}

              <div>
                <label className="block text-xs font-bold text-retro-terracota/80 uppercase tracking-wider mb-1.5">Correo Electrónico</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="tuemail@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-retro-terracota/20 focus:outline-none focus:ring-2 focus:ring-retro-terracota/25 focus:border-retro-terracota text-retro-terracota placeholder-retro-terracota/30 text-sm transition-all font-bold"
                  />
                  <Mail className="w-4 h-4 text-retro-terracota/40 absolute left-3.5 top-3.5" />
                </div>
              </div>

              {activeTab !== 'forgot' && (
                <div>
                  <label className="block text-xs font-bold text-retro-terracota/80 uppercase tracking-wider mb-1.5">Contraseña</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 rounded-xl border border-retro-terracota/20 focus:outline-none focus:ring-2 focus:ring-retro-terracota/25 focus:border-retro-terracota text-retro-terracota placeholder-retro-terracota/30 text-sm transition-all font-bold"
                    />
                    <Lock className="w-4 h-4 text-retro-terracota/40 absolute left-3.5 top-3.5" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-retro-terracota/40 hover:text-retro-terracota/70 absolute right-3 top-3.5 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'login' && (
                <div className="text-right text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => handleTabChange('forgot')}
                    className="text-retro-terracota hover:underline font-bold"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-retro-terracota text-white font-black py-3.5 rounded-xl hover:bg-retro-terracota/90 shadow-lg shadow-retro-terracota/15 transition-all duration-200 mt-6 disabled:bg-retro-terracota/40 disabled:shadow-none flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Procesando...</span>
                  </>
                ) : (
                  <span>
                    {activeTab === 'login' && 'Ingresar'}
                    {activeTab === 'register' && 'Crear Cuenta'}
                    {activeTab === 'forgot' && 'Enviar Enlace'}
                  </span>
                )}
              </motion.button>

              {activeTab === 'forgot' && (
                <div className="text-center pt-4">
                  <button
                    type="button"
                    onClick={() => handleTabChange('login')}
                    className="text-xs text-retro-terracota/60 hover:text-retro-terracota hover:underline font-bold"
                  >
                    ← Volver al inicio de sesión
                  </button>
                </div>
              )}
            </form>
          </>
        )}

        {/* Footer info message */}
        <div className="text-center text-xs text-retro-terracota/50 mt-6 pt-4 border-t border-retro-terracota/10">
          Al continuar, aceptas nuestros <a href="#" className="text-retro-terracota hover:underline">Términos de Servicio</a> y <a href="#" className="text-retro-terracota hover:underline">Políticas de Privacidad</a>.
        </div>
      </motion.div>
    </div>
  );
}
