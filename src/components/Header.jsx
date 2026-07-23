import React, { useState, useEffect } from 'react';
import { Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import AuthModal from './AuthModal';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Header({ activeSection, setActiveSection, currentPage, setCurrentPage }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 20);
          
          if (location.pathname === '/') {
            const sections = ['inicio', 'como-funciona', 'testimonios', 'contacto'];
            const scrollPosition = window.scrollY + 120;

            for (const section of sections) {
              const el = document.getElementById(section);
              if (el) {
                const top = el.offsetTop;
                const height = el.offsetHeight;
                if (scrollPosition >= top && scrollPosition < top + height) {
                  setActiveSection(section);
                  break;
                }
              }
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [setActiveSection, location.pathname]);

  const navItems = [
    { id: 'inicio', label: 'Inicio', target: 'landing' },
    { id: 'como-funciona', label: 'Cómo funciona', target: 'landing' },
    { id: 'catalogo', label: 'Menú', target: 'landing' },
    { id: 'pricing', label: 'Planes', target: 'landing' },
    { id: 'contacto', label: 'Contacto', target: 'landing' },
  ];

  const handleNavClick = (itemId, targetPage) => {
    setIsMobileMenuOpen(false);
    
    if (itemId === 'catalogo') {
      navigate('/menu');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (itemId === 'pricing') {
      navigate('/planes');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (targetPage === 'dashboard') {
      navigate('/dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (targetPage === 'admin') {
      navigate('/admin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Secciones de la landing (inicio, como-funciona, testimonios, contacto)
      if (location.pathname !== '/') {
        navigate('/');
        // Esperamos a que la página de inicio se monte antes de hacer scroll
        setTimeout(() => {
          const element = document.getElementById(itemId);
          if (element) {
            const offset = 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.scrollY - offset;
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        }, 150);
      } else {
        const element = document.getElementById(itemId);
        if (element) {
          const offset = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.scrollY - offset;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <>
      <header 
        className={`fixed left-0 right-0 z-40 transition-all duration-500 ease-out ${
          isScrolled 
            ? 'top-4 max-w-5xl mx-auto px-4 md:px-8 py-2 rounded-full bg-white/80 backdrop-blur-md border border-white/20 shadow-[0_20px_40px_rgba(176,90,50,0.06)]' 
            : 'top-0 w-full px-4 sm:px-6 lg:px-8 py-5 bg-transparent border-transparent shadow-none'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo - image_0.png SVG */}
            <div 
              onClick={() => handleNavClick('inicio', 'landing')}
              className="cursor-pointer group flex-shrink-0"
            >
              <Logo className="h-14 w-auto" />
            </div>

            {/* Desktop Navigation Links & CTA */}
            <div className="hidden md:flex items-center space-x-8">
              <nav className="flex items-center space-x-6">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id, 'landing')}
                    className="relative text-sm font-extrabold tracking-wide py-2 text-retro-terracota hover:text-retro-mostaza transition-colors font-sans"
                  >
                    {item.label}
                    {currentPage === 'landing' && activeSection === item.id && (
                      <motion.div 
                        layoutId="modernActiveIndicator"
                        transition={{ type: "spring", stiffness: 120, damping: 20 }}
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-retro-terracota rounded-full"
                      />
                    )}
                  </button>
                ))}

                {user && (
                  user.isAdmin ? (
                    <button
                      onClick={() => handleNavClick('admin', 'admin')}
                      className="relative text-sm font-extrabold tracking-wide py-2 flex items-center space-x-1 text-retro-terracota hover:text-retro-mostaza transition-colors font-sans"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Panel Admin</span>
                      {currentPage === 'admin' && (
                        <motion.div 
                          layoutId="modernActiveIndicator"
                          transition={{ type: "spring", stiffness: 120, damping: 20 }}
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-retro-terracota rounded-full"
                        />
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleNavClick('dashboard', 'dashboard')}
                      className="relative text-sm font-extrabold tracking-wide py-2 flex items-center space-x-1 text-retro-terracota hover:text-retro-mostaza transition-colors font-sans"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Mi Panel</span>
                      {currentPage === 'dashboard' && (
                        <motion.div 
                          layoutId="modernActiveIndicator"
                          transition={{ type: "spring", stiffness: 120, damping: 20 }}
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-retro-terracota rounded-full"
                        />
                      )}
                    </button>
                  )
                )}
              </nav>

              {/* Login Button / Profile */}
              <div className="flex items-center pl-2">
                {user ? (
                  <div className="flex items-center space-x-2">
                    <div className="bg-white border border-retro-terracota/20 text-retro-terracota px-4 py-2 rounded-2xl text-xs font-bold shadow-md shadow-retro-terracota/5 flex items-center space-x-1.5">
                      <div className="w-5 h-5 rounded-full bg-retro-terracota text-white flex items-center justify-center font-extrabold text-[10px]">
                        {user.name.charAt(0)}
                      </div>
                      <span>{user.name}</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      title="Cerrar Sesión"
                      className="p-2 text-retro-terracota hover:text-retro-mostaza rounded-xl transition-colors"
                    >
                      <LogOut className="w-4.5 h-4.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="bg-retro-mostaza hover:bg-retro-mostaza/90 text-white font-bold text-xs py-2 px-5 rounded-full border border-retro-terracota/25 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Iniciar Sesión
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-retro-terracota hover:text-retro-mostaza p-2 rounded-lg transition-colors focus:outline-none"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

      </header>

      {/* Mobile Navigation Drawer (Native-feeling overlay with slide and spring physics) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm md:hidden"
            />

            {/* Drawer Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 150, damping: 22 }}
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm z-50 bg-white opacity-100 border-l border-retro-terracota/10 shadow-2xl p-6 flex flex-col justify-between md:hidden text-left"
            >
              <div>
                {/* Close button & Logo */}
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-retro-terracota/10">
                  <Logo className="h-10 w-auto" />
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 text-retro-terracota hover:bg-retro-crema/40 rounded-xl"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Navigation Links */}
                <nav className="space-y-3">
                  {navItems.map((item, idx) => (
                    <motion.button
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      key={item.id}
                      onClick={() => handleNavClick(item.id, 'landing')}
                      className={`block w-full text-left px-4 py-3 rounded-2xl text-base font-black transition-all ${
                        currentPage === 'landing' && activeSection === item.id
                          ? 'bg-retro-terracota text-white shadow-md shadow-retro-terracota/15'
                          : 'text-retro-terracota hover:bg-retro-crema/40'
                      }`}
                    >
                      {item.label}
                    </motion.button>
                  ))}

                  {user && (
                    user.isAdmin ? (
                      <motion.button
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: navItems.length * 0.05 }}
                        onClick={() => handleNavClick('admin', 'admin')}
                        className={`w-full flex items-center space-x-2 px-4 py-3 rounded-2xl text-base font-black transition-all ${
                          currentPage === 'admin'
                            ? 'bg-retro-terracota text-white shadow-md'
                            : 'text-retro-terracota hover:bg-retro-crema/40'
                        }`}
                      >
                        <LayoutDashboard className="w-5 h-5" />
                        <span>Panel Admin</span>
                      </motion.button>
                    ) : (
                      <motion.button
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: navItems.length * 0.05 }}
                        onClick={() => handleNavClick('dashboard', 'dashboard')}
                        className={`w-full flex items-center space-x-2 px-4 py-3 rounded-2xl text-base font-black transition-all ${
                          currentPage === 'dashboard'
                            ? 'bg-retro-terracota text-white shadow-md'
                            : 'text-retro-terracota hover:bg-retro-crema/40'
                        }`}
                      >
                        <LayoutDashboard className="w-5 h-5" />
                        <span>Mi Panel</span>
                      </motion.button>
                    )
                  )}
                </nav>
              </div>

              {/* Footer of Drawer (User login/logout) */}
              <div className="pt-6 border-t border-retro-terracota/10">
                {user ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 bg-retro-crema/40 p-3.5 rounded-2xl border border-retro-terracota/10">
                      <div className="w-8 h-8 rounded-full bg-retro-terracota text-white flex items-center justify-center font-extrabold text-sm shadow-md">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-black text-retro-terracota">{user.name}</p>
                        <p className="text-[10px] font-bold text-retro-terracota/60 truncate max-w-[180px]">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center justify-center space-x-2 bg-retro-terracota/5 text-retro-terracota font-black py-3 rounded-2xl border border-retro-terracota/20 hover:bg-retro-terracota/10 transition-colors text-xs tracking-wider uppercase"
                    >
                      <LogOut className="w-4.5 h-4.5" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setShowAuthModal(true);
                    }}
                    className="w-full bg-retro-mostaza text-white font-black py-3.5 rounded-2xl flex items-center justify-center shadow-md border border-retro-terracota/10 text-xs tracking-wider uppercase"
                  >
                    <span>Iniciar Sesión</span>
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Auth Modal Integration */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
