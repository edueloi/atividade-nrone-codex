import React from 'react';
import { motion } from 'motion/react';
import { 
  Users, ClipboardCheck, AlertCircle, Stethoscope, 
  Activity, BrainCircuit, Clock, FileDown, 
  MoreVertical, Lock, Unlock, AlertTriangle, History
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Legend 
} from 'recharts';
import { StatCard } from '../../components/StatCard.js';

const mockBarData = [
  { name: 'Ombros', value: 42 },
  { name: 'Lombar', value: 28 },
  { name: 'Pescoço', value: 15 },
  { name: 'Punhos', value: 10 },
  { name: 'Outros', value: 5 },
];

const mockLineData = [
  { name: 'Jan', value: 45, base: 60 },
  { name: 'Fev', value: 52, base: 58 },
  { name: 'Mar', value: 48, base: 55 },
  { name: 'Abr', value: 61, base: 53 },
  { name: 'Mai', value: 55, base: 50 },
  { name: 'Jun', value: 67, base: 48 },
];

export function MonthlyDashboardView() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      {/* Top Bar Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-zinc-200 shadow-sm">
         <div className="flex items-center gap-3">
            <div className="flex bg-zinc-100 p-1 rounded-xl">
               <button className="px-3 py-1.5 bg-white shadow-sm rounded-lg text-xs font-bold text-zinc-900">Mensal</button>
               <button className="px-3 py-1.5 rounded-lg text-xs font-bold text-zinc-500 hover:text-zinc-900">Estratégico</button>
            </div>
            <select className="bg-zinc-50 border-none text-xs font-bold rounded-xl px-3 py-2 outline-none cursor-pointer hover:bg-zinc-100">
               <option>Março / 2026</option>
               <option>Fevereiro / 2026</option>
            </select>
         </div>
         <div className="flex items-center gap-2">
            <button className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors"><FileDown size={18} /></button>
            <div className="h-6 w-px bg-zinc-200 mx-2" />
            <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all">
               <Lock size={14} />
               Fechar Mês
            </button>
         </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        <StatCard label="Participação" value="84.2%" trend="+2.4%" icon={<Users size={20} className="text-emerald-600" />} color="emerald" subValue="Meta: 80%" />
        <StatCard label="Check-ins" value="1,240" trend="+12%" icon={<ClipboardCheck size={20} className="text-blue-600" />} color="blue" />
        <StatCard label="Queixas Mom." value="12" trend="-4" icon={<AlertCircle size={20} className="text-amber-600" />} color="amber" negative />
        <StatCard label="Queixas Amb." value="08" trend="+2" icon={<Stethoscope size={20} className="text-red-600" />} color="red" />
        <StatCard label="Reabilitados" value="76" trend="+5" icon={<Activity size={20} className="text-emerald-600" />} color="emerald" />
        <StatCard label="Adesão NR1" value="92%" trend="+8%" icon={<BrainCircuit size={20} className="text-indigo-600" />} color="indigo" />
        <StatCard label="Plano Ação" value="15/18" trend="83%" icon={<History size={20} className="text-zinc-600" />} color="zinc" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Participation Chart */}
        <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Participação por Semana</h3>
            <div className="flex gap-4">
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">Realizado</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-zinc-200" />
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">Meta</span>
               </div>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={mockLineData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#a1a1aa'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#a1a1aa'}} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                <Area type="monotone" dataKey="base" stroke="#e2e8f0" strokeWidth={2} strokeDasharray="5 5" fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Body Parts Chart */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-6">Queixas por Estrutura</h3>
          <div className="space-y-4">
            {mockBarData.map((item, idx) => (
              <div key={idx} className="group cursor-pointer">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-bold text-zinc-600">{item.name}</span>
                  <span className="font-bold text-zinc-900">{item.value}%</span>
                </div>
                <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${item.value}%` }}
                    className={`h-full rounded-full transition-all ${idx === 0 ? 'bg-emerald-500' : 'bg-zinc-300 group-hover:bg-zinc-400'}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Complaints by Sector Chart */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-6">Queixas por Setor (Top 10)</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart layout="vertical" data={[
                { name: 'Montagem', value: 32, trend: '+5%' },
                { name: 'Logística', value: 24, trend: '-2%' },
                { name: 'Pintura', value: 18, trend: '+1%' },
                { name: 'Planta A', value: 12, trend: '0%' },
                { name: 'Almoxarifado', value: 8, trend: '-4%' },
              ]}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f4f4f5" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#a1a1aa'}} width={80} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Funnel Chart */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-6">Funil Preventivo</h3>
          <div className="flex flex-col items-center justify-center h-[250px] relative">
              <div className="w-full space-y-2">
                 <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-center">
                    <p className="text-[10px] font-bold text-emerald-600 uppercase">Queixas Momentâneas</p>
                    <p className="text-xl font-bold">84</p>
                 </div>
                 <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-zinc-200 mx-auto" />
                 <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl text-center">
                    <p className="text-[10px] font-bold text-amber-600 uppercase">Queixas Ambulatoriais</p>
                    <p className="text-xl font-bold">12</p>
                 </div>
                 <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-zinc-200 mx-auto" />
                 <div className="bg-red-50 border border-red-100 p-3 rounded-xl text-center">
                    <p className="text-[10px] font-bold text-red-600 uppercase">Afastamentos</p>
                    <p className="text-xl font-bold">02</p>
                 </div>
              </div>
          </div>
        </div>

        {/* Absenteeism by CID */}
        <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Absenteísmo por Grupo CID</h3>
              <div className="flex gap-3">
                 <button className="px-3 py-1 bg-zinc-100 rounded-lg text-[10px] font-bold text-zinc-600">{"< 15 dias"}</button>
                 <button className="px-3 py-1 bg-zinc-900 rounded-lg text-[10px] font-bold text-white">{"> 15 dias"}</button>
              </div>
           </div>
           <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                 <BarChart data={[
                    { name: 'Grupo F (Mental)', value: 18, prev: 12 },
                    { name: 'Grupo G (Nervoso)', value: 12, prev: 15 },
                    { name: 'Grupo I (Circulatório)', value: 8, prev: 6 },
                    { name: 'Outros', value: 4, prev: 10 },
                 ]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#a1a1aa'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#a1a1aa'}} />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="value" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={40} />
                    <Bar dataKey="prev" fill="#e2e8f0" radius={[4, 4, 0, 0]} barSize={40} />
                 </BarChart>
              </ResponsiveContainer>
           </div>
        </div>
      </div>

      {/* Operation Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Pending Launches */}
        <div className="xl:col-span-2 bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
             <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Pendências de Lançamento (Até dia 10)</h3>
             <span className="px-2 py-1 bg-amber-50 text-amber-600 text-[10px] font-bold rounded uppercase">8 Pendentes</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                  <th className="px-6 py-4">Profissional</th>
                  <th className="px-6 py-4">Unidade / Setor</th>
                  <th className="px-6 py-4">O que falta</th>
                  <th className="px-6 py-4">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                <tr className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4">
                     <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-zinc-100" />
                        <span className="text-xs font-bold">Ricardo Prof</span>
                     </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-zinc-500">Toyota / Montagem</td>
                  <td className="px-6 py-4">
                     <div className="flex gap-1">
                        <span className="px-1.5 py-0.5 bg-red-50 text-red-600 text-[9px] font-bold rounded">Presença</span>
                        <span className="px-1.5 py-0.5 bg-red-50 text-red-600 text-[9px] font-bold rounded">Queixas</span>
                     </div>
                  </td>
                  <td className="px-6 py-4">
                     <button className="text-emerald-600 text-[10px] font-bold uppercase hover:underline">Cobrar</button>
                  </td>
                </tr>
                <tr className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4">
                     <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-zinc-100" />
                        <span className="text-xs font-bold">Ana Fisio</span>
                     </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-zinc-500">Pilon / Planta A</td>
                  <td className="px-6 py-4">
                     <div className="flex gap-1">
                        <span className="px-1.5 py-0.5 bg-red-50 text-red-600 text-[9px] font-bold rounded">Evolução</span>
                     </div>
                  </td>
                  <td className="px-6 py-4">
                     <button className="text-emerald-600 text-[10px] font-bold uppercase hover:underline">Cobrar</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Alert Sectors */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
           <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-6">Setores em Alerta</h3>
           <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl">
                 <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-red-700">Montagem Cross</span>
                    <AlertTriangle size={16} className="text-red-500" />
                 </div>
                 <p className="text-[10px] text-red-600 font-medium mb-3">Participação 64% (Meta 80%) + 4 Queixas novas</p>
                 <button className="w-full py-2 bg-white text-red-600 text-[10px] font-bold uppercase rounded-lg border border-red-200 hover:bg-red-50 transition-all">Criar Plano de Ação</button>
              </div>
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                 <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-amber-700">Logística</span>
                    <AlertTriangle size={16} className="text-amber-500" />
                 </div>
                 <p className="text-[10px] text-amber-600 font-medium mb-3">Pico de absenteísmo (Grupo F) nos últimos 7 dias</p>
                 <button className="w-full py-2 bg-white text-amber-600 text-[10px] font-bold uppercase rounded-lg border border-amber-200 hover:bg-amber-50 transition-all">Criar Plano de Ação</button>
              </div>
           </div>
        </div>

        {/* Latest Launches */}
        <div className="xl:col-span-3 bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
             <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Últimos Lançamentos</h3>
             <button className="text-emerald-600 text-[10px] font-bold uppercase hover:underline">Ver Todos</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                  <th className="px-6 py-4">Data/Hora</th>
                  <th className="px-6 py-4">Tipo</th>
                  <th className="px-6 py-4">Setor</th>
                  <th className="px-6 py-4">Autor</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {[
                  { date: '03/03 14:20', type: 'Aula + Presença', sector: 'Montagem', author: 'Ricardo P.', status: 'OK' },
                  { date: '03/03 11:45', type: 'Queixa Mom.', sector: 'Logística', author: 'Ana F.', status: 'Pendente' },
                  { date: '03/03 09:15', type: 'Fisioterapia', sector: 'Planta A', author: 'Ana F.', status: 'OK' },
                  { date: '02/03 16:30', type: 'Atestado', sector: 'Montagem', author: 'Ivane C.', status: 'OK' },
                ].map((item, i) => (
                  <tr key={i} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4 text-xs font-medium text-zinc-500">{item.date}</td>
                    <td className="px-6 py-4">
                       <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                         item.type === 'Aula + Presença' ? 'bg-emerald-50 text-emerald-600' :
                         item.type === 'Queixa Mom.' ? 'bg-amber-50 text-amber-600' :
                         item.type === 'Fisioterapia' ? 'bg-blue-50 text-blue-600' :
                         'bg-purple-50 text-purple-600'
                       }`}>
                         {item.type}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-500">{item.sector}</td>
                    <td className="px-6 py-4 text-xs font-bold">{item.author}</td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'OK' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          <span className="text-[10px] font-bold text-zinc-600 uppercase">{item.status}</span>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
