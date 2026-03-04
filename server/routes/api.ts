import { Router } from "express";
import db from "../db/database.js";

const router = Router();

// API Routes
router.get("/tenants", (req, res) => {
  const tenants = db.prepare("SELECT * FROM tenants").all();
  res.json(tenants);
});

router.get("/units/:tenantId", (req, res) => {
  const units = db.prepare("SELECT * FROM units WHERE tenant_id = ?").all(req.params.tenantId);
  res.json(units);
});

router.get("/dashboard/stats/:tenantId", (req, res) => {
  const { tenantId } = req.params;
  // Mocking some stats for the dashboard based on tenant
  const stats = {
    participation: 84.2,
    complaints_momentary: 12,
    complaints_ambulatory: 8,
    absenteismo: 4.5,
    rehabilitated: 76
  };
  res.json(stats);
});

router.get("/complaints/body-parts/:tenantId", (req, res) => {
  const stats = db.prepare(`
    SELECT body_part, count(*) as value 
    FROM health_complaints 
    GROUP BY body_part
  `).all();
  res.json(stats);
});

// --- Aula + Presença (Gym/Classes) ---
router.get("/classes/today", (req, res) => {
  const { tenantId, userId } = req.query;
  const today = new Date().toISOString().split('T')[0];
  
  const sessions = db.prepare(`
    SELECT 
      cs.*, 
      s.name as sector_name, 
      sh.name as shift_name,
      u.name as unit_name,
      usr.name as instructor_name,
      CASE 
        WHEN sh.name = 'T1' THEN s.expected_count_t1
        WHEN sh.name = 'T2' THEN s.expected_count_t2
        WHEN sh.name = 'T3' THEN s.expected_count_t3
        ELSE 0
      END as expected_count
    FROM class_sessions cs
    JOIN sectors s ON cs.sector_id = s.id
    JOIN shifts sh ON cs.shift_id = sh.id
    JOIN units u ON cs.unit_id = u.id
    JOIN users usr ON cs.instructor_user_id = usr.id
    WHERE cs.tenant_id = ? AND cs.date_time_start LIKE ?
  `).all(tenantId, `${today}%`);
  
  res.json(sessions);
});

router.post("/classes/start", (req, res) => {
  const { sessionId } = req.body;
  db.prepare("UPDATE class_sessions SET status = 'running' WHERE id = ?").run(sessionId);
  res.json({ success: true });
});

router.post("/classes/:classId/attendance", (req, res) => {
  const { classId } = req.params;
  const { expectedCount, presentCount, method } = req.body;
  const id = `att-${Date.now()}`;
  
  db.prepare(`
    INSERT INTO attendance (id, class_session_id, expected_count, present_count, method)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, classId, expectedCount, presentCount, method);
  
  res.json({ success: true, id });
});

router.post("/classes/:classId/finish", (req, res) => {
  const { classId } = req.params;
  const { notes } = req.body;
  const now = new Date().toISOString();
  
  db.prepare(`
    UPDATE class_sessions 
    SET status = 'finished', notes = ?, date_time_end = ? 
    WHERE id = ?
  `).run(notes, now, classId);
  
  res.json({ success: true });
});

router.post("/classes/:classId/evidence", (req, res) => {
  const { classId } = req.params;
  const { tenantId, fileUrl, createdBy, tags } = req.body;
  const id = `evid-${Date.now()}`;
  
  db.prepare(`
    INSERT INTO evidence (id, tenant_id, ref_type, ref_id, file_url, tags, created_by)
    VALUES (?, ?, 'class_session', ?, ?, ?, ?)
  `).run(id, tenantId, classId, fileUrl, JSON.stringify(tags || []), createdBy);
  
  res.json({ success: true, id });
});

router.get("/schedules", (req, res) => {
  const { tenantId } = req.query;
  const schedules = db.prepare(`
    SELECT s.*, sec.name as sector_name, sh.name as shift_name
    FROM schedules s
    JOIN sectors sec ON s.sector_id = sec.id
    JOIN shifts sh ON s.shift_id = sh.id
    WHERE s.tenant_id = ?
  `).all(tenantId);
  res.json(schedules);
});

router.post("/schedules", (req, res) => {
  const { id, tenant_id, unit_id, sector_id, shift_id, day_of_week, start_time, duration_minutes, assigned_user_id, recurrence_rule } = req.body;
  db.prepare(`
    INSERT INTO schedules (id, tenant_id, unit_id, sector_id, shift_id, day_of_week, start_time, duration_minutes, assigned_user_id, recurrence_rule)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, tenant_id, unit_id, sector_id, shift_id, day_of_week, start_time, duration_minutes, assigned_user_id, recurrence_rule);
  res.json({ success: true });
});

router.put("/schedules/:id", (req, res) => {
  const { id } = req.params;
  const { sector_id, shift_id, day_of_week, start_time, duration_minutes, assigned_user_id } = req.body;
  db.prepare(`
    UPDATE schedules 
    SET sector_id = ?, shift_id = ?, day_of_week = ?, start_time = ?, duration_minutes = ?, assigned_user_id = ?
    WHERE id = ?
  `).run(sector_id, shift_id, day_of_week, start_time, duration_minutes, assigned_user_id, id);
  res.json({ success: true });
});

router.delete("/schedules/:id", (req, res) => {
  db.prepare("DELETE FROM schedules WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

router.get("/reports/attendance/monthly", (req, res) => {
  const { tenantId, month, year } = req.query;
  // Mocking monthly report
  res.json({
    participationBySector: [
      { sector: 'Montagem Cross', rate: 85 },
      { sector: 'Logística', rate: 72 },
      { sector: 'Pintura', rate: 90 },
      { sector: 'Manutenção', rate: 78 },
    ],
    dailyParticipation: [
      { day: '01/03', rate: 82 },
      { day: '02/03', rate: 85 },
      { day: '03/03', rate: 79 },
    ]
  });
});

router.get("/pending/monthly", (req, res) => {
  const { tenantId, month, year } = req.query;
  // Mocking pending classes
  res.json([
    { id: 'p1', sector_name: 'Logística', shift_name: 'T1', date: '2026-03-01', reason: 'Sem presença registrada' },
    { id: 'p2', sector_name: 'Pintura', shift_name: 'T2', date: '2026-03-02', reason: 'Aula planejada não realizada' },
  ]);
});

router.post("/closing/month/close", (req, res) => {
  const { tenantId, month, year, userId } = req.body;
  // In a real app, we'd update a 'month_closings' table
  res.json({ success: true });
});

router.get("/reports/attendance/summary", (req, res) => {
  const { tenantId, year } = req.query;
  res.json({
    participationByMonth: [
      { month: 'Jan', rate: 82 },
      { month: 'Fev', rate: 78 },
      { month: 'Mar', rate: 85 },
    ],
    rankingBelowGoal: [
      { sector: 'Logística', rate: 72 },
      { sector: 'Pintura', rate: 75 },
    ]
  });
});

// --- Absenteísmo (Absenteeism) ---
// Audit Log Helper
function logAudit(tenantId: string, entityType: string, entityId: string, action: string, userId: string, before: any = null, after: any = null) {
  const id = `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  db.prepare(`
    INSERT INTO audit_log (id, tenant_id, entity_type, entity_id, action, before_json, after_json, user_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, tenantId, entityType, entityId, action, before ? JSON.stringify(before) : null, after ? JSON.stringify(after) : null, userId);
}

router.post("/absenteeism", (req, res) => {
  const { id, tenant_id, unit_id, sector_id, shift_id, start_date, end_date, days_lost, range_class, cid_group, cid_code, notes, status, created_by } = req.body;
  db.prepare(`
    INSERT INTO absenteeism_records (id, tenant_id, unit_id, sector_id, shift_id, start_date, end_date, days_lost, range_class, cid_group, cid_code, notes, status, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, tenant_id, unit_id, sector_id, shift_id, start_date, end_date, days_lost, range_class, cid_group, cid_code, notes, status, created_by);
  
  logAudit(tenant_id, 'absenteeism', id, 'CREATE', created_by, null, req.body);
  
  res.json({ success: true });
});

router.get("/absenteeism", (req, res) => {
  const { tenantId, month, year, unitId, sectorId, cidGroup, range, status } = req.query;
  let query = `
    SELECT a.*, u.name as unit_name, s.name as sector_name
    FROM absenteeism_records a
    JOIN units u ON a.unit_id = u.id
    JOIN sectors s ON a.sector_id = s.id
    WHERE a.tenant_id = ?
  `;
  const params: any[] = [tenantId];

  if (month && year) {
    query += " AND a.start_date LIKE ?";
    params.push(`${year}-${month.toString().padStart(2, '0')}%`);
  }
  if (unitId) {
    query += " AND a.unit_id = ?";
    params.push(unitId);
  }
  if (sectorId) {
    query += " AND a.sector_id = ?";
    params.push(sectorId);
  }
  if (cidGroup) {
    query += " AND a.cid_group = ?";
    params.push(cidGroup);
  }
  if (range) {
    query += " AND a.range_class = ?";
    params.push(range);
  }
  if (status) {
    query += " AND a.status = ?";
    params.push(status);
  }

  const records = db.prepare(query).all(...params);
  res.json(records);
});

router.get("/absenteeism/:id", (req, res) => {
  const record = db.prepare(`
    SELECT a.*, u.name as unit_name, s.name as sector_name, usr.name as creator_name
    FROM absenteeism_records a
    JOIN units u ON a.unit_id = u.id
    JOIN sectors s ON a.sector_id = s.id
    JOIN users usr ON a.created_by = usr.id
    WHERE a.id = ?
  `).get(req.params.id);
  res.json(record);
});

router.put("/absenteeism/:id", (req, res) => {
  const { id } = req.params;
  const { unit_id, sector_id, shift_id, start_date, end_date, days_lost, range_class, cid_group, cid_code, notes, status, updated_by } = req.body;
  
  const before = db.prepare("SELECT * FROM absenteeism_records WHERE id = ?").get(id) as any;
  
  db.prepare(`
    UPDATE absenteeism_records 
    SET unit_id = ?, sector_id = ?, shift_id = ?, start_date = ?, end_date = ?, days_lost = ?, range_class = ?, cid_group = ?, cid_code = ?, notes = ?, status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(unit_id, sector_id, shift_id, start_date, end_date, days_lost, range_class, cid_group, cid_code, notes, status, id);
  
  logAudit(before.tenant_id, 'absenteeism', id, 'UPDATE', updated_by, before, req.body);
  
  res.json({ success: true });
});

router.patch("/absenteeism/:id/status", (req, res) => {
  const { id } = req.params;
  const { status, updated_by } = req.body;
  
  const before = db.prepare("SELECT * FROM absenteeism_records WHERE id = ?").get(id) as any;
  
  db.prepare("UPDATE absenteeism_records SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(status, id);
  
  logAudit(before.tenant_id, 'absenteeism', id, 'CONFIRM', updated_by, before, { status });
  
  res.json({ success: true });
});

router.delete("/absenteeism/:id", (req, res) => {
  const { id } = req.params;
  const { deleted_by } = req.query;
  
  const before = db.prepare("SELECT * FROM absenteeism_records WHERE id = ?").get(id) as any;
  if (before) {
    db.prepare("DELETE FROM absenteeism_records WHERE id = ?").run(id);
    logAudit(before.tenant_id, 'absenteeism', id, 'DELETE', deleted_by as string, before, null);
  }
  
  res.json({ success: true });
});

router.get("/absenteeism/:id/attachments", (req, res) => {
  const attachments = db.prepare("SELECT * FROM absenteeism_attachments WHERE record_id = ?").all(req.params.id);
  res.json(attachments);
});

router.post("/absenteeism/:id/attachments", (req, res) => {
  const { id: recordId } = req.params;
  const { file_url, file_name, file_type, created_by } = req.body;
  const id = `att-${Date.now()}`;
  db.prepare(`
    INSERT INTO absenteeism_attachments (id, record_id, file_url, file_name, file_type, created_by)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, recordId, file_url, file_name, file_type, created_by);
  res.json({ success: true, id });
});

router.delete("/absenteeism/attachments/:id", (req, res) => {
  db.prepare("DELETE FROM absenteeism_attachments WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

router.get("/absenteeism/:id/history", (req, res) => {
  const history = db.prepare(`
    SELECT a.*, u.name as user_name
    FROM audit_log a
    JOIN users u ON a.user_id = u.id
    WHERE a.entity_id = ? AND a.entity_type = 'absenteeism'
    ORDER BY a.created_at DESC
  `).all(req.params.id);
  res.json(history);
});

router.get("/reports/absenteeism/summary", (req, res) => {
  const { tenantId, month, year } = req.query;
  // Mocking summary for now
  res.json({
    totalDaysLost: 45,
    totalRecords: 12,
    over15Rate: 25,
    topCIDs: [
      { group: 'F', count: 5 },
      { group: 'I', count: 3 },
      { group: 'G', count: 2 },
    ],
    criticalSector: 'Montagem Cross',
    weeklyImpact: [
      { week: 'Semana 1', days: 10 },
      { week: 'Semana 2', days: 15 },
      { week: 'Semana 3', days: 8 },
      { week: 'Semana 4', days: 12 },
    ],
    cidDistribution: [
      { name: 'Grupo F', value: 45 },
      { name: 'Grupo G', value: 25 },
      { name: 'Grupo I', value: 20 },
      { name: 'Outros', value: 10 },
    ],
    sectorRanking: [
      { sector: 'Montagem Cross', days: 25 },
      { sector: 'Logística', days: 12 },
      { sector: 'Pintura', days: 8 },
    ]
  });
});

router.get("/nr1/forms/:tenantId", (req, res) => {
  const forms = db.prepare("SELECT * FROM nr1_forms WHERE tenant_id = ? AND active = 1").all(req.params.tenantId);
  res.json(forms);
});

// --- Admissional (Cinesiofuncional) ---
router.get("/admission/templates", (req, res) => {
  const { tenantId } = req.query;
  const templates = db.prepare("SELECT * FROM admission_templates WHERE tenant_id = ?").all(tenantId);
  res.json(templates.map((t: any) => ({ ...t, fields_json: JSON.parse(t.fields_json) })));
});

router.post("/admission/templates", (req, res) => {
  const { id, tenant_id, role_name, fields_json, created_by } = req.body;
  db.prepare(`
    INSERT INTO admission_templates (id, tenant_id, role_name, fields_json, created_by)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, tenant_id, role_name, JSON.stringify(fields_json), created_by);
  res.json({ success: true });
});

router.get("/admission/evaluations", (req, res) => {
  const { tenantId, unitId, sectorId, result } = req.query;
  let query = `
    SELECT e.*, u.name as unit_name, s.name as sector_name
    FROM admission_evaluations e
    JOIN units u ON e.unit_id = u.id
    JOIN sectors s ON e.sector_id = s.id
    WHERE e.tenant_id = ?
  `;
  const params: any[] = [tenantId];

  if (unitId) {
    query += " AND e.unit_id = ?";
    params.push(unitId);
  }
  if (sectorId) {
    query += " AND e.sector_id = ?";
    params.push(sectorId);
  }
  if (result) {
    query += " AND e.result = ?";
    params.push(result);
  }

  const evaluations = db.prepare(query).all(...params);
  res.json(evaluations.map((e: any) => ({ 
    ...e, 
    reasons_json: JSON.parse(e.reasons_json || '[]'),
    scores_json: JSON.parse(e.scores_json || '{}')
  })));
});

router.post("/admission/evaluations", (req, res) => {
  const { id, tenant_id, unit_id, sector_id, role_name, template_id, evaluation_date, result, reasons_json, scores_json, notes, created_by } = req.body;
  db.prepare(`
    INSERT INTO admission_evaluations (id, tenant_id, unit_id, sector_id, role_name, template_id, evaluation_date, result, reasons_json, scores_json, notes, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, tenant_id, unit_id, sector_id, role_name, template_id, evaluation_date, result, JSON.stringify(reasons_json), JSON.stringify(scores_json), notes, created_by);
  res.json({ success: true });
});

router.get("/reports/admission/summary", (req, res) => {
  const { tenantId } = req.query;
  // Mocking summary
  res.json({
    totalEvaluations: 156,
    recommendedRate: 88,
    restrictedRate: 7,
    notRecommendedRate: 5,
    topCriticalRoles: [
      { role: 'Operador de Empilhadeira', count: 4 },
      { role: 'Montador', count: 2 },
      { role: 'Logística', count: 1 },
    ],
    resultDistribution: [
      { name: 'Recomendado', value: 88 },
      { name: 'Restrição', value: 7 },
      { name: 'Não Recomendado', value: 5 },
    ],
    roleRanking: [
      { role: 'Operador de Empilhadeira', value: 12 },
      { role: 'Montador', value: 8 },
      { role: 'Logística', value: 5 },
    ],
    monthlyTrend: [
      { month: 'Jan', rate: 4 },
      { month: 'Fev', rate: 6 },
      { month: 'Mar', rate: 5 },
    ],
    frequentReasons: [
      { reason: 'Dor lombar', count: 8 },
      { reason: 'Lesão ombro', count: 5 },
      { reason: 'Limitação mobilidade', count: 3 },
    ]
  });
});

// Strategic Dashboard Endpoints
router.get("/dashboard/strategic/:tenantId", (req, res) => {
  const { tenantId } = req.params;
  const { year = 2026, compareYear = 2025, baselineYear = 2022 } = req.query;

  // Mocking strategic data
  const strategicData = {
    summary: {
      participation: { current: 84.2, previous: 78.5, baseline: 62.0, meta: 80 },
      checkins: { current: 12450, previous: 11200, baseline: 8500, avg_month: 1037 },
      complaints: { 
        momentary: { current: 142, previous: 168, baseline: 245 },
        ambulatory: { current: 45, previous: 52, baseline: 88 }
      },
      rehabilitated: { current: 88, previous: 72, baseline: 45 },
      absenteeism: { 
        days: { current: 450, previous: 520, baseline: 850 },
        split_under_15: 320,
        split_over_15: 130
      },
      critical_sectors: [
        { name: "Produção A", complaints: 24, absenteeism: 45 },
        { name: "Logística", complaints: 18, absenteeism: 32 },
        { name: "Manutenção", complaints: 15, absenteeism: 28 }
      ],
      nr1: { adhesion: 92, high_risk_sectors: 4 },
      action_plan: { completed: 85, delayed: 12 }
    },
    historical: {
      baseline_vs_current: [
        { month: 'Jan', baseline: 45, current: 32 },
        { month: 'Fev', baseline: 42, current: 30 },
        { month: 'Mar', baseline: 48, current: 35 },
        { month: 'Abr', baseline: 40, current: 28 },
        { month: 'Mai', baseline: 38, current: 25 },
        { month: 'Jun', baseline: 44, current: 31 },
        { month: 'Jul', baseline: 46, current: 33 },
        { month: 'Ago', baseline: 43, current: 29 },
        { month: 'Set', baseline: 41, current: 27 },
        { month: 'Out', baseline: 39, current: 26 },
        { month: 'Nov', baseline: 45, current: 30 },
        { month: 'Dez', baseline: 47, current: 34 },
      ],
      trends_5_years: [
        { year: 2022, complaints: 333, absenteeism: 850, participation: 62 },
        { year: 2023, complaints: 290, absenteeism: 720, participation: 68 },
        { year: 2024, complaints: 250, absenteeism: 610, participation: 74 },
        { year: 2025, complaints: 220, absenteeism: 520, participation: 78 },
        { year: 2026, complaints: 187, absenteeism: 450, participation: 84 },
      ]
    },
    risk_matrix: [
      { sector: 'Produção A', risk: 'Alto', complaints: 24, previous_risk: 'Alto' },
      { sector: 'Produção B', risk: 'Médio', complaints: 12, previous_risk: 'Alto' },
      { sector: 'Logística', risk: 'Médio', complaints: 18, previous_risk: 'Médio' },
      { sector: 'Manutenção', risk: 'Baixo', complaints: 8, previous_risk: 'Médio' },
      { sector: 'Administrativo', risk: 'Baixo', complaints: 2, previous_risk: 'Baixo' },
    ],
    body_structure_yoy: [
      { part: 'Ombro', current: 42, previous: 48 },
      { part: 'Lombar', current: 28, previous: 35 },
      { part: 'Pescoço', current: 15, previous: 12 },
      { part: 'Punhos', current: 10, previous: 14 },
      { part: 'Outros', current: 5, previous: 8 },
    ],
    health_funnel: [
      { name: 'Queixa Momentânea', value: 142, fill: '#8884d8' },
      { name: 'Ambulatorial', value: 45, fill: '#83a6ed' },
      { name: 'Afastamento', value: 12, fill: '#8dd1e1' },
    ],
    absenteeism_cid: [
      { month: 'Jan', F: 10, G: 5, I: 2 },
      { month: 'Fev', F: 8, G: 4, I: 3 },
      { month: 'Mar', F: 12, G: 6, I: 1 },
      { month: 'Abr', F: 9, G: 3, I: 4 },
      { month: 'Mai', F: 7, G: 5, I: 2 },
      { month: 'Jun', F: 11, G: 4, I: 3 },
    ],
    admissionals: {
      recommended: 450,
      not_recommended: 24,
      reasons: [
        { name: 'Ergonômico', value: 12 },
        { name: 'Clínico', value: 8 },
        { name: 'Psicossocial', value: 4 },
      ]
    }
  };

  res.json(strategicData);
});

export default router;
