import React, { useState } from 'react';
import { useMealSelection } from '../context/MealSelectionContext';
import { Clock, Calendar, Check } from 'lucide-react';

export default function TimeSimulator() {
  const { simulatedMode, setSimulatedMode, isSelectionOpen, weekId } = useMealSelection();
  const [isOpen, setIsOpen] = useState(false);

  // Return null if context is not fully initialized with simulatedMode
  if (simulatedMode === undefined) return null;

  const options = [
    { id: 'real', label: 'Tiempo Real', desc: 'Usa la fecha y hora del sistema' },
    { id: 'weekend', label: 'Fin de Semana (Abierto)', desc: 'Simula Sábado 12:00 PM (Permite elegir)' },
    { id: 'weekday', label: 'Entre Semana (Cerrado)', desc: 'Simula Lunes 12:00 PM (Solo lectura)' },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans text-left">
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-4 py-3 rounded-full shadow-2xl transition-all duration-300 border ${
          isSelectionOpen
            ? 'bg-emerald-500 hover:bg-emerald-600 border-emerald-400 text-white shadow-emerald-500/20'
            : 'bg-retro-terracota hover:bg-retro-terracota/90 border-retro-terracota/20 text-white shadow-retro-terracota/20'
        }`}
      >
        <Clock className="w-4.5 h-4.5 animate-pulse" />
        <span className="text-[11px] font-black uppercase tracking-wider">
          Simulador: {simulatedMode === 'real' ? 'Real' : simulatedMode === 'weekend' ? 'Sáb/Dom' : 'Lun/Vie'}
        </span>
      </button>

      {/* Simulator Modal Drawer */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-72 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl animate-fade-in text-slate-100">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-retro-crema flex items-center space-x-1.5">
              <Calendar className="w-4 h-4 text-retro-mostaza" />
              <span>Simulador de Negocio</span>
            </h4>
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-slate-500 hover:text-slate-300 px-2 py-0.5 rounded-lg hover:bg-slate-800"
            >
              Cerrar
            </button>
          </div>

          <p className="text-[10px] text-slate-400 font-semibold mb-4 leading-relaxed">
            Cambia las condiciones de tiempo para probar el bloqueo temporal y la vista del catálogo.
          </p>

          <div className="space-y-2.5">
            {options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                  setSimulatedMode(opt.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all duration-200 ${
                  simulatedMode === opt.id
                    ? 'bg-retro-terracota/15 border-retro-terracota text-white'
                    : 'bg-slate-950 hover:bg-slate-800/50 border-slate-800 text-slate-300'
                }`}
              >
                <div>
                  <div className="text-xs font-black">{opt.label}</div>
                  <div className="text-[9px] text-slate-500 font-semibold mt-0.5">{opt.desc}</div>
                </div>
                {simulatedMode === opt.id && (
                  <div className="w-5 h-5 rounded-full bg-retro-terracota text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-[9px] font-black tracking-wider text-slate-500 uppercase">
            <span>Menú Semanal (Week ID):</span>
            <span className="text-retro-crema font-bold">{weekId}</span>
          </div>
        </div>
      )}
    </div>
  );
}
