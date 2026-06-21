import React, { useState, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Plus, Check, Star, AlertCircle, Save, 
  CheckCircle, Trash2, Loader2, X, Lock, 
  Sparkles, ChevronRight, Info, MapPin, Calendar 
} from 'lucide-react';
import { useMealSelection } from '../context/MealSelectionContext';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';
import RequirePaymentGate from './RequirePaymentGate';

const categories = ['Todos', 'Platillos', 'Snacks', 'Bebidas'];

// Simulated generic dishes for new/unregistered visitors
const MOCK_GENERIC_DISHES = [
  {
    id: 'mock-1',
    name: 'Salmón Grill con Aguacate',
    description: 'Filete de salmón fresco a la plancha sobre una cama de espinacas tiernas, aguacate fresco y aderezo cítrico.',
    macros: { calories: 420, protein: 38, carbs: 5, fat: 28 },
    imageUrl: '/keto_salmon.webp',
    category: 'comida',
    tags: ['Keto', 'Alto en Proteína']
  },
  {
    id: 'mock-2',
    name: 'Buddha Bowl Vegano de Quinoa',
    description: 'Mezcla balanceada de quinoa, edamames, garbanzos sazonados, col morada y aguacate fresco con tahini.',
    macros: { calories: 380, protein: 14, carbs: 52, fat: 12 },
    imageUrl: '/vegan_bowl.webp',
    category: 'comida',
    tags: ['Vegano']
  },
  {
    id: 'mock-3',
    name: 'Pollo Fitness con Brócoli',
    description: 'Pechuga de pollo al grill marinada en finas hierbas con brócoli al vapor y arroz de quinoa integral.',
    macros: { calories: 390, protein: 42, carbs: 12, fat: 8 },
    imageUrl: '/protein_chicken.webp',
    category: 'comida',
    tags: ['Alto en Proteína']
  },
  {
    id: 'mock-4',
    name: 'Ensalada Tofu Orgánica',
    description: 'Tofu orgánico extra firme con mezcla de lechugas, aguacate, de calabaza y aderezo vinagreta.',
    macros: { calories: 320, protein: 18, carbs: 8, fat: 22 },
    imageUrl: '/keto_vegan_salad.webp',
    category: 'cena',
  }
];

// Dynamic tag helper based on macro profile & keywords
const getDishTags = (dish) => {
  if (dish.tags) return dish.tags;
  const tags = [];
  const nameLower = (dish.name || '').toLowerCase();
  const descLower = (dish.description || '').toLowerCase();
  
  if (nameLower.includes('keto') || descLower.includes('keto') || (dish.macros?.fat > 20 && dish.macros?.carbs < 15)) {
    tags.push('Keto');
  }
  if (nameLower.includes('vegan') || descLower.includes('tofu') || descLower.includes('garbanzo') || nameLower.includes('chiches') || descLower.includes('vegetal')) {
    tags.push('Vegano');
  }
  if (dish.macros?.protein >= 30 || nameLower.includes('pui') || nameLower.includes('chicken') || nameLower.includes('saumon') || nameLower.includes('pavo')) {
    tags.push('Alto en Proteína');
  }
  if (tags.length === 0) tags.push('Balanceado');
  return tags;
};

export default function Catalog() {
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDay, setActiveDay] = useState('lunes');
  const [activeSlot, setActiveSlot] = useState('comida');
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Custom states for redesign
  const [selectedDishForModal, setSelectedDishForModal] = useState(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  
  const { user } = useAuth();
  
  const {
    selectedDays,
    selectedMealIds,
    assignDishToSlot,
    removeDishFromSlot,
    clearSelection,
    saveSelection,
    limit,
    plan,
    error,
    setError,
    isSyncing,
    syncSuccess,
    isAccepted,
    
    // Shipping and Cutlery variables
    withCutlery,
    setWithCutlery,
    shippingCost,
    
    // Firestore fields & lock variables
    dishes,
    allDishes,
    loading,
    isSelectionOpen,
    weekId,
    getDishesForDay
  } = useMealSelection();

  // Helper maps for Spanish localized names
  const formatDayName = (day) => {
    const map = {
      lunes: 'Lunes',
      martes: 'Martes',
      miercoles: 'Miércoles',
      jueves: 'Jueves',
      viernes: 'Viernes'
    };
    return map[day] || day;
  };

  const formatSlotName = (slot) => {
    const map = {
      comida: 'Almuerzo',
      cena: 'Cena',
      snack: 'Snack'
    };
    return map[slot] || slot;
  };

  const isSlotLocked = useCallback((slotId) => {
    if (!user) return false; // Demo mode for guests
    if (!plan) return false; // Demo mode for registered no plan
    
    if (['cal800_1', 'cal600_1', 'comida_diaria', 'godinez', 'basic'].includes(plan)) {
      return slotId !== 'comida';
    }
    if (['cal800_2', 'cal600_2', 'normal'].includes(plan)) {
      return slotId === 'snack' || slotId === 'bebida';
    }
    return false; // cal800_3, cal600_3, pro: all unlocked
  }, [user, plan]);

  // Handle assigning a dish to the active slot
  const handleAssignDish = useCallback((dishId) => {
    if (!isSelectionOpen) return;
    const success = assignDishToSlot(activeDay, activeSlot, dishId);
    return success;
  }, [activeDay, activeSlot, assignDishToSlot, isSelectionOpen]);

  // Check if a dish is scheduled anywhere and return list of day/slots
  const getScheduledSlotsForDish = useCallback((dishId) => {
    const scheduled = [];
    const dayNamesShort = {
      lunes: 'Lun',
      martes: 'Mar',
      miercoles: 'Mié',
      jueves: 'Jue',
      viernes: 'Vie'
    };
    const slotNamesShort = {
      comida: 'Almuerzo',
      cena: 'Cena',
      snack: 'Snack'
    };
    
    Object.keys(selectedDays || {}).forEach(day => {
      const slotsObj = selectedDays[day] || {};
      Object.keys(slotsObj).forEach(slot => {
        if (slotsObj[slot] === dishId) {
          scheduled.push(`${dayNamesShort[day]} (${slotNamesShort[slot]})`);
        }
      });
    });
    
    return scheduled;
  }, [selectedDays]);

  // Use Firestore active menu filtered by day for registered users, otherwise generic simulated menu
  const displayDishes = useMemo(() => {
    return user ? getDishesForDay(activeDay) : MOCK_GENERIC_DISHES;
  }, [user, getDishesForDay, activeDay]);

  const filteredDishes = useMemo(() => {
    return displayDishes.filter((dish) => {
      let matchesFilter = false;
      const cat = (dish.category || '').toLowerCase();
      if (activeFilter === 'Todos') {
        matchesFilter = true;
      } else if (activeFilter === 'Platillos' && (cat === 'platillo' || cat === 'comida' || cat === 'cena' || !cat)) {
        matchesFilter = true;
      } else if (activeFilter === 'Snacks' && (cat === 'snack' || cat === 'snacks')) {
        matchesFilter = true;
      } else if (activeFilter === 'Bebidas' && (cat === 'bebida' || cat === 'bebidas')) {
        matchesFilter = true;
      }
      const matchesSearch = (dish.name || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, searchQuery, displayDishes]);

  return (
    <RequirePaymentGate>
      <section 
        id="catalogo" 
      className={`py-24 bg-retro-crema/20 relative overflow-hidden transition-all ${
        user && plan ? 'pb-32' : ''
      }`}
    >
      {/* Decorative Background Glows */}
      <div className="absolute top-0 right-[-10%] w-[35rem] h-[35rem] bg-retro-mostaza/5 rounded-full blur-[110px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div className="max-w-xl text-left">
            <span className="text-retro-terracota font-bold text-xs uppercase tracking-wider bg-retro-crema px-3 py-1 rounded-full border border-retro-terracota/10">
              {user 
                ? (isSelectionOpen ? 'Selección Semanal Abierta' : 'Selección Semanal Cerrada') 
                : 'Conoce Nuestro Menú'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-retro-terracota mt-4 tracking-tight font-sans">
              {user 
                ? (isSelectionOpen ? 'Elige tu Menú Semanal' : 'Tu Selección para esta Semana') 
                : 'Explora Nuestras Opciones'}
            </h2>
            <p className="text-retro-terracota/70 text-base mt-2 font-semibold">
              {user 
                ? (isSelectionOpen 
                    ? 'Haz clic en un día y horario, luego selecciona tus platos favoritos para armar tu semana.' 
                    : 'El periodo de selección ha cerrado. Aquí puedes ver los platillos que recibirás este ciclo.') 
                : 'Estos son algunos de nuestros platillos balanceados. Inicia sesión o regístrate para comenzar a planificar tu menú semanal.'}
            </p>
          </div>

          {/* Search bar */}
          <div className="mt-6 md:mt-0 relative w-full md:w-80">
            <input
              type="text"
              placeholder="Buscar platillo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-retro-terracota/20 focus:outline-none focus:ring-2 focus:ring-retro-terracota/20 focus:border-retro-terracota text-retro-terracota placeholder-retro-terracota/40 text-xs font-bold bg-white"
            />
            <Search className="w-4.5 h-4.5 text-retro-terracota/40 absolute left-3.5 top-3.5" />
          </div>
        </div>

        {/* TEMPORAL LOCK ALERT BANNER */}
        {user && !isSelectionOpen && (
          <div className="mb-8 p-5 bg-retro-terracota text-white rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl border border-retro-terracota/25 animate-fade-in text-left">
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-2xl bg-white/10 text-white flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h4 className="text-sm font-black uppercase tracking-wider">El periodo de selección de menú está cerrado</h4>
                <p className="text-[11px] font-bold opacity-90 mt-0.5 leading-snug">
                  La selección está disponible únicamente sábados y domingos. Mostrando tus platillos guardados en modo lectura.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest bg-white/10 px-3.5 py-1.5 rounded-xl">
              <Calendar className="w-3.5 h-3.5 text-retro-mostaza" />
              <span>Semana: {weekId}</span>
            </div>
          </div>
        )}

        {/* Banners & Selections Feedback */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-3xl text-xs font-black text-red-700 flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span>{error}</span>
              </div>
            </motion.div>
          )}

          {syncSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-emerald-50 border-2 border-emerald-500 rounded-3xl text-xs font-black text-emerald-800 flex items-center space-x-2 shadow-sm"
            >
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>¡Tu selección semanal de platillos ha sido guardada en tu perfil!</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* DELIVERY INFO BAR - Manzana Verde Style */}
        {user && (
          <div className="mb-8 p-5 bg-white border border-retro-terracota/10 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm text-left animate-fade-in">
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-2xl bg-retro-terracota/5 text-retro-terracota flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <h4 className="text-[10px] font-black text-retro-terracota/50 uppercase tracking-widest">Dirección de Entrega</h4>
                <p className="text-xs font-black text-retro-terracota mt-0.5 leading-snug">
                  {user?.address?.street 
                    ? `${user.address.street}, ${user.address.colony}, ${user.address.municipality}` 
                    : 'Sin dirección configurada. Configúrala en tu Panel.'}
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 self-start md:self-auto">
              {/* Cubiertos Toggle */}
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black text-retro-terracota/60 uppercase tracking-wider font-sans">Cubiertos:</span>
                <div className="inline-flex rounded-xl bg-retro-crema/40 p-1 border border-retro-terracota/10">
                  <button
                    type="button"
                    onClick={() => setWithCutlery(true)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${
                      withCutlery 
                        ? 'bg-retro-terracota text-white shadow-sm' 
                        : 'text-retro-terracota/70 hover:text-retro-terracota'
                    }`}
                  >
                    Sí
                  </button>
                  <button
                    type="button"
                    onClick={() => setWithCutlery(false)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${
                      !withCutlery 
                        ? 'bg-retro-terracota text-white shadow-sm' 
                        : 'text-retro-terracota/70 hover:text-retro-terracota'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              {/* Costo de Envío Pill */}
              <div className="px-4 py-2 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 font-sans">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Envío: ${shippingCost.toFixed(2)} MXN</span>
              </div>
            </div>
          </div>
        )}

        {/* DAY SLIDER & MEAL SLOTS SELECTOR */}
        <div className="mb-10 text-center">
          {/* Day Slider */}
          <div className="flex items-center space-x-3 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-retro-terracota/20 scrollbar-track-transparent justify-start sm:justify-center">
            {['lunes', 'martes', 'miercoles', 'jueves', 'viernes'].map((day) => {
              const isSelected = activeDay === day;
              const daySchedule = selectedDays[day] || {};
              const scheduledCount = Object.values(daySchedule).filter(Boolean).length;
              
              return (
                <button
                  key={day}
                  onClick={() => setActiveDay(day)}
                  className={`flex-shrink-0 flex flex-col items-center justify-center py-2.5 px-6 rounded-2xl transition-all duration-300 ${
                    isSelected
                      ? 'bg-emerald-800 text-white shadow-lg shadow-emerald-800/25 scale-105 border border-emerald-800'
                      : 'bg-white hover:bg-retro-crema/40 text-retro-terracota border border-retro-terracota/10 hover:border-retro-terracota/30'
                  }`}
                >
                  <span className="text-[10px] font-black uppercase tracking-wider opacity-75">
                    {day === 'miercoles' ? 'Mié' : day.substring(0, 3)}
                  </span>
                  <span className="text-sm font-black mt-0.5 capitalize">{day === 'miercoles' ? 'Miércoles' : day}</span>
                  
                  {scheduledCount > 0 && (
                    <div className="flex gap-1 mt-1.5">
                      {Array.from({ length: scheduledCount }).map((_, i) => (
                        <span 
                          key={i} 
                          className={`w-1.5 h-1.5 rounded-full ${
                            isSelected ? 'bg-white' : 'bg-retro-oliva'
                          }`} 
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Slot Selector Tabs */}
          <div className="flex items-center justify-center gap-3 mt-6">
            {[
              { id: 'comida', name: 'Almuerzo', emoji: '☀️' },
              { id: 'cena', name: 'Cena', emoji: '🌙' },
              { id: 'snack', name: 'Snack', emoji: '🍎' },
              { id: 'bebida', name: 'Bebida', emoji: '🥤' }
            ].map((slot) => {
              const isSelected = activeSlot === slot.id;
              const locked = isSlotLocked(slot.id);
              
              return (
                <button
                  key={slot.id}
                  onClick={() => setActiveSlot(slot.id)}
                  className={`flex items-center space-x-2 px-5 py-2.5 rounded-2xl text-xs font-black transition-all duration-300 border ${
                    isSelected
                      ? 'bg-emerald-800 text-white border-emerald-800 shadow-md'
                      : 'bg-white hover:bg-retro-crema/20 text-retro-terracota border border-retro-terracota/10'
                  } ${locked ? 'opacity-65 hover:opacity-85' : ''}`}
                >
                  <span>{slot.emoji}</span>
                  <span>{slot.name}</span>
                  {locked && <Lock className="w-3.5 h-3.5 text-retro-terracota/60 ml-1" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* CTA banner when registered user does not have a subscription */}
        {user && !plan && (
          <div className="mb-8 p-6 bg-retro-crema/45 border border-dashed border-retro-terracota/30 rounded-3xl text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-black text-retro-terracota">¿Listo para programar tu menú?</h4>
              <p className="text-xs font-bold text-retro-terracota/70 mt-1">
                Elige uno de nuestros planes de comida abajo para poder activar tu calendario y seleccionar tus platillos de entrega.
              </p>
            </div>
            <a
              href="#pricing"
              className="inline-flex items-center justify-center bg-retro-terracota hover:bg-retro-terracota/90 text-white text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl transition-colors shadow-md shadow-retro-terracota/10 self-start sm:self-auto"
            >
              Ver Planes
            </a>
          </div>
        )}

        {/* CTA banner when unregistered visitor is browsing the landing page */}
        {!user && (
          <div className="mb-8 p-6 bg-retro-crema/45 border border-dashed border-retro-terracota/30 rounded-3xl text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-black text-retro-terracota">¿Listo para comer saludable?</h4>
              <p className="text-xs font-bold text-retro-terracota/70 mt-1">
                Inicia sesión y suscríbete a un plan para comenzar a programar tus platillos semanales.
              </p>
            </div>
            <button
              onClick={() => setShowAuthModal(true)}
              className="inline-flex items-center justify-center bg-retro-terracota hover:bg-retro-terracota/90 text-white text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl transition-colors shadow-md shadow-retro-terracota/10 self-start sm:self-auto"
            >
              Iniciar Sesión / Registrarse
            </button>
          </div>
        )}

        {/* Filter buttons */}
        <div className="flex flex-wrap items-center gap-2 mb-10 pb-4 border-b border-retro-terracota/10">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveFilter(category)}
              className={`px-5 py-2 rounded-full text-xs font-black transition-all duration-200 border ${
                activeFilter === category
                  ? 'bg-emerald-800 text-white border-emerald-800 shadow-md'
                  : 'bg-white hover:bg-retro-crema text-retro-terracota border border-retro-terracota/20 hover:border-retro-terracota/40'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Catalog Content Area */}
        {isSlotLocked(activeSlot) ? (
          /* Locked Slot Upselling Screen */
          <div className="py-16 text-center max-w-lg mx-auto bg-white/60 backdrop-blur-md border border-dashed border-retro-terracota/20 rounded-3xl p-8 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-retro-terracota/10 text-retro-terracota flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h3 className="text-lg font-black text-retro-terracota">Horario Bloqueado</h3>
            <p className="text-xs text-retro-terracota/70 font-bold mt-2 leading-relaxed">
              Tu plan de suscripción actual no incluye este horario de comida. Actualiza tu plan a uno superior para programar comidas adicionales para tu semana.
            </p>
            <button
              onClick={() => {
                const el = document.getElementById('pricing');
                if (el) {
                  const offset = 80;
                  const top = el.getBoundingClientRect().top + window.scrollY - offset;
                  window.scrollTo({ top, behavior: 'smooth' });
                }
              }}
              className="mt-6 inline-flex items-center space-x-2 bg-retro-terracota hover:bg-retro-terracota/90 text-white font-extrabold text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition-all shadow-md shadow-retro-terracota/10"
            >
              <span>Mejorar Plan de Suscripción</span>
              <Sparkles className="w-4 h-4 text-retro-mostaza animate-pulse" />
            </button>
          </div>
        ) : loading && user ? (
          /* Loading Dishes Indicator (Only for logged in users fetching from Firestore) */
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-4 border-retro-crema border-t-retro-terracota rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-retro-terracota/70 font-bold">Cargando platillos de la base de datos...</p>
          </div>
        ) : (
          /* Catalog Grid */
          <motion.div 
            layout
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredDishes.map((dish) => {
                const isSelectedForSlot = selectedDays[activeDay]?.[activeSlot] === dish.id;
                const scheduledSlots = getScheduledSlotsForDish(dish.id);
                const tags = getDishTags(dish);
                
                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    transition={{ duration: 0.25 }}
                    key={dish.id}
                    className={`bg-white border rounded-3xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 relative transition-all shadow-sm text-left ${
                      isSelectedForSlot 
                        ? 'border-emerald-700 bg-emerald-50/10 shadow-emerald-600/5' 
                        : 'border-retro-terracota/15 hover:border-retro-terracota/30 hover:bg-stone-50/40'
                    }`}
                  >
                    {/* Left: Square Image */}
                    <div 
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden flex-shrink-0 cursor-pointer relative bg-retro-crema/25 border border-retro-terracota/5"
                      onClick={() => setSelectedDishForModal(dish)}
                    >
                      <img
                        src={dish.imageUrl}
                        alt={dish.name}
                        className="w-full h-full object-cover transition-transform duration-350 hover:scale-102"
                        onError={(e) => { e.target.src = '/keto_salmon.webp'; }}
                      />
                    </div>

                    {/* Right: Info and Action button */}
                    <div className="flex-grow flex flex-col justify-between h-full min-w-0 w-full">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 
                            className="text-sm sm:text-base font-black text-retro-terracota leading-snug cursor-pointer hover:underline line-clamp-2"
                            onClick={() => setSelectedDishForModal(dish)}
                          >
                            {dish.name}
                          </h3>
                          
                          {/* Desktop Tag indicator */}
                          {scheduledSlots.length > 0 && (
                            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-retro-oliva/10 text-retro-oliva border border-retro-oliva/10">
                              {scheduledSlots.join(', ')}
                            </span>
                          )}
                        </div>

                        {/* Macros Bullet */}
                        <div className="text-[10px] sm:text-[11px] font-bold text-retro-terracota/60 mt-1.5 flex flex-wrap items-center gap-1">
                          <span className="text-retro-terracota font-black">● {dish.macros?.calories || 0} Kcal</span>
                          <span className="opacity-50">·</span>
                          <span>P {dish.macros?.protein || 0}g</span>
                          <span className="opacity-50">·</span>
                          <span>C {dish.macros?.carbs || 0}g</span>
                          <span className="opacity-50">·</span>
                          <span>G {dish.macros?.fat || 0}g</span>
                        </div>

                        {/* Tags line */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {tags.map((tag) => (
                            <span
                              key={tag}
                              className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                tag === 'Keto'
                                  ? 'bg-retro-terracota/10 text-retro-terracota'
                                  : tag === 'Vegano'
                                  ? 'bg-retro-oliva/10 text-retro-oliva'
                                  : 'bg-retro-mostaza/10 text-retro-mostaza'
                              }`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Action Row */}
                      <div className="mt-4 pt-3 border-t border-retro-terracota/5 flex items-center justify-end gap-2">
                        
                        <div className="flex items-center space-x-1.5">
                          {!user ? (
                            <button
                              onClick={() => setShowAuthModal(true)}
                              className="px-4 py-1.5 rounded-xl text-[10px] font-black tracking-wider uppercase transition-all bg-emerald-800 hover:bg-emerald-900 text-white shadow-md shadow-emerald-800/10"
                            >
                              Elegir
                            </button>
                          ) : !plan ? (
                            <button
                              onClick={() => {
                                const el = document.getElementById('pricing');
                                if (el) {
                                  const offset = 80;
                                  const top = el.getBoundingClientRect().top + window.scrollY - offset;
                                  window.scrollTo({ top, behavior: 'smooth' });
                                }
                              }}
                              className="px-4 py-1.5 rounded-xl text-[10px] font-black tracking-wider uppercase transition-all bg-emerald-800 hover:bg-emerald-900 text-white shadow-md shadow-emerald-800/10"
                            >
                              Elegir
                            </button>
                          ) : isSelectionOpen ? (
                            isAccepted ? (
                              isSelectedForSlot && (
                                <span className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-[9px] font-black bg-emerald-50 text-emerald-700 border border-emerald-250">
                                  <CheckCircle className="w-3.5 h-3.5 animate-pulse" />
                                  <span>Elegido</span>
                                </span>
                              )
                            ) : isSelectedForSlot ? (
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => removeDishFromSlot(activeDay, activeSlot)}
                                  className="flex items-center justify-center p-2 rounded-xl text-red-650 hover:bg-red-55 border border-red-200 transition-all"
                                  title="Quitar"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                                <span className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-250">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                  <span>Elegido</span>
                                </span>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleAssignDish(dish.id)}
                                className="px-4 py-1.5 rounded-xl text-[10px] font-black tracking-wider uppercase transition-all bg-emerald-800 hover:bg-emerald-900 text-white shadow-md shadow-emerald-800/15"
                              >
                                <span>{selectedDays[activeDay]?.[activeSlot] ? 'Reemplazar' : 'Elegir'}</span>
                              </button>
                            )
                          ) : (
                            isSelectedForSlot && (
                              <span className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-[9px] font-black bg-emerald-50 text-emerald-700 border border-emerald-250">
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Elegido</span>
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Empty state */}
            {filteredDishes.length === 0 && (
              <div className="col-span-full py-16 text-center font-sans">
                <AlertCircle className="w-8 h-8 text-retro-terracota/40 mx-auto mb-2" />
                <p className="text-retro-terracota/70 text-sm font-bold">
                  {user 
                    ? (isSelectionOpen 
                        ? 'No hay platillos disponibles en el menú activo para este día.' 
                        : 'No registraste platillos durante el fin de semana para este ciclo.') 
                    : 'No hay platillos de demostración disponibles.'}
                </p>
              </div>
            )}
          </motion.div>
        )}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* FLOATING SELECTION BAR */}
      {user && plan && (
        <div className="fixed bottom-6 inset-x-4 max-w-4xl mx-auto z-45 font-sans animate-fade-in-up">
          <div className="bg-white/90 backdrop-blur-md border border-retro-terracota/15 p-4 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl">
            {/* Left Info: Selections count and days progress */}
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div>
                <span className="text-[10px] font-black text-retro-terracota/50 uppercase tracking-widest block font-sans">Mi Selección Semanal</span>
                <span className="text-sm font-black text-retro-terracota">
                  {selectedMealIds.length} de {limit} platillos seleccionados
                </span>
              </div>
              
              {/* Day dots checklist */}
              <div className="flex items-center gap-2.5 bg-retro-crema/40 px-3 py-1.5 rounded-2xl border border-retro-terracota/5">
                {['lunes', 'martes', 'miercoles', 'jueves', 'viernes'].map((d) => {
                  const dayObj = selectedDays[d] || {};
                  const isDayCompleted = Object.values(dayObj).some(Boolean);
                  return (
                    <div key={d} className="flex flex-col items-center">
                      <span className="text-[8px] font-black uppercase text-retro-terracota/40 font-sans tracking-wide">
                        {d === 'miercoles' ? 'Mié' : d.substring(0, 3)}
                      </span>
                      <span className={`w-2.5 h-2.5 rounded-full mt-0.5 border ${
                        isDayCompleted 
                          ? 'bg-emerald-500 border-emerald-600 shadow-sm shadow-emerald-500/30' 
                          : 'bg-stone-300 border-stone-400'
                      }`} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Action: Verify / lock selection */}
            <div>
              {isAccepted ? (
                <div className="flex items-center space-x-1.5 px-4.5 py-2.5 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-2xl text-xs font-black uppercase tracking-wider shadow-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-600 animate-pulse" />
                  <span>Selección Confirmada y Enviada</span>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={selectedMealIds.length === 0}
                  onClick={() => setShowVerifyModal(true)}
                  className="px-5 py-3 rounded-2xl text-xs font-extrabold uppercase tracking-wider bg-retro-terracota hover:bg-retro-terracota/95 text-white transition-all shadow-md shadow-retro-terracota/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5 font-sans"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Verificar y Enviar Menú</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VERIFY ORDER MODAL */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-sans text-left">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl border border-retro-terracota/10 max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-retro-terracota/10">
              <h3 className="text-lg font-black text-retro-terracota flex items-center gap-2">
                <CheckCircle className="w-5.5 h-5.5 text-emerald-600 stroke-[2.5]" />
                Verifica tu Selección Semanal
              </h3>
              <p className="text-[11px] text-retro-terracota/70 font-semibold mt-1.5 leading-relaxed">
                Por favor, revisa tus platillos seleccionados antes de enviar. <strong>Una vez aceptada tu selección, ya no podrás modificarla para esta semana.</strong>
              </p>
            </div>

            {/* Content list */}
            <div className="p-6 overflow-y-auto flex-grow space-y-4">
              {['lunes', 'martes', 'miercoles', 'jueves', 'viernes'].map((day) => {
                const dayObj = selectedDays[day] || {};
                const slots = Object.keys(dayObj).filter(slot => dayObj[slot] !== null);
                
                if (slots.length === 0) return null;
                
                return (
                  <div key={day} className="p-3 bg-retro-crema/15 border border-retro-terracota/10 rounded-2xl">
                    <h4 className="text-[10px] font-black text-retro-terracota uppercase tracking-widest border-b border-retro-terracota/5 pb-1 mb-2">
                      {formatDayName(day)}
                    </h4>
                    <div className="space-y-2">
                      {slots.map(slot => {
                        const dishId = dayObj[slot];
                        const dish = allDishes.find(d => d.id === dishId);
                        return dish ? (
                          <div key={slot} className="flex items-center gap-3">
                            <img
                              src={dish.imageUrl}
                              alt={dish.name}
                              className="w-8 h-8 object-cover rounded-lg border border-retro-terracota/10"
                              onError={(e) => { e.target.src = '/keto_salmon.webp'; }}
                            />
                            <div>
                              <div className="text-xs font-black text-retro-terracota leading-snug line-clamp-1">{dish.name}</div>
                              <div className="text-[9px] font-bold text-retro-terracota/50 uppercase tracking-wider mt-0.5">
                                {formatSlotName(slot)} • {dish.macros?.calories || 0} kcal
                              </div>
                            </div>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Delivery info summary inside verification modal */}
              <div className="p-4 bg-retro-crema/30 rounded-2xl border border-retro-terracota/10 text-xs text-retro-terracota font-bold space-y-2">
                <div className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-retro-terracota/60 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-[9px] font-black uppercase text-retro-terracota/50 block font-sans tracking-wide">Dirección de Envío</span>
                    <span>{user?.address?.street ? `${user.address.street}, ${user.address.colony}, ${user.address.municipality}` : 'Sin dirección'}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-retro-terracota/5 pt-2 text-[10.5px]">
                  <span>Cubiertos incluidos:</span>
                  <span className="font-black text-retro-terracota">{withCutlery ? 'Sí' : 'No'}</span>
                </div>
                <div className="flex items-center justify-between text-[10.5px]">
                  <span>Costo de envío estimado:</span>
                  <span className="font-black text-retro-terracota">${shippingCost.toFixed(2)} MXN</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-retro-terracota/10 flex items-center justify-end space-x-2 bg-stone-50">
              <button
                type="button"
                onClick={() => setShowVerifyModal(false)}
                className="px-4 py-2.5 bg-white border border-retro-terracota/10 hover:border-retro-terracota/30 text-retro-terracota font-bold text-xs rounded-xl transition-all"
              >
                Regresar y Modificar
              </button>
              <button
                type="button"
                disabled={isSyncing}
                onClick={async () => {
                  await saveSelection(true); // Save with isAccepted = true
                  setShowVerifyModal(false);
                }}
                className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-950 text-white font-extrabold text-xs rounded-xl transition-all shadow-md flex items-center space-x-1.5 disabled:opacity-50"
              >
                {isSyncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                <span>{isSyncing ? 'Guardando...' : 'Confirmar y Aceptar Orden'}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* DISH DETAILS MODAL */}
      {createPortal(
        <AnimatePresence>
          {selectedDishForModal && (
            <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative flex flex-col md:flex-row max-h-[90vh] md:max-h-[80vh] border border-retro-terracota/10"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedDishForModal(null)}
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-stone-100 flex items-center justify-center text-stone-500 shadow-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Left Column: Image */}
              <div className="md:w-1/2 h-64 md:h-auto relative bg-retro-crema/20">
                <img
                  src={selectedDishForModal.imageUrl}
                  alt={selectedDishForModal.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = '/keto_salmon.webp'; }}
                />
              </div>

              {/* Right Column: Information */}
              <div className="md:w-1/2 p-6 flex flex-col overflow-y-auto max-h-[50vh] md:max-h-none text-left">
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {getDishTags(selectedDishForModal).map((tag) => (
                    <span
                      key={tag}
                      className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full text-white ${
                        tag === 'Keto' ? 'bg-retro-terracota' : tag === 'Vegano' ? 'bg-retro-oliva' : 'bg-retro-mostaza'
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <h3 className="text-xl font-black text-retro-terracota leading-snug">
                  {selectedDishForModal.name}
                </h3>
                <p className="text-xs text-retro-terracota/80 mt-3 font-semibold leading-relaxed">
                  {selectedDishForModal.description}
                </p>

                {/* Macro Badges detailed grid */}
                <div className="mt-5 grid grid-cols-4 gap-2">
                  <div className="bg-retro-crema/30 border border-retro-terracota/10 rounded-2xl p-2 text-center">
                    <span className="text-[8px] font-black text-retro-terracota/50 uppercase block">Calorías</span>
                    <span className="text-xs font-black text-retro-terracota">{selectedDishForModal.macros?.calories || 0} kcal</span>
                  </div>
                  <div className="bg-retro-crema/30 border border-retro-terracota/10 rounded-2xl p-2 text-center">
                    <span className="text-[8px] font-black text-retro-terracota/50 uppercase block">Proteína</span>
                    <span className="text-xs font-black text-retro-terracota">{selectedDishForModal.macros?.protein || 0}g</span>
                  </div>
                  <div className="bg-retro-crema/30 border border-retro-terracota/10 rounded-2xl p-2 text-center">
                    <span className="text-[8px] font-black text-retro-terracota/50 uppercase block">Grasas</span>
                    <span className="text-xs font-black text-retro-terracota">{selectedDishForModal.macros?.fat || 0}g</span>
                  </div>
                  <div className="bg-retro-crema/30 border border-retro-terracota/10 rounded-2xl p-2 text-center">
                    <span className="text-[8px] font-black text-retro-terracota/50 uppercase block">Carbos</span>
                    <span className="text-xs font-black text-retro-terracota">{selectedDishForModal.macros?.carbs || 0}g</span>
                  </div>
                </div>

                {/* Simulated Portion breakdown */}
                <div className="mt-5 border-t border-retro-terracota/10 pt-4 flex-grow">
                  <h4 className="text-[10px] font-black text-retro-terracota uppercase tracking-wider mb-2">Porción del Platillo (Estimación)</h4>
                  <ul className="space-y-1.5 text-[11px] font-bold text-retro-terracota/70">
                    <li className="flex items-center justify-between">
                      <span>🥩 Fuente de Proteína principal:</span>
                      <span className="text-retro-terracota font-black">~150g</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>🌾 Carbohidratos complejos:</span>
                      <span className="text-retro-terracota font-black">~100g</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>🥗 Vegetales y guarnición:</span>
                      <span className="text-retro-terracota font-black">~80g</span>
                    </li>
                  </ul>
                </div>

                {/* Modal Actions */}
                <div className="mt-6 pt-4 border-t border-retro-terracota/10">
                  {!user ? (
                    <button
                      onClick={() => {
                        setSelectedDishForModal(null);
                        setShowAuthModal(true);
                      }}
                      className="w-full bg-retro-mostaza hover:bg-retro-mostaza/90 text-white font-extrabold py-3 px-4 rounded-xl text-xs uppercase tracking-wider shadow-md text-center"
                    >
                      Iniciar sesión para ordenar
                    </button>
                  ) : !plan ? (
                    <button
                      onClick={() => {
                        setSelectedDishForModal(null);
                        const el = document.getElementById('pricing');
                        if (el) {
                          const offset = 80;
                          const top = el.getBoundingClientRect().top + window.scrollY - offset;
                          window.scrollTo({ top, behavior: 'smooth' });
                        }
                      }}
                      className="w-full bg-retro-terracota hover:bg-retro-terracota/90 text-white font-extrabold py-3 px-4 rounded-xl text-xs uppercase tracking-wider shadow-md text-center"
                    >
                      Ver planes de suscripción
                    </button>
                  ) : isSelectionOpen ? (
                    isAccepted ? (
                      selectedDays[activeDay]?.[activeSlot] === selectedDishForModal.id ? (
                        <div className="text-center py-2.5 text-xs font-black text-emerald-700 uppercase tracking-widest border border-dashed border-emerald-300 bg-emerald-50/50 rounded-xl font-sans flex items-center justify-center space-x-1.5">
                          <CheckCircle className="w-4 h-4" />
                          <span>Platillo Elegido y Confirmado</span>
                        </div>
                      ) : (
                        <div className="text-center py-2.5 text-xs font-black text-retro-terracota/50 uppercase tracking-widest border border-dashed border-retro-terracota/20 rounded-xl font-sans">
                          Selección Confirmada
                        </div>
                      )
                    ) : selectedDays[activeDay]?.[activeSlot] === selectedDishForModal.id ? (
                      <button
                        onClick={() => {
                          removeDishFromSlot(activeDay, activeSlot);
                          setSelectedDishForModal(null);
                        }}
                        className="w-full bg-red-50 hover:bg-red-100 border border-red-200 text-red-650 font-extrabold py-3 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center space-x-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Quitar de {formatDayName(activeDay)} ({formatSlotName(activeSlot)})</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          const success = handleAssignDish(selectedDishForModal.id);
                          if (success) setSelectedDishForModal(null);
                        }}
                        className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold py-3 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-md shadow-emerald-800/10"
                      >
                        <Plus className="w-4 h-4 stroke-[3]" />
                        <span>
                          {selectedDays[activeDay]?.[activeSlot] ? 'Reemplazar en' : 'Elegir para'} {formatDayName(activeDay)} ({formatSlotName(activeSlot)})
                        </span>
                      </button>
                    )
                  ) : (
                    <div className="text-center py-2 text-xs font-black text-retro-terracota/50 uppercase tracking-widest border border-dashed border-retro-terracota/20 rounded-xl font-sans">
                      Periodo de Selección Cerrado
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>,
      document.body
      )}


      </div>
      </section>
    </RequirePaymentGate>
  );
}
