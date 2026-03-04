import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertTriangle, CheckCircle2, Download, Eye, FileText, Filter, MoreVertical, Plus, Search, Settings, ShieldCheck, Upload, X, XCircle } from 'lucide-react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  createAdmissionEvaluation,
  createAdmissionTemplate,
  deleteAdmissionEvaluation,
  disableAdmissionTemplate,
  duplicateAdmissionTemplate,
  fetchAdmissionAttachments,
  fetchAdmissionEvaluations,
  fetchAdmissionReportHistory,
  fetchAdmissionReportJob,
  fetchAdmissionSummary,
  fetchAdmissionTemplates,
  fetchPublishedAdmissionTemplate,
  fetchUnits,
  generateAdmissionReport,
  publishAdmissionTemplate,
  updateAdmissionEvaluation,
  updateAdmissionTemplate,
  uploadAdmissionAttachment,
} from '../../services/api.js';

interface AdmissionalViewProps {
  tenant: { id: string; name: string };
  user: { id: string; name: string; role: string };
}

export const AdmissionalView: React.FC<AdmissionalViewProps> = ({ tenant, user }) => {
  const isAdmin = user.role === 'admin_atividade';
  const [activeSubTab, setActiveSubTab] = useState<'summary' | 'list' | 'templates' | 'reports'>('summary');
  const [summary, setSummary] = useState<any>(null);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [reportHistory, setReportHistory] = useState<any[]>([]);

  const [filters, setFilters] = useState({ search: '', from: '', to: '', result: '', reason: '', role: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [showEvalModal, setShowEvalModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportJobStatus, setReportJobStatus] = useState<any>(null);

  const [selectedEvaluation, setSelectedEvaluation] = useState<any | null>(null);
  const [selectedAttachments, setSelectedAttachments] = useState<any[]>([]);
  const [editingEvaluation, setEditingEvaluation] = useState<any | null>(null);

  const [editingTemplate, setEditingTemplate] = useState<any | null>(null);
  const [templateForm, setTemplateForm] = useState<any>({
    role_name: 'Operador de Empilhadeira',
    fields_json: [
      { id: 'flexibility', label: 'Flexibilidade', type: 'number', required: true, group: 'Avaliação física' },
      { id: 'strength', label: 'Força', type: 'number', required: true, group: 'Avaliação física' },
      { id: 'pain', label: 'Dor lombar', type: 'checkbox', required: false, group: 'Dor' },
    ],
    rules_json: { note: 'Se flexibilidade < 4 sugerir restrição.' },
    reasons_json: ['Dor lombar', 'Lesão ombro', 'Limitação mobilidade'],
  });

  const [evalStep, setEvalStep] = useState(1);
  const [newEval, setNewEval] = useState<any>({
    unit_id: 'toyota-sorocaba',
    sector_id: 'toyota-montagem',
    role_name: 'Operador de Empilhadeira',
    template_id: '',
    evaluation_date: new Date().toISOString().slice(0, 10),
    result: 'RECOMMENDED',
    reasons: [],
    answers: {},
    notes: '',
  });

  const [reportConfig, setReportConfig] = useState({ type: 'EXEC', from: '', to: '', includeCharts: true, hideSensitive: false });

  const loadData = async () => {
    if (activeSubTab === 'summary') setSummary(await fetchAdmissionSummary(tenant.id));
    if (activeSubTab === 'list') setEvaluations(await fetchAdmissionEvaluations({ tenantId: tenant.id, ...filters }));
    if (activeSubTab === 'templates') setTemplates(await fetchAdmissionTemplates(tenant.id));
    if (activeSubTab === 'reports') setReportHistory(await fetchAdmissionReportHistory(tenant.id));
  };

  useEffect(() => { fetchUnits(tenant.id).then(setUnits); }, [tenant.id]);
  useEffect(() => { loadData(); }, [tenant.id, activeSubTab]);

  const filteredEvaluations = useMemo(() => {
    return evaluations.filter((e) => {
      if (filters.search && !`${e.role_name} ${e.sector_name}`.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
  }, [evaluations, filters.search]);

  const goToListWithFilters = (next: any) => {
    setFilters((prev) => ({ ...prev, ...next }));
    setActiveSubTab('list');
    setTimeout(() => loadData(), 0);
  };

  const onRoleChange = async (role: string) => {
    const tpl = await fetchPublishedAdmissionTemplate(tenant.id, role);
    setNewEval((prev: any) => ({ ...prev, role_name: role, template_id: tpl?.id || '', answers: {} }));
  };

  const saveEvaluation = async () => {
    if ((newEval.result === 'RESTRICTED' || newEval.result === 'NOT_RECOMMENDED') && newEval.reasons.length === 0) return;

    const payload = {
      id: editingEvaluation?.id || `eval-${Date.now()}`,
      tenant_id: tenant.id,
      unit_id: newEval.unit_id,
      sector_id: newEval.sector_id,
      role_name: newEval.role_name,
      template_id: newEval.template_id,
      evaluation_date: newEval.evaluation_date,
      result: newEval.result,
      reasons_json: newEval.reasons,
      answers_json: newEval.answers,
      notes: newEval.notes,
      created_by: user.id,
    };

    if (editingEvaluation) {
      await updateAdmissionEvaluation(editingEvaluation.id, payload);
    } else {
      await createAdmissionEvaluation(payload);
    }

    setShowEvalModal(false);
    setEditingEvaluation(null);
    setEvalStep(1);
    if (activeSubTab !== 'list') setActiveSubTab('list');
    loadData();
  };

  const openEvaluationDetail = async (item: any) => {
    setSelectedEvaluation(item);
    setSelectedAttachments(await fetchAdmissionAttachments(item.id));
  };

  const saveTemplate = async () => {
    if (editingTemplate) {
      await updateAdmissionTemplate(editingTemplate.id, templateForm);
    } else {
      await createAdmissionTemplate({ id: `tpl-${Date.now()}`, tenant_id: tenant.id, created_by: user.id, ...templateForm });
    }
    setShowTemplateModal(false);
    setEditingTemplate(null);
    loadData();
  };

  const generateReport = async () => {
    setReportJobStatus({ status: 'RUNNING' });
    const job = await generateAdmissionReport({ tenantId: tenant.id, type: reportConfig.type, params: reportConfig, createdBy: user.id });
    const result = await fetchAdmissionReportJob(job.jobId);
    setReportJobStatus(result);
    setShowReportModal(false);
    setActiveSubTab('reports');
    loadData();
  };

  const activeTemplate = templates.find((t) => t.id === newEval.template_id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Admissional</h1>
          <p className="text-zinc-500">Template publicado → Avaliação criada → Resultado/Regras → Dash/Relatório.</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 border rounded-2xl">
          {[
            ['summary', 'Resumo'],
            ['list', 'Avaliações'],
            ['templates', 'Templates'],
            ['reports', 'Relatórios'],
          ].map(([k, l]) => (
            <button key={k} onClick={() => setActiveSubTab(k as any)} className={`px-4 py-2 rounded-xl text-sm font-bold ${activeSubTab === k ? 'bg-emerald-600 text-white' : 'text-zinc-500'}`}>{l}</button>
          ))}
        </div>
      </div>

      {activeSubTab === 'summary' && summary && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button onClick={() => goToListWithFilters({ result: 'RECOMMENDED' })} className="bg-white border rounded-2xl p-5 text-left"><div className="text-xs uppercase text-zinc-500">Recomendados</div><div className="text-3xl font-bold text-emerald-600">{summary.recommendedRate}%</div></button>
            <button onClick={() => goToListWithFilters({ result: 'RESTRICTED' })} className="bg-white border rounded-2xl p-5 text-left"><div className="text-xs uppercase text-zinc-500">Restrição</div><div className="text-3xl font-bold text-amber-600">{summary.restrictedRate}%</div></button>
            <button onClick={() => goToListWithFilters({ result: 'NOT_RECOMMENDED' })} className="bg-white border rounded-2xl p-5 text-left"><div className="text-xs uppercase text-zinc-500">Não recomendado</div><div className="text-3xl font-bold text-rose-600">{summary.notRecommendedRate}%</div></button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border rounded-2xl p-6">
              <h3 className="font-bold mb-3">Tendência de não recomendados</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={summary.monthlyTrend} onClick={(state: any) => state?.activePayload && goToListWithFilters({ from: `2026-${String(state.activePayload[0].payload.month).padStart(2, '0')}-01` })}>
                    <XAxis dataKey="month" /><YAxis /><Tooltip /><Line dataKey="rate" stroke="#ef4444" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-white border rounded-2xl p-5">
                <h4 className="font-bold mb-3">Motivos de restrição/veto</h4>
                <div className="space-y-2">{summary.frequentReasons.map((r: any) => <button key={r.reason} onClick={() => goToListWithFilters({ reason: r.reason })} className="w-full flex justify-between bg-zinc-50 rounded-xl px-3 py-2"><span>{r.reason}</span><span>{r.count}</span></button>)}</div>
              </div>
              <div className="bg-white border rounded-2xl p-5">
                <h4 className="font-bold mb-3">Funções críticas (vetos)</h4>
                <div className="space-y-2">{summary.topCriticalRoles.map((r: any) => <button key={r.role} onClick={() => goToListWithFilters({ role: r.role, result: 'NOT_RECOMMENDED' })} className="w-full flex justify-between bg-rose-50 rounded-xl px-3 py-2"><span>{r.role}</span><span>{r.count}</span></button>)}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'list' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[240px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" /><input className="w-full border rounded-xl py-2 pl-9 pr-3" placeholder="Buscar por função, setor..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} /></div>
            <button onClick={() => setShowFilters(true)} className="px-4 py-2 border rounded-xl font-bold text-sm flex items-center gap-2"><Filter className="w-4 h-4" />Filtros</button>
            <button onClick={() => setShowReportModal(true)} className="px-4 py-2 border rounded-xl font-bold text-sm flex items-center gap-2"><Download className="w-4 h-4" />Exportar</button>
            <button onClick={() => { setEditingEvaluation(null); setShowEvalModal(true); }} className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm flex items-center gap-2"><Plus className="w-4 h-4" />Nova Avaliação</button>
          </div>

          <div className="bg-white border rounded-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-zinc-50 text-xs uppercase text-zinc-500"><tr><th className="px-4 py-3">Data</th><th>Função</th><th>Unidade/Setor</th><th>Resultado</th><th>Motivo</th><th>Template</th><th>Anexo</th><th>Ações</th></tr></thead>
              <tbody>{filteredEvaluations.map((e) => (
                <tr key={e.id} className="border-t hover:bg-zinc-50 cursor-pointer" onClick={() => openEvaluationDetail(e)}>
                  <td className="px-4 py-3">{e.evaluation_date}</td>
                  <td>{e.role_name}</td><td>{e.unit_name} / {e.sector_name}</td>
                  <td>{e.result === 'RECOMMENDED' ? <span className="text-emerald-600 font-bold">Recomendado</span> : e.result === 'RESTRICTED' ? <span className="text-amber-600 font-bold">Restrição</span> : <span className="text-rose-600 font-bold">Não recomendado</span>}</td>
                  <td>{e.reasons_json?.[0] || '-'}</td><td>v{e.template_version || '-'}</td><td>{e.attachment_count ? '📎' : '-'}</td>
                  <td><button onClick={(ev) => { ev.stopPropagation(); setSelectedEvaluation(e); }} className="p-1"><MoreVertical className="w-4 h-4" /></button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'templates' && (
        <div className="space-y-4">
          <div className="flex justify-between"><h2 className="font-bold text-xl">Templates</h2><button onClick={() => { setEditingTemplate(null); setShowTemplateModal(true); }} className="px-4 py-2 bg-zinc-900 text-white rounded-xl text-sm font-bold flex items-center gap-2"><Plus className="w-4 h-4" />Novo Template</button></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((t) => (
              <div key={t.id} className="bg-white border rounded-2xl p-5 space-y-3">
                <div className="flex justify-between"><ShieldCheck className="w-5 h-5 text-zinc-400" /><span className="text-xs uppercase font-bold">{t.status}</span></div>
                <div className="font-bold">{t.role_name}</div><div className="text-xs text-zinc-500">Versão {t.version} • {t.fields_json.length} campos</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button onClick={() => { setEditingTemplate(t); setTemplateForm(t); setShowTemplateModal(true); }} className="border rounded-lg py-2">Editar</button>
                  <button onClick={async () => { await duplicateAdmissionTemplate(t.id); loadData(); }} className="border rounded-lg py-2">Duplicar</button>
                  <button onClick={async () => { await publishAdmissionTemplate(t.id); loadData(); }} className="border rounded-lg py-2">Publicar</button>
                  <button onClick={async () => { await disableAdmissionTemplate(t.id); loadData(); }} className="border rounded-lg py-2 text-rose-600">Desativar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'reports' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button onClick={() => { setReportConfig({ ...reportConfig, type: 'EXEC' }); setShowReportModal(true); }} className="bg-white border rounded-2xl p-6 text-left"><FileText className="w-8 h-8 mb-2" /><div className="font-bold">Gerar PDF Executivo</div></button>
            <button onClick={() => { setReportConfig({ ...reportConfig, type: 'TECH' }); setShowReportModal(true); }} className="bg-white border rounded-2xl p-6 text-left"><Download className="w-8 h-8 mb-2" /><div className="font-bold">Gerar PDF Técnico</div></button>
          </div>
          {reportJobStatus && <div className="bg-white border rounded-xl p-4 text-sm">Status último job: <b>{reportJobStatus.status}</b> {reportJobStatus.file_url && <a className="text-emerald-600 ml-2" href={reportJobStatus.file_url}>Baixar PDF</a>}</div>}
          <div className="bg-white border rounded-2xl p-4">
            <h3 className="font-bold mb-3">Histórico de relatórios</h3>
            <div className="space-y-2">{reportHistory.map((h) => <div key={h.id} className="flex justify-between bg-zinc-50 rounded-lg p-3 text-sm"><span>{h.created_at} • {h.type} • {h.status}</span><a href={h.file_url} className="text-emerald-600">Baixar novamente</a></div>)}</div>
          </div>
        </div>
      )}

      <AnimatePresence>{showFilters && <motion.div className="fixed inset-0 bg-zinc-900/40 flex justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><div className="w-full max-w-sm bg-white p-6 space-y-3"><div className="flex justify-between"><h3 className="font-bold">Filtros</h3><button onClick={() => setShowFilters(false)}><X className="w-4 h-4" /></button></div><input className="border rounded-xl p-2" placeholder="Função" value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value })} /><input className="border rounded-xl p-2" placeholder="Motivo" value={filters.reason} onChange={(e) => setFilters({ ...filters, reason: e.target.value })} /><select className="border rounded-xl p-2" value={filters.result} onChange={(e) => setFilters({ ...filters, result: e.target.value })}><option value="">Todos resultados</option><option value="RECOMMENDED">Recomendado</option><option value="RESTRICTED">Restrição</option><option value="NOT_RECOMMENDED">Não recomendado</option></select><button onClick={() => { setShowFilters(false); loadData(); }} className="w-full bg-emerald-600 text-white rounded-xl py-2">Aplicar</button></div></motion.div>}</AnimatePresence>

      <AnimatePresence>{showEvalModal && <motion.div className="fixed inset-0 bg-zinc-900/60 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><div className="bg-white w-full max-w-2xl rounded-2xl p-6 space-y-4"><div className="flex justify-between"><h3 className="font-bold text-xl">{editingEvaluation ? 'Editar' : 'Nova'} Avaliação</h3><button onClick={() => setShowEvalModal(false)}><X className="w-4 h-4" /></button></div>{evalStep === 1 && <div className="space-y-3"><input className="w-full border rounded-xl p-2" value={newEval.role_name} onChange={(e) => onRoleChange(e.target.value)} placeholder="Função/Cargo" /><input type="date" className="w-full border rounded-xl p-2" value={newEval.evaluation_date} onChange={(e) => setNewEval({ ...newEval, evaluation_date: e.target.value })} /><button onClick={() => setEvalStep(2)} className="w-full bg-emerald-600 text-white rounded-xl py-2">Ir para Step 2</button></div>}{evalStep === 2 && <div className="space-y-3"><div className="text-xs text-zinc-500">Template selecionado: {activeTemplate?.role_name || 'Sem template publicado'}</div>{(activeTemplate?.fields_json || []).map((f: any) => <div key={f.id} className="space-y-1"><label className="text-sm font-bold">{f.label}</label>{f.type === 'number' && <input type="number" className="w-full border rounded-xl p-2" onChange={(e) => setNewEval({ ...newEval, answers: { ...newEval.answers, [f.id]: Number(e.target.value) } })} />}{f.type === 'checkbox' && <label className="text-sm flex items-center gap-2"><input type="checkbox" onChange={(e) => setNewEval({ ...newEval, answers: { ...newEval.answers, [f.id]: e.target.checked } })} /> Sim</label>}{f.type === 'text' && <input className="w-full border rounded-xl p-2" onChange={(e) => setNewEval({ ...newEval, answers: { ...newEval.answers, [f.id]: e.target.value } })} />}</div>)}<select className="w-full border rounded-xl p-2" value={newEval.result} onChange={(e) => setNewEval({ ...newEval, result: e.target.value })}><option value="RECOMMENDED">Recomendado</option><option value="RESTRICTED">Restrição</option><option value="NOT_RECOMMENDED">Não recomendado</option></select>{(newEval.result === 'RESTRICTED' || newEval.result === 'NOT_RECOMMENDED') && <input className="w-full border rounded-xl p-2" placeholder="Motivos separados por vírgula" onChange={(e) => setNewEval({ ...newEval, reasons: e.target.value.split(',').map((v) => v.trim()).filter(Boolean) })} />}<textarea className="w-full border rounded-xl p-2" placeholder="Observações" onChange={(e) => setNewEval({ ...newEval, notes: e.target.value })} /><div className="grid grid-cols-3 gap-2"><button onClick={saveEvaluation} className="bg-emerald-600 text-white rounded-xl py-2">Salvar</button><button onClick={() => { saveEvaluation(); setShowEvalModal(true); }} className="bg-zinc-100 rounded-xl py-2">Salvar e outro</button><button onClick={() => setShowEvalModal(false)} className="bg-zinc-100 rounded-xl py-2">Rascunho</button></div></div>}</div></motion.div>}</AnimatePresence>

      <AnimatePresence>{selectedEvaluation && <motion.div className="fixed inset-0 bg-zinc-900/40 flex justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><div className="w-full max-w-lg bg-white p-6 space-y-3 overflow-auto"><div className="flex justify-between"><h3 className="font-bold">Detalhe da Avaliação</h3><button onClick={() => setSelectedEvaluation(null)}><X className="w-4 h-4" /></button></div><div className="text-sm"><b>{selectedEvaluation.role_name}</b> • {selectedEvaluation.evaluation_date}</div><div className="text-xs text-zinc-500">{selectedEvaluation.unit_name} / {selectedEvaluation.sector_name} • Template v{selectedEvaluation.template_version || '-'}</div><div className="bg-zinc-50 rounded-xl p-3 text-sm">Resultado: {selectedEvaluation.result}</div><div className="bg-zinc-50 rounded-xl p-3 text-sm">Motivos: {(selectedEvaluation.reasons_json || []).join(', ') || '-'}</div><div className="bg-zinc-50 rounded-xl p-3 text-sm">Anexos: {selectedAttachments.length}</div><div className="grid grid-cols-2 gap-2 text-sm"><button onClick={() => { setEditingEvaluation(selectedEvaluation); setNewEval({ ...newEval, ...selectedEvaluation, reasons: selectedEvaluation.reasons_json || [], answers: selectedEvaluation.answers_json || {} }); setShowEvalModal(true); }} className="border rounded-lg py-2">Editar</button><button className="border rounded-lg py-2">Criar Plano de Ação</button><button onClick={async () => { await uploadAdmissionAttachment(selectedEvaluation.id, { file_url: '/uploads/mock.png', file_name: 'mock.png', created_by: user.id }); setSelectedAttachments(await fetchAdmissionAttachments(selectedEvaluation.id)); }} className="border rounded-lg py-2">Anexos</button><button className="border rounded-lg py-2">Baixar PDF</button>{isAdmin && <button onClick={async () => { await deleteAdmissionEvaluation(selectedEvaluation.id); setSelectedEvaluation(null); loadData(); }} className="col-span-2 border rounded-lg py-2 text-rose-600">Excluir</button>}</div></div></motion.div>}</AnimatePresence>

      <AnimatePresence>{showTemplateModal && <motion.div className="fixed inset-0 bg-zinc-900/60 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><div className="bg-white w-full max-w-2xl rounded-2xl p-6 space-y-4"><div className="flex justify-between"><h3 className="font-bold text-xl">{editingTemplate ? 'Editar' : 'Novo'} Template</h3><button onClick={() => setShowTemplateModal(false)}><X className="w-4 h-4" /></button></div><input className="w-full border rounded-xl p-2" value={templateForm.role_name} onChange={(e) => setTemplateForm({ ...templateForm, role_name: e.target.value })} placeholder="Função/Cargo" /><textarea className="w-full border rounded-xl p-2 h-28" value={JSON.stringify(templateForm.fields_json, null, 2)} onChange={(e) => setTemplateForm({ ...templateForm, fields_json: JSON.parse(e.target.value || '[]') })} /><textarea className="w-full border rounded-xl p-2" value={JSON.stringify(templateForm.rules_json)} onChange={(e) => setTemplateForm({ ...templateForm, rules_json: JSON.parse(e.target.value || '{}') })} /><input className="w-full border rounded-xl p-2" value={(templateForm.reasons_json || []).join(', ')} onChange={(e) => setTemplateForm({ ...templateForm, reasons_json: e.target.value.split(',').map((v: string) => v.trim()).filter(Boolean) })} placeholder="Motivos" /><button onClick={saveTemplate} className="w-full bg-emerald-600 text-white rounded-xl py-2">Salvar Template</button></div></motion.div>}</AnimatePresence>

      <AnimatePresence>{showReportModal && <motion.div className="fixed inset-0 bg-zinc-900/60 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><div className="bg-white w-full max-w-md rounded-2xl p-6 space-y-3"><div className="flex justify-between"><h3 className="font-bold">Configurar Relatório</h3><button onClick={() => setShowReportModal(false)}><X className="w-4 h-4" /></button></div><input type="date" className="w-full border rounded-xl p-2" value={reportConfig.from} onChange={(e) => setReportConfig({ ...reportConfig, from: e.target.value })} /><input type="date" className="w-full border rounded-xl p-2" value={reportConfig.to} onChange={(e) => setReportConfig({ ...reportConfig, to: e.target.value })} /><label className="text-sm flex items-center gap-2"><input type="checkbox" checked={reportConfig.includeCharts} onChange={(e) => setReportConfig({ ...reportConfig, includeCharts: e.target.checked })} /> incluir gráficos</label><label className="text-sm flex items-center gap-2"><input type="checkbox" checked={reportConfig.hideSensitive} onChange={(e) => setReportConfig({ ...reportConfig, hideSensitive: e.target.checked })} /> ocultar dados sensíveis</label><button onClick={generateReport} className="w-full bg-zinc-900 text-white rounded-xl py-2">Gerar</button></div></motion.div>}</AnimatePresence>
    </div>
  );
};
