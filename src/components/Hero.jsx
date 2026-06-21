import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Clock, Utensils, ChevronRight, CheckCircle } from 'lucide-react';

export default function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 20 }
    }
  };

  const floatVariants = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 4.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const handleScrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section id="inicio" className="relative min-h-screen pt-28 pb-16 flex items-center overflow-hidden bg-gradient-to-b from-retro-crema via-white to-retro-crema/40 text-left">
      {/* Decorative Blur Spheres (Terracota and Mostaza colors) */}
      <div className="absolute top-20 left-[-10%] w-[35rem] h-[35rem] bg-retro-terracota/5 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute bottom-10 right-[-10%] w-[30rem] h-[30rem] bg-retro-mostaza/5 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Text Content Column */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-7 flex flex-col justify-center space-y-6"
          >
            {/* Top Tagline */}
            <motion.div 
              variants={itemVariants}
              className="inline-flex items-center space-x-2 bg-retro-terracota/5 text-retro-terracota px-4 py-1.5 rounded-full w-fit border border-retro-terracota/10"
            >
              <Sparkles className="w-4 h-4 text-retro-mostaza animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider">Servicio premium en Guadalajara</span>
            </motion.div>

            {/* Headline */}
            <motion.h1 
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-retro-terracota leading-[1.08] tracking-tight font-sans"
            >
              Come sano, <br />
              <span className="bg-gradient-to-r from-retro-terracota to-retro-mostaza bg-clip-text text-transparent">sin complicaciones.</span> <br />
              Entregado en tu puerta.
            </motion.h1>

            {/* Description */}
            <motion.p 
              variants={itemVariants}
              className="text-retro-terracota/80 text-base sm:text-lg font-bold leading-relaxed max-w-xl"
            >
              Planes de alimentación balanceados y frescos creados por chefs y nutriólogos. Preparados con ingredientes locales y entregados diariamente listos para comer.
            </motion.p>

            {/* Call to Actions */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 pt-2"
            >
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(176, 90, 50, 0.25)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleScrollTo('pricing')}
                className="bg-retro-terracota text-white font-extrabold px-8 py-3.5 rounded-full flex items-center justify-center space-x-2 shadow-lg shadow-retro-terracota/15 text-sm tracking-wide transition-all border border-retro-terracota"
              >
                <span>Ver Planes de Comida</span>
                <ChevronRight className="w-4 h-4 stroke-[3]" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 1)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleScrollTo('catalogo')}
                className="bg-white/80 border border-retro-terracota/20 text-retro-terracota font-extrabold px-8 py-3.5 rounded-full flex items-center justify-center shadow-md shadow-retro-terracota/5 text-sm tracking-wide transition-all hover:bg-white"
              >
                <span>Ver Menú Semanal</span>
              </motion.button>
            </motion.div>

            {/* Value Propositions list */}
            <motion.div 
              variants={itemVariants}
              className="grid grid-cols-3 gap-4 pt-6 border-t border-retro-terracota/10"
            >
              <div className="flex flex-col space-y-1">
                <span className="flex items-center text-retro-terracota font-bold text-xs">
                  <CheckCircle className="w-4 h-4 mr-1.5 flex-shrink-0 text-retro-mostaza stroke-[2.5]" /> Recetas Frescas
                </span>
                <span className="text-[10px] text-retro-terracota/70 font-semibold">100% naturales, sin conservadores</span>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="flex items-center text-retro-terracota font-bold text-xs">
                  <CheckCircle className="w-4 h-4 mr-1.5 flex-shrink-0 text-retro-mostaza stroke-[2.5]" /> Nutriólogo Aprobado
                </span>
                <span className="text-[10px] text-retro-terracota/70 font-semibold">Macronutrientes controlados</span>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="flex items-center text-retro-terracota font-bold text-xs">
                  <CheckCircle className="w-4 h-4 mr-1.5 flex-shrink-0 text-retro-mostaza stroke-[2.5]" /> Entrega Flexible
                </span>
                <span className="text-[10px] text-retro-terracota/70 font-semibold">En tu casa u oficina</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Graphical Mockup Column */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 60 }}
            className="lg:col-span-5 relative flex items-center justify-center"
          >
            {/* Glowing Backdrop */}
            <div className="absolute w-[80%] h-[80%] bg-gradient-to-tr from-retro-terracota/10 to-retro-mostaza/5 rounded-full filter blur-2xl z-0" />

            {/* Food Ring Decor */}
            <div className="absolute w-[110%] h-[110%] border border-dashed border-retro-terracota/20 rounded-full animate-[spin_60s_linear_infinite] z-0 pointer-events-none hidden sm:block" />

            {/* Main Image Plate */}
            <motion.div 
              variants={floatVariants}
              animate="animate"
              className="relative z-10"
            >
              <img 
                src="/hero_food.webp" 
                alt="Platillo Gourmet Ensalada" 
                fetchPriority="high"
                className="w-72 sm:w-96 md:w-[28rem] h-auto object-contain rounded-full shadow-2xl shadow-retro-terracota/10 border-8 border-white"
              />

              {/* Floating Badge 1 */}
              <motion.div 
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-10 -left-6 glass-card p-4 rounded-2xl flex items-center space-x-3 shadow-xl max-w-[170px]"
              >
                <div className="w-9 h-9 rounded-xl bg-retro-crema flex items-center justify-center text-retro-terracota border border-retro-terracota/10">
                  <Utensils className="w-4.5 h-4.5 stroke-[2.5]" />
                </div>
                <div className="text-left">
                  <h4 className="text-[11px] font-black text-retro-terracota">Menú Balanceado</h4>
                  <p className="text-[9px] text-retro-terracota/70 font-bold leading-none mt-0.5">Nutrientes calculados al gramo.</p>
                </div>
              </motion.div>

              {/* Floating Badge 2 */}
              <motion.div 
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-10 -right-6 glass-card p-4 rounded-2xl flex items-center space-x-3 shadow-xl max-w-[170px]"
              >
                <div className="w-9 h-9 rounded-xl bg-retro-terracota flex items-center justify-center text-white">
                  <Clock className="w-4.5 h-4.5 stroke-[2.5]" />
                </div>
                <div className="text-left">
                  <h4 className="text-[11px] font-black text-retro-terracota">Cocina al Día</h4>
                  <p className="text-[9px] text-retro-terracota/70 font-bold leading-none mt-0.5">Ingredientes frescos y locales.</p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
