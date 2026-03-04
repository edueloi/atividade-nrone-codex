import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Calendar, Clock, Filter, Search, Download, 
  FileText, AlertTriangle, TrendingUp, BarChart3, 
  PieChart as PieChartIcon, ChevronRight, MoreVertical, 
  Trash2, CheckCircle2, X, Save, Camera, Paperclip,
  Info, ShieldAlert, Settings, ArrowRight, ArrowLeft,
  Eye, Copy, ExternalLink, History, MessageSquare,
  FileDown, Check, AlertCircle
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { StatCard } from '../../components/StatCard.js';
import { 
  fetchAbsenteeismRecords, 
  createAbsenteeismRecord, 
  updateAbsenteeismStatus, 
  deleteAbsenteeismRecord, 
  fetchAbsenteeismSummary,
  fetchUnits,
  fetchAbsenteeismRecord,
  updateAbsenteeismRecord,
  fetchAbsenteeismAttachments,
  uploadAbsenteeismAttachment,
  deleteAbsenteeismAttachment,
  fetchAbsenteeismHistory
} from '../../services/api.js';

interface AbsenteeismViewProps {
  tenant: { id: string; name: string };
  user: { id: string; name: string; role: string };
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6366f1'];

export const AbsenteeismView: React.FC<AbsenteeismViewProps> = ({ tenant, user }) => {
  const [activeSubTab, setActiveSubTab] = useState<'summary' | 'list' | 'analysis' | 'config'>('summary');
  const [records, setRecords] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [units, setUnits] = useState<any[]>([]);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    unitId: '',
    sectorId: '',
    cidGroup: '',
    range: '',
    status: ''
  });
  const [toasts, setToasts] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const addToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };
  
  // Modal State
  const [modalStep, setModalStep] = useState(1);
  const [newRecord, setNewRecord] = useState({
    unit_id: '',
    sector_id: '',
    shift_id: '',
    start_date: '',
    end_date: '',
    days_lost: 0,
    range_class: 'LT15' as 'LT15' | 'GT15',
    cid_group: 'F' as 'F' | 'G' | 'I' | 'OUTROS',
    cid_code: '',
    notes: '',
    status: user.role === 'admin_atividade' ? 'CONFIRMED' : 'PENDING'
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
      const params = { 
        tenantId: tenant.id,
        month: filters.month,
        year: filters.year,
        unitId: filters.unitId,
        sectorId: filters.sectorId,
        cidGroup: filters.cidGroup,
        range: filters.range,
        status: filters.status
      };

      if (activeSubTab === 'summary') {
        const data = await fetchAbsenteeismSummary(params);
        setSummary(data);
      } else if (activeSubTab === 'list') {
        const data = await fetchAbsenteeismRecords(params);
        setRecords(data);
      }
    } catch (error) {
      console.error('Error loading absenteeism data:', error);
      addToast('Erro ao carregar dados', 'error');
    } finally {
      setLoading(false);
    }
  };

  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 0;
    const s = new Date(start);
    const e = new Date(end);
    const diffTime = Math.abs(e.getTime() - s.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  useEffect(() => {
    const days = calculateDays(newRecord.start_date, newRecord.end_date);
    setNewRecord(prev => ({ 
      ...prev, 
      days_lost: days,
      range_class: days > 15 ? 'GT15' : 'LT15'
    }));
  }, [newRecord.start_date, newRecord.end_date]);

  const handleSave = async () => {
    try {
      if (isEditing && selectedRecordId) {
        await updateAbsenteeismRecord(selectedRecordId, {
          ...newRecord,
          updated_by: user.id
        });
        addToast('Atestado atualizado com sucesso');
      } else {
        const id = `abs-${Date.now()}`;
        await createAbsenteeismRecord({
          ...newRecord,
          id,
          tenant_id: tenant.id,
          created_by: user.id
        });
        addToast('Atestado criado com sucesso');
      }
      setShowNewModal(false);
      setModalStep(1);
      setIsEditing(false);
      loadData();
    } catch (error) {
      addToast('Erro ao salvar atestado', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAbsenteeismRecord(id, user.id);
      addToast('Atestado excluído com sucesso');
      setShowDeleteConfirm(null);
      if (showDrawer) setShowDrawer(false);
      loadData();
    } catch (error) {
      addToast('Erro ao excluir atestado', 'error');
    }
  };

  const handleConfirmStatus = async (id: string) => {
    try {
      await updateAbsenteeismStatus(id, 'CONFIRMED', user.id);
      addToast('Atestado confirmado com sucesso');
      if (showDrawer) setShowDrawer(false);
      loadData();
    } catch (error) {
      addToast('Erro ao confirmar atestado', 'error');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Absenteísmo</h1>
          <p className="text-zinc-500">Gestão e análise de atestados e afastamentos.</p>
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
            Atestados
          </button>
          <button 
            onClick={() => setActiveSubTab('analysis')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeSubTab === 'analysis' ? 'bg-emerald-600 text-white shadow-md' : 'text-zinc-500 hover:bg-zinc-50'}`}
          >
            Análises
          </button>
          {isAdmin && (
            <button 
              onClick={() => setActiveSubTab('config')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeSubTab === 'config' ? 'bg-emerald-600 text-white shadow-md' : 'text-zinc-500 hover:bg-zinc-50'}`}
            >
              Config
            </button>
          )}
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
            className="space-y-8"
          >
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-3xl border border-zinc-200 shadow-sm">
              <div className="flex items-center gap-2 px-3 py-2 bg-zinc-50 rounded-xl border border-zinc-100">
                <Calendar className="w-4 h-4 text-zinc-400" />
                <select 
                  value={filters.month}
                  onChange={(e) => setFilters({ ...filters, month: parseInt(e.target.value) })}
                  className="bg-transparent text-sm font-bold text-zinc-700 focus:outline-none"
                >
                  <option value={1}>Janeiro</option>
                  <option value={2}>Fevereiro</option>
                  <option value={3}>Março</option>
                  <option value={4}>Abril</option>
                  <option value={5}>Maio</option>
                  <option value={6}>Junho</option>
                  <option value={7}>Julho</option>
                  <option value={8}>Agosto</option>
                  <option value={9}>Setembro</option>
                  <option value={10}>Outubro</option>
                  <option value={11}>Novembro</option>
                  <option value={12}>Dezembro</option>
                </select>
                <select 
                  value={filters.year}
                  onChange={(e) => setFilters({ ...filters, year: parseInt(e.target.value) })}
                  className="bg-transparent text-sm font-bold text-zinc-700 focus:outline-none"
                >
                  <option value={2026}>2026</option>
                  <option value={2025}>2025</option>
                </select>
              </div>

              <div className="h-8 w-px bg-zinc-100 mx-2" />

              <div className="flex items-center gap-2">
                <select 
                  value={filters.unitId}
                  onChange={(e) => setFilters({ ...filters, unitId: e.target.value })}
                  className="px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-sm font-medium text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
                >
                  <option value="">Todas Unidades</option>
                  {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
                <select 
                  value={filters.cidGroup}
                  onChange={(e) => setFilters({ ...filters, cidGroup: e.target.value })}
                  className="px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-sm font-medium text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
                >
                  <option value="">Todos CIDs</option>
                  <option value="F">Grupo F (Mental)</option>
                  <option value="G">Grupo G (Nervoso)</option>
                  <option value="I">Grupo I (Circulatório)</option>
                  <option value="OUTROS">Outros</option>
                </select>
              </div>

              <button 
                onClick={loadData}
                className="ml-auto p-2.5 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 transition-all"
              >
                <TrendingUp className="w-5 h-5" />
              </button>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <StatCard label="Dias Perdidos" value={summary.totalDaysLost} trend="-12%" icon={<Clock className="text-rose-600" />} color="rose" negative />
              <StatCard label="Nº Atestados" value={summary.totalRecords} trend="+2" icon={<FileText className="text-blue-600" />} color="blue" />
              <StatCard label="% > 15 Dias" value={`${summary.over15Rate}%`} trend="-5%" icon={<ShieldAlert className="text-amber-600" />} color="amber" />
              <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm flex flex-col justify-between">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Top 3 CIDs</span>
                <div className="flex gap-2 mt-2">
                  {summary.topCIDs.map((cid: any, i: number) => (
                    <div key={i} className="px-2 py-1 bg-zinc-100 rounded-lg text-xs font-bold text-zinc-600">
                      {cid.group} ({cid.count})
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm flex flex-col justify-between">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Setor Crítico</span>
                <div className="mt-2">
                  <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-xs font-bold">
                    {summary.criticalSector}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Weekly Impact */}
              <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Impacto Semanal (Dias Perdidos)</h3>
                  <button className="p-2 hover:bg-zinc-50 rounded-xl transition-colors"><Download size={16} className="text-zinc-400" /></button>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={summary.weeklyImpact}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                      <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#a1a1aa' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#a1a1aa' }} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      <Bar 
                        dataKey="days" 
                        fill="#ef4444" 
                        radius={[4, 4, 0, 0]} 
                        onClick={() => setActiveSubTab('list')}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* CID Distribution */}
              <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-6">Distribuição por CID</h3>
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={summary.cidDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        onClick={(data) => {
                          setFilters({ ...filters, cidGroup: data.name });
                          setActiveSubTab('list');
                        }}
                        className="cursor-pointer outline-none"
                      >
                        {summary.cidDistribution.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {summary.cidDistribution.map((item: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-zinc-500">{item.name}</span>
                      <span className="font-bold text-zinc-900">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sector Ranking */}
            <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-6">Ranking de Setores (Dias Perdidos)</h3>
              <div className="space-y-4">
                {summary.sectorRanking.map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center font-bold text-xs shadow-sm">
                        {i + 1}
                      </div>
                      <span className="font-bold text-zinc-900">{item.sector}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-48 h-2 bg-zinc-200 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-500" style={{ width: `${(item.days / summary.totalDaysLost) * 100}%` }} />
                      </div>
                      <span className="text-sm font-bold text-rose-600">{item.days} dias</span>
                    </div>
                  </div>
                ))}
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
                  <input type="text" placeholder="Buscar por CID, setor..." className="w-full pl-9 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
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
                  Novo Atestado
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-50/50 border-b border-zinc-100">
                      <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Período</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Dias</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">CID</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Setor / Unidade</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Anexo</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {records.map((record) => (
                      <tr 
                        key={record.id} 
                        onClick={() => {
                          setSelectedRecordId(record.id);
                          setShowDrawer(true);
                        }}
                        className="hover:bg-zinc-50/50 transition-colors group cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold text-zinc-900">
                            {new Date(record.start_date).toLocaleDateString()} - {new Date(record.end_date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-lg text-xs font-bold ${record.range_class === 'GT15' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
                            {record.days_lost} dias
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 bg-zinc-100 rounded flex items-center justify-center text-[10px] font-bold text-zinc-600">
                              {record.cid_group}
                            </span>
                            <span className="text-sm text-zinc-500">{record.cid_code || '-'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-zinc-900">{record.sector_name}</div>
                          <div className="text-[10px] text-zinc-400 uppercase font-bold">{record.unit_name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                            record.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-600' : 
                            record.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : 'bg-zinc-50 text-zinc-400'
                          }`}>
                            {record.status === 'CONFIRMED' ? 'Confirmado' : record.status === 'PENDING' ? 'Pendente' : 'Revisão'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button className="p-2 text-zinc-400 hover:text-emerald-600 transition-colors">
                            <Paperclip className="w-4 h-4" />
                          </button>
                        </td>
                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-2">
                            <div className="relative group/menu">
                              <button className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors rounded-lg hover:bg-zinc-100">
                                <MoreVertical className="w-4 h-4" />
                              </button>
                              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-2xl shadow-2xl border border-zinc-100 py-2 z-10 hidden group-hover/menu:block">
                                <button 
                                  onClick={() => {
                                    setSelectedRecordId(record.id);
                                    setShowDrawer(true);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-zinc-600 hover:bg-zinc-50 flex items-center gap-2"
                                >
                                  <Eye className="w-4 h-4" /> Ver Detalhes
                                </button>
                                {isAdmin && (
                                  <>
                                    <button 
                                      onClick={() => {
                                        setNewRecord(record);
                                        setIsEditing(true);
                                        setSelectedRecordId(record.id);
                                        setShowNewModal(true);
                                      }}
                                      className="w-full px-4 py-2 text-left text-sm text-zinc-600 hover:bg-zinc-50 flex items-center gap-2"
                                    >
                                      <Save className="w-4 h-4" /> Editar
                                    </button>
                                    {record.status === 'PENDING' && (
                                      <button 
                                        onClick={() => handleConfirmStatus(record.id)}
                                        className="w-full px-4 py-2 text-left text-sm text-emerald-600 hover:bg-emerald-50 flex items-center gap-2"
                                      >
                                        <Check className="w-4 h-4" /> Confirmar
                                      </button>
                                    )}
                                    <button 
                                      onClick={() => setShowDeleteConfirm(record.id)}
                                      className="w-full px-4 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                                    >
                                      <Trash2 className="w-4 h-4" /> Excluir
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
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

        {activeSubTab === 'analysis' && (
          <motion.div 
            key="analysis"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-12 text-center bg-white rounded-3xl border border-zinc-200 shadow-sm"
          >
            <BarChart3 className="w-16 h-16 text-zinc-200 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-zinc-900">Análises Avançadas</h2>
            <p className="text-zinc-500 max-w-md mx-auto mt-2">
              Em breve: Drilldowns por setor, comparativos anuais e tendências preditivas de afastamento.
            </p>
          </motion.div>
        )}

        {activeSubTab === 'config' && (
          <motion.div 
            key="config"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-8"
          >
            <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
              <Settings className="text-emerald-600" />
              <div>
                <h3 className="font-bold text-emerald-900">Configurações do Módulo</h3>
                <p className="text-xs text-emerald-700">Parametrize as regras de negócio do absenteísmo.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-zinc-400" />
                  Regras de Visibilidade
                </h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl cursor-pointer hover:bg-zinc-100 transition-colors">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500" />
                    <span className="text-sm text-zinc-700">Cliente pode visualizar anexos de atestados</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl cursor-pointer hover:bg-zinc-100 transition-colors">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500" />
                    <span className="text-sm text-zinc-700">Exibir código CID completo nos relatórios</span>
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-zinc-400" />
                  Alertas e Notificações
                </h4>
                <div className="space-y-3">
                  <div className="p-3 bg-zinc-50 rounded-xl space-y-2">
                    <span className="text-xs font-bold text-zinc-500 uppercase">Gatilho de Alerta (%)</span>
                    <input type="number" defaultValue={20} className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-sm" />
                    <p className="text-[10px] text-zinc-400 italic">Notificar quando o absenteísmo subir mais que X% vs mês anterior.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Record Modal */}
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
                    <h2 className="text-2xl font-bold text-zinc-900">Novo Atestado</h2>
                    <p className="text-zinc-500 text-sm">Registro de afastamento e impacto.</p>
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
                          value={newRecord.unit_id}
                          onChange={(e) => setNewRecord({ ...newRecord, unit_id: e.target.value })}
                          className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        >
                          <option value="">Selecione...</option>
                          {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-700">Setor</label>
                        <select 
                          value={newRecord.sector_id}
                          onChange={(e) => setNewRecord({ ...newRecord, sector_id: e.target.value })}
                          className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        >
                          <option value="">Selecione...</option>
                          <option value="toyota-montagem">Montagem Cross</option>
                          <option value="toyota-logistica">Logística</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-700">Data Início</label>
                        <input 
                          type="date" 
                          value={newRecord.start_date}
                          onChange={(e) => setNewRecord({ ...newRecord, start_date: e.target.value })}
                          className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-700">Data Fim</label>
                        <input 
                          type="date" 
                          value={newRecord.end_date}
                          onChange={(e) => setNewRecord({ ...newRecord, end_date: e.target.value })}
                          className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-6 bg-zinc-50 rounded-[32px] border border-zinc-100">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                          <Calendar className="text-emerald-600" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Impacto Calculado</span>
                          <div className="text-2xl font-bold text-zinc-900">{newRecord.days_lost} dias</div>
                        </div>
                      </div>
                      <div className={`px-4 py-2 rounded-xl text-xs font-bold ${newRecord.range_class === 'GT15' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'}`}>
                        {newRecord.range_class === 'GT15' ? '> 15 Dias (INSS)' : '< 15 Dias'}
                      </div>
                    </div>

                    <button 
                      onClick={() => setModalStep(2)}
                      disabled={!newRecord.unit_id || !newRecord.sector_id || !newRecord.start_date || !newRecord.end_date}
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
                      <div className="space-y-4">
                        <label className="text-xs font-bold text-zinc-700">Grupo CID</label>
                        <div className="grid grid-cols-4 gap-3">
                          {['F', 'G', 'I', 'OUTROS'].map((g) => (
                            <button 
                              key={g}
                              onClick={() => setNewRecord({ ...newRecord, cid_group: g as any })}
                              className={`py-4 rounded-2xl border-2 font-bold text-sm transition-all ${
                                newRecord.cid_group === g ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-zinc-100 text-zinc-400 hover:border-emerald-200'
                              }`}
                            >
                              {g}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-700">Código CID (Opcional)</label>
                        <input 
                          type="text" 
                          placeholder="Ex: F32.1"
                          value={newRecord.cid_code}
                          onChange={(e) => setNewRecord({ ...newRecord, cid_code: e.target.value })}
                          className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-700">Observações</label>
                        <textarea 
                          value={newRecord.notes}
                          onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
                          className="w-full h-24 p-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-700">Anexo (Foto/PDF)</label>
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
                        {isAdmin ? 'Salvar e Confirmar' : 'Salvar como Pendente'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notifications */}
      <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border ${
                toast.type === 'success' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-rose-600 border-rose-500 text-white'
              }`}
            >
              {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span className="font-bold text-sm">{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-zinc-900/90 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-[32px] shadow-2xl p-8 text-center space-y-6"
            >
              <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                <Trash2 className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-zinc-900">Excluir Atestado?</h3>
                <p className="text-zinc-500 text-sm">Esta ação não pode ser desfeita. O registro será removido permanentemente.</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 py-4 bg-zinc-100 text-zinc-600 rounded-2xl font-bold hover:bg-zinc-200 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-100"
                >
                  Excluir
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Absenteeism Detail Drawer */}
      <AnimatePresence>
        {showDrawer && selectedRecordId && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDrawer(false)}
              className="fixed inset-0 z-40 bg-zinc-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md z-50 bg-white shadow-2xl flex flex-col"
            >
              <AbsenteeismDrawer 
                recordId={selectedRecordId} 
                onClose={() => setShowDrawer(false)}
                onEdit={(record) => {
                  setNewRecord(record);
                  setIsEditing(true);
                  setShowNewModal(true);
                  setShowDrawer(false);
                }}
                onConfirm={() => handleConfirmStatus(selectedRecordId)}
                onDelete={() => setShowDeleteConfirm(selectedRecordId)}
                isAdmin={isAdmin}
                user={user}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const AbsenteeismDrawer: React.FC<{
  recordId: string;
  onClose: () => void;
  onEdit: (record: any) => void;
  onConfirm: () => void;
  onDelete: () => void;
  isAdmin: boolean;
  user: any;
}> = ({ recordId, onClose, onEdit, onConfirm, onDelete, isAdmin, user }) => {
  const [record, setRecord] = useState<any>(null);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'attachments' | 'history'>('details');

  useEffect(() => {
    loadRecord();
  }, [recordId]);

  const loadRecord = async () => {
    setLoading(true);
    try {
      const [data, atts, hist] = await Promise.all([
        fetchAbsenteeismRecord(recordId),
        fetchAbsenteeismAttachments(recordId),
        fetchAbsenteeismHistory(recordId)
      ]);
      setRecord(data);
      setAttachments(atts);
      setHistory(hist);
    } catch (error) {
      console.error('Error loading record details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !record) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Drawer Header */}
      <div className="p-6 border-b border-zinc-100 bg-zinc-50/50">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-colors text-zinc-400">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <>
                <button 
                  onClick={() => onEdit(record)}
                  className="p-2 hover:bg-white rounded-xl transition-colors text-zinc-400 hover:text-zinc-900"
                  title="Editar"
                >
                  <Save className="w-4 h-4" />
                </button>
                {record.status === 'PENDING' && (
                  <button 
                    onClick={onConfirm}
                    className="p-2 hover:bg-white rounded-xl transition-colors text-emerald-600"
                    title="Confirmar"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button 
                  onClick={onDelete}
                  className="p-2 hover:bg-white rounded-xl transition-colors text-rose-600"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-zinc-900">Atestado #{record.id.split('-')[1]}</h2>
            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${
              record.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700' : 
              record.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-zinc-100 text-zinc-500'
            }`}>
              {record.status === 'CONFIRMED' ? 'Confirmado' : record.status === 'PENDING' ? 'Pendente' : 'Revisão'}
            </span>
          </div>
          <p className="text-sm text-zinc-500">{record.sector_name} • {record.unit_name}</p>
        </div>
      </div>

      {/* Drawer Tabs */}
      <div className="flex border-b border-zinc-100 px-6">
        {[
          { id: 'details', label: 'Detalhes', icon: <Info className="w-4 h-4" /> },
          { id: 'attachments', label: 'Anexos', icon: <Paperclip className="w-4 h-4" /> },
          { id: 'history', label: 'Histórico', icon: <History className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-4 text-sm font-bold border-b-2 transition-all ${
              activeTab === tab.id ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-zinc-400 hover:text-zinc-600'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Drawer Content */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {activeTab === 'details' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Início</span>
                <p className="text-sm font-bold text-zinc-900">{new Date(record.start_date).toLocaleDateString()}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Fim</span>
                <p className="text-sm font-bold text-zinc-900">{new Date(record.end_date).toLocaleDateString()}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Dias Perdidos</span>
                <p className="text-sm font-bold text-zinc-900">{record.days_lost} dias</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Classificação</span>
                <p className={`text-sm font-bold ${record.range_class === 'GT15' ? 'text-rose-600' : 'text-blue-600'}`}>
                  {record.range_class === 'GT15' ? '> 15 Dias (INSS)' : '< 15 Dias'}
                </p>
              </div>
            </div>

            <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">CID</span>
                <span className="px-2 py-1 bg-white rounded-lg text-xs font-bold text-zinc-600 shadow-sm">Grupo {record.cid_group}</span>
              </div>
              <p className="text-lg font-bold text-zinc-900">{record.cid_code || 'Não informado'}</p>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Observações</span>
              <p className="text-sm text-zinc-600 leading-relaxed bg-zinc-50 p-4 rounded-2xl italic">
                {record.notes || 'Nenhuma observação registrada.'}
              </p>
            </div>

            <div className="pt-6 border-t border-zinc-100">
              <button className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold text-sm hover:bg-zinc-800 transition-all flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" />
                Criar Plano de Ação
              </button>
            </div>
          </div>
        )}

        {activeTab === 'attachments' && (
          <div className="space-y-4">
            {attachments.length === 0 ? (
              <div className="p-12 text-center bg-zinc-50 rounded-3xl border border-dashed border-zinc-200">
                <Paperclip className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
                <p className="text-sm text-zinc-500 font-medium">Nenhum anexo encontrado.</p>
                <button className="mt-4 text-emerald-600 font-bold text-xs hover:underline">Fazer Upload</button>
              </div>
            ) : (
              attachments.map((att) => (
                <div key={att.id} className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100 group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <FileText className="w-5 h-5 text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-900">{att.file_name}</p>
                      <p className="text-[10px] text-zinc-400 uppercase font-bold">{new Date(att.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 hover:bg-white rounded-lg text-zinc-400 hover:text-zinc-900 transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-white rounded-lg text-zinc-400 hover:text-emerald-600 transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            {history.map((item, i) => (
              <div key={item.id} className="relative pl-6 pb-6 border-l border-zinc-100 last:pb-0">
                <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-4 border-white shadow-sm" />
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-zinc-900">
                      {item.action === 'CREATE' ? 'Registro Criado' : 
                       item.action === 'UPDATE' ? 'Dados Atualizados' : 
                       item.action === 'CONFIRM' ? 'Status Confirmado' : item.action}
                    </p>
                    <span className="text-[10px] text-zinc-400 font-bold">{new Date(item.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-zinc-500">Por {item.user_name}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
