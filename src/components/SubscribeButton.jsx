import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Loader2, AlertCircle, Sparkles } from 'lucide-react';

// Assuming firebase import, but wrapped in try/catch to maintain standalone compatibility
let db;
try {
  const firebaseConfig = await import('../firebase/config');
  db = firebaseConfig.db;
} catch (e) {
  // If not configured, we'll run in mock/simulator mode for the SPA demo
}

export default function SubscribeButton({ planId, priceId, planName, className = '' }) {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);

    if (!user) {
      setError('Por favor, inicia sesión para poder contratar un plan.');
      setLoading(false);
      return;
    }

    try {
      // 1. REAL FIREBASE FIRESTORE FLOW
      if (db) {
        const { collection, addDoc, onSnapshot } = await import('firebase/firestore');
        
        const sessionsRef = collection(db, 'users', user.uid, 'checkout_sessions');
        const sessionDoc = await addDoc(sessionsRef, {
          price: priceId,
          success_url: `${window.location.origin}/?session_id={CHECKOUT_SESSION_ID}&plan=${planId}`,
          cancel_url: `${window.location.origin}/?payment=canceled`,
        });

        // Listen for the Checkout Session URL to be created by the Stripe Firebase extension
        const unsubscribe = onSnapshot(sessionDoc, (snap) => {
          const data = snap.data();
          if (data) {
            if (data.url) {
              unsubscribe();
              window.location.assign(data.url);
            } else if (data.error) {
              unsubscribe();
              setError(data.error.message || 'Hubo un problema al crear la sesión con Stripe.');
              setLoading(false);
            }
          }
        }, (err) => {
          unsubscribe();
          setError(`Error de base de datos: ${err.message}`);
          setLoading(false);
        });

      } else {
        // 2. INTERACTIVE DEMO SIMULATOR FLOW (if database config is missing)
        console.log(`[Stripe Simulator] Creando Checkout Session para: ${planId} (${priceId})`);
        
        // Wait 2.5 seconds to simulate API call latency and show the loading spinner state
        await new Promise((resolve) => setTimeout(resolve, 2500));

        // Simulate Stripe Checkout Redirect
        // In local mode, we'll automatically assign the subscription plan and redirect to dashboard to show end-to-end success flow!
        await updateProfile({
          plan: planId,
          selectedMeals: [] // reset meal selections for the new plan
        });
        
        // Redirect to represent Stripe success callback
        window.location.hash = '#dashboard';
        window.location.reload();
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError('Ocurrió un error inesperado al procesar tu suscripción. Intenta de nuevo.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full text-left">
      <button
        onClick={handleSubscribe}
        disabled={loading}
        className={`w-full py-3.5 px-6 rounded-2xl font-black text-xs tracking-wider uppercase transition-all duration-300 flex items-center justify-center space-x-2 border disabled:opacity-75 disabled:cursor-not-allowed ${className}`}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-current" />
            <span>Procesando pago...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-retro-mostaza animate-pulse" />
            <span>Suscribirme a {planName}</span>
          </>
        )}
      </button>

      {/* Error Message */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-[11px] font-bold text-red-700 flex items-start space-x-2 animate-fade-in">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
