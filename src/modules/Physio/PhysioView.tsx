import React from 'react';
import { motion } from 'motion/react';

export function PhysioView() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
        <h3 className="text-xl font-bold mb-6">Funil Clínico de Reabilitação</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-zinc-200 rounded-2xl overflow-hidden border border-zinc-200">
          <div className="bg-white p-8 text-center">
            <p className="text-[10px] uppercase font-bold text-zinc-400 mb-2">Queixas Ambulatoriais</p>
            <h4 className="text-4xl font-bold">142</h4>
          </div>
          <div className="bg-white p-8 text-center border-x border-zinc-200">
            <p className="text-[10px] uppercase font-bold text-zinc-400 mb-2">Queixas Momentâneas</p>
            <h4 className="text-4xl font-bold">84</h4>
          </div>
          <div className="bg-white p-8 text-center">
            <p className="text-[10px] uppercase font-bold text-zinc-400 mb-2">Reabilitados</p>
            <h4 className="text-4xl font-bold text-emerald-600">76</h4>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
