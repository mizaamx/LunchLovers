import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

export default function Testimonials() {
  const reviews = [
    {
      name: 'Sofía Rodríguez',
      location: 'Zapopan, Jal.',
      plan: 'Plan Normal',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', // Fallback placeholder if unsplash handles it, else clean layout handles it
      quote: 'Siempre batallaba con la preparación de comidas para la oficina y terminaba comiendo chatarra. Con Lunch Lovers como súper sano, me siento con más energía y ahorro como 6 horas de cocina a la semana. ¡El sabor es espectacular!',
      rating: 5,
    },
    {
      name: 'Carlos Mendoza',
      location: 'Col. Providencia, GDL',
      plan: 'Plan Pro Deportivo',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      quote: 'Como atleta, controlar mis macronutrientes es vital. El Plan Pro Deportivo ha sido clave en mi etapa de volumen y definición. Los niveles de proteína son reales y el sazón es excelente. Nada que ver con comida de dieta insípida.',
      rating: 5,
    },
    {
      name: 'Regina Limón',
      location: 'Col. Americana, GDL',
      plan: 'Plan Básico (Vegano)',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
      quote: 'Llevo 3 meses con el plan vegano y me encanta la flexibilidad. Me preocupaba que las opciones fueran repetitivas, pero los platillos como el Buddha Bowl son deliciosos. Los empaques compostables son un súper plus.',
      rating: 5,
    },
  ];

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 30 },
    visible: (i) => ({
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        delay: i * 0.15,
        type: "spring",
        stiffness: 80,
        damping: 15,
      },
    }),
  };

  return (
    <section id="testimonios" className="py-24 bg-retro-crema/25 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute bottom-10 left-[-10%] w-[35rem] h-[35rem] bg-retro-terracota/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-retro-terracota font-bold text-xs uppercase tracking-wider bg-retro-crema px-3 py-1 rounded-full border border-retro-terracota/10">
            Prueba Social
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-retro-terracota mt-4 tracking-tight font-sans">
            Lo que dicen nuestros Lunch Lovers
          </h2>
          <p className="text-retro-terracota/70 text-base mt-4 font-semibold">
            Más de 500 personas en la Zona Metropolitana de Guadalajara ya están transformando su relación con la comida gracias a nuestro servicio.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {reviews.map((review, i) => (
            <motion.div
              key={review.name}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={cardVariants}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="glass-card p-8 rounded-3xl border border-white text-left flex flex-col justify-between shadow-sm"
            >
              <div>
                {/* Rating Stars & Quote Icon */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-1">
                    {[...Array(review.rating)].map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-8 h-8 text-retro-terracota/10 fill-current" />
                </div>

                {/* Quote Text */}
                <p className="text-retro-terracota/80 text-sm leading-relaxed italic mb-6">
                  "{review.quote}"
                </p>
              </div>

              {/* Customer Profile info */}
              <div className="flex items-center pt-4 border-t border-retro-terracota/15">
                {/* Profile Initial fallback bubble to prevent Unsplash load delays in layouts */}
                <div className="w-12 h-12 rounded-full bg-retro-crema border border-white text-retro-terracota font-extrabold flex items-center justify-center shadow-inner flex-shrink-0">
                  {review.name.charAt(0)}
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-bold text-retro-terracota">{review.name}</h4>
                  <p className="text-[10px] text-retro-terracota/50 font-semibold">{review.location}</p>
                  <span className="inline-block text-[9px] font-extrabold text-retro-terracota bg-retro-crema border border-retro-terracota/10 px-2 py-0.5 rounded-full mt-1 uppercase tracking-wider">
                    {review.plan}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
