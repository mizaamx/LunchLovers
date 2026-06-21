import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageCircle, Leaf } from 'lucide-react';
import Logo from './Logo';

const Instagram = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const Facebook = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const TikTok = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
  </svg>
);

export default function Contact() {
  const [formState, setFormState] = useState({ name: '', email: '', subject: 'General', message: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formState.name && formState.email && formState.message) {
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setFormState({ name: '', email: '', subject: 'General', message: '' });
      }, 4000);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
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
    <section id="contacto" className="bg-white pt-24 pb-12 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute bottom-0 left-[-10%] w-[35rem] h-[35rem] bg-retro-crema/40 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start mb-20">
          
          {/* Info Column */}
          <div className="lg:col-span-5 text-left space-y-8">
            <div>
              <span className="text-retro-terracota font-bold text-xs uppercase tracking-wider bg-retro-crema px-3 py-1 rounded-full border border-retro-terracota/10">
                Contacto Directo
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-retro-terracota mt-4 tracking-tight font-sans">
                ¿Listo para transformar <br />tu alimentación?
              </h2>
              <p className="text-retro-terracota/80 text-base mt-4 font-bold leading-relaxed">
                Únete a cientos de tapatíos que ya comen sano y sin complicaciones. Si tienes dudas sobre los planes de entrega, requieres asesoría corporativa para tu oficina o menús personalizados por alérgenos, envíanos un mensaje y te responderemos en minutos.
              </p>
            </div>

            {/* Details list */}
            <div className="space-y-6 pt-4">
              <div className="flex items-start space-x-4">
                <div className="w-11 h-11 rounded-xl bg-retro-crema border border-retro-terracota/10 flex items-center justify-center text-retro-terracota flex-shrink-0 shadow-md">
                  <Phone className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-retro-terracota">Teléfono / WhatsApp de atención</h4>
                  <p className="text-retro-terracota/70 text-xs font-bold mt-1">+52 (33) 2255-7804</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-11 h-11 rounded-xl bg-retro-crema border border-retro-terracota/10 flex items-center justify-center text-retro-terracota flex-shrink-0 shadow-md">
                  <Mail className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-retro-terracota">Correo de soporte</h4>
                  <p className="text-retro-terracota/70 text-xs font-bold mt-1">soporte@lunchlovers.com</p>
                </div>
              </div>
            </div>

            {/* Social channels */}
            <div className="pt-6 border-t border-retro-terracota/10">
              <h4 className="text-xs font-black text-retro-terracota/50 uppercase tracking-widest mb-3">Conecta en redes</h4>
              <div className="flex items-center space-x-3">
                <a href="https://www.instagram.com/lunch.loversgdl?fbclid=IwZXh0bgNhZW0CMTAAYnJpZBExdEJnMU1GdEJJUUhOTkVrb3NydGMGYXBwX2lkEDIyMjAzOTE3ODgyMDA4OTIAAR7T20O4i9IGdndw7BgSFha6pYZKmvqFsDvCZYZ546NRI9uCYgMePr7ZWhZ2lw_aem_oeLAHp1KpFijilQpzanBtQ&h=AUCCkZpUyDe8g9xdTA36qb_7iqwa-0SAtDxnd0kTlgRkQ2_UW9MwCMDXwMd2kAut0Z6e6Xst4Qks-vx1sSxy3bQe_8uCNTeBNAjs1g-sF5C3cUSUsa5V-EDb3oYbtkfwTpdudDpuu8jvXO9SJEQ9" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-10 h-10 rounded-full bg-retro-crema text-retro-terracota hover:bg-retro-terracota hover:text-white flex items-center justify-center transition-all shadow-md border border-retro-terracota/10">
                  <Instagram className="w-4.5 h-4.5" />
                </a>
                <a href="#" aria-label="TikTok" className="w-10 h-10 rounded-full bg-retro-crema text-retro-terracota hover:bg-retro-terracota hover:text-white flex items-center justify-center transition-all shadow-md border border-retro-terracota/10">
                  <TikTok className="w-4.5 h-4.5" />
                </a>
                <a href="https://www.facebook.com/profile.php?id=61577078408315&locale=es_LA" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-10 h-10 rounded-full bg-retro-crema text-retro-terracota hover:bg-retro-terracota hover:text-white flex items-center justify-center transition-all shadow-md border border-retro-terracota/10">
                  <Facebook className="w-4.5 h-4.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Form Column */}
          <div className="lg:col-span-7">
            <div className="glass-card p-8 rounded-3xl relative overflow-hidden bg-white/70">
              <AnimatePresence mode="wait">
                {!isSubmitted ? (
                  <motion.form
                    key="contact-form"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-6 text-left"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-retro-terracota uppercase tracking-wider mb-2">Nombre Completo</label>
                        <input
                          type="text"
                          name="name"
                          required
                          value={formState.name}
                          onChange={handleChange}
                          placeholder="Juan Pérez"
                          className="w-full px-4 py-3 rounded-xl border border-retro-terracota/20 focus:outline-none focus:ring-2 focus:ring-retro-terracota/20 focus:border-retro-terracota text-retro-terracota placeholder-retro-terracota/40 text-xs font-bold bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-retro-terracota uppercase tracking-wider mb-2">Correo Electrónico</label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formState.email}
                          onChange={handleChange}
                          placeholder="juan@ejemplo.com"
                          className="w-full px-4 py-3 rounded-xl border border-retro-terracota/20 focus:outline-none focus:ring-2 focus:ring-retro-terracota/20 focus:border-retro-terracota text-retro-terracota placeholder-retro-terracota/40 text-xs font-bold bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-retro-terracota uppercase tracking-wider mb-2">¿Cómo podemos ayudarte?</label>
                      <select
                        name="subject"
                        value={formState.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-retro-terracota/20 focus:outline-none focus:ring-2 focus:ring-retro-terracota/20 focus:border-retro-terracota text-retro-terracota text-xs font-bold bg-white"
                      >
                        <option value="General">Tengo una duda general</option>
                        <option value="Planes">Quiero asesoría para elegir mi plan</option>
                        <option value="Corporativo">Quiero cotizar comida para mi oficina</option>
                        <option value="Alergias">Requiero un menú especial por alérgenos</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-retro-terracota uppercase tracking-wider mb-2">Mensaje</label>
                      <textarea
                        name="message"
                        required
                        rows="4"
                        value={formState.message}
                        onChange={handleChange}
                        placeholder="Escribe tus requerimientos detallados aquí..."
                        className="w-full px-4 py-3 rounded-xl border border-retro-terracota/20 focus:outline-none focus:ring-2 focus:ring-retro-terracota/20 focus:border-retro-terracota text-retro-terracota placeholder-retro-terracota/40 text-xs font-bold bg-white resize-none"
                      />
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      type="submit"
                      className="w-full bg-retro-terracota hover:bg-retro-terracota/95 text-white font-extrabold py-3.5 px-6 rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-retro-terracota/10 transition-all text-xs uppercase tracking-wider border border-retro-terracota"
                    >
                      <Send className="w-4 h-4" />
                      <span>Enviar Mensaje y Agendar Asesoría</span>
                    </motion.button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="success-message"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-16 text-center flex flex-col items-center justify-center space-y-4"
                  >
                    <div className="w-14 h-14 rounded-full bg-retro-crema text-retro-terracota flex items-center justify-center shadow-inner">
                      <Leaf className="w-6 h-6 fill-current text-retro-terracota" />
                    </div>
                    <h3 className="text-xl font-black text-retro-terracota font-sans">¡Mensaje Recibido!</h3>
                    <p className="text-retro-terracota/70 text-xs font-bold max-w-sm">
                      Gracias, {formState.name}. Tu solicitud de asesoría ha sido registrada. Uno de nuestros nutriólogos te contactará muy pronto.
                    </p>
                    <span className="text-[10px] text-retro-terracota/40 animate-pulse font-bold">Restableciendo formulario...</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>

        {/* Footer Area */}
        <div className="border-t border-retro-terracota/10 pt-16 mt-8 flex flex-col md:flex-row items-center justify-between text-left gap-6">
          
          {/* Logo Brand SVG */}
          <div className="flex items-center space-x-2 mb-2 md:mb-0 cursor-pointer" onClick={() => handleScrollTo('inicio')}>
            <Logo className="h-14 w-auto" />
          </div>

          {/* Links navigation */}
          <div className="flex flex-wrap justify-center gap-6 mb-2 md:mb-0 text-xs font-extrabold text-retro-terracota/70">
            <button onClick={() => handleScrollTo('inicio')} className="hover:text-retro-terracota transition-colors">Inicio</button>
            <button onClick={() => handleScrollTo('como-funciona')} className="hover:text-retro-terracota transition-colors">Cómo funciona</button>
            <button onClick={() => handleScrollTo('catalogo')} className="hover:text-retro-terracota transition-colors">Menú</button>
            <button onClick={() => handleScrollTo('pricing')} className="hover:text-retro-terracota transition-colors">Planes</button>
            <button onClick={() => handleScrollTo('testimonios')} className="hover:text-retro-terracota transition-colors">Testimonios</button>
            <button onClick={() => handleScrollTo('contacto')} className="hover:text-retro-terracota transition-colors">Contacto</button>
          </div>

          {/* Copyright details */}
          <div className="text-[11px] font-bold text-retro-terracota/50 text-center md:text-right space-y-0.5">
            <p>© {new Date().getFullYear()} Lunch Lovers GDL. Todos los derechos reservados.</p>
            <p>Hecho con amor y salud en Guadalajara, Jalisco.</p>
          </div>

        </div>

      </div>
    </section>
  );
}
