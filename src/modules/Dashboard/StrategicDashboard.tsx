import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, Users, Calendar, Filter, Search, Download, 
  ChevronDown, AlertTriangle, CheckCircle2, FileText, 
  BarChart3, PieChart as PieChartIcon, Activity, 
  ArrowUpRight, ArrowDownRight, Target, ShieldCheck,
  LayoutDashboard, History, Map, Info, MoreVertical,
  Settings, Lock, Unlock, FileArchive
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
  Legend, ComposedChart, Line, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { fetchStrategicDashboard } from '../../services/api.js';

interface StrategicDashboardProps {
  tenant: { id: string; name: string };
  role: string;
}

export const StrategicDashboardView: React.FC<StrategicDashboardProps> = ({ tenant, role }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [selectedYear, setSelectedYear] = useState(2026);
  const [compareYear, setCompareYear] = useState(2025);
  const [baselineYear, setBaselineYear] = useState(2022);
  const [activeMetric, setActiveMetric] = useState('complaints');
  const [drilldown, setDrilldown] = useState<{ type: string; title: string } | null>(null);

  const isAdmin = role === 'admin_atividade';

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const result = await fetchStrategicDashboard(tenant.id, { 
          year: selectedYear, 
          compareYear, 
          baselineYear 
        });
        setData(result);
      } catch (error) {
        console.error("Error loading strategic data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [tenant.id, selectedYear, compareYear, baselineYear]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6 pb-12">
      {/* Topbar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <LayoutDashboard className="w-6 h-6 text-emerald-500" />
              Dash Anual (Estratégico)
            </h1>
            <p className="text-sm text-slate-500">
              {tenant.name} • {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200">
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-transparent text-sm font-medium px-3 py-1.5 focus:outline-none"
              >
                <option value={2026}>2026</option>
                <option value={2025}>2025</option>
                <option value={2024}>2024</option>
              </select>
              <div className="w-px h-4 bg-slate-200" />
              <button className="text-xs font-medium px-3 py-1.5 text-slate-600 hover:bg-white rounded-lg transition-colors">
                Comparar com {compareYear}
              </button>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-400 px-2">Linha de Base:</span>
              <select 
                value={baselineYear}
                onChange={(e) => setBaselineYear(Number(e.target.value))}
                className="bg-transparent text-sm font-medium px-3 py-1.5 focus:outline-none"
              >
                <option value={2022}>2022 (Início)</option>
                <option value={2023}>2023</option>
              </select>
            </div>

            <div className="relative group">
              <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors shadow-sm shadow-emerald-200">
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">Exportar</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-2">
                <button className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Relatório Executivo (PDF)
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Relatório Técnico (PDF)
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" /> CSV / Excel
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg flex items-center gap-2">
                  <FileArchive className="w-4 h-4" /> Pacote Evidências (ZIP)
                </button>
              </div>
            </div>

            {isAdmin && (
              <div className="flex items-center gap-2">
                <button className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all" title="Configurar Metas">
                  <Target className="w-5 h-5" />
                </button>
                <button className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all" title="Fechar Ano">
                  <Lock className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Filter className="w-4 h-4" />
            <span>Filtros:</span>
          </div>
          <select className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
            <option>Todas Unidades</option>
          </select>
          <select className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
            <option>Todos Setores</option>
          </select>
          <div className="flex-1 max-w-xs relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar dados..." 
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>
      </div>

      {/* BLOCO A — Resumo Executivo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard 
          title="Participação Média"
          value={`${data.summary.participation.current}%`}
          meta={`Meta ${data.summary.participation.meta}%`}
          trend={data.summary.participation.current - data.summary.participation.previous}
          baseline={data.summary.participation.baseline}
          icon={<Users className="w-5 h-5" />}
          color="emerald"
          onClick={() => setDrilldown({ type: 'participation', title: 'Detalhamento de Participação' })}
        />
        <SummaryCard 
          title="Check-ins Anuais"
          value={data.summary.checkins.current.toLocaleString()}
          meta={`Média ${data.summary.checkins.avg_month}/mês`}
          trend={data.summary.checkins.current - data.summary.checkins.previous}
          baseline={data.summary.checkins.baseline}
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="blue"
          onClick={() => setDrilldown({ type: 'checkins', title: 'Detalhamento de Check-ins' })}
        />
        <SummaryCard 
          title="Queixas Totais"
          value={data.summary.complaints.momentary.current + data.summary.complaints.ambulatory.current}
          meta={`${data.summary.complaints.momentary.current} Mom. / ${data.summary.complaints.ambulatory.current} Amb.`}
          trend={(data.summary.complaints.momentary.current + data.summary.complaints.ambulatory.current) - (data.summary.complaints.momentary.previous + data.summary.complaints.ambulatory.previous)}
          baseline={data.summary.complaints.momentary.baseline + data.summary.complaints.ambulatory.baseline}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="amber"
          inverseTrend
          onClick={() => setDrilldown({ type: 'complaints', title: 'Detalhamento de Queixas' })}
        />
        <SummaryCard 
          title="Absenteísmo (Dias)"
          value={data.summary.absenteeism.days.current}
          meta={`<15d: ${data.summary.absenteeism.split_under_15} | >15d: ${data.summary.absenteeism.split_over_15}`}
          trend={data.summary.absenteeism.days.current - data.summary.absenteeism.days.previous}
          baseline={data.summary.absenteeism.days.baseline}
          icon={<History className="w-5 h-5" />}
          color="rose"
          inverseTrend
          onClick={() => setDrilldown({ type: 'absenteeism', title: 'Detalhamento de Absenteísmo' })}
        />
      </div>

      {/* BLOCO B — Evolução Histórica */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Linha de Base vs Atual</h3>
              <p className="text-sm text-slate-500">Comparativo mensal do ano de início ({baselineYear}) contra o ano atual ({selectedYear})</p>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button 
                onClick={() => setActiveMetric('complaints')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${activeMetric === 'complaints' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Queixas
              </button>
              <button 
                onClick={() => setActiveMetric('participation')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${activeMetric === 'participation' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Participação
              </button>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.historical.baseline_vs_current}>
                <defs>
                  <linearGradient id="colorBaseline" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="baseline" name={`Linha Base (${baselineYear})`} stroke="#94a3b8" strokeWidth={2} fillOpacity={1} fill="url(#colorBaseline)" strokeDasharray="5 5" />
                <Area type="monotone" dataKey="current" name={`Ano Atual (${selectedYear})`} stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCurrent)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Tendência 5 Anos</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data.historical.trends_5_years}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <Tooltip />
                <Bar yAxisId="left" dataKey="complaints" name="Queixas" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                <Line yAxisId="right" type="monotone" dataKey="participation" name="Participação %" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <div className="flex items-center gap-2 text-emerald-700 font-medium text-sm mb-1">
              <TrendingUp className="w-4 h-4" />
              Insight Estratégico
            </div>
            <p className="text-xs text-emerald-600 leading-relaxed">
              Redução consolidada de 43% nas queixas desde o início do contrato, com aumento de 22% na adesão aos programas.
            </p>
          </div>
        </div>
      </div>

      {/* BLOCO C — Mapas de risco e setores críticos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">Matriz de Risco Biomecânico</h3>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">Heatmap Setorial</span>
          </div>
          <div className="space-y-4">
            {data.risk_matrix.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center gap-4 group cursor-pointer">
                <div className="w-32 text-sm font-medium text-slate-600 truncate">{item.sector}</div>
                <div className="flex-1 h-8 bg-slate-100 rounded-lg overflow-hidden flex">
                  <div 
                    className={`h-full transition-all ${
                      item.risk === 'Alto' ? 'bg-rose-500 w-full' : 
                      item.risk === 'Médio' ? 'bg-amber-500 w-2/3' : 'bg-emerald-500 w-1/3'
                    }`}
                  />
                </div>
                <div className="w-24 flex items-center gap-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                    item.risk === 'Alto' ? 'text-rose-600 bg-rose-50' : 
                    item.risk === 'Médio' ? 'text-amber-600 bg-amber-50' : 'text-emerald-600 bg-emerald-50'
                  }`}>
                    {item.risk}
                  </span>
                  {item.risk !== item.previous_risk && (
                    <ArrowDownRight className="w-4 h-4 text-emerald-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50 rounded-xl border border-emerald-100 transition-all">
            Ver Detalhe por Setor
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Estrutura Corporal (YoY)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.body_structure_yoy} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis dataKey="part" type="category" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} width={80} />
                <Tooltip />
                <Legend />
                <Bar dataKey="previous" name={compareYear} fill="#cbd5e1" radius={[0, 4, 4, 0]} barSize={10} />
                <Bar dataKey="current" name={selectedYear} fill="#10b981" radius={[0, 4, 4, 0]} barSize={10} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* BLOCO D — Funil de saúde & Absenteísmo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Funil de Saúde Anual</h3>
          <div className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.health_funnel}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.health_funnel.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center">
            <p className="text-xs text-slate-500">Conversão de queixas em afastamentos reduzida em 15%</p>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">Absenteísmo por CID</h3>
            <button className="text-xs font-medium text-emerald-600 hover:underline">Ver lista de atestados</button>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.absenteeism_cid}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <Tooltip />
                <Legend />
                <Bar dataKey="F" name="CID F (Mental)" stackId="a" fill="#8b5cf6" radius={[0, 0, 0, 0]} />
                <Bar dataKey="G" name="CID G (Nervoso)" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                <Bar dataKey="I" name="CID I (Circulatório)" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* BLOCO E & F — NR1 & Admissional */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">NR1 Psicossocial</h3>
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-2xl font-bold text-slate-900">{data.summary.nr1.adhesion}%</div>
              <div className="text-xs text-slate-500">Adesão Anual</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-2xl font-bold text-rose-600">{data.summary.nr1.high_risk_sectors}</div>
              <div className="text-xs text-slate-500">Setores em Risco</div>
            </div>
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <button className="flex-1 py-2 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition-all">
                Novo Ciclo
              </button>
              <button className="flex-1 py-2 bg-white text-emerald-600 border border-emerald-200 rounded-xl text-sm font-medium hover:bg-emerald-50 transition-all">
                Gerar Relatório
              </button>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Admissional (Anual)</h3>
          <div className="flex items-center gap-8">
            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Recomendados</span>
                <span className="text-sm font-bold text-emerald-600">{data.admissionals.recommended}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: '95%' }} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Não Recomendados</span>
                <span className="text-sm font-bold text-rose-600">{data.admissionals.not_recommended}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500" style={{ width: '5%' }} />
              </div>
            </div>
            <div className="w-px h-24 bg-slate-100" />
            <div className="flex-1">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Principais Motivos</h4>
              <div className="space-y-2">
                {data.admissionals.reasons.map((r: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">{r.name}</span>
                    <span className="font-bold text-slate-900">{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BLOCO G — Plano de Ação */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Execução do Plano de Ação</h3>
            <p className="text-sm text-slate-500">Status das ações corretivas e preventivas do ano</p>
          </div>
          {isAdmin && (
            <button className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition-all">
              Criar Plano de Ação
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-200" />
                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={364.4} strokeDashoffset={364.4 * (1 - data.summary.action_plan.completed / 100)} className="text-emerald-500" />
              </svg>
              <div className="absolute text-2xl font-bold text-slate-900">{data.summary.action_plan.completed}%</div>
            </div>
            <span className="mt-4 text-sm font-medium text-slate-600">Concluído no Ano</span>
          </div>
          <div className="md:col-span-2 space-y-4">
            <div className="p-4 bg-rose-50 rounded-xl border border-rose-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-100 rounded-lg text-rose-600">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-rose-900">{data.summary.action_plan.delayed} Ações Atrasadas</div>
                  <div className="text-xs text-rose-700">Necessitam atenção imediata do Admin</div>
                </div>
              </div>
              <button className="px-3 py-1.5 bg-white text-rose-600 rounded-lg text-xs font-bold hover:bg-rose-100 transition-all">Ver Ações</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white border border-slate-100 rounded-xl">
                <div className="text-xs text-slate-400 uppercase font-bold mb-1">Ginástica</div>
                <div className="text-lg font-bold text-slate-900">12 Ações</div>
              </div>
              <div className="p-4 bg-white border border-slate-100 rounded-xl">
                <div className="text-xs text-slate-400 uppercase font-bold mb-1">Ergonomia</div>
                <div className="text-lg font-bold text-slate-900">8 Ações</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BLOCO H — Evidências */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900">Linha do Tempo de Evidências</h3>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 transition-all">Abrir Galeria</button>
            <button className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-all">Baixar Pacote Anual</button>
          </div>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex-shrink-0 w-48 group cursor-pointer">
              <div className="relative aspect-video rounded-xl overflow-hidden mb-2">
                <img 
                  src={`https://picsum.photos/seed/evid-${i}/400/225`} 
                  alt="Evidência" 
                  className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/50 backdrop-blur-md text-[10px] text-white rounded font-bold">
                  JAN 2026
                </div>
              </div>
              <div className="text-xs font-bold text-slate-900 truncate">Campanha Postura</div>
              <div className="flex gap-1 mt-1">
                <span className="text-[10px] px-1 bg-blue-50 text-blue-600 rounded">Pilar Ergo</span>
                <span className="text-[10px] px-1 bg-emerald-50 text-emerald-600 rounded">Setor Prod A</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Drilldown Modal */}
      <AnimatePresence>
        {drilldown && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrilldown(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{drilldown.title}</h2>
                  <p className="text-sm text-slate-500">Detalhamento estratégico • {selectedYear}</p>
                </div>
                <button 
                  onClick={() => setDrilldown(null)}
                  className="p-2 hover:bg-white rounded-xl transition-colors text-slate-400 hover:text-slate-600"
                >
                  <ChevronDown className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <div className="text-xs font-bold text-emerald-600 uppercase mb-1">Ano Atual</div>
                    <div className="text-2xl font-bold text-emerald-900">84.2%</div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="text-xs font-bold text-slate-500 uppercase mb-1">Ano Anterior</div>
                    <div className="text-2xl font-bold text-slate-900">78.5%</div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="text-xs font-bold text-slate-500 uppercase mb-1">Linha de Base</div>
                    <div className="text-2xl font-bold text-slate-900">62.0%</div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-2xl border border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900 mb-4">Distribuição por Unidade</h3>
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                          { name: 'Matriz', value: 88 },
                          { name: 'Filial Sul', value: 76 },
                          { name: 'Centro Logístico', value: 92 },
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} />
                          <YAxis axisLine={false} tickLine={false} />
                          <Tooltip />
                          <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-slate-100">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                        <tr>
                          <th className="px-6 py-3">Setor</th>
                          <th className="px-6 py-3">Indicador</th>
                          <th className="px-6 py-3">Status</th>
                          <th className="px-6 py-3">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {[1, 2, 3, 4].map((i) => (
                          <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-medium text-slate-900">Produção {i}</td>
                            <td className="px-6 py-4 text-slate-600">82.5%</td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold uppercase">Estável</span>
                            </td>
                            <td className="px-6 py-4">
                              <button className="text-emerald-600 font-bold hover:underline">Ver 360º</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-white rounded-xl transition-all">Fechar</button>
                <button className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-all flex items-center gap-2">
                  <Download className="w-4 h-4" /> Exportar Recorte
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface SummaryCardProps {
  title: string;
  value: string | number;
  meta: string;
  trend: number;
  baseline: number;
  icon: React.ReactNode;
  color: 'emerald' | 'blue' | 'amber' | 'rose';
  inverseTrend?: boolean;
  onClick?: () => void;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, meta, trend, baseline, icon, color, inverseTrend, onClick }) => {
  const isPositive = trend > 0;
  const isGood = inverseTrend ? !isPositive : isPositive;

  const colorClasses = {
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
    amber: 'text-amber-600 bg-amber-50 border-amber-100',
    rose: 'text-rose-600 bg-rose-50 border-rose-100',
  };

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-xl border ${colorClasses[color]}`}>
          {icon}
        </div>
        <div className="flex flex-col items-end">
          <div className={`flex items-center gap-1 text-xs font-bold ${isGood ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
          <div className="text-[10px] text-slate-400 font-medium">vs ano anterior</div>
        </div>
      </div>
      
      <div>
        <div className="text-2xl font-bold text-slate-900 mb-1">{value}</div>
        <div className="text-sm font-medium text-slate-600 mb-3">{title}</div>
      </div>

      <div className="pt-3 border-t border-slate-50 space-y-2">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-slate-400 font-medium">{meta}</span>
        </div>
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-slate-400 font-medium">Linha de Base:</span>
          <span className="text-slate-600 font-bold">{baseline}</span>
        </div>
      </div>
    </motion.div>
  );
};
