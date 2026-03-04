import React from 'react';
import { motion } from 'motion/react';
import { Settings, Users, Building2, MapPin, Layers, Clock } from 'lucide-react';

function AdminCard({ icon, title, count, onClick }: { icon: React.ReactNode, title: string, count: string, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="p-6 bg-white border border-zinc-200 rounded-3xl text-left hover:border-emerald-600 hover:shadow-md transition-all group"
    >
      <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-emerald-50 transition-colors">
        <span className="text-zinc-400 group-hover:text-emerald-600 transition-colors">{icon}</span>
      </div>
      <h4 className="text-sm font-bold text-zinc-900 mb-1">{title}</h4>
      <p className="text-2xl font-bold text-zinc-400 group-hover:text-zinc-900 transition-colors">{count}</p>
    </button>
  );
}

export function AdminView() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center">
          <Settings className="text-white" size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold">Painel Administrativo</h3>
          <p className="text-zinc-500 text-sm">Configurações globais e cadastros base</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AdminCard icon={<Building2 size={24} />} title="Contratos (Tenants)" count="12" />
        <AdminCard icon={<MapPin size={24} />} title="Unidades" count="24" />
        <AdminCard icon={<Layers size={24} />} title="Setores" count="86" />
        <AdminCard icon={<Clock size={24} />} title="Turnos" count="03" />
        <AdminCard icon={<Users size={24} />} title="Usuários" count="142" />
        <AdminCard icon={<Settings size={24} />} title="Parâmetros" count="Config" />
      </div>
    </motion.div>
  );
}
