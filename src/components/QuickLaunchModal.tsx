import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Plus, ClipboardCheck, AlertCircle, Stethoscope, 
  Activity, Clock, BrainCircuit, AlertTriangle 
} from 'lucide-react';

interface QuickLaunchModalProps {
  onClose: () => void;
}

export function QuickLaunchModal({ onClose }: QuickLaunchModalProps) {
  const [step, setStep] = useState(1);
  const [type, setType] = useState<'gym' | 'momentary' | 'ambulatory' | 'physio' | 'absent' | 'nr1'>('gym');
  const [method, setMethod] = useState<'count' | 'mass' | 'qr'>('count');
  const [count, setCount] = useState(0);

  const launchTypes = [
    { id: 'gym', label: 'Aula + Presença', icon: <ClipboardCheck size={20} />, color: 'emerald' },
    { id: 'momentary', label: 'Queixa Mom.', icon: <AlertCircle size={20} />, color: 'amber' },
    { id: 'ambulatory', label: 'Queixa Amb.', icon: <Stethoscope size={20} />, color: 'red' },
    { id: 'physio', label: 'Fisioterapia', icon: <Activity size={20} />, color: 'blue' },
    { id: 'absent', label: 'Absenteísmo', icon: <Clock size={20} />, color: 'purple' },
    { id: 'nr1', label: 'NR1 Resposta', icon: <BrainCircuit size={20} />, color: 'indigo' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" 
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-white w-full max-w-2xl rounded-3xl p-8 shadow-2xl overflow-hidden"
      >
        <div className="flex justify-between items-start mb-8">
          <div>
            <h3 className="text-2xl font-bold">Lançamento Rápido</h3>
            <p className="text-zinc-500 text-sm">Selecione o tipo de registro para iniciar.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
            <Plus className="rotate-45 text-zinc-400" size={24} />
          </button>
        </div>

        {step === 1 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {launchTypes.map(t => (
              <button 
                key={t.id}
                onClick={() => { setType(t.id as any); setStep(2); }}
                className={`p-6 rounded-2xl border-2 text-left transition-all group ${type === t.id ? 'border-emerald-600 bg-emerald-50' : 'border-zinc-100 hover:border-zinc-200'}`}
              >
                <div className={`w-10 h-10 rounded-xl bg-${t.color}-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                   <span className={`text-${t.color}-600`}>{t.icon}</span>
                </div>
                <p className="text-sm font-bold text-zinc-900">{t.label}</p>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6 p-4 bg-zinc-50 rounded-2xl">
               <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                  {launchTypes.find(t => t.id === type)?.icon}
               </div>
               <span className="font-bold text-sm">{launchTypes.find(t => t.id === type)?.label}</span>
               <button onClick={() => setStep(1)} className="ml-auto text-[10px] font-bold uppercase text-emerald-600 hover:underline">Trocar Tipo</button>
            </div>

            {type === 'gym' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2 block">Unidade / Setor</label>
                    <select className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-medium">
                      <option>Toyota Sorocaba - Montagem</option>
                      <option>Toyota Sorocaba - Logística</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2 block">Tipo de Pausa</label>
                    <div className="grid grid-cols-3 gap-2">
                       {['5min', '10min', '15min'].map(m => (
                         <button key={m} className="p-3 bg-white border border-zinc-200 rounded-xl text-xs font-bold hover:border-emerald-600 transition-all">{m}</button>
                       ))}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block">Presença</label>
                   <div className="flex gap-4">
                      <button onClick={() => setMethod('count')} className={`flex-1 py-3 rounded-xl border-2 font-bold text-xs ${method === 'count' ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-zinc-100 text-zinc-400'}`}>Contagem</button>
                      <button onClick={() => setMethod('mass')} className={`flex-1 py-3 rounded-xl border-2 font-bold text-xs ${method === 'mass' ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-zinc-100 text-zinc-400'}`}>Lista Massa</button>
                      <button onClick={() => setMethod('qr')} className={`flex-1 py-3 rounded-xl border-2 font-bold text-xs ${method === 'qr' ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-zinc-100 text-zinc-400'}`}>QR Code</button>
                   </div>
                   {method === 'count' && (
                      <div className="flex items-center justify-center gap-6 py-4">
                         <button onClick={() => setCount(Math.max(0, count - 5))} className="w-12 h-12 rounded-xl border border-zinc-200 font-bold">-5</button>
                         <span className="text-5xl font-bold">{count}</span>
                         <button onClick={() => setCount(count + 5)} className="w-12 h-12 rounded-xl border border-zinc-200 font-bold">+5</button>
                      </div>
                   )}
                </div>
              </div>
            )}

            {type === 'momentary' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2 block">Estrutura Corporal</label>
                    <select className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-medium">
                      <option>Ombros</option>
                      <option>Lombar</option>
                      <option>Pescoço</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2 block">Intensidade</label>
                    <div className="grid grid-cols-3 gap-2">
                       {['Leve', 'Média', 'Forte'].map(i => (
                         <button key={i} className="p-3 bg-white border border-zinc-200 rounded-xl text-xs font-bold hover:border-amber-600 transition-all">{i}</button>
                       ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                   <AlertTriangle className="text-amber-600" size={20} />
                   <p className="text-xs text-amber-700 font-medium">Lançamento preventivo para evitar absenteísmo.</p>
                </div>
              </div>
            )}

            {type === 'absent' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2 block">Grupo CID</label>
                    <select className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-medium">
                      <option>F - Mental</option>
                      <option>G - Nervoso</option>
                      <option>I - Circulatório</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2 block">Dias Perdidos</label>
                    <input type="number" className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-medium" placeholder="Ex: 5" />
                  </div>
                </div>
              </div>
            )}

            <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 flex items-center gap-3 text-left cursor-pointer hover:bg-zinc-100 transition-colors">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <Plus className="text-zinc-400" />
              </div>
              <div>
                <span className="text-xs font-bold text-zinc-700 block">Anexar Evidência (Foto)</span>
                <span className="text-[10px] text-zinc-400 uppercase font-bold">Opcional para este lançamento</span>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
               <button onClick={onClose} className="flex-1 py-4 bg-zinc-100 text-zinc-600 font-bold rounded-2xl hover:bg-zinc-200 transition-all">Cancelar</button>
               <button onClick={onClose} className="flex-[2] py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200">Finalizar Registro</button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
