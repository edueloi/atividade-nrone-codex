import React from 'react';
import { motion } from 'motion/react';
import { 
  Rocket, Target, ShieldCheck, Activity, 
  ArrowUpRight, ArrowDownRight, CheckCircle2, 
  AlertTriangle, Filter, Search, Download, 
  ChevronDown, LayoutDashboard, History, Map, Info, MoreVertical,
  Settings, Lock, Unlock, FileArchive
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
  Legend, ComposedChart, Line, ScatterChart, Scatter, ZAxis
} from 'recharts';

export const ImplementationDashboardView: React.FC = () => {
  const data = [
    { name: 'Matriz de Risco', status: 'Concluído', progress: 100, date: '01/02/2026' },
    { name: 'Pausa Ativa (5/10/15)', status: 'Em Andamento', progress: 65, date: '15/02/2026' },
    { name: 'Diagnóstico Inicial', status: 'Concluído', progress: 100, date: '10/01/2026' },
    { name: 'Baseline do Contrato', status: 'Concluído', progress: 100, date: '20/01/2026' },
    { name: 'Treinamento Equipes', status: 'Pendente', progress: 0, date: '25/03/2026' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Dash Implantação</h1>
          <p className="text-zinc-500">Acompanhe o progresso da implantação do contrato.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors flex items-center gap-2">
            <Rocket className="w-4 h-4" />
            Nova Etapa
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
            <h2 className="text-lg font-bold text-zinc-900 mb-6">Status das Etapas</h2>
            <div className="space-y-6">
              {data.map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span className="text-zinc-900">{item.name}</span>
                    <span className={item.status === 'Concluído' ? 'text-emerald-600' : item.status === 'Em Andamento' ? 'text-blue-600' : 'text-zinc-400'}>
                      {item.status}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${item.progress}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className={`h-full ${item.status === 'Concluído' ? 'bg-emerald-500' : item.status === 'Em Andamento' ? 'bg-blue-500' : 'bg-zinc-200'}`}
                    />
                  </div>
                  <div className="flex items-center justify-end text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                    Previsto: {item.date}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
            <h2 className="text-lg font-bold text-zinc-900 mb-6">Matriz de Risco Inicial</h2>
            <div className="aspect-square bg-zinc-50 rounded-xl border border-zinc-100 flex items-center justify-center p-4">
              <div className="grid grid-cols-3 grid-rows-3 gap-2 w-full h-full">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className={`rounded-lg border border-white/20 shadow-sm ${i === 0 ? 'bg-rose-500' : i === 4 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                ))}
              </div>
            </div>
            <p className="mt-4 text-xs text-zinc-500 text-center">Distribuição inicial de riscos por setor.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
