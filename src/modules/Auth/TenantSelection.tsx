import React from 'react';
import { motion } from 'motion/react';
import { Building2, ChevronRight } from 'lucide-react';

interface TenantSelectionProps {
  tenants: any[];
  onSelect: (tenant: any) => void;
}

export function TenantSelectionView({ tenants, onSelect }: TenantSelectionProps) {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl bg-white rounded-[40px] p-12 shadow-2xl border border-zinc-100"
      >
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Building2 className="text-white" size={32} />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 mb-2">Selecione o Contrato</h2>
          <p className="text-zinc-500 font-medium">Você tem acesso a múltiplos clientes. Escolha um para gerenciar.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tenants.map(t => (
            <button 
              key={t.id}
              onClick={() => onSelect(t)}
              className="p-8 bg-zinc-50 rounded-3xl border-2 border-transparent hover:border-emerald-600 hover:bg-emerald-50/30 transition-all text-left group"
            >
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                <Building2 className="text-zinc-400 group-hover:text-emerald-600" size={24} />
              </div>
              <h3 className="font-bold text-zinc-900 mb-1">{t.name}</h3>
              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                Acessar Painel <ChevronRight size={12} />
              </div>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
