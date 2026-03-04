import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertTriangle,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  Filter,
  MoreVertical,
  Play,
  Plus,
  Save,
  Search,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  cancelClassSession,
  copySchedulesWeek,
  createSchedule,
  createScheduleException,
  deleteClassSession,
  deleteSchedule,
  fetchAttendanceSummary,
  fetchBelowTarget,
  fetchSchedules,
  fetchTodayClasses,
  finishClassSession,
  launchAdhocClass,
  saveAttendance,
  startClassSession,
  updateSchedule,
} from '../../services/api.js';

interface GymViewProps {
  tenant: { id: string; name: string };
  user: { id: string; name: string; role: string };
}

export const GymView: React.FC<GymViewProps> = ({ tenant, user }) => {
  const isAdmin = user.role === 'admin_atividade';
  const [activeSubTab, setActiveSubTab] = useState<'today' | 'calendar' | 'reports'>('today');
  const [classes, setClasses] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [selectedClass, setSelectedClass] = useState<any | null>(null);
  const [executingClass, setExecutingClass] = useState<any | null>(null);
  const [execStep, setExecStep] = useState(1);
  const [counts, setCounts] = useState({ expected: 0, present: 0 });
  const [notes, setNotes] = useState('');

  const [showFilters, setShowFilters] = useState(false);
  const [showAdhocModal, setShowAdhocModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any | null>(null);
  const [showScheduleDetail, setShowScheduleDetail] = useState<any | null>(null);

  const [filters, setFilters] = useState({ search: '', status: '', mineOnly: false });
  const [adhocForm, setAdhocForm] = useState({ unitId: 'toyota-sorocaba', sectorId: 'toyota-montagem', shiftId: 'toyota-t1', duration: 10 });
  const [scheduleForm, setScheduleForm] = useState({
    sector_id: 'toyota-montagem',
    shift_id: 'toyota-t1',
    day_of_week: 1,
    start_time: '10:00',
    duration_minutes: 10,
    type: 'pausa ativa',
  });

  const [reportDetail, setReportDetail] = useState<string>('');
  const [belowTarget, setBelowTarget] = useState<any[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeSubTab === 'today') {
        const data = await fetchTodayClasses(tenant.id, user.id);
        setClasses(data);
      }
      if (activeSubTab === 'calendar') {
        const data = await fetchSchedules(tenant.id);
        setSchedules(data);
      }
      if (activeSubTab === 'reports') {
        const [s, b] = await Promise.all([
          fetchAttendanceSummary(tenant.id, 2026),
          fetchBelowTarget(tenant.id, '2026-03', 80),
        ]);
        setSummary(s);
        setBelowTarget(b);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeSubTab, tenant.id]);

  const filteredClasses = useMemo(() => {
    return classes.filter((c) => {
      if (filters.status && c.status !== filters.status) return false;
      if (filters.search && !`${c.sector_name} ${c.shift_name}`.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
  }, [classes, filters]);

  const handleStartClass = async (cls: any) => {
    const result = await startClassSession(cls.id);
    setExecutingClass({ ...cls, id: result.classId || cls.id, status: 'running' });
    setCounts({ expected: cls.expected_count || 20, present: cls.present_count || 0 });
    setExecStep(1);
    loadData();
  };

  const handleLaunchAdhoc = async () => {
    const payload = {
      tenantId: tenant.id,
      scheduleId: null,
      unitId: adhocForm.unitId,
      sectorId: adhocForm.sectorId,
      shiftId: adhocForm.shiftId,
      duration: adhocForm.duration,
      plannedStart: new Date().toISOString(),
      instructorId: user.id,
    };
    const created = await launchAdhocClass(payload);
    setExecutingClass({ ...payload, id: created.classId, sector_name: 'Montagem Cross', shift_name: 'Turno 1', status: 'running' });
    setCounts({ expected: 20, present: 0 });
    setExecStep(1);
    setShowAdhocModal(false);
    loadData();
  };

  const handleSaveAttendance = async () => {
    await saveAttendance(executingClass.id, {
      expectedCount: counts.expected,
      presentCount: counts.present,
      method: 'count',
    });
    setExecStep(3);
  };

  const handleFinishClass = async () => {
    await finishClassSession(executingClass.id, notes);
    setExecutingClass(null);
    setNotes('');
    loadData();
  };

  const handleSaveSchedule = async () => {
    if (editingSchedule) {
      await updateSchedule(editingSchedule.id, scheduleForm);
    } else {
      await createSchedule({
        id: `sch-${Date.now()}`,
        tenant_id: tenant.id,
        unit_id: 'toyota-sorocaba',
        assigned_user_id: user.id,
        recurrence_rule: 'weekly',
        ...scheduleForm,
      });
    }
    setShowScheduleModal(false);
    setEditingSchedule(null);
    loadData();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Aula + Presença</h1>
          <p className="text-zinc-500">Planejamento gera esperado, execução confirma realizado.</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-zinc-200">
          {['today', 'calendar', 'reports'].map((t) => (
            <button key={t} onClick={() => setActiveSubTab(t as any)} className={`px-4 py-2 rounded-xl text-sm font-bold ${activeSubTab === t ? 'bg-emerald-600 text-white' : 'text-zinc-500'}`}>
              {t === 'today' ? 'Hoje' : t === 'calendar' ? 'Calendário' : 'Relatórios'}
            </button>
          ))}
        </div>
      </div>

      {activeSubTab === 'today' && (
        <div className="space-y-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input className="w-full pl-9 pr-3 py-2 border rounded-xl" placeholder="Buscar setor/turno" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
            </div>
            <button onClick={() => setShowFilters(true)} className="px-4 py-2 border rounded-xl font-bold text-sm flex items-center gap-2"><Filter className="w-4 h-4" />Filtros</button>
            <button onClick={() => setShowAdhocModal(true)} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold flex items-center gap-2"><Plus className="w-4 h-4" />Lançar Avulsa</button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredClasses.map((cls) => (
              <div key={cls.id} className="bg-white p-5 rounded-2xl border border-zinc-200 space-y-4">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-bold text-zinc-900">{cls.sector_name}</h3>
                    <p className="text-xs text-zinc-500">{cls.shift_name} • {cls.duration_minutes} min</p>
                    <p className="text-xs text-zinc-500">Prof. {cls.instructor_name}</p>
                  </div>
                  <span className="text-xs font-bold uppercase">{cls.ui_status || cls.status}</span>
                </div>
                {!!cls.present_count && <div className="text-xs text-zinc-600">Presentes/Previstos: {cls.present_count}/{cls.expected_count}</div>}
                <div className="flex gap-2">
                  {cls.status === 'planned' && <button onClick={() => handleStartClass(cls)} className="flex-1 bg-emerald-600 text-white rounded-xl py-2 text-sm font-bold flex items-center justify-center gap-1"><Play className="w-4 h-4" />Iniciar</button>}
                  {cls.status !== 'planned' && <button onClick={() => setExecutingClass(cls)} className="flex-1 bg-zinc-100 rounded-xl py-2 text-sm font-bold">Ver</button>}
                  <button onClick={() => setSelectedClass(cls)} className="p-2 border rounded-xl"><MoreVertical className="w-4 h-4" /></button>
                  {isAdmin && <button onClick={async () => { await deleteClassSession(cls.id, user.id); loadData(); }} className="p-2 border rounded-xl text-rose-600"><Trash2 className="w-4 h-4" /></button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'calendar' && (
        <div className="bg-white p-6 rounded-3xl border border-zinc-200 space-y-6">
          <div className="flex justify-between">
            <h2 className="font-bold text-xl">Planejamento</h2>
            <div className="flex gap-2">
              <button onClick={async () => { await copySchedulesWeek({ tenantId: tenant.id, options: { copyInstructor: true } }); loadData(); }} className="px-4 py-2 bg-zinc-100 rounded-xl text-sm font-bold flex items-center gap-2"><Copy className="w-4 h-4" />Copiar Semana</button>
              <button onClick={() => { setEditingSchedule(null); setShowScheduleModal(true); }} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold flex items-center gap-2"><Plus className="w-4 h-4" />Nova Recorrência</button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((d, idx) => (
              <div key={d} className="space-y-2">
                <div className="text-center text-xs font-bold">{d}</div>
                <div className="min-h-[220px] bg-zinc-50 rounded-xl p-2 space-y-2">
                  {schedules.filter((s) => s.day_of_week === (idx + 1) % 7).map((s) => (
                    <button key={s.id} onClick={() => setShowScheduleDetail(s)} className="w-full text-left bg-white border rounded-lg p-2 text-xs">
                      <div className="font-bold">{s.start_time} • {s.sector_name}</div>
                      <div>{s.shift_name} • {s.duration_minutes} min</div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'reports' && summary && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { t: 'Participação média', v: '84.2%' },
              { t: 'Check-ins realizados', v: '1,245' },
              { t: 'Aulas canceladas', v: '12' },
              { t: 'Setores atendidos', v: '18/20' },
            ].map((c) => (
              <button key={c.t} onClick={() => setReportDetail(c.t)} className="bg-white p-5 border rounded-2xl text-left">
                <div className="text-xs uppercase text-zinc-500">{c.t}</div>
                <div className="text-2xl font-bold">{c.v}</div>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border">
              <div className="flex justify-between mb-3"><h3 className="font-bold flex items-center gap-2"><BarChart3 className="w-4 h-4" />Participação Mensal</h3><button className="text-zinc-500"><Download className="w-4 h-4" /></button></div>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={summary.participationByMonth} onClick={(state: any) => state?.activePayload && setReportDetail(`Mês: ${state.activePayload[0].payload.month}`)}>
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line dataKey="rate" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border">
              <h3 className="font-bold mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4" />Ranking Abaixo da Meta</h3>
              <div className="space-y-2">
                {belowTarget.map((r: any, i: number) => (
                  <button key={i} onClick={() => setReportDetail(`Setor: ${r.sector}`)} className="w-full flex justify-between bg-zinc-50 rounded-xl p-3">
                    <span>{r.sector}</span><span className="font-bold text-rose-600">{Number(r.rate).toFixed(1)}%</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showFilters && (
          <motion.div className="fixed inset-0 bg-zinc-900/40 flex justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="w-full max-w-sm bg-white p-6 space-y-4">
              <div className="flex justify-between"><h3 className="font-bold">Filtros</h3><button onClick={() => setShowFilters(false)}><X className="w-4 h-4" /></button></div>
              <select className="w-full border rounded-xl p-3" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                <option value="">Todos status</option><option value="planned">Planejada</option><option value="running">Em andamento</option><option value="finished">Concluída</option><option value="canceled">Cancelada</option>
              </select>
              <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={filters.mineOnly} onChange={(e) => setFilters({ ...filters, mineOnly: e.target.checked })} /> Apenas minhas aulas</label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAdhocModal && (
          <motion.div className="fixed inset-0 bg-zinc-900/50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="bg-white w-full max-w-md rounded-2xl p-6 space-y-4">
              <div className="flex justify-between"><h3 className="font-bold text-lg">Lançar Aula Avulsa</h3><button onClick={() => setShowAdhocModal(false)}><X className="w-4 h-4" /></button></div>
              <select className="w-full border rounded-xl p-3" value={adhocForm.duration} onChange={(e) => setAdhocForm({ ...adhocForm, duration: Number(e.target.value) })}>
                <option value={5}>5 min</option><option value={10}>10 min</option><option value={15}>15 min</option>
              </select>
              <div className="flex gap-2">
                <button onClick={handleLaunchAdhoc} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold">Criar e Iniciar</button>
                <button onClick={() => setShowAdhocModal(false)} className="flex-1 py-3 bg-zinc-100 rounded-xl font-bold">Cancelar</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {executingClass && (
          <motion.div className="fixed inset-0 z-50 bg-zinc-900/70 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="bg-white w-full h-full rounded-2xl p-6 overflow-auto max-w-4xl mx-auto">
              <div className="flex justify-between mb-6"><h3 className="font-bold text-xl">Execução da Aula</h3><button onClick={() => setExecutingClass(null)}><X className="w-5 h-5" /></button></div>
              {execStep === 1 && <div className="space-y-4"><p>{executingClass.sector_name || 'Setor'} • {executingClass.shift_name || 'Turno'}</p><button onClick={() => setExecStep(2)} className="px-4 py-2 bg-emerald-600 text-white rounded-xl">Ir para Presença</button></div>}
              {execStep === 2 && <div className="space-y-4 max-w-md"><div className="grid grid-cols-2 gap-3"><input type="number" value={counts.expected} onChange={(e) => setCounts({ ...counts, expected: Number(e.target.value) })} className="border rounded-xl p-3" /><div className="border rounded-xl p-3 text-center text-2xl font-bold">{counts.present}</div></div><div className="grid grid-cols-3 gap-2"><button onClick={() => setCounts({ ...counts, present: Math.max(0, counts.present - 1) })} className="py-2 rounded-xl bg-zinc-100">-1</button><button onClick={() => setCounts({ ...counts, present: counts.present + 1 })} className="py-2 rounded-xl bg-zinc-100">+1</button><button onClick={() => setCounts({ ...counts, present: counts.present + 5 })} className="py-2 rounded-xl bg-zinc-100">+5</button></div><button onClick={handleSaveAttendance} className="w-full py-3 bg-zinc-900 text-white rounded-xl font-bold flex items-center justify-center gap-2"><Save className="w-4 h-4" />Salvar Presença</button></div>}
              {execStep === 3 && <div className="space-y-4 max-w-md"><textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full border rounded-xl p-3 h-28" placeholder="Observações" /><button onClick={handleFinishClass} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2"><CheckCircle2 className="w-4 h-4" />Concluir Aula</button></div>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedClass && (
          <motion.div className="fixed inset-0 bg-zinc-900/40 flex justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="w-full max-w-md bg-white p-6 space-y-3">
              <div className="flex justify-between"><h3 className="font-bold">Detalhe da Aula</h3><button onClick={() => setSelectedClass(null)}><X className="w-4 h-4" /></button></div>
              <div className="text-sm">{selectedClass.sector_name} • {selectedClass.shift_name}</div>
              <button onClick={async () => { await cancelClassSession(selectedClass.id, 'Cancelada manualmente', user.id); setSelectedClass(null); loadData(); }} className="w-full py-2 border rounded-xl text-left px-3">Cancelar aula</button>
              <button className="w-full py-2 border rounded-xl text-left px-3">Adicionar evidência</button>
              <button className="w-full py-2 border rounded-xl text-left px-3">Duplicar como avulsa</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showScheduleModal && (
          <motion.div className="fixed inset-0 bg-zinc-900/50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="bg-white w-full max-w-md rounded-2xl p-6 space-y-4">
              <div className="flex justify-between"><h3 className="font-bold">{editingSchedule ? 'Editar' : 'Nova'} Recorrência</h3><button onClick={() => setShowScheduleModal(false)}><X className="w-4 h-4" /></button></div>
              <input type="time" className="w-full border rounded-xl p-3" value={scheduleForm.start_time} onChange={(e) => setScheduleForm({ ...scheduleForm, start_time: e.target.value })} />
              <select className="w-full border rounded-xl p-3" value={scheduleForm.duration_minutes} onChange={(e) => setScheduleForm({ ...scheduleForm, duration_minutes: Number(e.target.value) })}><option value={5}>5 min</option><option value={10}>10 min</option><option value={15}>15 min</option></select>
              <button onClick={handleSaveSchedule} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold">Salvar Recorrência</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showScheduleDetail && (
          <motion.div className="fixed inset-0 bg-zinc-900/40 flex justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="w-full max-w-md bg-white p-6 space-y-3">
              <div className="flex justify-between"><h3 className="font-bold">Detalhe Aula Planejada</h3><button onClick={() => setShowScheduleDetail(null)}><X className="w-4 h-4" /></button></div>
              <div className="text-sm">{showScheduleDetail.sector_name} • {showScheduleDetail.start_time}</div>
              <button onClick={() => { setEditingSchedule(showScheduleDetail); setScheduleForm(showScheduleDetail); setShowScheduleModal(true); }} className="w-full py-2 border rounded-xl text-left px-3">Editar</button>
              <button onClick={async () => { await createScheduleException(showScheduleDetail.id, { date: new Date().toISOString().slice(0, 10), reason: 'Parada', createdBy: user.id }); setShowScheduleDetail(null); }} className="w-full py-2 border rounded-xl text-left px-3">Cancelar ocorrência</button>
              <button onClick={async () => { await deleteSchedule(showScheduleDetail.id); setShowScheduleDetail(null); loadData(); }} className="w-full py-2 border rounded-xl text-left px-3 text-rose-600">Excluir recorrência</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {reportDetail && <div className="bg-white p-4 rounded-xl border text-sm">Detalhe: {reportDetail}</div>}
      {loading && <div className="text-sm text-zinc-500">Carregando...</div>}
    </div>
  );
};
