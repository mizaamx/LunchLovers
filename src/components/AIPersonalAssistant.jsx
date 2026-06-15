import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Trash2, AlertCircle, Loader2 } from 'lucide-react';

export default function AIPersonalAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', text: '¡Hola! Soy tu asistente nutricional de Lunch Lovers. Dime tu objetivo calórico diario o semanal y te ayudaré a armar tu plan de comidas perfecto.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend) => {
    const promptText = textToSend || input;
    if (!promptText.trim()) return;

    if (!textToSend) {
      setInput('');
    }

    const newMessages = [...messages, { role: 'user', text: promptText }];
    setMessages(newMessages);
    setIsLoading(true);
    setError('');

    try {
      // Consultamos nuestro proxy seguro en el backend
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newMessages
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Error al conectar con el servidor de IA.');
      }

      const data = await res.json();
      setMessages(prev => [...prev, { role: 'model', text: data.text }]);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error al conectar con la IA. Por favor, intenta de nuevo más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      { role: 'model', text: '¡Hola! Soy tu asistente nutricional de Lunch Lovers. Dime tu objetivo calórico diario o semanal y te ayudaré a armar tu plan de comidas perfecto.' }
    ]);
    setError('');
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ type: "spring", stiffness: 180, damping: 20 }}
            className="w-80 sm:w-96 h-[500px] mb-4 flex flex-col rounded-3xl liquid-glass border border-white/20 shadow-[0_20px_50px_rgba(176,90,50,0.15)] overflow-hidden text-left"
          >
            {/* Header */}
            <div className="p-4 bg-retro-terracota text-white flex items-center justify-between shadow-sm border-b border-white/10">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                  <Sparkles className="w-4.5 h-4.5 text-retro-mostaza animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-black tracking-tight leading-none">NutriLovers AI</h4>
                  <div className="flex items-center space-x-1 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-[10px] font-bold text-retro-crema/80">En línea</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={clearChat}
                  title="Vaciar chat"
                  className="p-1.5 hover:bg-white/15 rounded-lg text-retro-crema/80 hover:text-white transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/15 rounded-lg text-retro-crema/80 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-grow flex flex-col min-h-0 relative bg-white/60">
              <div className="flex-grow overflow-y-auto p-4 space-y-3 scrollbar-thin">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs font-bold shadow-sm leading-relaxed whitespace-pre-line border ${
                        msg.role === 'user'
                          ? 'bg-retro-terracota text-white border-retro-terracota/20 rounded-tr-none'
                          : 'bg-white text-retro-terracota border-retro-terracota/10 rounded-tl-none shadow-[0_2px_8px_rgba(176,90,50,0.02)]'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white text-retro-terracota border border-retro-terracota/10 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 text-retro-terracota animate-spin" />
                      <span className="text-[11px] font-bold text-retro-terracota/60">Calculando menú óptimo...</span>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-[11px] font-bold flex items-start space-x-2">
                    <AlertCircle className="w-4.5 h-4.5 text-red-500 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Suggestions Buttons */}
              <div className="px-4 py-2 border-t border-retro-terracota/5 flex items-center space-x-1.5 overflow-x-auto whitespace-nowrap scrollbar-none">
                <button
                  onClick={() => handleSendMessage('Recomiéndame un menú semanal de 1800 calorías diarias')}
                  className="px-3 py-1 bg-white hover:bg-retro-crema/50 border border-retro-terracota/10 rounded-full text-[10px] font-black text-retro-terracota"
                >
                  Plan 1800 Kcal
                </button>
                <button
                  onClick={() => handleSendMessage('¿Cuáles de los platillos son Keto?')}
                  className="px-3 py-1 bg-white hover:bg-retro-crema/50 border border-retro-terracota/10 rounded-full text-[10px] font-black text-retro-terracota"
                >
                  Opciones Keto
                </button>
                <button
                  onClick={() => handleSendMessage('Recomiéndame 5 platillos altos en proteína')}
                  className="px-3 py-1 bg-white hover:bg-retro-crema/50 border border-retro-terracota/10 rounded-full text-[10px] font-black text-retro-terracota"
                >
                  Alto en Proteína
                </button>
              </div>
            </div>

            {/* Input field */}
            <div className="p-3 bg-white border-t border-retro-terracota/10 flex items-center space-x-2">
              <input
                type="text"
                placeholder="Ej. Recomiéndame 2000 kcal al día..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={isLoading}
                className="flex-grow px-4 py-2 rounded-2xl border border-retro-terracota/20 focus:outline-none focus:ring-2 focus:ring-retro-terracota/25 focus:border-retro-terracota text-xs font-bold text-retro-terracota bg-retro-crema/10 placeholder-retro-terracota/30 disabled:opacity-55"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSendMessage()}
                disabled={isLoading || !input.trim()}
                className="w-9 h-9 rounded-2xl bg-retro-terracota text-white flex items-center justify-center hover:bg-retro-terracota/90 disabled:bg-retro-terracota/40 shadow-sm transition-all"
              >
                <Send className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Button & Tooltip Wrapper */}
      <div className="flex items-center">
        {/* Floating Action Button */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.06, y: -2 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              setIsOpen(!isOpen);
              setShowTooltip(false);
            }}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="w-14 h-14 rounded-full bg-retro-terracota text-white flex items-center justify-center shadow-lg shadow-retro-terracota/20 border border-retro-terracota/15 hover:bg-retro-terracota/95 focus:outline-none relative"
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                >
                  <X className="w-6 h-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="sparkles"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  className="relative"
                >
                  <Sparkles className="w-6 h-6 text-retro-mostaza" />
                  {/* Notification dot */}
                  <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-retro-mostaza rounded-full border border-retro-terracota" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Tooltip in retro-warm colors (Terracota and Crema) to the right */}
        <AnimatePresence>
          {showTooltip && !isOpen && (
            <motion.div
              initial={{ opacity: 0, x: -20, scale: 0.85 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.85 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="ml-3 bg-retro-terracota text-retro-crema font-bold text-xs py-2 px-4 rounded-xl border-2 border-retro-crema shadow-lg pointer-events-none whitespace-nowrap relative z-20"
            >
              🤖 ¡Asistente Nutricional IA!
              <div className="absolute left-[-6px] top-1/2 transform -translate-y-1/2 w-2.5 h-2.5 bg-retro-terracota rotate-45 border-l-2 border-b-2 border-retro-crema" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
