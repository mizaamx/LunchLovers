import React from 'react';
import { motion } from 'framer-motion';
import { MousePointerClick, CreditCard, Truck, ArrowRight } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Eligé tus platillos y plan de comida',
      description: 'Explora nuestro catálogo de platillos frescos y selecciona la suscripción que mejor se adapte a tu ritmo semanal o mensual.',
      icon: MousePointerClick,
      color: 'bg-retro-crema text-retro-terracota border border-retro-terracota/20',
    },
    {
      number: '02',
      title: 'Pagar el plan de promoción',
      description: 'Realiza tu pago seguro de forma semanal o mensual y asegura tus comidas para el siguiente ciclo. Cancela o pausa cuando quieras.',
      icon: CreditCard,
      color: 'bg-retro-crema/60 text-retro-terracota border border-retro-terracota/20',
    },
    {
      number: '03',
      title: 'Recibe tus platillos...',
      description: 'Entregamos tus alimentos recién preparados en empaques biodegradables directamente en tu hogar u oficina en Guadalajara.',
      icon: Truck,
      color: 'bg-retro-terracota text-white shadow-lg shadow-retro-terracota/10',
    },
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 35 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.15,
        type: "spring",
        stiffness: 90,
        damping: 18,
      },
    }),
  };

  return (
    <section id="como-funciona" className="py-24 bg-white relative overflow-hidden text-center">
      {/* Background Decor */}
      <div className="absolute top-10 right-[-10%] w-[30rem] h-[30rem] bg-retro-terracota/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto mb-16">
          <span className="text-retro-terracota font-bold text-xs uppercase tracking-wider bg-retro-crema px-3 py-1 rounded-full border border-retro-terracota/10">
            Fácil y Rápido
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-retro-terracota mt-4 tracking-tight font-sans">
            ¿Cómo funciona Lunch Lovers?
          </h2>
          <p className="text-retro-terracota/70 text-base mt-3 font-semibold max-w-xl mx-auto">
            Olvídate de hacer el súper, cocinar y contar calorías. Hacemos que comer saludable sea la parte más sencilla de tu día en Guadalajara.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 max-w-5xl mx-auto relative">
          
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="relative flex flex-col items-center">
                {/* Connecting arrow (desktop only) */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-12 left-[75%] w-[40%] z-0 pointer-events-none">
                    <div className="flex items-center justify-center space-x-1">
                      <div className="h-0.5 w-full bg-retro-terracota/10 border-t border-dashed border-retro-terracota/20" />
                      <ArrowRight className="w-4 h-4 text-retro-terracota/30 flex-shrink-0 stroke-[2.5]" />
                    </div>
                  </div>
                )}

                <motion.div
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-80px" }}
                  variants={cardVariants}
                  className="glass-card p-8 rounded-3xl w-full flex flex-col items-center text-center z-10"
                >
                  {/* Step Icon Container */}
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 relative ${step.color}`}>
                    <Icon className="w-7 h-7 stroke-[2]" />
                    <span className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-retro-terracota text-white font-extrabold text-[10px] flex items-center justify-center border-2 border-white shadow-md">
                      {step.number}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-black text-retro-terracota mb-3 font-sans leading-tight">
                    {step.title}
                  </h3>
                  <p className="text-retro-terracota/75 text-xs font-bold leading-relaxed max-w-xs">
                    {step.description}
                  </p>
                </motion.div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
