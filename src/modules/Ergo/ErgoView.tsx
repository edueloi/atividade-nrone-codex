import React from 'react';
import { motion } from 'motion/react';

function RiskRow({ sector, risk, color }: { sector: string, risk: string, color: string }) {
  return (
    <div className="flex justify-between items-center p-4 bg-zinc-50 rounded-2xl border border-zinc-200">
      <span className="font-bold text-sm">{sector}</span>
      <span className={`text-[10px] uppercase font-bold px-3 py-1 rounded-full bg-${color}-50 text-${color}-600 border border-${color}-100`}>
        {risk}
      </span>
    </div>
  );
}

function ValidationItem({ title, status, date }: { title: string, status: string, date: string }) {
  return (
    <div className="flex justify-between items-center p-4 hover:bg-zinc-50 rounded-2xl transition-colors">
      <div>
        <p className="font-bold text-sm">{title}</p>
        <p className="text-[10px] text-zinc-400 uppercase font-bold">{date}</p>
      </div>
      <span className={`text-[10px] uppercase font-bold ${status === 'Vetado' ? 'text-red-500' : 'text-emerald-600'}`}>{status}</span>
    </div>
  );
}

export function ErgoView() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
          <h3 className="text-xl font-bold mb-6">Matriz de Risco Biomecânico</h3>
          <div className="space-y-4">
            <RiskRow sector="Montagem Cross" risk="Crítico" color="red" />
            <RiskRow sector="Pintura" risk="Médio" color="amber" />
            <RiskRow sector="Logística" risk="Baixo" color="emerald" />
            <RiskRow sector="Administrativo" risk="Baixo" color="emerald" />
          </div>
        </div>
        
        <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
          <h3 className="text-xl font-bold mb-6">Validação de Engenharia</h3>
          <div className="space-y-4">
            <ValidationItem title="Nova Bancada - Linha 4" status="Aprovado" date="02/03/2026" />
            <ValidationItem title="Braço Mecânico - Setor A" status="Vetado" date="01/03/2026" />
            <ValidationItem title="Ajuste de Altura - Esteira" status="Ajustado" date="28/02/2026" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
