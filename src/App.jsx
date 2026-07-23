import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MealSelectionProvider } from './context/MealSelectionContext';
import Header from './components/Header';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import WhatsAppButton from './components/WhatsAppButton';
import RequirePaymentGate from './components/RequirePaymentGate';

// Helper para reintentar la carga en caso de ChunkLoadError por nuevos despliegues
const lazyWithRetry = (importFn) => {
  return lazy(async () => {
    try {
      return await importFn();
    } catch (error) {
      console.error("Chunk loading failed, attempting full page reload...", error);
      const lastReload = localStorage.getItem('chunk_load_failed_reload');
      const now = Date.now();
      
      if (!lastReload || now - parseInt(lastReload) > 10000) {
        localStorage.setItem('chunk_load_failed_reload', now.toString());
        window.location.reload();
        return new Promise(() => {});
      }
      throw error;
    }
  });
};

// Carga perezosa de los componentes
const Dashboard = lazyWithRetry(() => import('./components/Dashboard'));
const AdminDashboard = lazyWithRetry(() => import('./components/AdminDashboard'));
const AIPersonalAssistant = lazyWithRetry(() => import('./components/AIPersonalAssistant'));
const Catalog = lazyWithRetry(() => import('./components/Catalog'));
const Pricing = lazyWithRetry(() => import('./components/Pricing'));
const Testimonials = lazyWithRetry(() => import('./components/Testimonials'));
const Contact = lazyWithRetry(() => import('./components/Contact'));

// Ruta protegida para clientes autenticados con pasarela de pago activa
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="py-24 text-center">
      <div className="w-8 h-8 border-4 border-retro-crema border-t-retro-terracota rounded-full animate-spin mx-auto mb-3" />
      <p className="text-xs text-retro-terracota/70 font-bold">Cargando...</p>
    </div>
  );
  return user ? <RequirePaymentGate>{children}</RequirePaymentGate> : <Navigate to="/" replace />;
}

// Ruta protegida para administradores
function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="py-24 text-center">
      <div className="w-8 h-8 border-4 border-retro-crema border-t-retro-terracota rounded-full animate-spin mx-auto mb-3" />
      <p className="text-xs text-retro-terracota/70 font-bold">Cargando...</p>
    </div>
  );
  return user && user.isAdmin ? children : <Navigate to="/" replace />;
}

function AppLayout() {
  const { user, updateProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const processedPaymentRef = useRef(false);

  const [activeSection, _setActiveSection] = useState('inicio');

  const isAdminView = location.pathname.startsWith('/admin');

  // Compatibilidad: mapeamos la ruta actual al "currentPage" esperado por Header y subcomponentes
  const currentPage = 
    location.pathname === '/dashboard' ? 'dashboard' :
    location.pathname === '/admin' ? 'admin' : 'landing';

  // Sincronizar activeSection cuando se cargan rutas directas
  useEffect(() => {
    if (location.pathname === '/menu') {
      _setActiveSection('catalogo');
    } else if (location.pathname === '/planes') {
      _setActiveSection('pricing');
    } else if (location.pathname === '/') {
      _setActiveSection('inicio');
    }
  }, [location.pathname]);

  // Manejo del callback de Mercado Pago (éxito de pago)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');
    const planParam = params.get('plan');

    if (paymentStatus === 'success' && planParam && user && !processedPaymentRef.current) {
      processedPaymentRef.current = true;
      const updatePlan = async () => {
        try {
          await updateProfile({ plan: planParam, selectedMeals: [] });
          const newUrl = window.location.origin + window.location.pathname + window.location.hash;
          window.history.replaceState({}, document.title, newUrl);
          navigate('/dashboard');
        } catch (e) {
          console.error("Failed to update plan from query param callback:", e);
        }
      };
      updatePlan();
    }
  }, [user, updateProfile, navigate]);

  // Soporte para redirección de hash antiguo (#admin o #dashboard)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash === '#admin') {
      window.location.hash = '';
      navigate('/admin');
    } else if (hash === '#dashboard') {
      window.location.hash = '';
      navigate('/dashboard');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-retro-crema text-retro-terracota font-sans selection:bg-retro-terracota/20 selection:text-retro-terracota">
      
      {!isAdminView && (
        <Header 
          activeSection={activeSection} 
          setActiveSection={(section) => {
            if (section === 'catalogo') {
              navigate('/menu');
            } else if (section === 'pricing') {
              navigate('/planes');
            } else {
              if (location.pathname !== '/') {
                navigate('/');
                setTimeout(() => _setActiveSection(section), 50);
              } else {
                _setActiveSection(section);
              }
            }
          }}
          currentPage={currentPage}
          setCurrentPage={(page) => {
            if (page === 'dashboard') navigate('/dashboard');
            else if (page === 'admin') navigate('/admin');
          }}
        />
      )}

      <main className="flex-grow">
        <Suspense fallback={
          <div className="py-24 text-center flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-4 border-retro-crema border-t-retro-terracota rounded-full animate-spin mb-3" />
            <p className="text-xs text-retro-terracota/70 font-bold">Cargando...</p>
          </div>
        }>
          <Routes>
            {/* Página de Inicio (Línea de tiempo de secciones informativas) */}
            <Route path="/" element={
              <>
                <Hero />
                <HowItWorks />
                <Testimonials />
                <Contact />
              </>
            } />

            {/* Menú Semanal / Catálogo */}
            <Route path="/menu" element={<Catalog />} />

            {/* Suscripciones / Precios */}
            <Route path="/planes" element={<Pricing />} />

            {/* Portal de Cliente Protegido */}
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard 
                  setCurrentPage={(page) => {
                    if (page === 'landing') navigate('/');
                    else if (page === 'admin') navigate('/admin');
                  }}
                  setActiveSection={(section) => {
                    if (section === 'catalogo') navigate('/menu');
                    else if (section === 'pricing') navigate('/planes');
                    else {
                      navigate('/');
                      setTimeout(() => _setActiveSection(section), 50);
                    }
                  }}
                />
              </PrivateRoute>
            } />

            {/* Portal de Administrador Protegido */}
            <Route path="/admin" element={
              <AdminRoute>
                <AdminDashboard 
                  setCurrentPage={(page) => {
                    if (page === 'landing') navigate('/');
                    else if (page === 'dashboard') navigate('/dashboard');
                  }}
                  setActiveSection={(section) => {
                    if (section === 'catalogo') navigate('/menu');
                    else if (section === 'pricing') navigate('/planes');
                    else {
                      navigate('/');
                      setTimeout(() => _setActiveSection(section), 50);
                    }
                  }}
                />
              </AdminRoute>
            } />

            {/* Redirección por defecto */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>

      {!isAdminView && <WhatsAppButton />}
      {!isAdminView && (
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
        <Router>
          <AppLayout />
        </Router>
      </MealSelectionProvider>
    </AuthProvider>
  );
}
