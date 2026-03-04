import React from 'react';
import { motion } from 'motion/react';
import { 
  FileCheck, AlertTriangle, CheckCircle2, 
  Clock, Download, Filter, Search, 
  ChevronDown, LayoutDashboard, History, Map, Info, MoreVertical,
  Settings, Lock, Unlock, FileArchive, Users, Activity
} from 'lucide-react';

export const ClosingView: React.FC = () => {
  const units = [
    { name: 'Unidade Matriz', status: 'Pendente', launches: 85, target: 120, professional: 'Ricardo Prof' },
    { name: 'Filial Sul', status: 'Concluído', launches: 142, target: 140, professional: 'Ana Silva' },
    { name: 'Centro Logístico', status: 'Em Revisão', launches: 98, target: 100, professional: 'Carlos Souza' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Fechamento do Mês</h1>
          <p className="text-zinc-500">Valide e encerre a competência atual.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white border border-zinc-200 text-zinc-600 rounded-xl font-bold text-sm hover:bg-zinc-50 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Pacote do Mês
          </button>
          <button className="px-4 py-2 bg-rose-600 text-white rounded-xl font-bold text-sm hover:bg-rose-700 transition-colors flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Fechar Competência
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-zinc-900">Status por Unidade</h2>
              <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-lg">Prazo: Dia 10</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 text-zinc-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="px-6 py-3">Unidade / Profissional</th>
                    <th className="px-6 py-3">Lançamentos</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {units.map((unit, i) => (
                    <tr key={i} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-zinc-900">{unit.name}</div>
                        <div className="text-xs text-zinc-500">{unit.professional}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden max-w-[100px]">
                            <div className={`h-full ${unit.launches >= unit.target ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(100, (unit.launches / unit.target) * 100)}%` }} />
                          </div>
                          <span className="text-xs font-bold text-zinc-600">{unit.launches}/{unit.target}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                          unit.status === 'Concluído' ? 'bg-emerald-50 text-emerald-600' : 
                          unit.status === 'Em Revisão' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {unit.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-emerald-600 font-bold hover:underline">Cobrar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
            <h2 className="text-lg font-bold text-zinc-900 mb-6">Resumo de Pendências</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-100">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <span className="text-sm font-bold text-amber-900">12 Aulas s/ Presença</span>
                </div>
                <button className="text-xs font-bold text-amber-700 hover:underline">Ver</button>
              </div>
              <div className="flex items-center justify-between p-4 bg-rose-50 rounded-xl border border-rose-100">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-rose-600" />
                  <span className="text-sm font-bold text-rose-900">5 Queixas s/ Evolução</span>
                </div>
                <button className="text-xs font-bold text-rose-700 hover:underline">Ver</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
