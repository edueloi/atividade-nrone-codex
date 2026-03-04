import React from 'react';
import { motion } from 'motion/react';
import { 
  FileDown, FileText, BarChart3, FileArchive, 
  Download, Filter, Search, Calendar,
  ChevronDown, LayoutDashboard, History, Map, Info, MoreVertical,
  Settings, Lock, Unlock, Users, Activity, CheckCircle2
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const reports = [
    { title: 'Relatório Executivo Mensal', type: 'PDF', size: '1.2 MB', date: '01/03/2026', category: 'Mensal' },
    { title: 'Relatório Técnico de Ergonomia', type: 'PDF', size: '4.5 MB', date: '28/02/2026', category: 'Técnico' },
    { title: 'Base de Dados - Absenteísmo', type: 'XLSX', size: '850 KB', date: '02/03/2026', category: 'Dados' },
    { title: 'Pacote de Evidências - Q1 2026', type: 'ZIP', size: '125 MB', date: '01/03/2026', category: 'Auditoria' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Relatórios e Exportações</h1>
          <p className="text-zinc-500">Gere e baixe documentos oficiais do contrato.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white border border-zinc-200 rounded-xl flex items-center gap-2 text-sm font-medium text-zinc-600">
            <Calendar className="w-4 h-4" />
            Competência: Março 2026
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'PDF Executivo', icon: <FileText className="text-emerald-600" />, color: 'emerald' },
          { label: 'PDF Técnico', icon: <FileText className="text-blue-600" />, color: 'blue' },
          { label: 'CSV / Excel', icon: <BarChart3 className="text-amber-600" />, color: 'amber' },
          { label: 'Evidências (ZIP)', icon: <FileArchive className="text-rose-600" />, color: 'rose' },
        ].map((item, i) => (
          <button key={i} className="p-6 bg-white border border-zinc-200 rounded-2xl shadow-sm hover:border-emerald-500 hover:shadow-md transition-all text-left group">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-${item.color}-50`}>
              {item.icon}
            </div>
            <h3 className="font-bold text-zinc-900 group-hover:text-emerald-600 transition-colors">{item.label}</h3>
            <p className="text-xs text-zinc-500 mt-1">Gerar novo arquivo</p>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-900">Arquivos Gerados Recentemente</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input type="text" placeholder="Buscar arquivos..." className="pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-zinc-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="px-6 py-3">Nome do Arquivo</th>
                <th className="px-6 py-3">Categoria</th>
                <th className="px-6 py-3">Data</th>
                <th className="px-6 py-3">Tamanho</th>
                <th className="px-6 py-3">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {reports.map((report, i) => (
                <tr key={i} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-zinc-100 rounded-lg">
                        {report.type === 'PDF' ? <FileText className="w-4 h-4 text-rose-500" /> : report.type === 'ZIP' ? <FileArchive className="w-4 h-4 text-amber-500" /> : <BarChart3 className="w-4 h-4 text-emerald-500" />}
                      </div>
                      <span className="font-bold text-zinc-900">{report.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-zinc-100 text-zinc-600 rounded-lg text-[10px] font-bold uppercase">{report.category}</span>
                  </td>
                  <td className="px-6 py-4 text-zinc-500">{report.date}</td>
                  <td className="px-6 py-4 text-zinc-500">{report.size}</td>
                  <td className="px-6 py-4">
                    <button className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
