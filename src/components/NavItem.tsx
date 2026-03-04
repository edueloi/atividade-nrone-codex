import React from 'react';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
  collapsed?: boolean;
}

export function NavItem({ icon, label, active, onClick, collapsed }: NavItemProps) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group relative ${
        active 
          ? 'bg-emerald-50 text-emerald-700' 
          : 'hover:bg-zinc-50 text-zinc-500 hover:text-zinc-900'
      }`}
    >
      <span className={`${active ? 'text-emerald-600' : 'text-zinc-400 group-hover:text-zinc-600'}`}>{icon}</span>
      {!collapsed && <span className="tracking-tight">{label}</span>}
      {active && !collapsed && <div className="ml-auto w-1.5 h-1.5 bg-emerald-600 rounded-full" />}
      {collapsed && active && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-emerald-600 rounded-l-full" />}
    </button>
  );
}
