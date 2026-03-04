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
  const { tenantId, date, unitId, sectorId, shiftId, status, userId, mineOnly } = req.query;
  const targetDate = (date as string) || new Date().toISOString().split('T')[0];

  let query = `
    SELECT
      cs.*,
      s.name as sector_name,
      sh.name as shift_name,
      u.name as unit_name,
      usr.name as instructor_name,
      att.expected_count,
      att.present_count,
      att.method as attendance_method,
      CASE
        WHEN att.id IS NULL AND cs.status = 'finished' THEN 'pending_attendance'
        ELSE cs.status
      END as ui_status
    FROM class_sessions cs
    JOIN sectors s ON cs.sector_id = s.id
    JOIN shifts sh ON cs.shift_id = sh.id
    JOIN units u ON cs.unit_id = u.id
    JOIN users usr ON cs.instructor_user_id = usr.id
    LEFT JOIN attendance att ON att.class_session_id = cs.id
    WHERE cs.tenant_id = ? AND cs.date_time_start LIKE ?
  `;
  const params: any[] = [tenantId, `${targetDate}%`];

  if (unitId) {
    query += ' AND cs.unit_id = ?';
    params.push(unitId);
  }
  if (sectorId) {
    query += ' AND cs.sector_id = ?';
    params.push(sectorId);
  }
  if (shiftId) {
    query += ' AND cs.shift_id = ?';
    params.push(shiftId);
  }
  if (status) {
    query += ' AND cs.status = ?';
    params.push(status);
  }
  if (mineOnly === 'true' && userId) {
    query += ' AND cs.instructor_user_id = ?';
    params.push(userId);
  }

  query += ' ORDER BY cs.date_time_start ASC';

  const sessions = db.prepare(query).all(...params);
  res.json(sessions);
});

router.post("/classes/start", (req, res) => {
  const {
    tenantId,
    scheduleId,
    unitId,
    sectorId,
    shiftId,
    plannedStart,
    duration,
    instructorId
  } = req.body;

  if (scheduleId && !unitId) {
    const existing = db.prepare('SELECT id, status FROM class_sessions WHERE id = ?').get(scheduleId) as any;
    if (existing) {
      if (existing.status === 'canceled') {
        return res.status(400).json({ success: false, message: 'Aula cancelada não pode ser iniciada.' });
      }
      db.prepare("UPDATE class_sessions SET status = 'running' WHERE id = ?").run(scheduleId);
      return res.json({ success: true, classId: scheduleId, mode: 'existing' });
    }
  }

  const classId = `sess-${Date.now()}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO class_sessions (id, schedule_id, tenant_id, unit_id, sector_id, shift_id, date_time_start, duration_minutes, instructor_user_id, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'running')
  `).run(
    classId,
    scheduleId || null,
    tenantId,
    unitId,
    sectorId,
    shiftId,
    plannedStart || now,
    duration || 10,
    instructorId
  );

  res.json({ success: true, classId, mode: 'created' });
});

router.post("/classes/:classId/attendance", (req, res) => {
  const { classId } = req.params;
  const { expectedCount, presentCount, method } = req.body;

  const existing = db.prepare('SELECT id FROM attendance WHERE class_session_id = ?').get(classId) as any;
  if (existing) {
    db.prepare(`
      UPDATE attendance
      SET expected_count = ?, present_count = ?, method = ?, created_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(expectedCount, presentCount, method, existing.id);
    return res.json({ success: true, id: existing.id, updated: true });
  }

  const id = `att-${Date.now()}`;
  db.prepare(`
    INSERT INTO attendance (id, class_session_id, expected_count, present_count, method)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, classId, expectedCount, presentCount, method);

  res.json({ success: true, id, updated: false });
});

router.put("/classes/:classId/attendance", (req, res) => {
  const { classId } = req.params;
  const { expectedCount, presentCount, method } = req.body;
  db.prepare(`
    UPDATE attendance
    SET expected_count = ?, present_count = ?, method = ?
    WHERE class_session_id = ?
  `).run(expectedCount, presentCount, method, classId);
  res.json({ success: true });
});

router.post("/classes/:classId/finish", (req, res) => {
  const { classId } = req.params;
  const { notes } = req.body;
  const now = new Date().toISOString();

  const attendance = db.prepare('SELECT id FROM attendance WHERE class_session_id = ?').get(classId) as any;
  if (!attendance) {
    return res.status(400).json({ success: false, message: 'Registre presença antes de concluir.' });
  }

  db.prepare(`
    UPDATE class_sessions
    SET status = 'finished', notes = ?, date_time_end = ?
    WHERE id = ?
  `).run(notes || null, now, classId);

  res.json({ success: true });
});

router.patch('/classes/:classId/cancel', (req, res) => {
  const { classId } = req.params;
  const { reason } = req.body;
  db.prepare("UPDATE class_sessions SET status = 'canceled', notes = COALESCE(notes, '') || ? WHERE id = ?")
    .run(`
[Cancelada] ${reason || 'Sem motivo informado'}`, classId);
  res.json({ success: true });
});

router.delete('/classes/:classId', (req, res) => {
  const { classId } = req.params;
  const cls = db.prepare('SELECT id, schedule_id, status FROM class_sessions WHERE id = ?').get(classId) as any;
  if (!cls) {
    return res.status(404).json({ success: false, message: 'Aula não encontrada.' });
  }
  if (cls.schedule_id) {
    return res.status(400).json({ success: false, message: 'Somente aulas avulsas podem ser excluídas.' });
  }
  if (cls.status === 'finished') {
    return res.status(400).json({ success: false, message: 'Aulas concluídas não podem ser excluídas.' });
  }

  db.prepare('DELETE FROM attendance WHERE class_session_id = ?').run(classId);
  db.prepare('DELETE FROM class_sessions WHERE id = ?').run(classId);
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
  const { tenantId, from, to, unitId } = req.query;
  let query = `
    SELECT s.*, sec.name as sector_name, sh.name as shift_name, u.name as instructor_name
    FROM schedules s
    JOIN sectors sec ON s.sector_id = sec.id
    JOIN shifts sh ON s.shift_id = sh.id
    LEFT JOIN users u ON s.assigned_user_id = u.id
    WHERE s.tenant_id = ?
  `;
  const params: any[] = [tenantId];
  if (unitId) {
    query += ' AND s.unit_id = ?';
    params.push(unitId);
  }
  if (from && to) {
    query += ' AND (s.date IS NULL OR (s.date BETWEEN ? AND ?))';
    params.push(from, to);
  }
  query += ' ORDER BY s.day_of_week, s.start_time';
  const schedules = db.prepare(query).all(...params);
  res.json(schedules);
});

router.post("/schedules", (req, res) => {
  const {
    id,
    tenant_id,
    unit_id,
    sector_id,
    shift_id,
    day_of_week,
    start_time,
    duration_minutes,
    assigned_user_id,
    recurrence_rule,
    type
  } = req.body;
  db.prepare(`
    INSERT INTO schedules (id, tenant_id, unit_id, sector_id, shift_id, day_of_week, start_time, duration_minutes, assigned_user_id, recurrence_rule, type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, tenant_id, unit_id, sector_id, shift_id, day_of_week, start_time, duration_minutes, assigned_user_id, recurrence_rule || null, type || 'regular');
  res.json({ success: true });
});

router.put("/schedules/:id", (req, res) => {
  const { id } = req.params;
  const { sector_id, shift_id, day_of_week, start_time, duration_minutes, assigned_user_id, type } = req.body;
  db.prepare(`
    UPDATE schedules
    SET sector_id = ?, shift_id = ?, day_of_week = ?, start_time = ?, duration_minutes = ?, assigned_user_id = ?, type = ?
    WHERE id = ?
  `).run(sector_id, shift_id, day_of_week, start_time, duration_minutes, assigned_user_id, type || 'regular', id);
  res.json({ success: true });
});

router.delete("/schedules/:id", (req, res) => {
  db.prepare("DELETE FROM schedules WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

router.post('/schedules/copy-week', (req, res) => {
  const { tenantId, options } = req.body;
  const schedules = db.prepare('SELECT * FROM schedules WHERE tenant_id = ?').all(tenantId) as any[];
  const copyInstructor = options?.copyInstructor !== false;

  schedules.forEach((s) => {
    db.prepare(`
      INSERT INTO schedules (id, tenant_id, unit_id, sector_id, shift_id, day_of_week, start_time, duration_minutes, assigned_user_id, recurrence_rule, type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(`sch-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, s.tenant_id, s.unit_id, s.sector_id, s.shift_id, s.day_of_week, s.start_time, s.duration_minutes, copyInstructor ? s.assigned_user_id : null, s.recurrence_rule, s.type);
  });

  res.json({ success: true, copied: schedules.length });
});

router.post('/schedules/:id/exceptions', (req, res) => {
  const { id } = req.params;
  const { date, reason, createdBy } = req.body;
  const exId = `ex-${Date.now()}`;
  db.prepare(`
    INSERT INTO schedule_exceptions (id, schedule_id, date, status, reason, created_by)
    VALUES (?, ?, ?, 'canceled', ?, ?)
  `).run(exId, id, date, reason || null, createdBy || null);
  res.json({ success: true, id: exId });
});

router.get("/reports/attendance/summary", (req, res) => {
  const { tenantId } = req.query;

  const monthly = db.prepare(`
    SELECT strftime('%m', date_time_start) as month, AVG(CASE WHEN a.expected_count > 0 THEN (a.present_count * 100.0 / a.expected_count) ELSE 0 END) as rate
    FROM class_sessions cs
    LEFT JOIN attendance a ON a.class_session_id = cs.id
    WHERE cs.tenant_id = ? AND cs.status = 'finished'
    GROUP BY strftime('%m', date_time_start)
    ORDER BY month
  `).all(tenantId) as any[];

  const ranking = db.prepare(`
    SELECT s.name as sector, AVG(CASE WHEN a.expected_count > 0 THEN (a.present_count * 100.0 / a.expected_count) ELSE 0 END) as rate
    FROM class_sessions cs
    JOIN sectors s ON cs.sector_id = s.id
    LEFT JOIN attendance a ON a.class_session_id = cs.id
    WHERE cs.tenant_id = ? AND cs.status = 'finished'
    GROUP BY s.name
    HAVING rate < 80
    ORDER BY rate ASC
  `).all(tenantId);

  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  res.json({
    participationByMonth: monthly.map((m: any) => ({ month: monthNames[Number(m.month) - 1], rate: Number((m.rate || 0).toFixed(1)) })),
    rankingBelowGoal: ranking.map((r: any) => ({ sector: r.sector, rate: Number((r.rate || 0).toFixed(1)) })),
  });
});

router.get('/reports/attendance/by-sector', (req, res) => {
  const { tenantId } = req.query;
  const rows = db.prepare(`
    SELECT s.name as sector, COUNT(cs.id) as classes, AVG(CASE WHEN a.expected_count > 0 THEN (a.present_count * 100.0 / a.expected_count) ELSE 0 END) as rate
    FROM class_sessions cs
    JOIN sectors s ON cs.sector_id = s.id
    LEFT JOIN attendance a ON a.class_session_id = cs.id
    WHERE cs.tenant_id = ?
    GROUP BY s.name
    ORDER BY rate DESC
  `).all(tenantId);
  res.json(rows);
});

router.get('/reports/attendance/timeline', (req, res) => {
  const { tenantId, from, to } = req.query;
  const rows = db.prepare(`
    SELECT substr(cs.date_time_start, 1, 10) as date, COUNT(cs.id) as classes,
      AVG(CASE WHEN a.expected_count > 0 THEN (a.present_count * 100.0 / a.expected_count) ELSE 0 END) as rate
    FROM class_sessions cs
    LEFT JOIN attendance a ON a.class_session_id = cs.id
    WHERE cs.tenant_id = ? AND substr(cs.date_time_start, 1, 10) BETWEEN ? AND ?
    GROUP BY substr(cs.date_time_start, 1, 10)
    ORDER BY date ASC
  `).all(tenantId, from, to);
  res.json(rows);
});

router.get('/reports/attendance/below-target', (req, res) => {
  const { tenantId, target } = req.query;
  const rows = db.prepare(`
    SELECT s.name as sector, AVG(CASE WHEN a.expected_count > 0 THEN (a.present_count * 100.0 / a.expected_count) ELSE 0 END) as rate
    FROM class_sessions cs
    JOIN sectors s ON cs.sector_id = s.id
    LEFT JOIN attendance a ON a.class_session_id = cs.id
    WHERE cs.tenant_id = ?
    GROUP BY s.name
    HAVING rate < ?
    ORDER BY rate ASC
  `).all(tenantId, Number(target || 80));
  res.json(rows);
});

router.get("/reports/attendance/monthly", (req, res) => {
  const { tenantId } = req.query;
  const rows = db.prepare(`
    SELECT s.name as sector, AVG(CASE WHEN a.expected_count > 0 THEN (a.present_count * 100.0 / a.expected_count) ELSE 0 END) as rate
    FROM class_sessions cs
    JOIN sectors s ON cs.sector_id = s.id
    LEFT JOIN attendance a ON a.class_session_id = cs.id
    WHERE cs.tenant_id = ?
    GROUP BY s.name
    ORDER BY s.name
  `).all(tenantId) as any[];

  res.json({
    participationBySector: rows.map((r) => ({ sector: r.sector, rate: Number((r.rate || 0).toFixed(1)) })),
    dailyParticipation: [],
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
  const templates = db.prepare("SELECT * FROM admission_templates WHERE tenant_id = ? ORDER BY role_name, version DESC").all(tenantId);
  res.json(templates.map((t: any) => ({ ...t, fields_json: JSON.parse(t.fields_json), rules_json: t.rules_json ? JSON.parse(t.rules_json) : {}, reasons_json: t.reasons_json ? JSON.parse(t.reasons_json) : [] })));
});

router.get('/admission/templates/:id', (req, res) => {
  const tpl = db.prepare('SELECT * FROM admission_templates WHERE id = ?').get(req.params.id) as any;
  if (!tpl) return res.status(404).json({ message: 'Template não encontrado' });
  res.json({ ...tpl, fields_json: JSON.parse(tpl.fields_json), rules_json: tpl.rules_json ? JSON.parse(tpl.rules_json) : {}, reasons_json: tpl.reasons_json ? JSON.parse(tpl.reasons_json) : [] });
});

router.get('/admission/templates/:role/published', (req, res) => {
  const { role } = req.params;
  const { tenantId } = req.query;
  const tpl = db.prepare(`
    SELECT * FROM admission_templates
    WHERE tenant_id = ? AND role_name = ? AND status = 'PUBLISHED'
    ORDER BY version DESC LIMIT 1
  `).get(tenantId, role) as any;
  if (!tpl) return res.json(null);
  res.json({ ...tpl, fields_json: JSON.parse(tpl.fields_json), rules_json: tpl.rules_json ? JSON.parse(tpl.rules_json) : {}, reasons_json: tpl.reasons_json ? JSON.parse(tpl.reasons_json) : [] });
});

router.post("/admission/templates", (req, res) => {
  const { id, tenant_id, role_name, fields_json, rules_json, reasons_json, created_by } = req.body;
  const versionRow = db.prepare('SELECT COALESCE(MAX(version), 0) + 1 as nextVersion FROM admission_templates WHERE tenant_id = ? AND role_name = ?').get(tenant_id, role_name) as any;
  db.prepare(`
    INSERT INTO admission_templates (id, tenant_id, role_name, version, status, fields_json, rules_json, reasons_json, created_by)
    VALUES (?, ?, ?, ?, 'DRAFT', ?, ?, ?, ?)
  `).run(id, tenant_id, role_name, versionRow.nextVersion, JSON.stringify(fields_json || []), JSON.stringify(rules_json || {}), JSON.stringify(reasons_json || []), created_by);
  res.json({ success: true });
});

router.put('/admission/templates/:id', (req, res) => {
  const { id } = req.params;
  const { role_name, fields_json, rules_json, reasons_json } = req.body;
  db.prepare(`
    UPDATE admission_templates
    SET role_name = ?, fields_json = ?, rules_json = ?, reasons_json = ?
    WHERE id = ?
  `).run(role_name, JSON.stringify(fields_json || []), JSON.stringify(rules_json || {}), JSON.stringify(reasons_json || []), id);
  res.json({ success: true });
});

router.post('/admission/templates/:id/publish', (req, res) => {
  const { id } = req.params;
  const tpl = db.prepare('SELECT * FROM admission_templates WHERE id = ?').get(id) as any;
  if (!tpl) return res.status(404).json({ success: false });

  db.prepare(`UPDATE admission_templates SET status = 'DISABLED' WHERE tenant_id = ? AND role_name = ? AND id != ? AND status = 'PUBLISHED'`).run(tpl.tenant_id, tpl.role_name, id);
  db.prepare(`UPDATE admission_templates SET status = 'PUBLISHED' WHERE id = ?`).run(id);
  res.json({ success: true });
});

router.post('/admission/templates/:id/duplicate', (req, res) => {
  const { id } = req.params;
  const tpl = db.prepare('SELECT * FROM admission_templates WHERE id = ?').get(id) as any;
  if (!tpl) return res.status(404).json({ success: false });
  const newId = `tpl-${Date.now()}`;
  const versionRow = db.prepare('SELECT COALESCE(MAX(version), 0) + 1 as nextVersion FROM admission_templates WHERE tenant_id = ? AND role_name = ?').get(tpl.tenant_id, tpl.role_name) as any;
  db.prepare(`
    INSERT INTO admission_templates (id, tenant_id, role_name, version, status, fields_json, rules_json, reasons_json, created_by)
    VALUES (?, ?, ?, ?, 'DRAFT', ?, ?, ?, ?)
  `).run(newId, tpl.tenant_id, tpl.role_name, versionRow.nextVersion, tpl.fields_json, tpl.rules_json, tpl.reasons_json, tpl.created_by);
  res.json({ success: true, id: newId });
});

router.patch('/admission/templates/:id/disable', (req, res) => {
  db.prepare(`UPDATE admission_templates SET status = 'DISABLED' WHERE id = ?`).run(req.params.id);
  res.json({ success: true });
});

router.get("/admission/evaluations", (req, res) => {
  const { tenantId, from, to, unitId, sectorId, role, result, reason, evaluator } = req.query;
  let query = `
    SELECT e.*, u.name as unit_name, s.name as sector_name, usr.name as evaluator_name, t.version as template_version
    FROM admission_evaluations e
    JOIN units u ON e.unit_id = u.id
    JOIN sectors s ON e.sector_id = s.id
    LEFT JOIN users usr ON e.created_by = usr.id
    LEFT JOIN admission_templates t ON e.template_id = t.id
    WHERE e.tenant_id = ?
  `;
  const params: any[] = [tenantId];
  if (from) { query += ' AND e.evaluation_date >= ?'; params.push(from); }
  if (to) { query += ' AND e.evaluation_date <= ?'; params.push(to); }
  if (unitId) { query += ' AND e.unit_id = ?'; params.push(unitId); }
  if (sectorId) { query += ' AND e.sector_id = ?'; params.push(sectorId); }
  if (role) { query += ' AND e.role_name LIKE ?'; params.push(`%${role}%`); }
  if (result) { query += ' AND e.result = ?'; params.push(result); }
  if (reason) { query += ' AND e.reasons_json LIKE ?'; params.push(`%${reason}%`); }
  if (evaluator) { query += ' AND e.created_by = ?'; params.push(evaluator); }
  query += ' ORDER BY e.evaluation_date DESC';

  const evaluations = db.prepare(query).all(...params);
  res.json(evaluations.map((e: any) => ({
    ...e,
    reasons_json: JSON.parse(e.reasons_json || '[]'),
    answers_json: JSON.parse(e.answers_json || e.scores_json || '{}'),
  })));
});

router.get('/admission/evaluations/:id', (req, res) => {
  const row = db.prepare(`
    SELECT e.*, u.name as unit_name, s.name as sector_name, usr.name as evaluator_name, t.version as template_version
    FROM admission_evaluations e
    JOIN units u ON e.unit_id = u.id
    JOIN sectors s ON e.sector_id = s.id
    LEFT JOIN users usr ON e.created_by = usr.id
    LEFT JOIN admission_templates t ON e.template_id = t.id
    WHERE e.id = ?
  `).get(req.params.id) as any;
  if (!row) return res.status(404).json({ message: 'Avaliação não encontrada' });
  res.json({ ...row, reasons_json: JSON.parse(row.reasons_json || '[]'), answers_json: JSON.parse(row.answers_json || row.scores_json || '{}') });
});

router.post("/admission/evaluations", (req, res) => {
  const { id, tenant_id, unit_id, sector_id, role_name, template_id, evaluation_date, result, reasons_json, answers_json, notes, created_by } = req.body;
  const tpl = template_id ? db.prepare('SELECT version FROM admission_templates WHERE id = ?').get(template_id) as any : null;
  db.prepare(`
    INSERT INTO admission_evaluations (id, tenant_id, unit_id, sector_id, role_name, template_id, template_version, evaluation_date, result, reasons_json, answers_json, notes, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, tenant_id, unit_id, sector_id, role_name, template_id, tpl?.version || null, evaluation_date, result, JSON.stringify(reasons_json || []), JSON.stringify(answers_json || {}), notes, created_by);
  res.json({ success: true });
});

router.put('/admission/evaluations/:id', (req, res) => {
  const { id } = req.params;
  const { unit_id, sector_id, role_name, result, reasons_json, answers_json, notes } = req.body;
  db.prepare(`
    UPDATE admission_evaluations
    SET unit_id = ?, sector_id = ?, role_name = ?, result = ?, reasons_json = ?, answers_json = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(unit_id, sector_id, role_name, result, JSON.stringify(reasons_json || []), JSON.stringify(answers_json || {}), notes || null, id);
  res.json({ success: true });
});

router.delete('/admission/evaluations/:id', (req, res) => {
  db.prepare('DELETE FROM admission_attachments WHERE evaluation_id = ?').run(req.params.id);
  db.prepare('DELETE FROM admission_evaluations WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

router.post('/admission/evaluations/:id/attachments', (req, res) => {
  const { id } = req.params;
  const { file_url, file_name, created_by } = req.body;
  const attId = `adm-att-${Date.now()}`;
  db.prepare(`
    INSERT INTO admission_attachments (id, evaluation_id, file_url, file_name, created_by)
    VALUES (?, ?, ?, ?, ?)
  `).run(attId, id, file_url, file_name || 'anexo', created_by || null);
  res.json({ success: true, id: attId });
});

router.get('/admission/evaluations/:id/attachments', (req, res) => {
  const rows = db.prepare('SELECT * FROM admission_attachments WHERE evaluation_id = ? ORDER BY created_at DESC').all(req.params.id);
  res.json(rows);
});

router.get("/reports/admission/summary", (req, res) => {
  const { tenantId } = req.query;
  const totals = db.prepare(`
    SELECT COUNT(*) as total,
      SUM(CASE WHEN result='RECOMMENDED' THEN 1 ELSE 0 END) as recommended,
      SUM(CASE WHEN result='RESTRICTED' THEN 1 ELSE 0 END) as restricted,
      SUM(CASE WHEN result='NOT_RECOMMENDED' THEN 1 ELSE 0 END) as notRecommended
    FROM admission_evaluations WHERE tenant_id = ?
  `).get(tenantId) as any;

  const reasonRows = db.prepare('SELECT reasons_json FROM admission_evaluations WHERE tenant_id = ?').all(tenantId) as any[];
  const reasonMap: Record<string, number> = {};
  reasonRows.forEach((r) => {
    const list = JSON.parse(r.reasons_json || '[]');
    list.forEach((reason: string) => reasonMap[reason] = (reasonMap[reason] || 0) + 1);
  });

  const critical = db.prepare(`
    SELECT role_name as role, COUNT(*) as count
    FROM admission_evaluations
    WHERE tenant_id = ? AND result = 'NOT_RECOMMENDED'
    GROUP BY role_name ORDER BY count DESC LIMIT 5
  `).all(tenantId);

  const monthly = db.prepare(`
    SELECT strftime('%m', evaluation_date) as month,
      SUM(CASE WHEN result='NOT_RECOMMENDED' THEN 1 ELSE 0 END) as count
    FROM admission_evaluations
    WHERE tenant_id = ?
    GROUP BY strftime('%m', evaluation_date)
    ORDER BY month
  `).all(tenantId) as any[];

  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const total = totals.total || 0;
  res.json({
    totalEvaluations: total,
    recommendedRate: total ? Math.round((totals.recommended * 100) / total) : 0,
    restrictedRate: total ? Math.round((totals.restricted * 100) / total) : 0,
    notRecommendedRate: total ? Math.round((totals.notRecommended * 100) / total) : 0,
    topCriticalRoles: critical,
    resultDistribution: [
      { name: 'Recomendado', value: totals.recommended || 0 },
      { name: 'Restrição', value: totals.restricted || 0 },
      { name: 'Não Recomendado', value: totals.notRecommended || 0 },
    ],
    monthlyTrend: monthly.map((m: any) => ({ month: monthNames[Number(m.month)-1], rate: m.count || 0 })),
    frequentReasons: Object.entries(reasonMap).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([reason,count])=>({ reason, count })),
  });
});

router.post('/reports/admission/pdf', (req, res) => {
  const { tenantId, type, params, createdBy } = req.body;
  const id = `job-${Date.now()}`;
  db.prepare(`
    INSERT INTO report_jobs (id, tenant_id, type, params_json, status, file_url, created_by)
    VALUES (?, ?, ?, ?, 'DONE', ?, ?)
  `).run(id, tenantId, type, JSON.stringify(params || {}), `/uploads/${id}.pdf`, createdBy || null);
  res.json({ success: true, jobId: id });
});

router.get('/reports/admission/jobs/:jobId', (req, res) => {
  const job = db.prepare('SELECT * FROM report_jobs WHERE id = ?').get(req.params.jobId);
  if (!job) return res.status(404).json({ message: 'Job não encontrado' });
  res.json(job);
});

router.get('/reports/admission/history', (req, res) => {
  const { tenantId } = req.query;
  const jobs = db.prepare('SELECT * FROM report_jobs WHERE tenant_id = ? ORDER BY created_at DESC').all(tenantId);
  res.json(jobs);
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
