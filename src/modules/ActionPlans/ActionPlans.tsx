import React from 'react';
import { motion } from 'motion/react';
import { Target, Plus, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

function ActionPlanRow({ title, sector, status, dueDate }: { title: string, sector: string, status: string, dueDate: string }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white border border-zinc-100 rounded-2xl hover:border-emerald-200 hover:shadow-sm transition-all group">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
          status === 'in_progress' ? 'bg-blue-50 text-blue-600' :
          'bg-amber-50 text-amber-600'
        }`}>
          {status === 'completed' ? <CheckCircle2 size={20} /> : <Clock size={20} />}
        </div>
        <div>
          <h4 className="text-sm font-bold text-zinc-900">{title}</h4>
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{sector} • Prazo: {dueDate}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
         <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
           status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
           status === 'in_progress' ? 'bg-blue-50 text-blue-600' :
           'bg-amber-50 text-amber-600'
         }`}>
           {status === 'completed' ? 'Concluído' : status === 'in_progress' ? 'Em Andamento' : 'Aberto'}
         </span>
         <button className="p-2 text-zinc-300 hover:text-zinc-900 transition-colors"><Plus size={18} className="rotate-45" /></button>
      </div>
    </div>
  );
}

export function ActionPlansView() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center">
            <Target className="text-white" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold">Plano de Ação (5W2H)</h3>
            <p className="text-zinc-500 text-sm">Gestão de melhorias e correções</p>
          </div>
        </div>
        <button className="px-6 py-3 bg-zinc-900 text-white rounded-xl text-sm font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200 flex items-center gap-2">
           <Plus size={18} />
           Novo Plano
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
           <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-2 bg-amber-500 rounded-full" />
              <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Abertos</h4>
           </div>
           <div className="space-y-3">
              <ActionPlanRow title="Ajuste Ergonômico Bancada" sector="Montagem" status="open" dueDate="15/03" />
              <ActionPlanRow title="Treinamento Postural" sector="Logística" status="open" dueDate="20/03" />
           </div>
        </div>
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
           <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Em Andamento</h4>
           </div>
           <div className="space-y-3">
              <ActionPlanRow title="Substituição de Cadeiras" sector="Adm" status="in_progress" dueDate="10/03" />
           </div>
        </div>
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
           <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Concluídos</h4>
           </div>
           <div className="space-y-3">
              <ActionPlanRow title="Iluminação Setor Pintura" sector="Pintura" status="completed" dueDate="01/03" />
           </div>
        </div>
      </div>
    </motion.div>
  );
}
