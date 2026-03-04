import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Activity, Shield, User, ChevronRight } from 'lucide-react';

interface LoginViewProps {
  tenants: any[];
  onLogin: (role: string, tenantId: string | null) => void;
}

export function LoginView({ tenants, onLogin }: LoginViewProps) {
  const [selectedTenant, setSelectedTenant] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[40px] p-10 shadow-2xl border border-zinc-100"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-200">
            <Activity className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 mb-2">Atividade SST</h1>
          <p className="text-zinc-500 font-medium">Plataforma Integrada de Saúde e Segurança</p>
        </div>

        <div className="space-y-4">
          <div className="p-6 bg-zinc-50 rounded-3xl border border-zinc-100">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-4 block">Selecione o Contrato (Tenant)</label>
            <div className="space-y-2">
              {tenants.map(t => (
                <button 
                  key={t.id}
                  onClick={() => setSelectedTenant(t.id)}
                  className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between group ${selectedTenant === t.id ? 'border-emerald-600 bg-emerald-50' : 'border-zinc-100 hover:border-zinc-200 bg-white'}`}
                >
                  <span className={`font-bold text-sm ${selectedTenant === t.id ? 'text-emerald-700' : 'text-zinc-600'}`}>{t.name}</span>
                  <ChevronRight size={16} className={selectedTenant === t.id ? 'text-emerald-600' : 'text-zinc-300'} />
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={() => onLogin('admin_atividade', null)}
            className="w-full py-5 bg-zinc-900 text-white rounded-3xl font-bold flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200"
          >
            <Shield size={20} />
            Entrar como Admin Atividade
          </button>

          <button 
            disabled={!selectedTenant}
            onClick={() => onLogin('professional', selectedTenant)}
            className="w-full py-5 bg-emerald-600 text-white rounded-3xl font-bold flex items-center justify-center gap-3 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 disabled:opacity-50 disabled:shadow-none"
          >
            <User size={20} />
            Entrar como Profissional
          </button>
        </div>

        <p className="text-center mt-10 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
          v2.5.0 • Atividade Laboral & SST
        </p>
      </motion.div>
    </div>
  );
}
