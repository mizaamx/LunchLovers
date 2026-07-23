import React from 'react';
import { Heart, Mail, Phone, MapPin, ShieldCheck, Clock, Sparkles, Globe } from 'lucide-react';
import Logo from './Logo';

export default function Footer({ setActiveSection, currentPage, setCurrentPage }) {
  return (
    <footer className="bg-retro-terracota text-retro-crema relative overflow-hidden border-t-4 border-retro-mostaza/30 pt-16 pb-12 font-sans">
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-retro-mostaza/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-retro-crema/5 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-retro-crema/15">
          
          {/* Columna 1: Brand & Logo */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Logo className="h-10 text-retro-crema" />
              <span className="text-xl font-black tracking-tight text-retro-crema">LunchLovers</span>
            </div>
            <p className="text-xs text-retro-crema/80 font-medium leading-relaxed">
              Alimentación saludable, deliciosa y sin complicaciones. Tu menú semanal diseñado por nutriólogos y preparado con ingredientes locales de primera calidad.
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noreferrer" 
                aria-label="Instagram"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-retro-mostaza hover:text-retro-terracota transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noreferrer" 
                aria-label="Facebook"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-retro-mostaza hover:text-retro-terracota transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.592 0 9 1.592 9 4.415V8z"/>
                </svg>
              </a>
              <a 
                href="mailto:contacto@lunchloversgdl.com" 
                aria-label="Email"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-retro-mostaza hover:text-retro-terracota transition-colors"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Columna 2: Navegación Rápida */}
          <div>
            <h4 className="text-sm font-extrabold uppercase tracking-wider text-retro-mostaza mb-4">Navegación</h4>
            <ul className="space-y-2.5 text-xs font-semibold">
              <li>
                <button 
                  onClick={() => setActiveSection?.('inicio')}
                  className="hover:text-retro-mostaza transition-colors flex items-center space-x-1.5"
                >
                  <span>›</span>
                  <span>Inicio</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveSection?.('catalogo')}
                  className="hover:text-retro-mostaza transition-colors flex items-center space-x-1.5"
                >
                  <span>›</span>
                  <span>Menú Semanal</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveSection?.('pricing')}
                  className="hover:text-retro-mostaza transition-colors flex items-center space-x-1.5"
                >
                  <span>›</span>
                  <span>Planes y Suscripciones</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Columna 3: Horarios y Entregas */}
          <div>
            <h4 className="text-sm font-extrabold uppercase tracking-wider text-retro-mostaza mb-4">Entregas y Cobertura</h4>
            <ul className="space-y-2.5 text-xs text-retro-crema/80 font-medium">
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-retro-mostaza flex-shrink-0 mt-0.5" />
                <span>Zona Metropolitana de Guadalajara (GDL, Zapopan, Tlaquepaque, Tlajomulco)</span>
              </li>
              <li className="flex items-start space-x-2">
                <Clock className="w-4 h-4 text-retro-mostaza flex-shrink-0 mt-0.5" />
                <span>Entregas de Lunes a Viernes de 7:00 am a 11:00 am</span>
              </li>
              <li className="flex items-start space-x-2">
                <ShieldCheck className="w-4 h-4 text-retro-mostaza flex-shrink-0 mt-0.5" />
                <span>Envasado al vacío y grado alimenticio</span>
              </li>
            </ul>
          </div>

          {/* Columna 4: Garantía y Atencion */}
          <div>
            <h4 className="text-sm font-extrabold uppercase tracking-wider text-retro-mostaza mb-4">Atención a Clientes</h4>
            <p className="text-xs text-retro-crema/80 font-medium mb-3">
              ¿Tienes dudas con tu pedido o necesitas un ajuste personalizado en tu plan?
            </p>
            <div className="bg-white/10 p-3.5 rounded-2xl border border-white/10 text-xs">
              <p className="font-extrabold text-retro-crema flex items-center space-x-1.5">
                <Phone className="w-3.5 h-3.5 text-retro-mostaza" />
                <span>Soporte vía WhatsApp</span>
              </p>
              <p className="text-[11px] text-retro-crema/70 mt-1">Respuesta inmediata en horario laboral.</p>
            </div>
          </div>

        </div>

        {/* Subfooter: Copyright & Avisos */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-retro-crema/60 font-medium space-y-4 sm:space-y-0">
          <p>© {new Date().getFullYear()} LunchLovers GDL. Todos los derechos reservados.</p>
          <div className="flex items-center space-x-6">
            <span className="hover:text-retro-crema transition-colors cursor-pointer">Aviso de Privacidad</span>
            <span className="hover:text-retro-crema transition-colors cursor-pointer">Términos y Condiciones</span>
            <span className="flex items-center space-x-1">
              <span>Hecho con</span>
              <Heart className="w-3 h-3 text-red-400 fill-current" />
              <span>en GDL</span>
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
