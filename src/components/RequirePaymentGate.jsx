import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, CreditCard, Copy, Check, ExternalLink, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RequirePaymentGate({ children }) {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  // If visitor is not authenticated, let them see the catalog (public demo mode)
  if (!user) {
    return children;
  }

  // If user is admin, allow access always
  if (user.isAdmin) {
    return children;
  }

  const [showModal, setShowModal] = useState(false);

  // If user payment is pending, show warning banner but DO NOT block rendering children
  if (user.paymentStatus === 'pending') {
    const handleCopyClabe = () => {
      navigator.clipboard.writeText('5579100476535206');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    const plansInfo = {
      cal800_1: { name: 'Plan Hearty Lovers (1 Comida)', price: '$800.00 MXN / sem' },
      cal800_2: { name: 'Plan Hearty Lovers (2 Comidas)', price: '$1,350.00 MXN / sem' },
      cal800_3: { name: 'Plan Hearty Lovers (3 Comidas)', price: '$1,800.00 MXN / sem' },
      cal600_1: { name: 'Plan Light Lovers (1 Comida)', price: '$650.00 MXN / sem' },
      cal600_2: { name: 'Plan Light Lovers (2 Comidas)', price: '$1,250.00 MXN / sem' },
      cal600_3: { name: 'Plan Light Lovers (3 Comidas)', price: '$1,700.00 MXN / sem' },
      godinez: { name: 'Paquete Godínez', price: '$750.00 MXN / sem' },
      comida_diaria: { name: 'Comida Diaria (Flexible)', price: '$125.00 MXN / comida' },
      basic: { name: 'Plan Básico', price: '$29.00 MXN / mes' },
      normal: { name: 'Plan Normal', price: '$99.00 MXN / mes' },
      pro: { name: 'Plan Pro', price: '$99.00 MXN / mes' }
    };

    const planDetails = plansInfo[user.plan] || { name: 'Plan Seleccionado', price: 'Pendiente de calcular' };

    return (
      <div className="relative w-full flex flex-col min-h-screen">
        {/* Warning Banner */}
        <div className="w-full bg-amber-500 text-slate-950 font-black text-xs py-3 px-4 text-center flex flex-col sm:flex-row items-center justify-center gap-2 border-b border-amber-600 shadow-md z-[40] sticky top-[72px]">
          <span className="flex items-center space-x-1.5">
            <ShieldAlert className="w-4 h-4 text-slate-950 flex-shrink-0 animate-pulse" />
            <span>Tu suscripción está pendiente de pago. Puedes pre-seleccionar tus platillos, pero no podrás confirmar tu pedido hasta que tu pago sea aprobado.</span>
          </span>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-[10px] uppercase tracking-wider px-3.5 py-1.5 rounded-xl transition-all shadow-md flex items-center space-x-1"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Ver Datos de Pago</span>
          </button>
        </div>

        {/* Children Render */}
        <div className="flex-grow">
          {children}
        </div>

        {/* Bank Transfer Modal */}
        {showModal && (
          <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-xl w-full bg-white rounded-3xl border-2 border-retro-terracota/15 shadow-[0_20px_50px_rgba(176,90,50,0.08)] overflow-hidden text-left p-6 sm:p-8 relative"
            >
              {/* Close button */}
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-105 hover:bg-stone-200 flex items-center justify-center text-stone-500 transition-colors border border-stone-200"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Header Banner */}
              <div className="flex items-center space-x-3.5 pb-4 border-b border-retro-terracota/10 mb-6">
                <div className="w-11 h-11 rounded-2xl bg-retro-terracota/10 text-retro-terracota flex items-center justify-center flex-shrink-0">
                  <ShieldAlert className="w-6 h-6 stroke-[2.2] text-retro-terracota" />
                </div>
                <div>
                  <h3 className="text-base font-black text-retro-terracota uppercase tracking-wide">Acceso de Pago</h3>
                  <p className="text-[10px] font-black text-retro-mostaza uppercase tracking-widest mt-0.5">Control de Pago de Usuario</p>
                </div>
              </div>

              {/* User Details & Warning */}
              <div className="space-y-5">
                <div className="p-5 bg-retro-crema/45 rounded-2xl border border-retro-terracota/10">
                  <p className="text-xs font-bold text-retro-terracota/80 leading-relaxed">
                    ¡Hola, <span className="font-black text-retro-terracota">{user.name}</span>! Para activar tu calendario y poder confirmar la selección de tus alimentos, es necesario que verifiquemos tu pago.
                  </p>
                  <div className="mt-3.5 flex items-center space-x-2 text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200 px-3.5 py-2 rounded-xl w-fit">
                    <CreditCard className="w-4 h-4 text-amber-700" />
                    <span>Estatus actual: Pago Pendiente</span>
                  </div>
                </div>

                {/* Bank Transfer Details */}
                <div>
                  <h4 className="text-[10px] font-black text-retro-terracota/70 uppercase tracking-widest mb-3">Datos para Transferencia</h4>
                  <div className="bg-stone-50 border border-retro-terracota/10 rounded-2xl p-5 space-y-3.5 text-xs font-bold text-retro-terracota/80">
                    <div className="flex justify-between border-b border-stone-200/60 pb-2">
                      <span className="text-retro-terracota/60">Banco:</span>
                      <span className="text-retro-terracota font-black">SANTANDER</span>
                    </div>
                    <div className="flex justify-between border-b border-stone-200/60 pb-2">
                      <span className="text-retro-terracota/60">Beneficiario:</span>
                      <span className="text-retro-terracota font-black">Susana Ruiz Cazares</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-stone-200/60 pb-2">
                      <span className="text-retro-terracota/60">CLABE Interbancaria:</span>
                      <div className="flex items-center space-x-1.5 bg-white px-2.5 py-1 rounded-lg border border-retro-terracota/5">
                        <span className="text-retro-terracota font-black select-all tracking-wide">5579100476535206</span>
                        <button
                          type="button"
                          onClick={handleCopyClabe}
                          className="p-1 hover:bg-stone-100 rounded transition-colors text-retro-terracota/60"
                          title="Copiar CLABE"
                        >
                          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-retro-terracota/60">Monto del Plan ({planDetails.name}):</span>
                      <span className="text-retro-terracota font-black text-sm">
                        {planDetails.price}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Next Action Steps */}
                <div className="p-5 bg-retro-crema/10 border border-dashed border-retro-terracota/20 rounded-2xl space-y-2">
                  <h5 className="text-[10px] font-black text-retro-terracota uppercase tracking-wider">¿Cómo activar tu cuenta?</h5>
                  <p className="text-[11px] font-semibold text-retro-terracota/70 leading-relaxed">
                    Una vez realizada la transferencia, envía tu comprobante por WhatsApp o al correo <a href="mailto:soporte@lunchlovers.com" className="underline font-black text-retro-terracota hover:text-retro-terracota/90">soporte@lunchlovers.com</a> especificando tu correo registrado. 
                  </p>
                  <div className="pt-2">
                    <a
                      href="https://wa.me/523322557804?text=Hola,%20adjunto%20comprobante%20de%20pago%20para%20activar%20mi%20cuenta"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 bg-retro-terracota hover:bg-retro-terracota/90 text-white font-extrabold text-[10px] uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all shadow-md shadow-retro-terracota/10"
                    >
                      <span>Enviar Comprobante por WhatsApp</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    );
  }

  // If user has paymentStatus === 'paid', render regular catalog/selections
  return children;
}
