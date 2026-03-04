import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';

function NR1Card({ title, value, trend }: { title: string, value: string, trend: string }) {
  return (
    <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-200">
      <p className="text-[10px] uppercase font-bold text-zinc-400 mb-2">{title}</p>
      <h4 className="text-3xl font-bold mb-1">{value}</h4>
      <p className="text-[10px] font-bold text-emerald-600">{trend}</p>
    </div>
  );
}

export function NR1View() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-xl font-bold">Mapeamento Psicossocial (NR1)</h3>
            <p className="text-zinc-500 text-sm">Embrião de mapeamento de saúde mental</p>
          </div>
          <button className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold">Novo Questionário</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <NR1Card title="Ansiedade" value="12%" trend="Estável" />
          <NR1Card title="Burnout" value="4%" trend="-2%" />
          <NR1Card title="Satisfação" value="88%" trend="+5%" />
        </div>

        <div className="mt-8 p-6 bg-zinc-50 rounded-2xl border border-zinc-200">
          <h4 className="font-bold mb-4">Perguntas Ativas (Mapeamento Leve)</h4>
          <div className="space-y-3">
            <p className="text-sm text-zinc-600 flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> "Como você avalia seu nível de estresse hoje?"</p>
            <p className="text-sm text-zinc-600 flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> "Você sente que tem suporte da sua liderança?"</p>
            <p className="text-sm text-zinc-600 flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> "Teve dificuldades para dormir devido ao trabalho?"</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
