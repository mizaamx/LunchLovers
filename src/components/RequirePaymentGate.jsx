import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, CreditCard, Copy, Check, ExternalLink } from 'lucide-react';
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

  // If user payment is pending, completely unmount children and show payment required gate
  if (user.paymentStatus === 'pending') {
    const handleCopyClabe = () => {
      navigator.clipboard.writeText('123456789012345678');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <div className="w-full py-16 px-4 bg-retro-crema/20 flex justify-center items-center font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          className="max-w-xl w-full bg-white rounded-3xl border-2 border-retro-terracota/15 shadow-[0_20px_50px_rgba(176,90,50,0.08)] overflow-hidden text-left p-6 sm:p-8"
        >
          
          {/* Header Banner */}
          <div className="flex items-center space-x-3.5 pb-4 border-b border-retro-terracota/10 mb-6">
            <div className="w-11 h-11 rounded-2xl bg-retro-terracota/10 text-retro-terracota flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-6 h-6 stroke-[2.2] animate-pulse text-retro-terracota" />
            </div>
            <div>
              <h3 className="text-base font-black text-retro-terracota uppercase tracking-wide">Acceso Restringido</h3>
              <p className="text-[10px] font-black text-retro-mostaza uppercase tracking-widest mt-0.5">Control de Pago de Usuario</p>
            </div>
          </div>

          {/* User Details & Warning */}
          <div className="space-y-5">
            <div className="p-5 bg-retro-crema/45 rounded-2xl border border-retro-terracota/10">
              <p className="text-xs font-bold text-retro-terracota/80 leading-relaxed">
                ¡Hola, <span className="font-black text-retro-terracota">{user.name}</span>! Para activar tu calendario y poder seleccionar tus alimentos de esta semana, es necesario que verifiquemos tu pago.
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
                  <span className="text-retro-terracota font-black">BBVA Bancomer</span>
                </div>
                <div className="flex justify-between border-b border-stone-200/60 pb-2">
                  <span className="text-retro-terracota/60">Beneficiario:</span>
                  <span className="text-retro-terracota font-black">Lunch Lovers GDL S.A. de C.V.</span>
                </div>
                <div className="flex justify-between items-center border-b border-stone-200/60 pb-2">
                  <span className="text-retro-terracota/60">CLABE Interbancaria:</span>
                  <div className="flex items-center space-x-1.5 bg-white px-2.5 py-1 rounded-lg border border-retro-terracota/5">
                    <span className="text-retro-terracota font-black select-all tracking-wide">123456789012345678</span>
                    <button
                      onClick={handleCopyClabe}
                      className="p-1 hover:bg-stone-100 rounded transition-colors text-retro-terracota/60"
                      title="Copiar CLABE"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-retro-terracota/60">Monto del Plan ({user.plan === 'basic' ? 'Básico' : user.plan === 'pro' ? 'Pro' : 'Normal'}):</span>
                  <span className="text-retro-terracota font-black text-sm">
                    {user.plan === 'basic' ? '$29.00' : '$99.00'} MXN
                  </span>
                </div>
              </div>
            </div>

            {/* Next Action Steps */}
            <div className="p-5 bg-retro-crema/10 border border-dashed border-retro-terracota/20 rounded-2xl space-y-2">
              <h5 className="text-[10px] font-black text-retro-terracota uppercase tracking-wider">¿Cómo activar tu cuenta?</h5>
              <p className="text-[11px] font-semibold text-retro-terracota/70 leading-relaxed">
                Una vez realizada la transferencia, envía tu comprobante por WhatsApp o al correo <a href="mailto:pagos@lunchlovers.com" className="underline font-black text-retro-terracota hover:text-retro-terracota/90">pagos@lunchlovers.com</a> especificando tu correo registrado. 
              </p>
              <div className="pt-2">
                <a
                  href="https://wa.me/523300000000?text=Hola,%20adjunto%20comprobante%20de%20pago%20para%20activar%20mi%20cuenta"
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
    );
  }

  // If user has paymentStatus === 'paid', render regular catalog/selections
  return children;
}
