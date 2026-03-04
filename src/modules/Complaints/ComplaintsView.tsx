import React from 'react';
import { motion } from 'motion/react';
import { AlertCircle, Stethoscope, Activity } from 'lucide-react';
import { StatCard } from '../../components/StatCard.js';

export function ComplaintsView() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard label="Queixas Momentâneas" value="84" trend="+12%" icon={<AlertCircle size={20} className="text-amber-600" />} color="amber" />
        <StatCard label="Queixas Ambulatoriais" value="142" trend="-5%" icon={<Stethoscope size={20} className="text-red-600" />} color="red" />
      </div>
      
      <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
        <h3 className="text-xl font-bold mb-6">Mapeamento de Queixas por Setor</h3>
        <div className="space-y-4">
          {[
            { sector: 'Montagem Cross', count: 12, trend: 'up' },
            { sector: 'Logística', count: 8, trend: 'down' },
            { sector: 'Pintura', count: 5, trend: 'stable' },
          ].map((item, i) => (
            <div key={i} className="flex justify-between items-center p-4 bg-zinc-50 rounded-2xl border border-zinc-200">
              <span className="font-bold text-sm text-zinc-900">{item.sector}</span>
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold">{item.count}</span>
                <span className={`text-[10px] font-bold uppercase ${item.trend === 'up' ? 'text-red-500' : item.trend === 'down' ? 'text-emerald-600' : 'text-zinc-400'}`}>
                  {item.trend === 'up' ? '↑' : item.trend === 'down' ? '↓' : '•'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
