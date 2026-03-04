import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, Clock, Users, CheckCircle2, 
  Play, Plus, Filter, Search, Download,
  ChevronRight, ArrowLeft, Camera, MessageSquare,
  QrCode, ListChecks, Hash, X, Save, AlertTriangle,
  TrendingUp, BarChart3, MoreVertical, Copy, Trash2
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, LineChart, Line, Legend
} from 'recharts';
import { fetchTodayClasses, startClassSession, saveAttendance, finishClassSession, fetchSchedules, fetchAttendanceSummary } from '../../services/api.js';

interface GymViewProps {
  tenant: { id: string; name: string };
  user: { id: string; name: string; role: string };
}

export const GymView: React.FC<GymViewProps> = ({ tenant, user }) => {
  const [activeSubTab, setActiveSubTab] = useState<'today' | 'calendar' | 'reports'>('today');
  const [classes, setClasses] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [executingClass, setExecutingClass] = useState<any | null>(null);
  const [execStep, setExecStep] = useState(1);
  const [attendanceMethod, setAttendanceMethod] = useState<'count' | 'qr' | 'list'>('count');
  const [counts, setCounts] = useState({ expected: 0, present: 0 });
  const [notes, setNotes] = useState('');
  const [summary, setSummary] = useState<any>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any | null>(null);

  const isAdmin = user.role === 'admin_atividade';

  useEffect(() => {
    loadData();
  }, [tenant.id, activeSubTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeSubTab === 'today') {
        const data = await fetchTodayClasses(tenant.id, user.id);
        setClasses(data);
      } else if (activeSubTab === 'calendar') {
        const data = await fetchSchedules(tenant.id);
        setSchedules(data);
      } else if (activeSubTab === 'reports') {
        const data = await fetchAttendanceSummary(tenant.id, 2026);
        setSummary(data);
      }
    } catch (error) {
      console.error('Error loading gym data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartClass = async (cls: any) => {
    await startClassSession(cls.id);
    setExecutingClass({ ...cls, status: 'running' });
    setCounts({ expected: cls.expected_count || 20, present: 0 });
    setExecStep(1);
  };

  const handleSaveAttendance = async () => {
    await saveAttendance(executingClass.id, {
      expectedCount: counts.expected,
      presentCount: counts.present,
      method: attendanceMethod
    });
    setExecStep(3);
  };

  const handleFinishClass = async () => {
    // If there's a photo, we'd upload it here
    // await uploadClassEvidence(executingClass.id, { ... })
    
    await finishClassSession(executingClass.id, notes);
    setExecutingClass(null);
    loadData();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Aula + Presença</h1>
          <p className="text-zinc-500">Gestão de Ginástica Laboral e participação.</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-zinc-200 shadow-sm">
          <button 
            onClick={() => setActiveSubTab('today')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeSubTab === 'today' ? 'bg-emerald-600 text-white shadow-md' : 'text-zinc-500 hover:bg-zinc-50'}`}
          >
            Hoje
          </button>
          <button 
            onClick={() => setActiveSubTab('calendar')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeSubTab === 'calendar' ? 'bg-emerald-600 text-white shadow-md' : 'text-zinc-500 hover:bg-zinc-50'}`}
          >
            Calendário
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
        {activeSubTab === 'today' && (
          <motion.div 
            key="today"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input type="text" placeholder="Buscar setor ou turno..." className="w-full pl-9 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
              </div>
              <button className="px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm font-bold text-zinc-600 flex items-center gap-2 hover:bg-zinc-50">
                <Filter className="w-4 h-4" />
                Filtros
              </button>
              <button className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-emerald-700 shadow-sm">
                <Plus className="w-4 h-4" />
                Lançar Avulsa
              </button>
            </div>

            {/* Class Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classes.map((cls) => (
                <div key={cls.id} className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm hover:border-emerald-200 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        cls.status === 'finished' ? 'bg-emerald-100 text-emerald-600' : 
                        cls.status === 'running' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-zinc-900">{cls.sector_name}</h3>
                        <p className="text-xs text-zinc-500">{cls.shift_name} • {cls.duration_minutes} min</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                      cls.status === 'finished' ? 'bg-emerald-50 text-emerald-600' : 
                      cls.status === 'running' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {cls.status === 'finished' ? 'Concluída' : cls.status === 'running' ? 'Em Andamento' : 'Planejada'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-zinc-500 mb-6">
                    <Users className="w-3.5 h-3.5" />
                    <span>Prof. {cls.instructor_name || 'Ricardo'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {cls.status === 'planned' && (
                      <button 
                        onClick={() => handleStartClass(cls)}
                        className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        Iniciar
                      </button>
                    )}
                    {cls.status === 'running' && (
                      <button 
                        onClick={() => {
                          setExecutingClass(cls);
                          setExecStep(2);
                        }}
                        className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-amber-600 transition-colors"
                      >
                        Continuar
                      </button>
                    )}
                    {cls.status === 'finished' && (
                      <button className="flex-1 py-2.5 bg-zinc-100 text-zinc-600 rounded-xl text-sm font-bold flex items-center justify-center gap-2 cursor-default">
                        <CheckCircle2 className="w-4 h-4" />
                        Concluída
                      </button>
                    )}
                    {isAdmin && (
                      <button className="p-2.5 bg-zinc-50 text-zinc-400 rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeSubTab === 'calendar' && (
          <motion.div 
            key="calendar"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h2 className="text-xl font-bold text-zinc-900">Planejamento Semanal</h2>
                <p className="text-sm text-zinc-500">Cronograma recorrente de aulas por setor e turno.</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 bg-zinc-100 text-zinc-600 rounded-xl text-sm font-bold hover:bg-zinc-200 transition-colors flex items-center gap-2">
                  <Copy className="w-4 h-4" />
                  Copiar Semana
                </button>
                {isAdmin && (
                  <button 
                    onClick={() => {
                      setEditingSchedule(null);
                      setShowScheduleModal(true);
                    }}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Nova Recorrência
                  </button>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
              {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day, idx) => {
                const daySchedules = schedules.filter(s => s.day_of_week === (idx + 1) % 7);
                return (
                  <div key={day} className="space-y-4">
                    <div className="text-center py-2 bg-zinc-50 rounded-xl text-xs font-bold text-zinc-500 uppercase tracking-wider">
                      {day}
                    </div>
                    <div className="min-h-[400px] bg-zinc-50/50 rounded-2xl border border-dashed border-zinc-200 p-2 space-y-2">
                      {daySchedules.map((s) => (
                        <div 
                          key={s.id} 
                          onClick={() => {
                            if (isAdmin) {
                              setEditingSchedule(s);
                              setShowScheduleModal(true);
                            }
                          }}
                          className="p-3 bg-white border border-zinc-200 rounded-xl shadow-sm text-[10px] cursor-pointer hover:border-emerald-500 transition-colors group relative"
                        >
                          <div className="font-bold text-zinc-900">{s.start_time} - {s.sector_name}</div>
                          <div className="text-zinc-500 mt-0.5">{s.shift_name} • {s.duration_minutes} min</div>
                          {isAdmin && (
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreVertical className="w-3 h-3 text-zinc-400" />
                            </div>
                          )}
                        </div>
                      ))}
                      {daySchedules.length === 0 && (
                        <div className="h-full flex items-center justify-center text-[10px] text-zinc-400 text-center px-4">
                          Sem aulas
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {activeSubTab === 'reports' && summary && (
          <motion.div 
            key="reports"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Participação Média</div>
                <div className="text-2xl font-bold text-zinc-900">84.2%</div>
                <div className="text-[10px] text-emerald-600 font-bold mt-1">+2.4% vs mês ant.</div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Check-ins Realizados</div>
                <div className="text-2xl font-bold text-zinc-900">1,245</div>
                <div className="text-[10px] text-zinc-400 font-bold mt-1">Meta: 1,500</div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Aulas Canceladas</div>
                <div className="text-2xl font-bold text-rose-600">12</div>
                <div className="text-[10px] text-zinc-400 font-bold mt-1">Motivo: Feriado/Parada</div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Setores Atendidos</div>
                <div className="text-2xl font-bold text-zinc-900">18/20</div>
                <div className="text-[10px] text-amber-600 font-bold mt-1">2 pendentes</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                    Participação Mensal (%)
                  </h3>
                  <button className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={summary.participationByMonth}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} domain={[0, 100]} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Line type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    Ranking Abaixo da Meta (80%)
                  </h3>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Mês Atual</span>
                </div>
                <div className="space-y-4">
                  {summary.rankingBelowGoal.map((item: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-rose-100 text-rose-600 rounded-lg flex items-center justify-center font-bold text-xs">
                          {i + 1}
                        </div>
                        <span className="font-bold text-zinc-900">{item.sector}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2 bg-zinc-200 rounded-full overflow-hidden">
                          <div className="h-full bg-rose-500" style={{ width: `${item.rate}%` }} />
                        </div>
                        <span className="text-sm font-bold text-rose-600">{item.rate}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                <h3 className="font-bold text-zinc-900">Detalhamento por Setor</h3>
                <button className="text-xs font-bold text-emerald-600 hover:underline">Ver todos</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-50/50">
                      <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Setor</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Planejadas</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Realizadas</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Participação</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {[
                      { sector: 'Montagem Cross', planned: 44, actual: 42, rate: 95, status: 'ok' },
                      { sector: 'Logística', planned: 22, actual: 18, rate: 72, status: 'warning' },
                      { sector: 'Pintura', planned: 22, actual: 22, rate: 100, status: 'ok' },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-bold text-zinc-900">{row.sector}</td>
                        <td className="px-6 py-4 text-sm text-zinc-600">{row.planned}</td>
                        <td className="px-6 py-4 text-sm text-zinc-600">{row.actual}</td>
                        <td className="px-6 py-4">
                          <span className={`text-sm font-bold ${row.rate < 80 ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {row.rate}%
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                            row.status === 'ok' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            {row.status === 'ok' ? 'Meta Atingida' : 'Abaixo da Meta'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Execution Modal */}
      <AnimatePresence>
        {executingClass && (
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
              className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-8 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
                    <Play className="w-6 h-6 fill-current" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-zinc-900">Modo Execução</h2>
                    <p className="text-zinc-500 text-sm">{executingClass.sector_name} • {executingClass.shift_name}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setExecutingClass(null)}
                  className="p-3 hover:bg-zinc-100 rounded-2xl transition-colors text-zinc-400"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {/* Steps Indicator */}
                <div className="flex items-center justify-center gap-4 mb-12">
                  {[1, 2, 3].map((s) => (
                    <React.Fragment key={s}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                        execStep === s ? 'bg-emerald-600 text-white scale-110 shadow-lg shadow-emerald-200' : 
                        execStep > s ? 'bg-emerald-100 text-emerald-600' : 'bg-zinc-100 text-zinc-400'
                      }`}>
                        {execStep > s ? <CheckCircle2 className="w-5 h-5" /> : s}
                      </div>
                      {s < 3 && <div className={`w-12 h-0.5 rounded-full ${execStep > s ? 'bg-emerald-600' : 'bg-zinc-100'}`} />}
                    </React.Fragment>
                  ))}
                </div>

                {execStep === 1 && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="max-w-md mx-auto space-y-8 text-center"
                  >
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-zinc-900">Confirmar Aula</h3>
                      <p className="text-zinc-500">Verifique os detalhes antes de começar o check-in.</p>
                    </div>
                    <div className="bg-zinc-50 p-6 rounded-3xl border border-zinc-100 text-left space-y-4">
                      <div className="flex justify-between py-2 border-b border-zinc-200/50">
                        <span className="text-zinc-500 text-sm">Unidade</span>
                        <span className="font-bold text-zinc-900">{executingClass.unit_name}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-zinc-200/50">
                        <span className="text-zinc-500 text-sm">Setor</span>
                        <span className="font-bold text-zinc-900">{executingClass.sector_name}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-zinc-200/50">
                        <span className="text-zinc-500 text-sm">Turno</span>
                        <span className="font-bold text-zinc-900">{executingClass.shift_name}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-zinc-500 text-sm">Duração</span>
                        <span className="font-bold text-zinc-900">{executingClass.duration_minutes} min</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setExecStep(2)}
                      className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-lg hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all active:scale-[0.98]"
                    >
                      Começar Check-in
                    </button>
                  </motion.div>
                )}

                {execStep === 2 && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-8"
                  >
                    <div className="text-center space-y-2">
                      <h3 className="text-2xl font-bold text-zinc-900">Registro de Presença</h3>
                      <p className="text-zinc-500">Escolha o método mais rápido para este momento.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { id: 'count', label: 'Contagem Rápida', icon: <Hash className="w-6 h-6" /> },
                        { id: 'qr', label: 'QR Code', icon: <QrCode className="w-6 h-6" /> },
                        { id: 'list', label: 'Lista de Nomes', icon: <ListChecks className="w-6 h-6" /> },
                      ].map((method) => (
                        <button 
                          key={method.id}
                          onClick={() => setAttendanceMethod(method.id as any)}
                          className={`p-6 rounded-3xl border-2 transition-all text-center space-y-3 ${
                            attendanceMethod === method.id ? 'border-emerald-600 bg-emerald-50/50' : 'border-zinc-100 hover:border-emerald-200'
                          }`}
                        >
                          <div className={`w-12 h-12 mx-auto rounded-2xl flex items-center justify-center ${
                            attendanceMethod === method.id ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-zinc-100 text-zinc-500'
                          }`}>
                            {method.icon}
                          </div>
                          <span className={`block font-bold text-sm ${attendanceMethod === method.id ? 'text-emerald-900' : 'text-zinc-600'}`}>
                            {method.label}
                          </span>
                        </button>
                      ))}
                    </div>

                    {attendanceMethod === 'count' && (
                      <div className="max-w-md mx-auto bg-white p-8 rounded-[32px] border border-zinc-200 shadow-xl shadow-zinc-100 space-y-8">
                        <div className="grid grid-cols-2 gap-8">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Previstos</label>
                            <input 
                              type="number" 
                              value={counts.expected}
                              onChange={(e) => setCounts({ ...counts, expected: parseInt(e.target.value) || 0 })}
                              className="w-full text-3xl font-bold text-zinc-900 bg-zinc-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-emerald-500/20"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Presentes</label>
                            <div className="text-4xl font-black text-emerald-600 bg-emerald-50 rounded-2xl p-4 text-center">
                              {counts.present}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <button 
                            onClick={() => setCounts({ ...counts, present: Math.max(0, counts.present - 1) })}
                            className="py-4 bg-zinc-100 text-zinc-600 rounded-2xl font-bold hover:bg-zinc-200 transition-colors"
                          >
                            -1
                          </button>
                          <button 
                            onClick={() => setCounts({ ...counts, present: counts.present + 1 })}
                            className="py-4 bg-emerald-100 text-emerald-600 rounded-2xl font-bold hover:bg-emerald-200 transition-colors"
                          >
                            +1
                          </button>
                          <button 
                            onClick={() => setCounts({ ...counts, present: counts.present + 5 })}
                            className="py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-100"
                          >
                            +5
                          </button>
                        </div>

                        <button 
                          onClick={handleSaveAttendance}
                          className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold text-lg hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
                        >
                          <Save className="w-5 h-5" />
                          Salvar Presença
                        </button>
                      </div>
                    )}

                    {attendanceMethod !== 'count' && (
                      <div className="p-12 text-center bg-zinc-50 rounded-[32px] border border-dashed border-zinc-200">
                        <div className="w-20 h-20 bg-zinc-200 rounded-full flex items-center justify-center mx-auto mb-4">
                          <AlertTriangle className="w-10 h-10 text-zinc-400" />
                        </div>
                        <h4 className="text-lg font-bold text-zinc-900">Método em Desenvolvimento</h4>
                        <p className="text-zinc-500 text-sm mt-2">Por enquanto, utilize a Contagem Rápida para agilizar o processo.</p>
                        <button 
                          onClick={() => setAttendanceMethod('count')}
                          className="mt-6 text-emerald-600 font-bold hover:underline"
                        >
                          Voltar para Contagem
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}

                {execStep === 3 && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="max-w-md mx-auto space-y-8"
                  >
                    <div className="text-center space-y-2">
                      <h3 className="text-2xl font-bold text-zinc-900">Finalizar Aula</h3>
                      <p className="text-zinc-500">Adicione observações e evidências se necessário.</p>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-zinc-700">Observações</label>
                        <textarea 
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Ex: Grupo muito participativo, foco em alongamento de punhos..."
                          className="w-full h-32 p-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-zinc-700">Foto Evidência (Opcional)</label>
                        <div className="grid grid-cols-2 gap-4">
                          <button className="aspect-square bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-zinc-400 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600 transition-all group">
                            <Camera className="w-8 h-8 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-bold uppercase">Tirar Foto</span>
                          </button>
                          <div className="aspect-square bg-zinc-100 rounded-2xl flex items-center justify-center text-zinc-300">
                            <CheckCircle2 className="w-12 h-12" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={handleFinishClass}
                      className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-bold text-xl hover:bg-emerald-700 shadow-2xl shadow-emerald-100 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                    >
                      <CheckCircle2 className="w-6 h-6" />
                      CONCLUIR AULA
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Schedule Modal */}
      <AnimatePresence>
        {showScheduleModal && (
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
              className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                <h2 className="text-2xl font-bold text-zinc-900">
                  {editingSchedule ? 'Editar Aula' : 'Nova Recorrência'}
                </h2>
                <button 
                  onClick={() => setShowScheduleModal(false)}
                  className="p-3 hover:bg-zinc-100 rounded-2xl transition-colors text-zinc-400"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-700">Setor</label>
                  <select className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                    <option>Selecione o setor...</option>
                    <option>Montagem Cross</option>
                    <option>Logística</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-700">Dia da Semana</label>
                    <select className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                      <option value="1">Segunda</option>
                      <option value="2">Terça</option>
                      <option value="3">Quarta</option>
                      <option value="4">Quinta</option>
                      <option value="5">Sexta</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-700">Horário</label>
                    <input type="time" className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-700">Duração (minutos)</label>
                  <div className="flex gap-2">
                    {[5, 10, 15].map(d => (
                      <button key={d} className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm ${d === 15 ? 'border-emerald-600 bg-emerald-50 text-emerald-600' : 'border-zinc-100 text-zinc-400'}`}>
                        {d} min
                      </button>
                    ))}
                  </div>
                </div>
                <button className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-lg hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all flex items-center justify-center gap-2">
                  <Save className="w-5 h-5" />
                  Salvar Cronograma
                </button>
                {editingSchedule && (
                  <button className="w-full py-3 text-rose-600 font-bold text-sm hover:bg-rose-50 rounded-xl transition-all">
                    Excluir Recorrência
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
