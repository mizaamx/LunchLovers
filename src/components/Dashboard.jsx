import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, CreditCard, History, CheckCircle, Truck, AlertCircle, Save, Pause, Play } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMealSelection } from '../context/MealSelectionContext';
import { auth } from '../firebase/config';
import { updatePassword } from 'firebase/auth';


export default function Dashboard({ setCurrentPage, setActiveSection }) {
  const { user, updateProfile, resendVerificationEmail } = useAuth();
  const { selectedDays, selectedMealIds, allDishes, isAccepted } = useMealSelection();
  
  const getPlanDetails = (planId) => {
    const plansInfo = {
      cal800_1: { name: 'Plan 800 Kcal (1 Comida)', price: '$800 MXN / sem' },
      cal800_2: { name: 'Plan 800 Kcal (2 Comidas)', price: '$1,350 MXN / sem' },
      cal800_3: { name: 'Plan 800 Kcal (3 Comidas)', price: '$1,800 MXN / sem' },
      cal600_1: { name: 'Plan 600 Kcal (1 Comida)', price: '$650 MXN / sem' },
      cal600_2: { name: 'Plan 600 Kcal (2 Comidas)', price: '$1,250 MXN / sem' },
      cal600_3: { name: 'Plan 600 Kcal (3 Comidas)', price: '$1,700 MXN / sem' },
      godinez: { name: 'Paquete Godínez', price: '$750 MXN / sem' },
      comida_diaria: { name: 'Comida Diaria (Flexible)', price: '$125 MXN / comida' },
      basic: { name: 'Plan Básico', price: '$29 MXN / mes' },
      normal: { name: 'Plan Normal', price: '$99 MXN / mes' },
      pro: { name: 'Plan Pro', price: '$99 MXN / mes' }
    };
    return plansInfo[planId] || { name: 'Ninguno', price: '$0 MXN' };
  };

  const currentPlanInfo = getPlanDetails(user?.plan);
  
  // Verification states
  const [resendingVerification, setResendingVerification] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [verificationError, setVerificationError] = useState(null);
  
  // Local state for address
  const [street, setStreet] = useState(user?.address?.street || 'Av. Vallarta 1234');
  const [colony, setColony] = useState(user?.address?.colony || 'Col. Americana');
  const [municipality, setMunicipality] = useState(user?.address?.municipality || 'Guadalajara');
  const [zipCode, setZipCode] = useState(user?.address?.zipCode || '44160');
  const [instructions, setInstructions] = useState(user?.address?.instructions || 'Dejar en recepción.');
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [hasClickedCoverageCheck, setHasClickedCoverageCheck] = useState(false);
  const [isPlanPaused, setIsPlanPaused] = useState(false);

  // Profile and Password states
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState(null);

  // Reset coverage check state if address details are modified
  React.useEffect(() => {
    setHasClickedCoverageCheck(false);
  }, [street, colony, municipality, zipCode]);

  const selectedMeals = useMemo(() => {
    return allDishes.filter(meal => selectedMealIds.includes(meal.id));
  }, [selectedMealIds, allDishes]);

  const handleModifyMeals = useCallback(() => {
    if (setCurrentPage && setActiveSection) {
      setCurrentPage('landing');
      setActiveSection('catalogo');
      setTimeout(() => {
        const el = document.getElementById('catalogo');
        if (el) {
          const offset = 80;
          const top = el.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }, 100);
    }
  }, [setCurrentPage, setActiveSection]);

  const handleChangePlan = useCallback(() => {
    if (setCurrentPage && setActiveSection) {
      setCurrentPage('landing');
      setActiveSection('pricing');
      setTimeout(() => {
        const el = document.getElementById('pricing');
        if (el) {
          const offset = 80;
          const top = el.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }, 100);
    }
  }, [setCurrentPage, setActiveSection]);

  const handleSaveAddress = useCallback(async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    const allowed = ['Guadalajara'];
    if (!allowed.includes(municipality)) {
      setSaveError('Lo sentimos, por el momento no realizamos entregas en el municipio seleccionado.');
      setIsSaving(false);
      return;
    }

    try {
      await updateProfile({
        address: { street, colony, municipality, zipCode, instructions }
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error(err);
      setSaveError('No se pudo guardar la dirección. Intenta de nuevo.');
    } finally {
      setIsSaving(false);
    }
  }, [updateProfile, street, colony, municipality, zipCode, instructions, hasClickedCoverageCheck]);

  React.useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setProfilePhone(user.phone || '');
    }
  }, [user]);

  const handleUpdateProfile = useCallback(async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileSuccess(false);
    setProfileError(null);

    if (!profileName.trim()) {
      setProfileError('El nombre no puede estar vacío.');
      setIsUpdatingProfile(false);
      return;
    }

    try {
      await updateProfile({
        name: profileName,
        phone: profilePhone
      });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 4000);
    } catch (err) {
      console.error(err);
      setProfileError('No se pudo actualizar el perfil. Intenta de nuevo.');
    } finally {
      setIsUpdatingProfile(false);
    }
  }, [updateProfile, profileName, profilePhone]);

  const handleUpdatePassword = useCallback(async (e) => {
    e.preventDefault();
    setIsUpdatingPassword(true);
    setPasswordSuccess(false);
    setPasswordError(null);

    if (newPassword.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres.');
      setIsUpdatingPassword(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden.');
      setIsUpdatingPassword(false);
      return;
    }

    try {
      const authUser = auth.currentUser;
      if (authUser) {
        await updatePassword(authUser, newPassword);
        setPasswordSuccess(true);
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordSuccess(false), 4000);
      } else {
        throw new Error('No hay sesión de usuario activa.');
      }
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/requires-recent-login') {
        setPasswordError('Por seguridad, esta acción requiere iniciar sesión de nuevo antes de cambiar tu contraseña.');
      } else {
        setPasswordError('No se pudo cambiar la contraseña. Intenta de nuevo.');
      }
    } finally {
      setIsUpdatingPassword(false);
    }
  }, [newPassword, confirmPassword]);

  return (
    <section className="py-24 bg-gradient-to-b from-retro-crema to-white min-h-screen text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-8 border-b border-retro-terracota/10">
          <div>
            <h2 className="text-3xl font-extrabold text-retro-terracota tracking-tight font-sans">
              Mi Panel de Control
            </h2>
            <p className="text-retro-terracota/70 text-sm font-bold mt-1">
              Hola, <span className="text-retro-terracota font-black">{user?.name}</span>. Gestiona tus entregas, dirección de envío y suscripción.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-2 text-xs font-black bg-retro-crema text-retro-terracota px-4 py-2.5 rounded-2xl border border-retro-terracota/15 shadow-sm">
            <Truck className="w-4 h-4 text-retro-mostaza stroke-[2.5]" />
            <span>Próxima entrega: Lunes, 11:30 AM</span>
          </div>
        </div>

        {/* Verification Alert Banner */}
        {user && !user.emailVerified && (
          <div className="mb-8 p-5 bg-retro-crema border border-retro-terracota/20 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm animate-fade-in">
            <div className="flex items-center space-x-3.5 text-left">
              <div className="w-10 h-10 rounded-2xl bg-retro-terracota/10 text-retro-terracota flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h4 className="text-sm font-black text-retro-terracota">Cuenta no verificada</h4>
                <p className="text-[11px] font-bold text-retro-terracota/70 mt-0.5 leading-snug">
                  Por favor, verifica tu correo electrónico para poder activar tus suscripciones y realizar pedidos. ¿No recibiste el correo?
                </p>
                {/* Success / Error messages inline */}
                {verificationSuccess && <p className="text-[10px] font-bold text-emerald-600 mt-1">¡Correo enviado! Revisa tu bandeja de entrada.</p>}
                {verificationError && <p className="text-[10px] font-bold text-red-600 mt-1">{verificationError}</p>}
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
              <button
                disabled={resendingVerification}
                onClick={async () => {
                  setResendingVerification(true);
                  setVerificationError(null);
                  setVerificationSuccess(false);
                  try {
                    await resendVerificationEmail();
                    setVerificationSuccess(true);
                  } catch (err) {
                    setVerificationError(err.message || "No se pudo reenviar.");
                  } finally {
                    setResendingVerification(false);
                  }
                }}
                className="px-4 py-2 bg-retro-terracota hover:bg-retro-terracota/90 text-white font-black text-[10px] rounded-xl uppercase tracking-wider shadow-sm transition-all disabled:opacity-50"
              >
                {resendingVerification ? "Reenviando..." : "Reenviar correo"}
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-white hover:bg-retro-crema/50 border border-retro-terracota/15 hover:border-retro-terracota text-retro-terracota font-black text-[10px] rounded-xl uppercase tracking-wider shadow-sm transition-all"
              >
                Refrescar
              </button>
            </div>
          </div>
        )}

        {/* Dashboard Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Suscripción + Platillos Semanales */}
          <div className="lg:col-span-6 space-y-8">
            
            {/* CARD 1: Plan Activo */}
            <div className="glass-card p-6 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-retro-terracota/5 rounded-full blur-xl pointer-events-none" />
              
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-retro-terracota text-white flex items-center justify-center shadow-md">
                    <CreditCard className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-retro-terracota font-sans">Plan Activo</h3>
                    <p className="text-retro-terracota/60 text-xs font-bold">Detalle de tu suscripción</p>
                  </div>
                </div>
                
                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                  isPlanPaused 
                    ? 'bg-amber-50 text-amber-800 border-amber-200' 
                    : 'bg-retro-crema text-retro-terracota border-retro-terracota/20'
                }`}>
                  {isPlanPaused ? 'Pausado' : 'Activo'}
                </span>
              </div>

              <div className="p-4 bg-retro-crema/40 rounded-2xl border border-retro-terracota/10 mb-6 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[9px] font-black text-retro-terracota/60 uppercase tracking-wider block font-sans">Suscripción</span>
                  <span className="text-sm font-black text-retro-terracota">
                    {currentPlanInfo.name}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-black text-retro-terracota/60 uppercase tracking-wider block font-sans">Costo</span>
                  <span className="text-sm font-black text-retro-terracota">
                    {currentPlanInfo.price}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setIsPlanPaused(!isPlanPaused)}
                  className={`flex-grow py-3 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center space-x-1.5 ${
                    isPlanPaused
                      ? 'bg-retro-terracota text-white'
                      : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200'
                  }`}
                >
                  {isPlanPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
                  <span>{isPlanPaused ? 'Reactivar Plan' : 'Pausar Entregas'}</span>
                </button>
                <button 
                  onClick={handleChangePlan}
                  className="flex-grow bg-retro-crema hover:bg-white text-retro-terracota border border-retro-terracota/20 hover:border-retro-terracota py-3 px-4 rounded-xl font-bold text-xs transition-colors"
                >
                  Cambiar Plan
                </button>
              </div>
            </div>

            {/* CARD 2: Platillos Seleccionados */}
            <div className="glass-card p-6 rounded-3xl">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-retro-crema text-retro-terracota flex items-center justify-center shadow-md border border-retro-terracota/10">
                  <Calendar className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <h3 className="font-black text-base text-retro-terracota font-sans">Entregas de la Semana</h3>
                  <p className="text-retro-terracota/60 text-xs font-bold">Platillos programados para tu siguiente ciclo</p>
                </div>
              </div>

              {selectedMealIds.length > 0 ? (
                <div className="space-y-4">
                  {['lunes', 'martes', 'miercoles', 'jueves', 'viernes'].map((day) => {
                    const dayObj = selectedDays[day] || {};
                    const slots = Object.keys(dayObj).filter(slot => dayObj[slot] !== null);
                    
                    if (slots.length === 0) return null;
                    
                    const formatDay = (d) => {
                      const map = { lunes: 'Lunes', martes: 'Martes', miercoles: 'Miércoles', jueves: 'Jueves', viernes: 'Viernes' };
                      return map[d] || d;
                    };
                    const formatSlot = (s) => {
                      const map = { comida: 'Almuerzo', cena: 'Cena', snack: 'Snack' };
                      return map[s] || s;
                    };
                    
                    return (
                      <div key={day} className="p-3.5 rounded-2xl bg-white border border-retro-terracota/10">
                        <h4 className="text-[11px] font-black uppercase tracking-wider text-retro-terracota border-b border-retro-terracota/5 pb-1 mb-2 font-sans">
                          {formatDay(day)}
                        </h4>
                        
                        <div className="space-y-2.5">
                          {slots.map(slot => {
                            const dishId = dayObj[slot];
                            const meal = allDishes.find(d => d.id === dishId);
                            if (!meal) return null;
                            return (
                              <div key={slot} className="flex items-center gap-3">
                                <img
                                  src={meal.imageUrl}
                                  alt={meal.name}
                                  className="w-10 h-10 object-cover rounded-xl border border-retro-terracota/10"
                                  onError={(e) => { e.target.src = '/keto_salmon.webp'; }}
                                />
                                <div className="text-left flex-grow">
                                  <div className="text-[11px] font-black text-retro-terracota leading-tight line-clamp-1">
                                    {meal.name}
                                  </div>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[8px] font-black uppercase tracking-widest bg-retro-crema text-retro-terracota px-1 py-0.5 rounded border border-retro-terracota/5">
                                      {formatSlot(slot)}
                                    </span>
                                    <span className="text-[9px] font-bold text-retro-terracota/60">
                                      {meal.macros?.calories || 0} Kcal • {meal.macros?.protein || 0}g Pro
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                  {isAccepted ? (
                    <div className="text-center py-2 text-[10px] font-black text-emerald-700 uppercase tracking-widest bg-emerald-50 rounded-xl border border-emerald-250 mt-2 flex items-center justify-center space-x-1.5 font-sans">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Menú Semanal Confirmado y Enviado</span>
                    </div>
                  ) : (
                    <button 
                      onClick={handleModifyMeals}
                      className="w-full text-center py-2 text-xs font-bold text-retro-terracota hover:text-retro-mostaza hover:underline pt-2"
                    >
                      Modificar selección de platillos
                    </button>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center bg-retro-crema/20 rounded-2xl border border-dashed border-retro-terracota/20 flex flex-col items-center">
                  <p className="text-xs text-retro-terracota/70 font-bold mb-3">No has seleccionado tus platillos para esta semana.</p>
                  <button 
                    onClick={handleModifyMeals}
                    className="bg-retro-terracota hover:bg-retro-terracota/90 text-white font-black py-2 px-4 rounded-xl text-xs transition-colors shadow-md shadow-retro-terracota/10"
                  >
                    Seleccionar Platillos
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: Dirección ZMG + Historial */}
          <div className="lg:col-span-6 space-y-8">
            
            {/* CARD 2.5: Datos de Perfil y Seguridad */}
            <div className="glass-card p-6 rounded-3xl relative">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-retro-crema text-retro-terracota flex items-center justify-center shadow-md border border-retro-terracota/10">
                  <span className="text-base font-black">👤</span>
                </div>
                <div>
                  <h3 className="font-black text-base text-retro-terracota font-sans">Mi Perfil y Seguridad</h3>
                  <p className="text-retro-terracota/60 text-xs font-bold">Datos personales y cambio de contraseña</p>
                </div>
              </div>

              {/* Seccion 1: Datos Personales */}
              <form onSubmit={handleUpdateProfile} className="space-y-4 pb-6 border-b border-retro-terracota/10">
                <h4 className="text-[10px] font-black text-retro-terracota/50 uppercase tracking-widest mb-2">Información Personal</h4>
                
                {profileSuccess && (
                  <div className="bg-emerald-50 border-2 border-emerald-500 text-emerald-800 p-2.5 rounded-2xl text-[11px] font-black flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>¡Perfil actualizado exitosamente!</span>
                  </div>
                )}
                {profileError && (
                  <div className="bg-rose-50 border-2 border-rose-500 text-rose-800 p-2.5 rounded-2xl text-[11px] font-black flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 text-rose-600" />
                    <span>{profileError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                  <div>
                    <label className="block text-[10px] font-black text-retro-terracota uppercase tracking-wider mb-1">Nombre Completo</label>
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-retro-terracota/20 focus:outline-none focus:ring-2 focus:ring-retro-terracota/25 focus:border-retro-terracota text-retro-terracota bg-white text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-retro-terracota uppercase tracking-wider mb-1">Teléfono</label>
                    <input
                      type="text"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      placeholder="Ej. 3312345678"
                      className="w-full px-4 py-2.5 rounded-xl border border-retro-terracota/20 focus:outline-none focus:ring-2 focus:ring-retro-terracota/25 focus:border-retro-terracota text-retro-terracota bg-white text-xs font-bold"
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="w-full bg-retro-terracota/10 hover:bg-retro-terracota/20 text-retro-terracota border border-retro-terracota/20 font-black py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2 text-xs transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isUpdatingProfile ? 'Guardando...' : 'Guardar Datos Personales'}</span>
                </motion.button>
              </form>

              {/* Seccion 2: Cambio de Contrasena */}
              <form onSubmit={handleUpdatePassword} className="space-y-4 pt-6 text-left">
                <h4 className="text-[10px] font-black text-retro-terracota/50 uppercase tracking-widest mb-2">Cambiar Contraseña</h4>
                
                {passwordSuccess && (
                  <div className="bg-emerald-50 border-2 border-emerald-500 text-emerald-800 p-2.5 rounded-2xl text-[11px] font-black flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>¡Contraseña actualizada exitosamente!</span>
                  </div>
                )}
                {passwordError && (
                  <div className="bg-rose-50 border-2 border-rose-500 text-rose-800 p-2.5 rounded-2xl text-[11px] font-black flex items-center text-left">
                    <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 text-rose-600" />
                    <span>{passwordError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-retro-terracota uppercase tracking-wider mb-1">Nueva Contraseña</label>
                    <input
                      type="password"
                      required
                      placeholder="Mínimo 6 caracteres"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-retro-terracota/20 focus:outline-none focus:ring-2 focus:ring-retro-terracota/25 focus:border-retro-terracota text-retro-terracota bg-white text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-retro-terracota uppercase tracking-wider mb-1">Confirmar Contraseña</label>
                    <input
                      type="password"
                      required
                      placeholder="Repite la contraseña"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-retro-terracota/20 focus:outline-none focus:ring-2 focus:ring-retro-terracota/25 focus:border-retro-terracota text-retro-terracota bg-white text-xs font-bold"
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="w-full bg-retro-terracota hover:bg-retro-terracota/90 text-white font-extrabold py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2 text-xs transition-colors shadow-md shadow-retro-terracota/10 disabled:bg-retro-terracota/40"
                >
                  <span>{isUpdatingPassword ? 'Actualizando...' : 'Actualizar Contraseña'}</span>
                </motion.button>
              </form>
            </div>
            
            {/* CARD 3: Formulario Dirección Guadalajara */}
            <div className="glass-card p-6 rounded-3xl relative">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-retro-crema text-retro-terracota flex items-center justify-center shadow-md border border-retro-terracota/10">
                  <MapPin className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <h3 className="font-black text-base text-retro-terracota font-sans">Dirección de Entrega</h3>
                  <p className="text-retro-terracota/60 text-xs font-bold">Exclusivo Zona Metropolitana de Guadalajara</p>
                </div>
              </div>

              {/* Success Alert */}
              <AnimatePresence>
                {saveSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-emerald-50 border-2 border-emerald-500 text-emerald-800 p-3 rounded-2xl text-xs font-black mb-4 flex items-center"
                  >
                    <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>¡Dirección de entrega actualizada exitosamente!</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error Alert */}
              <AnimatePresence>
                {saveError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-rose-50 border-2 border-rose-500 text-rose-800 p-3 rounded-2xl text-xs font-black mb-4 flex items-center text-left"
                  >
                    <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 text-rose-600" />
                    <span>{saveError}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSaveAddress} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-retro-terracota uppercase tracking-wider mb-1">Calle y Número</label>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-retro-terracota/20 focus:outline-none focus:ring-2 focus:ring-retro-terracota/25 focus:border-retro-terracota text-retro-terracota bg-white text-xs font-bold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-retro-terracota uppercase tracking-wider mb-1">Colonia</label>
                    <input
                      type="text"
                      required
                      value={colony}
                      onChange={(e) => setColony(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-retro-terracota/20 focus:outline-none focus:ring-2 focus:ring-retro-terracota/25 focus:border-retro-terracota text-retro-terracota bg-white text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-retro-terracota uppercase tracking-wider mb-1">Municipio (ZMG)</label>
                    <select
                      value={municipality}
                      onChange={(e) => setMunicipality(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-retro-terracota/20 focus:outline-none focus:ring-2 focus:ring-retro-terracota/25 focus:border-retro-terracota text-retro-terracota bg-white text-xs font-bold"
                    >
                      <option value="Guadalajara">Guadalajara</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-retro-terracota uppercase tracking-wider mb-1">Código Postal</label>
                    <input
                      type="text"
                      required
                      maxLength="5"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-4 py-2.5 rounded-xl border border-retro-terracota/20 focus:outline-none focus:ring-2 focus:ring-retro-terracota/25 focus:border-retro-terracota text-retro-terracota bg-white text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-retro-terracota uppercase tracking-wider mb-1">Instrucciones de envío</label>
                    <input
                      type="text"
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-retro-terracota/20 focus:outline-none focus:ring-2 focus:ring-retro-terracota/25 focus:border-retro-terracota text-retro-terracota bg-white text-xs font-bold"
                    />
                  </div>
                </div>



                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={isSaving}
                  className="w-full bg-retro-terracota hover:bg-retro-terracota/90 text-white font-extrabold py-3 px-6 rounded-xl flex items-center justify-center space-x-2 shadow-md shadow-retro-terracota/10 transition-colors disabled:bg-retro-terracota/40"
                >
                  {isSaving ? (
                    <span>Guardando dirección...</span>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Actualizar Dirección de Envío</span>
                    </>
                  )}
                </motion.button>
              </form>
            </div>

            {/* CARD 4: Historial de Pedidos */}
            <div className="glass-card p-6 rounded-3xl">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-retro-crema text-retro-terracota flex items-center justify-center shadow-md border border-retro-terracota/10">
                  <History className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <h3 className="font-black text-base text-retro-terracota font-sans">Historial de Pedidos</h3>
                  <p className="text-retro-terracota/60 text-xs font-bold">Registro de tus transacciones pasadas</p>
                </div>
              </div>

              {user?.orderHistory && user.orderHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px] border-collapse font-bold">
                    <thead>
                      <tr className="text-retro-terracota/50 border-b border-retro-terracota/10">
                        <th className="pb-3 uppercase">Pedido</th>
                        <th className="pb-3 uppercase">Fecha</th>
                        <th className="pb-3 uppercase">Plan</th>
                        <th className="pb-3 uppercase">Total</th>
                        <th className="pb-3 uppercase text-right">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-retro-terracota/5">
                      {user.orderHistory.map(order => (
                        <tr key={order.id} className="hover:bg-retro-crema/20 transition-colors">
                          <td className="py-3 font-black text-retro-terracota">{order.id}</td>
                          <td className="py-3 text-retro-terracota/70">{order.date}</td>
                          <td className="py-3 text-retro-terracota/80">{order.plan}</td>
                          <td className="py-3 font-black text-retro-terracota">${order.total} MXN</td>
                          <td className="py-3 text-right">
                            <span className="bg-retro-crema text-retro-terracota border border-retro-terracota/10 px-2 py-0.5 rounded-full font-black text-[9px]">
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center bg-retro-crema/20 rounded-2xl border border-dashed border-retro-terracota/20">
                  <p className="text-xs text-retro-terracota/70 font-bold">Aún no tienes pedidos registrados.</p>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
