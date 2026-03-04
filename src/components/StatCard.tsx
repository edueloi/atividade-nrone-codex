import React from 'react';

interface StatCardProps {
  label: string;
  value: string;
  trend: string;
  icon: React.ReactNode;
  color: string;
  negative?: boolean;
  subValue?: string;
}

export function StatCard({ label, value, trend, icon, color, negative, subValue }: StatCardProps) {
  return (
    <div className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-sm hover:shadow-md transition-all group">
      <div className="flex justify-between items-start mb-3">
        <div className={`p-2.5 rounded-xl bg-${color}-50 group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${negative ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
          {trend}
        </span>
      </div>
      <div>
        <h4 className="text-2xl font-bold tracking-tight text-zinc-900 mb-0.5">{value}</h4>
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">{label}</p>
        {subValue && <p className="text-[10px] font-medium text-zinc-500">{subValue}</p>}
      </div>
    </div>
  );
}
