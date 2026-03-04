import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Calendar, Search, Filter, Download, 
  FileText, CheckCircle2, AlertTriangle, XCircle, 
  ChevronRight, MoreVertical, Trash2, Save, X, 
  ArrowRight, ArrowLeft, ShieldCheck, ClipboardList,
  BarChart3, PieChart as PieChartIcon, TrendingUp, Info,
  Settings, Copy, Eye, Paperclip, Camera
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { StatCard } from '../../components/StatCard.js';
import { 
  fetchAdmissionTemplates, 
  createAdmissionTemplate, 
  fetchAdmissionEvaluations, 
  createAdmissionEvaluation, 
  fetchAdmissionSummary,
  fetchUnits
} from '../../services/api.js';

interface AdmissionalViewProps {
  tenant: { id: string; name: string };
  user: { id: string; name: string; role: string };
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6366f1'];

export const AdmissionalView: React.FC<AdmissionalViewProps> = ({ tenant, user }) => {
  const [activeSubTab, setActiveSubTab] = useState<'summary' | 'list' | 'templates' | 'reports'>('summary');
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [units, setUnits] = useState<any[]>([]);
  
  // Modal State
  const [modalStep, setModalStep] = useState(1);
  const [newEval, setNewEval] = useState({
    unit_id: '',
    sector_id: '',
    role_name: '',
    template_id: '',
    evaluation_date: new Date().toISOString().split('T')[0],
    result: 'RECOMMENDED' as 'RECOMMENDED' | 'RESTRICTED' | 'NOT_RECOMMENDED',
    reasons: [] as string[],
    scores: {} as Record<string, any>,
    notes: ''
  });

  const isAdmin = user.role === 'admin_atividade';

  useEffect(() => {
    loadData();
    loadUnits();
  }, [tenant.id, activeSubTab]);

  const loadUnits = async () => {
    const data = await fetchUnits(tenant.id);
    setUnits(data);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeSubTab === 'summary') {
        const data = await fetchAdmissionSummary(tenant.id);
        setSummary(data);
      } else if (activeSubTab === 'list') {
        const data = await fetchAdmissionEvaluations({ tenantId: tenant.id });
        setEvaluations(data);
      } else if (activeSubTab === 'templates') {
        const data = await fetchAdmissionTemplates(tenant.id);
        setTemplates(data);
      }
    } catch (error) {
      console.error('Error loading admissional data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const id = `eval-${Date.now()}`;
    await createAdmissionEvaluation({
      ...newEval,
      id,
      tenant_id: tenant.id,
      created_by: user.id,
      reasons_json: newEval.reasons,
      scores_json: newEval.scores
    });
    setShowNewModal(false);
    setModalStep(1);
    loadData();
  };

  const getResultBadge = (result: string) => {
    switch (result) {
      case 'RECOMMENDED':
        return <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold uppercase">Recomendado</span>;
      case 'RESTRICTED':
        return <span className="px-2 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-bold uppercase">Restrição</span>;
      case 'NOT_RECOMMENDED':
        return <span className="px-2 py-1 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-bold uppercase">Não Recomendado</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Admissional</h1>
          <p className="text-zinc-500">Avaliação cinesiofuncional e aptidão física.</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-zinc-200 shadow-sm">
          <button 
            onClick={() => setActiveSubTab('summary')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeSubTab === 'summary' ? 'bg-emerald-600 text-white shadow-md' : 'text-zinc-500 hover:bg-zinc-50'}`}
          >
            Resumo
          </button>
          <button 
            onClick={() => setActiveSubTab('list')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeSubTab === 'list' ? 'bg-emerald-600 text-white shadow-md' : 'text-zinc-500 hover:bg-zinc-50'}`}
          >
            Avaliações
          </button>
          <button 
            onClick={() => setActiveSubTab('templates')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeSubTab === 'templates' ? 'bg-emerald-600 text-white shadow-md' : 'text-zinc-500 hover:bg-zinc-50'}`}
          >
            Templates
          </button>
          <button 
            onClick={() => setActiveSubTab('reports')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeSubTab === 'reports' ? 'bg-emerald-600 text-white shadow-md' : 'text-zinc-500 hover:bg-zinc-50'}`}
          >
            Relatórios
          </button>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeSubTab === 'summary' && summary && (
          <motion.div 
            key="summary"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total Avaliações" value={summary.totalEvaluations} trend="+12" icon={<ClipboardList className="text-blue-600" />} color="blue" />
              <StatCard label="% Recomendados" value={`${summary.recommendedRate}%`} trend="+2%" icon={<CheckCircle2 className="text-emerald-600" />} color="emerald" />
              <StatCard label="% Com Restrição" value={`${summary.restrictedRate}%`} trend="-1%" icon={<AlertTriangle className="text-amber-600" />} color="amber" />
              <StatCard label="% Não Recomendados" value={`${summary.notRecommendedRate}%`} trend="-1%" icon={<XCircle className="text-rose-600" />} color="rose" negative />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Result Distribution */}
              <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-6">Aptidão Geral</h3>
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={summary.resultDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {summary.resultDistribution.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Monthly Trend */}
              <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-6">Tendência de Não Recomendados (%)</h3>
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={summary.monthlyTrend}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#a1a1aa' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#a1a1aa' }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="rate" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Frequent Reasons */}
              <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-6">Motivos de Restrição/Veto</h3>
                <div className="space-y-4">
                  {summary.frequentReasons.map((item: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl">
                      <span className="text-sm font-bold text-zinc-900">{item.reason}</span>
                      <span className="px-3 py-1 bg-white rounded-lg text-xs font-bold text-zinc-600 shadow-sm">{item.count} casos</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Critical Roles */}
              <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-6">Funções Críticas (Vetos)</h3>
                <div className="space-y-4">
                  {summary.topCriticalRoles.map((item: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-rose-50 rounded-2xl border border-rose-100">
                      <span className="text-sm font-bold text-rose-900">{item.role}</span>
                      <span className="px-3 py-1 bg-white rounded-lg text-xs font-bold text-rose-600 shadow-sm">{item.count} vetos</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeSubTab === 'list' && (
          <motion.div 
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Filters & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-[300px]">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input type="text" placeholder="Buscar por função, setor..." className="w-full pl-9 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                </div>
                <button className="p-2.5 bg-white border border-zinc-200 rounded-xl text-zinc-400 hover:text-zinc-900 transition-colors">
                  <Filter className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button className="px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm font-bold text-zinc-600 flex items-center gap-2 hover:bg-zinc-50">
                  <Download className="w-4 h-4" />
                  Exportar
                </button>
                <button 
                  onClick={() => setShowNewModal(true)}
                  className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-emerald-700 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Nova Avaliação
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-50/50 border-b border-zinc-100">
                      <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Data</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Função</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Unidade / Setor</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Resultado</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Motivo Principal</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {evaluations.map((item) => (
                      <tr key={item.id} className="hover:bg-zinc-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold text-zinc-900">{new Date(item.evaluation_date).toLocaleDateString()}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-zinc-900">{item.role_name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-zinc-500">{item.sector_name}</div>
                          <div className="text-[10px] text-zinc-400 uppercase font-bold">{item.unit_name}</div>
                        </td>
                        <td className="px-6 py-4">
                          {getResultBadge(item.result)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs text-zinc-500">{item.reasons_json?.[0] || '-'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                            {isAdmin && (
                              <button className="p-2 text-zinc-400 hover:text-rose-600 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeSubTab === 'templates' && (
          <motion.div 
            key="templates"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-zinc-900">Templates de Avaliação</h2>
              <button className="px-4 py-2 bg-zinc-900 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-zinc-800">
                <Plus className="w-4 h-4" />
                Novo Template
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((tpl) => (
                <div key={tpl.id} className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm hover:border-emerald-500/50 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                      <ShieldCheck className="text-zinc-400 group-hover:text-emerald-600" />
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 text-zinc-400 hover:text-zinc-900"><Copy size={16} /></button>
                      <button className="p-2 text-zinc-400 hover:text-zinc-900"><Settings size={16} /></button>
                    </div>
                  </div>
                  <h3 className="font-bold text-zinc-900 mb-1">{tpl.role_name}</h3>
                  <p className="text-xs text-zinc-500 mb-4">{tpl.fields_json.length} testes configurados</p>
                  <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">v{tpl.version}</span>
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold uppercase">Publicado</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeSubTab === 'reports' && (
          <motion.div 
            key="reports"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-6">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                <BarChart3 size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-zinc-900">Relatório Executivo</h3>
                <p className="text-zinc-500 text-sm mt-2">Visão macro com gráficos e indicadores agregados para diretoria.</p>
              </div>
              <button className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all">
                <Download size={20} />
                Gerar PDF Executivo
              </button>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-6">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                <FileText size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-zinc-900">Relatório Técnico</h3>
                <p className="text-zinc-500 text-sm mt-2">Detalhamento por função, motivos de veto e scores de testes.</p>
              </div>
              <button className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all">
                <Download size={20} />
                Gerar PDF Técnico
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Evaluation Modal */}
      <AnimatePresence>
        {showNewModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-zinc-900/90 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
                    <Plus className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-zinc-900">Nova Avaliação</h2>
                    <p className="text-zinc-500 text-sm">Registro cinesiofuncional admissional.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowNewModal(false)}
                  className="p-3 hover:bg-zinc-100 rounded-2xl transition-colors text-zinc-400"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {/* Steps */}
                <div className="flex items-center justify-center gap-4 mb-12">
                  {[1, 2].map((s) => (
                    <React.Fragment key={s}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                        modalStep === s ? 'bg-emerald-600 text-white scale-110 shadow-lg shadow-emerald-200' : 
                        modalStep > s ? 'bg-emerald-100 text-emerald-600' : 'bg-zinc-100 text-zinc-400'
                      }`}>
                        {modalStep > s ? <CheckCircle2 className="w-5 h-5" /> : s}
                      </div>
                      {s < 2 && <div className={`w-12 h-0.5 rounded-full ${modalStep > s ? 'bg-emerald-600' : 'bg-zinc-100'}`} />}
                    </React.Fragment>
                  ))}
                </div>

                {modalStep === 1 && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-700">Unidade</label>
                        <select 
                          value={newEval.unit_id}
                          onChange={(e) => setNewEval({ ...newEval, unit_id: e.target.value })}
                          className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        >
                          <option value="">Selecione...</option>
                          {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-700">Setor</label>
                        <select 
                          value={newEval.sector_id}
                          onChange={(e) => setNewEval({ ...newEval, sector_id: e.target.value })}
                          className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        >
                          <option value="">Selecione...</option>
                          <option value="toyota-montagem">Montagem Cross</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-700">Função / Cargo</label>
                      <select 
                        value={newEval.template_id}
                        onChange={(e) => {
                          const tpl = templates.find(t => t.id === e.target.value);
                          setNewEval({ ...newEval, template_id: e.target.value, role_name: tpl?.role_name || '' });
                        }}
                        className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      >
                        <option value="">Selecione a função...</option>
                        {templates.map(t => <option key={t.id} value={t.id}>{t.role_name}</option>)}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-700">Data da Avaliação</label>
                      <input 
                        type="date" 
                        value={newEval.evaluation_date}
                        onChange={(e) => setNewEval({ ...newEval, evaluation_date: e.target.value })}
                        className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>

                    <button 
                      onClick={() => setModalStep(2)}
                      disabled={!newEval.unit_id || !newEval.sector_id || !newEval.template_id}
                      className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-lg hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      Próximo Passo
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </motion.div>
                )}

                {modalStep === 2 && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-8"
                  >
                    <div className="space-y-6">
                      <div className="p-6 bg-zinc-50 rounded-[32px] border border-zinc-100">
                        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Testes do Template</h4>
                        <div className="space-y-4">
                          {templates.find(t => t.id === newEval.template_id)?.fields_json.map((field: any) => (
                            <div key={field.name} className="space-y-2">
                              <label className="text-sm font-bold text-zinc-700">{field.label}</label>
                              {field.type === 'number' ? (
                                <input 
                                  type="number" 
                                  placeholder="Score / Valor"
                                  className="w-full p-3 bg-white border border-zinc-200 rounded-xl text-sm"
                                  onChange={(e) => setNewEval({ ...newEval, scores: { ...newEval.scores, [field.name]: e.target.value }})}
                                />
                              ) : (
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => setNewEval({ ...newEval, scores: { ...newEval.scores, [field.name]: true }})}
                                    className={`flex-1 py-2 rounded-xl border-2 font-bold text-xs ${newEval.scores[field.name] === true ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-zinc-100 text-zinc-400'}`}
                                  >
                                    Sim
                                  </button>
                                  <button 
                                    onClick={() => setNewEval({ ...newEval, scores: { ...newEval.scores, [field.name]: false }})}
                                    className={`flex-1 py-2 rounded-xl border-2 font-bold text-xs ${newEval.scores[field.name] === false ? 'border-rose-600 bg-rose-50 text-rose-700' : 'border-zinc-100 text-zinc-400'}`}
                                  >
                                    Não
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-xs font-bold text-zinc-700">Resultado Final</label>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { id: 'RECOMMENDED', label: 'Recomendado', color: 'emerald' },
                            { id: 'RESTRICTED', label: 'Restrição', color: 'amber' },
                            { id: 'NOT_RECOMMENDED', label: 'Não Recomendado', color: 'rose' }
                          ].map((r) => (
                            <button 
                              key={r.id}
                              onClick={() => setNewEval({ ...newEval, result: r.id as any })}
                              className={`py-4 rounded-2xl border-2 font-bold text-[10px] uppercase transition-all ${
                                newEval.result === r.id ? `border-${r.color}-600 bg-${r.color}-50 text-${r.color}-700` : 'border-zinc-100 text-zinc-400'
                              }`}
                            >
                              {r.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {(newEval.result === 'RESTRICTED' || newEval.result === 'NOT_RECOMMENDED') && (
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-zinc-700">Motivos (Selecione pelo menos um)</label>
                          <div className="flex flex-wrap gap-2">
                            {['Dor lombar', 'Lesão ombro', 'Limitação mobilidade', 'Histórico cirurgia'].map((reason) => (
                              <button 
                                key={reason}
                                onClick={() => {
                                  const exists = newEval.reasons.includes(reason);
                                  setNewEval({ 
                                    ...newEval, 
                                    reasons: exists ? newEval.reasons.filter(r => r !== reason) : [...newEval.reasons, reason] 
                                  });
                                }}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                                  newEval.reasons.includes(reason) ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                                }`}
                              >
                                {reason}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-700">Anexo (Laudo/Foto)</label>
                        <div className="p-8 border-2 border-dashed border-zinc-200 rounded-3xl flex flex-col items-center justify-center gap-3 text-zinc-400 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600 transition-all cursor-pointer group">
                          <Camera className="w-8 h-8 group-hover:scale-110 transition-transform" />
                          <span className="text-xs font-bold uppercase tracking-wider">Clique para anexar</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button 
                        onClick={() => setModalStep(1)}
                        className="flex-1 py-4 bg-zinc-100 text-zinc-600 rounded-2xl font-bold hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
                      >
                        <ArrowLeft className="w-5 h-5" />
                        Voltar
                      </button>
                      <button 
                        onClick={handleSave}
                        className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-bold text-lg hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all flex items-center justify-center gap-2"
                      >
                        <Save className="w-5 h-5" />
                        Salvar Avaliação
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
