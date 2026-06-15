import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Flame, Award, Dumbbell, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMealSelection } from '../context/MealSelectionContext';
import { db } from '../firebase/config';
import { collection, addDoc } from 'firebase/firestore';
import AuthModal from './AuthModal';

// Links de Mercado Pago para Suscripciones / Pagos
const linksMercadoPago = {
  basic: "https://www.mercadopago.com.mx/checkout/v1/redirect?pref_id=YOUR_PREFERENCE_ID_BASIC",
  normal: "https://www.mercadopago.com.mx/checkout/v1/redirect?pref_id=YOUR_PREFERENCE_ID_NORMAL",
  pro: "https://www.mercadopago.com.mx/checkout/v1/redirect?pref_id=YOUR_PREFERENCE_ID_PRO",
};

export default function Pricing() {
  const { user, resendVerificationEmail } = useAuth();
  const { selectedMealIds } = useMealSelection();
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [redirectingPlan, setRedirectingPlan] = useState(null);
  const [showRedirectModal, setShowRedirectModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState('idle'); // 'idle', 'saving', 'redirecting', 'error'
  const [error, setError] = useState(null);

  // Verification states
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);
  const [verificationError, setVerificationError] = useState(null);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  const plans = [
    {
      id: 'basic',
      name: 'Plan Básico',
      subtitle: 'Ideal para probar y empezar a comer sano.',
      weeklyPrice: 9,
      monthlyPrice: 29, // $29/mo exact text
      features: [
        '5 platillos semanales (Lun a Vie)',
        'Menú rotativo balanceado',
        'Empaques compostables',
        'Entrega diaria en tu puerta',
        'Asesoría digital básica',
      ],
      icon: Award,
      isPopular: false,
      styles: 'glass-card hover:border-retro-terracota/30',
      buttonClass: 'bg-retro-crema hover:bg-white text-retro-terracota border border-retro-terracota/20 hover:border-retro-terracota',
    },
    {
      id: 'normal',
      name: 'Plan Normal',
      subtitle: 'Comidas de Lunes a Viernes. El más equilibrado.',
      weeklyPrice: 29,
      monthlyPrice: 99, // $99/mo exact text
      features: [
        '10 platillos semanales (Comida + Cena)',
        'Menú personalizado según tus metas',
        'Entrega express preferente',
        'Consulta de valoración con nutriólogo',
        'Sin costos de envío',
        'Modificaciones al menú sin costo',
      ],
      icon: Flame,
      isPopular: true,
      styles: 'glass-card-active scale-105 border-2 border-retro-terracota',
      buttonClass: 'bg-retro-terracota hover:bg-retro-terracota/90 text-white shadow-lg shadow-retro-terracota/10',
    },
    {
      id: 'pro',
      name: 'Plan Pro',
      subtitle: 'Enfoque deportivo, alto en proteínas y snacks.',
      weeklyPrice: 29,
      monthlyPrice: 99, // $99/mo exact text
      features: [
        '10 platillos deportivos (alto en proteínas)',
        '5 snacks saludables semanales',
        'Ajuste exacto de macronutrientes',
        'Asesoría personalizada 24/7',
        'Entregas express prioritarias',
        'Ingredientes premium seleccionados',
      ],
      icon: Dumbbell,
      isPopular: false,
      styles: 'glass-card hover:border-retro-terracota/30',
      buttonClass: 'bg-retro-crema hover:bg-white text-retro-terracota border border-retro-terracota/20 hover:border-retro-terracota',
    },
  ];

  const handleCheckout = async (planId, planName) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (user && !user.emailVerified) {
      setShowVerificationModal(true);
      return;
    }

    setRedirectingPlan({ id: planId, name: planName });
    setShowRedirectModal(true);
    setCheckoutStep('saving');
    setError(null);

    try {
      // 1. Guardar en Firebase (Firestore) con pago_pendiente: true
      const orderData = {
        userId: user.uid,
        clientName: user.name,
        clientEmail: user.email,
        deliveryAddress: user.address || {
          street: '',
          colony: '',
          municipality: 'Guadalajara',
          zipCode: '',
          instructions: ''
        },
        selectedMeals: selectedMealIds || [],
        plan: planId,
        planName: planName,
        pago_pendiente: true,
        status: 'Pendiente',
        createdAt: new Date().toISOString(),
      };

      // Guardar el documento del pedido
      await addDoc(collection(db, 'orders'), orderData);

      // 2. Redirección: Inmediatamente después de que Firestore confirme que se guardó el documento (usando await)
      setCheckoutStep('redirecting');

      const url = linksMercadoPago[planId];
      
      // Delay visual de cortesía (1.2s) para mostrar el cambio de estado y realizar la redirección
      setTimeout(() => {
        if (url.includes("YOUR_PREFERENCE_ID")) {
          window.location.href = `${window.location.origin}/?payment=success&plan=${planId}#dashboard`;
        } else {
          window.location.assign(url);
        }
      }, 1200);

    } catch (err) {
      console.error("Error al registrar el pedido o redirigir:", err);
      setCheckoutStep('error');
      setError(err.message || 'No pudimos registrar tu pedido. Por favor, intenta de nuevo.');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20
      }
    }
  };

  const planBasic = plans.find(p => p.id === 'basic');
  const planNormal = plans.find(p => p.id === 'normal');
  const planPro = plans.find(p => p.id === 'pro');

  return (
    <section id="pricing" className="py-24 bg-white relative overflow-hidden">
      {/* Decorative background vectors */}
      <div className="absolute top-1/2 left-[-15%] w-[40rem] h-[40rem] bg-retro-crema/40 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-retro-terracota font-bold text-xs uppercase tracking-wider bg-retro-crema px-3 py-1 rounded-full border border-retro-terracota/10">
            Suscripciones Flexibles
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-retro-terracota mt-4 tracking-tight font-sans">
            Planes a tu medida
          </h2>
          <p className="text-retro-terracota/70 text-base mt-3 font-semibold">
            Elige el plan ideal para tu estilo de vida. Puedes pausar o cancelar tu suscripción en el momento que quieras.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="flex items-center justify-center mt-8">
            <div className="bg-retro-crema/60 border border-retro-terracota/10 p-1.5 rounded-full inline-flex items-center space-x-1">
              <button
                onClick={() => setBillingCycle('weekly')}
                className={`px-5 py-2 rounded-full text-xs font-black transition-all duration-300 ${
                  billingCycle === 'weekly'
                    ? 'bg-retro-terracota text-white shadow-md'
                    : 'text-retro-terracota hover:text-retro-mostaza'
                }`}
              >
                Semanal
              </button>
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-5 py-2 rounded-full text-xs font-black transition-all duration-300 flex items-center space-x-1.5 ${
                  billingCycle === 'monthly'
                    ? 'bg-retro-terracota text-white shadow-md'
                    : 'text-retro-terracota hover:text-retro-mostaza'
                }`}
              >
                <span>Mensual</span>
                <span className="text-[10px] font-black bg-retro-mostaza text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Descuento
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Bento Grid */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pt-4 max-w-6xl mx-auto text-left"
        >
          {/* 1. HERO PLAN: Plan Normal (Left Side, 7 columns) */}
          <motion.div
            variants={cardVariants}
            whileHover={{ y: -6, rotateX: 1.2, rotateY: -1.2, transition: { duration: 0.2 } }}
            className="lg:col-span-7 flex flex-col rounded-[2.5rem] p-8 lg:p-10 relative liquid-glass-active depth-container shadow-[0_20px_50px_rgba(176,90,50,0.12)]"
          >
            {/* Background dynamic blur spot */}
            <div className="absolute -right-20 -top-20 w-60 h-60 bg-retro-mostaza/10 rounded-full blur-3xl pointer-events-none" />
            
            {/* Popular Tag */}
            <div className="absolute top-0 right-8 transform -translate-y-1/2">
              <span className="text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md text-white bg-retro-mostaza border border-retro-mostaza">
                Más Popular
              </span>
            </div>

            <div className="flex flex-col md:flex-row gap-8 h-full">
              {/* Left Column of Hero Plan */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 bg-retro-terracota text-white border border-retro-terracota shadow-md shadow-retro-terracota/20">
                    <Flame className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <h3 className="text-2xl font-black text-retro-terracota font-sans tracking-tight">
                    {planNormal.name}
                  </h3>
                  <p className="text-retro-terracota/80 text-xs font-bold mt-3 leading-relaxed">
                    {planNormal.subtitle}
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-retro-terracota/10">
                  <div className="flex items-baseline justify-start">
                    <span className="text-retro-terracota/60 text-lg font-bold">$</span>
                    <span className="text-5xl font-black text-retro-terracota tracking-tight font-sans">
                      {billingCycle === 'weekly' ? planNormal.weeklyPrice : planNormal.monthlyPrice}
                    </span>
                    <span className="text-retro-terracota/60 text-xs font-extrabold ml-2">
                      MXN / {billingCycle === 'weekly' ? 'semana' : 'mes'}
                    </span>
                  </div>
                  
                  <div className="mt-6">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleCheckout(planNormal.id, planNormal.name)}
                      className="w-full py-4 px-6 rounded-2xl font-black text-xs tracking-wider uppercase transition-all bg-retro-terracota hover:bg-retro-terracota/90 text-white shadow-lg shadow-retro-terracota/15 border border-retro-terracota/20"
                    >
                      Suscribirme
                    </motion.button>
                    <p className="text-[10px] text-center font-bold text-retro-terracota/50 mt-2.5">
                      🔒 Pago 100% seguro a través de Mercado Pago
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column of Hero Plan (Features list) */}
              <div className="flex-1 flex flex-col justify-center bg-white/40 backdrop-blur-sm rounded-3xl p-6 border border-retro-terracota/5 shadow-[inset_0_1px_2px_rgba(255,255,255,0.4)]">
                <h4 className="text-xs font-black uppercase tracking-wider text-retro-terracota/60 mb-4">
                  ¿Qué incluye este plan?
                </h4>
                <ul className="space-y-4 flex-grow">
                  {planNormal.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start text-xs font-bold text-retro-terracota/90">
                      <span className="w-5 h-5 rounded-full bg-retro-terracota/10 text-retro-terracota flex items-center justify-center mr-3 flex-shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>

          {/* 2. SECONDARY PLANS: Basic & Pro (Right Side, 5 columns) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Plan Básico */}
            <motion.div
              variants={cardVariants}
              whileHover={{ y: -4, rotateX: 0.8, rotateY: -0.8, transition: { duration: 0.2 } }}
              className="rounded-[2rem] p-6 relative liquid-glass depth-container shadow-[0_15px_30px_rgba(176,90,50,0.04)] overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-retro-crema text-retro-terracota border border-retro-terracota/10">
                    <Award className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-retro-terracota font-sans">
                      {planBasic.name}
                    </h3>
                    <p className="text-[11px] font-bold text-retro-terracota/60">
                      Ideal para probar
                    </p>
                  </div>
                </div>
                
                <div className="flex items-baseline">
                  <span className="text-retro-terracota/60 text-xs font-bold">$</span>
                  <span className="text-3xl font-black text-retro-terracota font-sans">
                    {billingCycle === 'weekly' ? planBasic.weeklyPrice : planBasic.monthlyPrice}
                  </span>
                  <span className="text-retro-terracota/60 text-[10px] font-extrabold ml-1">
                    MXN/{billingCycle === 'weekly' ? 'sem' : 'mes'}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-retro-terracota/5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ul className="space-y-2">
                  {planBasic.features.slice(0, 3).map((feature, idx) => (
                    <li key={idx} className="flex items-center text-[10px] font-bold text-retro-terracota/85">
                      <Check className="w-3 h-3 stroke-[3] text-retro-terracota mr-2 flex-shrink-0" />
                      <span className="truncate">{feature}</span>
                    </li>
                  ))}
                </ul>
                <ul className="space-y-2">
                  {planBasic.features.slice(3).map((feature, idx) => (
                    <li key={idx} className="flex items-center text-[10px] font-bold text-retro-terracota/85">
                      <Check className="w-3 h-3 stroke-[3] text-retro-terracota mr-2 flex-shrink-0" />
                      <span className="truncate">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-5">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCheckout(planBasic.id, planBasic.name)}
                  className="w-full py-3 px-5 rounded-xl font-black text-[11px] tracking-wider uppercase bg-retro-crema hover:bg-white text-retro-terracota border border-retro-terracota/15 hover:border-retro-terracota transition-all"
                >
                  Suscribirme
                </motion.button>
              </div>
            </motion.div>

            {/* Plan Pro */}
            <motion.div
              variants={cardVariants}
              whileHover={{ y: -4, rotateX: 0.8, rotateY: -0.8, transition: { duration: 0.2 } }}
              className="rounded-[2rem] p-6 relative liquid-glass depth-container shadow-[0_15px_30px_rgba(176,90,50,0.04)] overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-retro-crema text-retro-terracota border border-retro-terracota/10">
                    <Dumbbell className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-retro-terracota font-sans">
                      {planPro.name}
                    </h3>
                    <p className="text-[11px] font-bold text-retro-terracota/60">
                      Enfoque deportivo
                    </p>
                  </div>
                </div>
                
                <div className="flex items-baseline">
                  <span className="text-retro-terracota/60 text-xs font-bold">$</span>
                  <span className="text-3xl font-black text-retro-terracota font-sans">
                    {billingCycle === 'weekly' ? planPro.weeklyPrice : planPro.monthlyPrice}
                  </span>
                  <span className="text-retro-terracota/60 text-[10px] font-extrabold ml-1">
                    MXN/{billingCycle === 'weekly' ? 'sem' : 'mes'}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-retro-terracota/5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ul className="space-y-2">
                  {planPro.features.slice(0, 3).map((feature, idx) => (
                    <li key={idx} className="flex items-center text-[10px] font-bold text-retro-terracota/85">
                      <Check className="w-3 h-3 stroke-[3] text-retro-terracota mr-2 flex-shrink-0" />
                      <span className="truncate">{feature}</span>
                    </li>
                  ))}
                </ul>
                <ul className="space-y-2">
                  {planPro.features.slice(3).map((feature, idx) => (
                    <li key={idx} className="flex items-center text-[10px] font-bold text-retro-terracota/85">
                      <Check className="w-3 h-3 stroke-[3] text-retro-terracota mr-2 flex-shrink-0" />
                      <span className="truncate">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-5">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCheckout(planPro.id, planPro.name)}
                  className="w-full py-3 px-5 rounded-xl font-black text-[11px] tracking-wider uppercase bg-retro-crema hover:bg-white text-retro-terracota border border-retro-terracota/15 hover:border-retro-terracota transition-all"
                >
                  Suscribirme
                </motion.button>
              </div>
            </motion.div>

          </div>
        </motion.div>

        {/* Security badge */}
        <div className="mt-12 text-center text-[10px] font-bold text-retro-terracota/50 flex flex-col sm:flex-row items-center justify-center gap-2">
          <span>🔒 Transacciones 100% seguras encriptadas</span>
          <span className="hidden sm:inline">•</span>
          <span>📅 Puedes pausar tu suscripción antes del jueves a las 11:59 PM</span>
        </div>

        {/* Redirection Modal */}
        <AnimatePresence>
          {showRedirectModal && redirectingPlan && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass p-8 rounded-3xl max-w-md w-full text-center border border-retro-terracota/20 shadow-2xl relative bg-white/95"
              >
                {/* Cancel option */}
                {checkoutStep !== 'redirecting' && (
                  <button
                    onClick={() => {
                      setShowRedirectModal(false);
                      setRedirectingPlan(null);
                      setCheckoutStep('idle');
                      setError(null);
                    }}
                    className="absolute top-4 right-4 text-retro-terracota/40 hover:text-retro-terracota/70 text-[10px] font-black uppercase tracking-wider"
                  >
                    Cancelar
                  </button>
                )}

                {checkoutStep === 'saving' && (
                  <>
                    <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                      <Loader2 className="w-10 h-10 text-retro-terracota animate-spin stroke-[2.5]" />
                    </div>
                    <h3 className="text-lg font-black text-retro-terracota font-sans">
                      Registrando tu pedido...
                    </h3>
                    <p className="text-retro-terracota/70 text-xs font-bold mt-3 leading-relaxed">
                      Estamos guardando los detalles del <span className="text-retro-terracota font-black">{redirectingPlan.name}</span> en nuestro sistema.
                    </p>
                  </>
                )}

                {checkoutStep === 'redirecting' && (
                  <>
                    <div className="relative w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                      <div className="absolute inset-0 border-4 border-retro-crema border-t-retro-terracota rounded-full animate-spin" />
                      <div className="w-10 h-10 bg-retro-crema text-retro-terracota rounded-full flex items-center justify-center font-black text-sm border border-retro-terracota/10">
                        MP
                      </div>
                    </div>
                    <h3 className="text-lg font-black text-retro-terracota font-sans">
                      Redirigiendo a Mercado Pago
                    </h3>
                    <p className="text-retro-terracota/70 text-xs font-bold mt-3 leading-relaxed">
                      ¡Pedido guardado! Redirigiendo a la pasarela segura para pagar el <span className="text-retro-terracota font-black">{redirectingPlan.name}</span>.
                    </p>
                  </>
                )}

                {checkoutStep === 'error' && (
                  <>
                    <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-rose-50 rounded-full text-rose-500 border border-rose-100">
                      <AlertCircle className="w-8 h-8 stroke-[2.5]" />
                    </div>
                    <h3 className="text-lg font-black text-rose-700 font-sans">
                      Hubo un problema
                    </h3>
                    <p className="text-rose-600/80 text-xs font-bold mt-2 leading-relaxed">
                      {error}
                    </p>
                    <button
                      onClick={() => handleCheckout(redirectingPlan.id, redirectingPlan.name)}
                      className="mt-6 w-full py-3 bg-retro-terracota hover:bg-retro-terracota/90 text-white font-black text-xs rounded-xl shadow-md transition-all uppercase tracking-wider"
                    >
                      Reintentar
                    </button>
                  </>
                )}

                {checkoutStep !== 'error' && (
                  <div className="mt-6 p-4 bg-retro-crema/40 rounded-2xl border border-retro-terracota/10 text-left">
                    <p className="text-[10px] font-black uppercase tracking-wider text-retro-terracota/60">
                      Pasarela de Pago Segura
                    </p>
                    <p className="text-[11px] font-bold text-retro-terracota mt-1 leading-snug">
                      Podrás pagar de forma rápida y confiable usando tarjeta de débito/crédito, transferencia SPEI o efectivo en tiendas de conveniencia.
                    </p>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Integración del AuthModal si se hace clic sin sesión iniciada */}
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

        {/* Verification Modal for Unverified Accounts */}
        <AnimatePresence>
          {showVerificationModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass p-8 rounded-3xl max-w-md w-full text-center border border-retro-terracota/20 shadow-2xl relative bg-white"
              >
                <button
                  onClick={() => {
                    setShowVerificationModal(false);
                    setVerificationSuccess(false);
                    setVerificationError(null);
                  }}
                  className="absolute top-4 right-4 text-retro-terracota/40 hover:text-retro-terracota/70 text-xs font-black uppercase tracking-wider"
                >
                  Cerrar
                </button>

                <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-retro-crema/60 text-retro-terracota rounded-full border border-retro-terracota/10">
                  <AlertCircle className="w-8 h-8 stroke-[2.5]" />
                </div>

                <h3 className="text-lg font-black text-retro-terracota font-sans">
                  Verificación Requerida
                </h3>
                <p className="text-retro-terracota/70 text-xs font-bold mt-3 leading-relaxed">
                  Para poder suscribirte a un plan de comidas, debes verificar tu cuenta de correo electrónico primero.
                </p>

                {verificationError && (
                  <p className="mt-4 text-red-600 text-[11px] font-bold">
                    {verificationError}
                  </p>
                )}

                {verificationSuccess && (
                  <p className="mt-4 text-emerald-600 text-[11px] font-bold">
                    ¡Correo de verificación enviado! Revisa tu bandeja de entrada.
                  </p>
                )}

                <div className="mt-6 flex flex-col space-y-3">
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
                        setVerificationError(err.message || "No pudimos enviar el correo.");
                      } finally {
                        setResendingVerification(false);
                      }
                    }}
                    className="w-full py-3 bg-retro-terracota hover:bg-retro-terracota/90 text-white font-black text-xs rounded-xl shadow-md transition-all uppercase tracking-wider disabled:opacity-50"
                  >
                    {resendingVerification ? "Enviando..." : "Reenviar correo de verificación"}
                  </button>
                  
                  <button
                    onClick={() => {
                      window.location.reload();
                    }}
                    className="w-full py-3 bg-retro-crema hover:bg-white text-retro-terracota border border-retro-terracota/15 hover:border-retro-terracota font-black text-xs rounded-xl shadow-sm transition-all uppercase tracking-wider"
                  >
                    Ya verifiqué mi cuenta (Refrescar)
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
