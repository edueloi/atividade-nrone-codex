import React from 'react';
import { Search, Plus, Bell, User } from 'lucide-react';

interface HeaderProps {
  tenantName: string;
  onQuickLaunch: () => void;
}

export function Header({ tenantName, onQuickLaunch }: HeaderProps) {
  const today = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-zinc-200 sticky top-0 z-40 px-8 py-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900">Dash Mensal</h2>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{tenantName} • {today}</p>
        </div>
        <div className="hidden md:flex items-center bg-zinc-100 px-4 py-2 rounded-2xl border border-zinc-200 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
          <Search size={18} className="text-zinc-400" />
          <input 
            type="text" 
            placeholder="Buscar dados..." 
            className="bg-transparent border-none outline-none px-3 text-sm font-medium w-64 placeholder:text-zinc-400"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 rounded-xl transition-all relative">
          <Bell size={20} />
          <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>
        <button 
          onClick={onQuickLaunch}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-2xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 active:scale-95"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Lançamento Rápido</span>
        </button>
        <div className="h-8 w-px bg-zinc-200 mx-2" />
        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-zinc-900">Ricardo Prof</p>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Profissional</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-zinc-100 flex items-center justify-center border border-zinc-200 shadow-sm overflow-hidden">
            <User size={20} className="text-zinc-400" />
          </div>
        </div>
      </div>
    </header>
  );
}
