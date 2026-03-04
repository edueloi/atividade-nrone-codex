import React from 'react';
import { motion } from 'motion/react';
import { Megaphone, Calendar, CheckCircle2 } from 'lucide-react';

export function CampaignsView() {
  const months = [
    { name: 'Janeiro', theme: 'Janeiro Branco', status: 'completed' },
    { name: 'Fevereiro', theme: 'Fevereiro Laranja', status: 'completed' },
    { name: 'Março', theme: 'Março Azul', status: 'active' },
    { name: 'Abril', theme: 'Abril Verde', status: 'upcoming' },
    { name: 'Maio', theme: 'Maio Amarelo', status: 'upcoming' },
    { name: 'Junho', theme: 'Junho Vermelho', status: 'upcoming' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center">
            <Megaphone className="text-purple-600" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold">Calendário de Campanhas</h3>
            <p className="text-zinc-500 text-sm">Gestão das 12 campanhas anuais de saúde</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {months.map((m, i) => (
            <div key={i} className={`p-6 rounded-3xl border-2 transition-all ${
              m.status === 'active' ? 'border-emerald-600 bg-emerald-50/30' : 
              m.status === 'completed' ? 'border-zinc-100 bg-zinc-50 opacity-60' : 
              'border-zinc-100 bg-white'
            }`}>
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{m.name}</span>
                {m.status === 'completed' && <CheckCircle2 size={16} className="text-emerald-500" />}
                {m.status === 'active' && <div className="px-2 py-1 bg-emerald-600 text-white text-[8px] font-bold rounded-lg uppercase animate-pulse">Ativa</div>}
              </div>
              <h4 className="text-lg font-bold text-zinc-900 mb-4">{m.theme}</h4>
              <button className={`w-full py-3 rounded-xl text-xs font-bold transition-all ${
                m.status === 'active' ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-zinc-100 text-zinc-400'
              }`}>
                {m.status === 'completed' ? 'Ver Evidências' : 'Gerenciar Campanha'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
