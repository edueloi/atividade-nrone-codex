import React from 'react';
import { motion } from 'motion/react';
import { 
  Activity, Users, AlertTriangle, CheckCircle2, 
  ArrowUpRight, Clock, Calendar, Zap
} from 'lucide-react';
import { StatCard } from '../../components/StatCard.js';

export const HomeView: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Olá, Ricardo</h1>
          <p className="text-zinc-500">Aqui está o resumo das atividades de hoje.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white border border-zinc-200 rounded-xl flex items-center gap-2 text-sm font-medium text-zinc-600">
            <Calendar className="w-4 h-4" />
            04 de Março, 2026
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Presença Hoje" 
          value="84%" 
          trend="+2.4%" 
          icon={<Users size={20} />} 
          color="emerald" 
        />
        <StatCard 
          label="Queixas Ativas" 
          value="12" 
          trend="-1" 
          icon={<AlertTriangle size={20} />} 
          color="amber" 
          negative
        />
        <StatCard 
          label="Aulas Realizadas" 
          value="8/12" 
          trend="0" 
          icon={<Activity size={20} />} 
          color="blue" 
        />
        <StatCard 
          label="Pendências" 
          value="5" 
          trend="+2" 
          icon={<Clock size={20} />} 
          color="rose" 
          negative
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Alertas e Pendências */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
            <h2 className="text-lg font-bold text-zinc-900 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              Ações Prioritárias
            </h2>
            <div className="space-y-4">
              {[
                { title: 'Validar Posto de Trabalho - Linha A', type: 'Ergonomia', priority: 'Alta', time: 'Há 2 horas' },
                { title: 'Relatório Mensal Toyota - Fevereiro', type: 'Gestão', priority: 'Média', time: 'Há 5 horas' },
                { title: 'Acompanhamento Fisioterapia - João Silva', type: 'Saúde', priority: 'Baixa', time: 'Ontem' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl border border-zinc-100 hover:border-emerald-200 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${item.priority === 'Alta' ? 'bg-rose-500' : item.priority === 'Média' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                    <div>
                      <h3 className="text-sm font-bold text-zinc-900 group-hover:text-emerald-600 transition-colors">{item.title}</h3>
                      <p className="text-xs text-zinc-500">{item.type} • {item.time}</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-zinc-300 group-hover:text-emerald-500 transition-colors" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Atalhos Rápidos */}
        <div className="space-y-6">
          <div className="bg-emerald-600 p-6 rounded-2xl shadow-lg shadow-emerald-200 text-white">
            <h2 className="text-lg font-bold mb-4">Lançamento Rápido</h2>
            <p className="text-emerald-100 text-sm mb-6">Registre presenças, queixas ou atendimentos em segundos.</p>
            <button className="w-full py-3 bg-white text-emerald-600 rounded-xl font-bold text-sm hover:bg-emerald-50 transition-colors">
              Abrir Lançador
            </button>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
            <h2 className="text-lg font-bold text-zinc-900 mb-4">Próximas Campanhas</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 font-bold text-xs">
                  MAR
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">Março Azul</h3>
                  <p className="text-xs text-zinc-500">Prevenção Câncer Colorretal</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
