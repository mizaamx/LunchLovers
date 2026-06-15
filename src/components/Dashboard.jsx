import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, CreditCard, History, CheckCircle, Truck, AlertCircle, Save, Pause, Play } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMealSelection } from '../context/MealSelectionContext';

const municipalities = [
  'Guadalajara',
  'Zapopan',
  'San Pedro Tlaquepaque',
  'Tonalá',
  'Tlajomulco de Zúñiga'
];

const mockCatalog = [
  { id: 1, name: 'Amanida de Saumon avec Avocat', image: '/keto_salmon.webp', cal: 420, protein: '38 pro' },
  { id: 2, name: 'Buddha Bowl de Quinoa avec Edamame', image: '/vegan_bowl.webp', cal: 380, protein: '16 pro' },
  { id: 3, name: 'Salată de Pui et Quinoa Fitness', image: '/protein_chicken.webp', cal: 410, protein: '45 pro' },
  { id: 4, name: 'Ensalada de Tofu Crujiente avec Végétaux', image: '/keto_vegan_salad.webp', cal: 310, protein: '18 pro' },
  { id: 5, name: 'Saumon Glacé Oriental Style Keto', image: '/keto_salmon.webp', cal: 395, protein: '35 pro' },
  { id: 6, name: 'Curry de Poids Chiches et Quinoa Fit', image: '/vegan_bowl.webp', cal: 440, protein: '22 pro' },
];

export default function Dashboard({ setCurrentPage, setActiveSection }) {
  const { user, updateProfile, resendVerificationEmail } = useAuth();
  const { selectedDays, selectedMealIds, allDishes } = useMealSelection();
  
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

    const allowed = ['Guadalajara', 'Zapopan', 'San Pedro Tlaquepaque', 'Tonalá', 'Tlajomulco de Zúñiga'];
    if (!allowed.includes(municipality)) {
      setSaveError('Lo sentimos, por el momento no realizamos entregas en el municipio seleccionado.');
      setIsSaving(false);
      return;
    }

    const needsVerification = ['Tonalá', 'Tlajomulco de Zúñiga'].includes(municipality);
    if (needsVerification && !hasClickedCoverageCheck) {
      setSaveError('Por favor, primero consulta la zona de cobertura vía WhatsApp usando el botón de abajo.');
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
                  <span className="text-[9px] font-black text-retro-terracota/60 uppercase tracking-wider block">Suscripción</span>
                  <span className="text-sm font-black text-retro-terracota">
                    {user?.plan === 'basic' ? 'Plan Básico' : user?.plan === 'normal' ? 'Plan Normal' : user?.plan === 'pro' ? 'Plan Pro' : 'Ninguno'}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-black text-retro-terracota/60 uppercase tracking-wider block">Costo</span>
                  <span className="text-sm font-black text-retro-terracota">
                    {user?.plan === 'basic' ? '$29' : user?.plan ? '$99' : '$0'} MXN / mes
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
                  <button 
                    onClick={handleModifyMeals}
                    className="w-full text-center py-2 text-xs font-bold text-retro-terracota hover:text-retro-mostaza hover:underline pt-2"
                  >
                    Modificar selección de platillos
                  </button>
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
                      {municipalities.map(muni => (
                        <option key={muni} value={muni}>{muni}</option>
                      ))}
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

                {/* WhatsApp Coverage Verification */}
                {['Tonalá', 'Tlajomulco de Zúñiga'].includes(municipality) && (
                  <div className="p-4 bg-retro-crema/40 border-2 border-dashed border-retro-terracota/30 rounded-2xl space-y-3 mb-2 text-left">
                    <p className="text-[11px] font-bold text-retro-terracota leading-relaxed">
                      ⚠️ <strong>Consultar zona de cobertura:</strong> Los municipios de Tonalá y Tlajomulco de Zúñiga se encuentran más retirados de nuestra zona central. Por favor, haz clic en el botón de abajo para verificar la cobertura de tu dirección por WhatsApp antes de guardar.
                    </p>
                    <a
                      href={`https://wa.me/523345678910?text=${encodeURIComponent(`Hola, me gustaría verificar si tienen cobertura de entrega en la siguiente dirección: Calle: ${street}, Colonia: ${colony}, Municipio: ${municipality}, CP: ${zipCode}.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setHasClickedCoverageCheck(true)}
                      className="inline-flex items-center justify-center w-full py-2.5 px-4 bg-[#25D366] hover:bg-[#20ba5a] text-white font-black text-xs rounded-xl shadow-md transition-all space-x-2"
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.705 1.459h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413"/>
                      </svg>
                      <span>{hasClickedCoverageCheck ? '✓ Consulta Abierta' : 'Consultar zona de cobertura'}</span>
                    </a>
                  </div>
                )}

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
