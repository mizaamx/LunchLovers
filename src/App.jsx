import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MealSelectionProvider } from './context/MealSelectionContext';
import Header from './components/Header';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import Catalog from './components/Catalog';
import Pricing from './components/Pricing';
import Testimonials from './components/Testimonials';
import Contact from './components/Contact';
import WhatsAppButton from './components/WhatsAppButton';
import RequirePaymentGate from './components/RequirePaymentGate';

// Helper to handle ChunkLoadError when a new version is deployed and the user's browser attempts to fetch outdated assets
const lazyWithRetry = (importFn) => {
  return lazy(async () => {
    try {
      return await importFn();
    } catch (error) {
      console.error("Chunk loading failed, attempting full page reload...", error);
      const lastReload = localStorage.getItem('chunk_load_failed_reload');
      const now = Date.now();
      
      // Prevent infinite reload loops if there is a real network/server error (limit reload to once every 10s)
      if (!lastReload || now - parseInt(lastReload) > 10000) {
        localStorage.setItem('chunk_load_failed_reload', now.toString());
        window.location.reload();
        return new Promise(() => {}); // Suspend while page is reloading
      }
      
      throw error;
    }
  });
};

const Dashboard = lazyWithRetry(() => import('./components/Dashboard'));
const AdminDashboard = lazyWithRetry(() => import('./components/AdminDashboard'));
const AIPersonalAssistant = lazyWithRetry(() => import('./components/AIPersonalAssistant'));

function AppContent() {
  const [activeSection, setActiveSection] = useState('inicio');
  const [currentPage, setCurrentPage] = useState('landing'); // 'landing', 'dashboard', 'admin'
  const { user, loading, updateProfile } = useAuth();
  
  const userRef = useRef(user);
  const processedPaymentRef = useRef(false);

  // Sync user reference to keep event listener dependency-free
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Protected route enforcement for Admin
  useEffect(() => {
    if (currentPage === 'admin') {
      if (!loading && (!user || !user.isAdmin)) {
        setCurrentPage('landing');
        setActiveSection('inicio');
      }
    }
  }, [currentPage, user, loading]);

  // Handle Mercado Pago payment success callback parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');
    const planParam = params.get('plan');

    if (paymentStatus === 'success' && planParam && user && !processedPaymentRef.current) {
      processedPaymentRef.current = true;
      const updatePlan = async () => {
        try {
          await updateProfile({ plan: planParam, selectedMeals: [] });
          // Clear query params to clean up URL
          const newUrl = window.location.origin + window.location.pathname + window.location.hash;
          window.history.replaceState({}, document.title, newUrl);
          
          // Switch to dashboard view
          setCurrentPage('dashboard');
        } catch (e) {
          console.error("Failed to update plan from query param callback:", e);
        }
      };
      updatePlan();
    }
  }, [user, updateProfile]);

  // Support direct route matching in hash/URL - Registered ONCE to prevent listener churn
  useEffect(() => {
    const handleHashRoute = () => {
      const hash = window.location.hash;
      const currentUser = userRef.current;
      if (hash === '#admin') {
        if (currentUser && currentUser.isAdmin) {
          setCurrentPage('admin');
        } else {
          setCurrentPage('landing');
          window.location.hash = '';
        }
      } else if (hash === '#dashboard') {
        if (currentUser) {
          setCurrentPage('dashboard');
        } else {
          setCurrentPage('landing');
          window.location.hash = '';
        }
      }
    };

    window.addEventListener('hashchange', handleHashRoute);
    handleHashRoute(); // check on mount

    return () => window.removeEventListener('hashchange', handleHashRoute);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-retro-crema text-retro-terracota font-sans selection:bg-retro-terracota/20 selection:text-retro-terracota">
      
      {/* Top Fixed Header (Only visible if not on Admin Panel to preserve its full sidebar height layout) */}
      {currentPage !== 'admin' && (
        <Header 
          activeSection={activeSection} 
          setActiveSection={setActiveSection} 
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      )}

      {/* Main Container */}
      <main className="flex-grow">
        <Suspense fallback={
          <div className="py-24 text-center flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-4 border-retro-crema border-t-retro-terracota rounded-full animate-spin mb-3" />
            <p className="text-xs text-retro-terracota/70 font-bold">Cargando...</p>
          </div>
        }>
          {currentPage === 'landing' ? (
            <>
              {/* Full-width sequential sections */}
              <Hero />
              <HowItWorks />
              <Catalog />
              <Pricing />
              <Testimonials />
              <Contact />
            </>
          ) : currentPage === 'dashboard' ? (
            /* Private client portal (full width page) */
            <RequirePaymentGate>
              <Dashboard 
                setCurrentPage={setCurrentPage} 
                setActiveSection={setActiveSection} 
              />
            </RequirePaymentGate>
          ) : (
            /* Protected administrator portal */
            user && user.isAdmin ? (
              <AdminDashboard 
                setCurrentPage={setCurrentPage} 
                setActiveSection={setActiveSection} 
              />
            ) : (
              <div className="py-24 text-center">Redirigiendo...</div>
            )
          )}
        </Suspense>
      </main>

      {/* Floating CTA WhatsApp Widget (Only visible if not on Admin Panel) */}
      {currentPage !== 'admin' && <WhatsAppButton />}

      {/* Floating AI Nutrition Assistant (Only visible if not on Admin Panel) */}
      {currentPage !== 'admin' && (
        <Suspense fallback={null}>
          <AIPersonalAssistant />
        </Suspense>
      )}

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MealSelectionProvider>
        <AppContent />
      </MealSelectionProvider>
    </AuthProvider>
  );
}
