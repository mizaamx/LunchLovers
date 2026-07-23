import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Flame, Award, Dumbbell, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMealSelection } from '../context/MealSelectionContext';
import { db } from '../firebase/config';
import { collection, addDoc } from 'firebase/firestore';
import AuthModal from './AuthModal';

export default function Pricing() {
  const { user, resendVerificationEmail, updateProfile } = useAuth();
  const { selectedMealIds } = useMealSelection();
  const [billingCycle, setBillingCycle] = useState('weekly'); // Default to weekly as requested
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

  // State variables for interactive Calorie Plan
  const [calorieTier, setCalorieTier] = useState('800'); // '800' or '600'
  const [mealsPerDay, setMealsPerDay] = useState(1); // 1, 2, or 3

  // Resume checkout flow once the user logs in / registers
  React.useEffect(() => {
    if (user) {
      const intendedPlanId = localStorage.getItem('intended_plan');
      if (intendedPlanId) {
        localStorage.removeItem('intended_plan');
        
        let planName = '';
        if (intendedPlanId === 'godinez') planName = 'Paquete Godínez';
        else if (intendedPlanId === 'comida_diaria') planName = 'Comida Diaria (Flexible)';
        else if (intendedPlanId === 'cal800_1') planName = 'Plan Hearty Lovers (1 Comida)';
        else if (intendedPlanId === 'cal800_2') planName = 'Plan Hearty Lovers (2 Comidas)';
        else if (intendedPlanId === 'cal800_3') planName = 'Plan Hearty Lovers (3 Comidas)';
        else if (intendedPlanId === 'cal600_1') planName = 'Plan Light Lovers (1 Comida)';
        else if (intendedPlanId === 'cal600_2') planName = 'Plan Light Lovers (2 Comidas)';
        else if (intendedPlanId === 'cal600_3') planName = 'Plan Light Lovers (3 Comidas)';
        
        if (planName) {
          handleCheckout(intendedPlanId, planName);
        }
      }
    }
  }, [user]);

  const getCaloriePlanDetails = () => {
    if (calorieTier === '800') {
      if (mealsPerDay === 1) {
        return {
          id: 'cal800_1',
          name: 'Plan Hearty Lovers (1 Comida)',
          price: 800,
          mealsCount: 5,
          features: [
            '5 platos completos semanales (Lunes a Viernes)',
            'Menú rotativo balanceado',
            'Empaques compostables biodegradables',
            'Entrega diaria directa en Guadalajara',
            'Asesoría digital básica',
          ]
        };
      } else if (mealsPerDay === 2) {
        return {
          id: 'cal800_2',
          name: 'Plan Hearty Lovers (2 Comidas)',
          price: 1350,
          mealsCount: 10,
          features: [
            '10 platos completos semanales (Almuerzo + Cena, Lun a Vie)',
            'Menú personalizado según tus metas',
            'Entrega express preferente',
            'Ajuste de porciones personalizado',
            'Envío a domicilio incluido',
            'Modificaciones al menú sin costo',
          ]
        };
      } else {
        return {
          id: 'cal800_3',
          name: 'Plan Hearty Lovers (3 Comidas)',
          price: 1800,
          mealsCount: 15,
          features: [
            '15 platos completos semanales (Almuerzo + Cena + Snack, Lun a Vie)',
            'Ajuste exacto de macronutrientes',
            'Asesoría personalizada 24/7',
            'Entregas express prioritarias',
            'Ingredientes premium seleccionados',
            'Envío a domicilio incluido',
          ]
        };
      }
    } else {
      // 600 Kcal
      if (mealsPerDay === 1) {
        return {
          id: 'cal600_1',
          name: 'Plan Light Lovers (1 Comida)',
          price: 650,
          mealsCount: 5,
          features: [
            '5 platos ligeros y balanceados semanales (Lunes a Viernes)',
            'Menú rotativo balanceado y ligero',
            'Empaques compostables biodegradables',
            'Entrega diaria directa en Guadalajara',
            'Asesoría digital básica',
          ]
        };
      } else if (mealsPerDay === 2) {
        return {
          id: 'cal600_2',
          name: 'Plan Light Lovers (2 Comidas)',
          price: 1250,
          mealsCount: 10,
          features: [
            '10 platos ligeros y balanceados semanales (Almuerzo + Cena, Lun a Vie)',
            'Menú personalizado para déficit calórico',
            'Entrega express preferente',
            'Ajuste de porciones personalizado',
            'Envío a domicilio incluido',
            'Modificaciones al menú sin costo',
          ]
        };
      } else {
        return {
          id: 'cal600_3',
          name: 'Plan Light Lovers (3 Comidas)',
          price: 1700,
          mealsCount: 15,
          features: [
            '15 platos ligeros y balanceados semanales (Almuerzo + Cena + Snack, Lun a Vie)',
            'Control de macronutrientes estricto',
            'Asesoría personalizada 24/7',
            'Entregas express prioritarias',
            'Ingredientes premium seleccionados',
            'Envío a domicilio incluido',
          ]
        };
      }
    }
  };

  const activeCaloriePlan = getCaloriePlanDetails();

  const planGodinez = {
    id: 'godinez',
    name: 'Paquete Godínez',
    subtitle: 'El plan ideal para tu horario de oficina.',
    price: 750,
    features: [
      '5 comidas semanales (1 comida diaria de Lun a Vie)',
      'Porciones ideales para la jornada laboral',
      'Entrega diaria en tu oficina en Guadalajara',
      'Olvídate de cocinar durante la semana',
      'Platillos listos para calentar y disfrutar',
    ],
  };

  const planComidaDiaria = {
    id: 'comida_diaria',
    name: 'Comida Diaria (Flexible)',
    subtitle: 'Toma el control día a día con total libertad.',
    price: 125,
    features: [
      '$125.00 MXN por comida individual',
      'Pide los días y porciones que necesites',
      'Sin suscripciones fijas ni plazos forzosos',
      'Complementa tu semana de forma fácil',
      'Entrega diaria en Guadalajara',
    ],
  };

  const getPrice = (weeklyPrice, isSingleMeal = false) => {
    if (billingCycle === 'weekly') {
      return weeklyPrice;
    } else {
      // Monthly subscription = weeklyPrice * 4 with a 10% discount
      if (isSingleMeal) {
        // For individual meal, assume a pack of 20 meals for the month
        return Math.round(weeklyPrice * 20 * 0.9);
      }
      return Math.round(weeklyPrice * 4 * 0.9);
    }
  };

  const handleCheckout = async (planId, planName) => {
    if (!user) {
      localStorage.setItem('intended_plan', planId);
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

      // Actualizar el perfil del usuario con el plan y estatus pendiente
      await updateProfile({ plan: planId, paymentStatus: 'pending' });

      // 2. Transición visual para redirección a datos de transferencia
      setCheckoutStep('redirecting');

      // Delay de cortesía de 1.5s
      setTimeout(() => {
        window.location.href = `${window.location.origin}/dashboard`;
        window.location.reload();
      }, 1500);

    } catch (err) {
      console.error("Error al registrar el pedido:", err);
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
          {/* 1. HERO CARD: Plan Calórico Premium (Left Side, 7 columns) */}
          <motion.div
            variants={cardVariants}
            whileHover={{ y: -6, rotateX: 1.0, rotateY: -1.0, transition: { duration: 0.2 } }}
            className="lg:col-span-7 flex flex-col rounded-[2.5rem] p-8 lg:p-10 relative liquid-glass-active depth-container shadow-[0_20px_50px_rgba(176,90,50,0.12)]"
          >
            {/* Background dynamic blur spot */}
            <div className="absolute -right-20 -top-20 w-60 h-60 bg-retro-mostaza/10 rounded-full blur-3xl pointer-events-none" />
            
            {/* Popular Tag */}
            <div className="absolute top-0 right-8 transform -translate-y-1/2">
              <span className="text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md text-white bg-retro-mostaza border border-retro-mostaza">
                Planes Premium
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
                    Planes Premium Lunch Lovers
                  </h3>
                  <p className="text-retro-terracota/80 text-xs font-bold mt-2 leading-relaxed">
                    Elige el tamaño de tus porciones y la cantidad de comidas que necesitas cada día de Lunes a Viernes.
                  </p>

                  {/* Calorie Tier Tabs */}
                  <div className="mt-5">
                    <span className="text-[10px] font-black text-retro-terracota/50 uppercase tracking-wider block mb-2 font-sans">1. Selecciona el Tipo de Plan</span>
                    <div className="flex rounded-xl bg-retro-crema/60 p-1 border border-retro-terracota/10 w-fit">
                      <button
                        onClick={() => setCalorieTier('800')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
                          calorieTier === '800' 
                            ? 'bg-retro-terracota text-white shadow-sm' 
                            : 'text-retro-terracota/70 hover:text-retro-terracota'
                        }`}
                      >
                        Hearty Lovers
                      </button>
                      <button
                        onClick={() => setCalorieTier('600')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
                          calorieTier === '600' 
                            ? 'bg-retro-terracota text-white shadow-sm' 
                            : 'text-retro-terracota/70 hover:text-retro-terracota'
                        }`}
                      >
                        Light Lovers
                      </button>
                    </div>
                  </div>

                  {/* Meals Per Day Tabs */}
                  <div className="mt-5">
                    <span className="text-[10px] font-black text-retro-terracota/50 uppercase tracking-wider block mb-2 font-sans">2. Comidas diarias (Lunes a Viernes)</span>
                    <div className="flex rounded-xl bg-retro-crema/60 p-1 border border-retro-terracota/10">
                      {[1, 2, 3].map((num) => (
                        <button
                          key={num}
                          onClick={() => setMealsPerDay(num)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all ${
                            mealsPerDay === num
                              ? 'bg-retro-terracota text-white shadow-sm'
                              : 'text-retro-terracota/70 hover:text-retro-terracota'
                          }`}
                        >
                          {num} {num === 1 ? 'Comida' : 'Comidas'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-retro-terracota/10">
                  <div className="flex items-baseline justify-start">
                    <span className="text-retro-terracota/60 text-lg font-bold">$</span>
                    <span className="text-5xl font-black text-retro-terracota tracking-tight font-sans">
                      {getPrice(activeCaloriePlan.price)}
                    </span>
                    <span className="text-retro-terracota/60 text-xs font-extrabold ml-2">
                      MXN / {billingCycle === 'weekly' ? 'semana' : 'mes'}
                    </span>
                  </div>
                  
                  <div className="mt-6">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleCheckout(activeCaloriePlan.id, activeCaloriePlan.name)}
                      className="w-full py-4 px-6 rounded-2xl font-black text-xs tracking-wider uppercase transition-all bg-retro-terracota hover:bg-retro-terracota/90 text-white shadow-lg shadow-retro-terracota/15 border border-retro-terracota/20"
                    >
                      Suscribirme
                    </motion.button>
                    <p className="text-[10px] text-center font-bold text-retro-terracota/50 mt-2.5 font-sans">
                      🔒 Pago 100% seguro a través de Mercado Pago
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column of Hero Plan (Features list) */}
              <div className="flex-1 flex flex-col justify-center bg-white/40 backdrop-blur-sm rounded-3xl p-6 border border-retro-terracota/5 shadow-[inset_0_1px_2px_rgba(255,255,255,0.4)]">
                <h4 className="text-xs font-black uppercase tracking-wider text-retro-terracota/60 mb-4 font-sans">
                  {activeCaloriePlan.name}
                </h4>
                <ul className="space-y-4 flex-grow">
                  {activeCaloriePlan.features.map((feature, idx) => (
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

          {/* 2. SECONDARY PLANS: Godínez & Comida Diaria (Right Side, 5 columns) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Paquete Godínez */}
            <motion.div
              variants={cardVariants}
              whileHover={{ y: -4, rotateX: 0.8, rotateY: -0.8, transition: { duration: 0.2 } }}
              className="rounded-[2rem] p-6 relative liquid-glass depth-container shadow-[0_15px_30px_rgba(176,90,50,0.04)] overflow-hidden text-left"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-retro-crema text-retro-terracota border border-retro-terracota/10">
                    <Award className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-retro-terracota font-sans">
                      {planGodinez.name}
                    </h3>
                    <p className="text-[11px] font-bold text-retro-terracota/60 leading-snug">
                      {planGodinez.subtitle}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-baseline">
                  <span className="text-retro-terracota/60 text-xs font-bold">$</span>
                  <span className="text-3xl font-black text-retro-terracota font-sans">
                    {getPrice(planGodinez.price)}
                  </span>
                  <span className="text-retro-terracota/60 text-[10px] font-extrabold ml-1">
                    MXN/{billingCycle === 'weekly' ? 'sem' : 'mes'}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-retro-terracota/5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ul className="space-y-2">
                  {planGodinez.features.slice(0, 3).map((feature, idx) => (
                    <li key={idx} className="flex items-center text-[10px] font-bold text-retro-terracota/85">
                      <Check className="w-3 h-3 stroke-[3] text-retro-terracota mr-2 flex-shrink-0" />
                      <span className="truncate">{feature}</span>
                    </li>
                  ))}
                </ul>
                <ul className="space-y-2">
                  {planGodinez.features.slice(3).map((feature, idx) => (
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
                  onClick={() => handleCheckout(planGodinez.id, planGodinez.name)}
                  className="w-full py-3 px-5 rounded-xl font-black text-[11px] tracking-wider uppercase bg-retro-crema hover:bg-white text-retro-terracota border border-retro-terracota/15 hover:border-retro-terracota transition-all"
                >
                  Suscribirme
                </motion.button>
              </div>
            </motion.div>

            {/* Comida Diaria / Flexible */}
            <motion.div
              variants={cardVariants}
              whileHover={{ y: -4, rotateX: 0.8, rotateY: -0.8, transition: { duration: 0.2 } }}
              className="rounded-[2rem] p-6 relative liquid-glass depth-container shadow-[0_15px_30px_rgba(176,90,50,0.04)] overflow-hidden text-left"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-retro-crema text-retro-terracota border border-retro-terracota/10">
                    <Dumbbell className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-retro-terracota font-sans">
                      {planComidaDiaria.name}
                    </h3>
                    <p className="text-[11px] font-bold text-retro-terracota/60 leading-snug">
                      {planComidaDiaria.subtitle}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-baseline">
                  <span className="text-retro-terracota/60 text-xs font-bold">$</span>
                  <span className="text-3xl font-black text-retro-terracota font-sans">
                    {getPrice(planComidaDiaria.price, true)}
                  </span>
                  <span className="text-retro-terracota/60 text-[10px] font-extrabold ml-1">
                    MXN/{billingCycle === 'weekly' ? 'comida' : 'mes'}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-retro-terracota/5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ul className="space-y-2">
                  {planComidaDiaria.features.slice(0, 3).map((feature, idx) => (
                    <li key={idx} className="flex items-center text-[10px] font-bold text-retro-terracota/85">
                      <Check className="w-3 h-3 stroke-[3] text-retro-terracota mr-2 flex-shrink-0" />
                      <span className="truncate">{feature}</span>
                    </li>
                  ))}
                </ul>
                <ul className="space-y-2">
                  {planComidaDiaria.features.slice(3).map((feature, idx) => (
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
                  onClick={() => handleCheckout(planComidaDiaria.id, planComidaDiaria.name)}
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
                        <ShieldCheck className="w-6 h-6 stroke-[2.2] text-retro-terracota" />
                      </div>
                    </div>
                    <h3 className="text-lg font-black text-retro-terracota font-sans">
                      ¡Plan Registrado con Éxito!
                    </h3>
                    <p className="text-retro-terracota/70 text-xs font-bold mt-3 leading-relaxed">
                      Redirigiendo a los datos de transferencia bancaria para activar tu suscripción de <span className="text-retro-terracota font-black">{redirectingPlan.name}</span>.
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
                      Instrucciones de Pago
                    </p>
                    <p className="text-[11px] font-bold text-retro-terracota mt-1 leading-snug">
                      Podrás pagar mediante transferencia interbancaria (SPEI). Al completar este registro, se te mostrarán los datos de la cuenta Santander de Susana Ruiz Cazares para realizar tu depósito.
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
