import React from 'react';
import { motion } from 'motion/react';
import { 
  HardHat, ShieldCheck, Activity, 
  ArrowUpRight, ArrowDownRight, CheckCircle2, 
  AlertTriangle, Filter, Search, Download, 
  ChevronDown, LayoutDashboard, History, Map, Info, MoreVertical,
  Settings, Lock, Unlock, FileArchive, Users, Zap
} from 'lucide-react';

export const ErgoEngView: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Ergonomia & Engenharia</h1>
          <p className="text-zinc-500">Validação de projetos e ações ergonômicas.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            Validar Projeto
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
            <h2 className="text-lg font-bold text-zinc-900 mb-6">Projetos em Validação</h2>
            <div className="space-y-4">
              {[
                { title: 'Linha de Montagem - Posto 04', status: 'Em Análise', priority: 'Alta', date: '02/03/2026' },
                { title: 'Novo Centro de Distribuição', status: 'Aprovado', priority: 'Média', date: '28/02/2026' },
                { title: 'Ajuste de Bancada - Logística', status: 'Reprovado', priority: 'Alta', date: '25/02/2026' },
              ].map((project, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl border border-zinc-100 hover:border-emerald-200 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${project.status === 'Aprovado' ? 'bg-emerald-100 text-emerald-600' : project.status === 'Reprovado' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'}`}>
                      <HardHat className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-zinc-900 group-hover:text-emerald-600 transition-colors">{project.title}</h3>
                      <p className="text-xs text-zinc-500">{project.status} • {project.date}</p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${project.priority === 'Alta' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
                    {project.priority}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
            <h2 className="text-lg font-bold text-zinc-900 mb-6">Ações Ergonômicas</h2>
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <div className="text-2xl font-bold text-emerald-900">42</div>
                <div className="text-xs text-emerald-600 font-bold uppercase">Ações Concluídas</div>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="text-2xl font-bold text-blue-900">15</div>
                <div className="text-xs text-blue-600 font-bold uppercase">Em Andamento</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
