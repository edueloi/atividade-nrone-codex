import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure database directory exists (handled by AI Studio tool)
const dbPath = path.join(process.cwd(), "database", "sst_platform.db");
const db = new Database(dbPath);

export function initDb() {
  db.exec(`
    -- Multi-tenant Core
    CREATE TABLE IF NOT EXISTS tenants (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      logo_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS units (
      id TEXT PRIMARY KEY,
      tenant_id TEXT,
      name TEXT NOT NULL,
      address TEXT,
      FOREIGN KEY(tenant_id) REFERENCES tenants(id)
    );

    CREATE TABLE IF NOT EXISTS sectors (
      id TEXT PRIMARY KEY,
      unit_id TEXT,
      name TEXT NOT NULL,
      expected_count_t1 INTEGER DEFAULT 0,
      expected_count_t2 INTEGER DEFAULT 0,
      expected_count_t3 INTEGER DEFAULT 0,
      FOREIGN KEY(unit_id) REFERENCES units(id)
    );

    CREATE TABLE IF NOT EXISTS shifts (
      id TEXT PRIMARY KEY,
      unit_id TEXT,
      name TEXT NOT NULL,
      FOREIGN KEY(unit_id) REFERENCES units(id)
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT CHECK(role IN ('admin_atividade', 'professional', 'client', 'auditor')) NOT NULL,
      tenant_id TEXT, -- NULL for Admin Atividade (sees all)
      FOREIGN KEY(tenant_id) REFERENCES tenants(id)
    );

    -- Goals and Parameters
    CREATE TABLE IF NOT EXISTS tenant_parameters (
      tenant_id TEXT PRIMARY KEY,
      participation_goal REAL DEFAULT 80.0,
      max_complaints_threshold INTEGER DEFAULT 10,
      FOREIGN KEY(tenant_id) REFERENCES tenants(id)
    );

    -- Aula + Presença (Gym/Classes)
    CREATE TABLE IF NOT EXISTS schedules (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      unit_id TEXT NOT NULL,
      sector_id TEXT NOT NULL,
      shift_id TEXT NOT NULL,
      day_of_week INTEGER, -- 0-6
      date TEXT, -- For specific non-recurring dates
      start_time TEXT NOT NULL,
      duration_minutes INTEGER DEFAULT 15,
      type TEXT DEFAULT 'regular',
      assigned_user_id TEXT,
      recurrence_rule TEXT,
      status TEXT DEFAULT 'active',
      FOREIGN KEY(tenant_id) REFERENCES tenants(id),
      FOREIGN KEY(unit_id) REFERENCES units(id),
      FOREIGN KEY(sector_id) REFERENCES sectors(id)
    );

    CREATE TABLE IF NOT EXISTS class_sessions (
      id TEXT PRIMARY KEY,
      schedule_id TEXT,
      tenant_id TEXT NOT NULL,
      unit_id TEXT NOT NULL,
      sector_id TEXT NOT NULL,
      shift_id TEXT NOT NULL,
      date_time_start TEXT NOT NULL,
      date_time_end TEXT,
      duration_minutes INTEGER,
      instructor_user_id TEXT NOT NULL,
      status TEXT DEFAULT 'planned', -- planned, running, finished, canceled
      notes TEXT,
      FOREIGN KEY(schedule_id) REFERENCES schedules(id),
      FOREIGN KEY(tenant_id) REFERENCES tenants(id),
      FOREIGN KEY(unit_id) REFERENCES units(id),
      FOREIGN KEY(sector_id) REFERENCES sectors(id)
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id TEXT PRIMARY KEY,
      class_session_id TEXT NOT NULL,
      expected_count INTEGER DEFAULT 0,
      present_count INTEGER DEFAULT 0,
      method TEXT DEFAULT 'count', -- count, qr, list
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(class_session_id) REFERENCES class_sessions(id)
    );

    CREATE TABLE IF NOT EXISTS evidence (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      ref_type TEXT NOT NULL, -- 'class_session', 'action_plan', etc.
      ref_id TEXT NOT NULL,
      file_url TEXT NOT NULL,
      thumb_url TEXT,
      tags TEXT, -- JSON array
      created_by TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(tenant_id) REFERENCES tenants(id)
    );

    -- Fisioterapia (Cinesioterapia)
    CREATE TABLE IF NOT EXISTS physio_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      unit_id TEXT,
      patient_name TEXT NOT NULL,
      professional_id TEXT,
      notes TEXT,
      evolution_score INTEGER, -- 1-100
      rehabilitated BOOLEAN DEFAULT 0,
      date DATE NOT NULL,
      FOREIGN KEY(unit_id) REFERENCES units(id),
      FOREIGN KEY(professional_id) REFERENCES users(id)
    );

    -- Funil Clínico (Queixas)
    CREATE TABLE IF NOT EXISTS health_complaints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      unit_id TEXT,
      sector_id TEXT,
      type TEXT CHECK(type IN ('ambulatory', 'momentary')),
      body_part TEXT NOT NULL, -- ombro, lombar, etc.
      severity INTEGER CHECK(severity BETWEEN 1 AND 5),
      recurrent BOOLEAN DEFAULT 0,
      date DATE NOT NULL,
      FOREIGN KEY(unit_id) REFERENCES units(id),
      FOREIGN KEY(sector_id) REFERENCES sectors(id)
    );

    -- Absenteísmo (CIDs)
    CREATE TABLE IF NOT EXISTS absenteeism_records (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      unit_id TEXT NOT NULL,
      sector_id TEXT NOT NULL,
      shift_id TEXT,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      days_lost INTEGER NOT NULL,
      range_class TEXT CHECK(range_class IN ('LT15', 'GT15')) NOT NULL,
      cid_group TEXT CHECK(cid_group IN ('F', 'G', 'I', 'OUTROS')) NOT NULL,
      cid_code TEXT,
      notes TEXT,
      status TEXT CHECK(status IN ('PENDING', 'CONFIRMED', 'REVIEW')) DEFAULT 'PENDING',
      created_by TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(tenant_id) REFERENCES tenants(id),
      FOREIGN KEY(unit_id) REFERENCES units(id),
      FOREIGN KEY(sector_id) REFERENCES sectors(id)
    );

    CREATE TABLE IF NOT EXISTS absenteeism_attachments (
      id TEXT PRIMARY KEY,
      record_id TEXT NOT NULL,
      file_url TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_type TEXT,
      created_by TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(record_id) REFERENCES absenteeism_records(id)
    );

    CREATE TABLE IF NOT EXISTS audit_log (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      action TEXT NOT NULL, -- CREATE, UPDATE, DELETE, CONFIRM, etc
      before_json TEXT,
      after_json TEXT,
      user_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(tenant_id) REFERENCES tenants(id)
    );

    -- Ergonomia
    CREATE TABLE IF NOT EXISTS ergo_biomechanical_risk (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sector_id TEXT,
      risk_level TEXT CHECK(risk_level IN ('low', 'medium', 'high', 'critical')),
      analysis_date DATE NOT NULL,
      FOREIGN KEY(sector_id) REFERENCES sectors(id)
    );

    CREATE TABLE IF NOT EXISTS project_validations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      unit_id TEXT,
      project_name TEXT NOT NULL,
      status TEXT CHECK(status IN ('approved', 'vetoed', 'adjusted')),
      evidence_url TEXT,
      notes TEXT,
      date DATE NOT NULL,
      FOREIGN KEY(unit_id) REFERENCES units(id)
    );

    -- NR1 Psicossocial
    CREATE TABLE IF NOT EXISTS nr1_forms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_id TEXT,
      title TEXT NOT NULL,
      questions_json TEXT NOT NULL,
      version INTEGER DEFAULT 1,
      active BOOLEAN DEFAULT 1,
      FOREIGN KEY(tenant_id) REFERENCES tenants(id)
    );

    CREATE TABLE IF NOT EXISTS nr1_responses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      form_id INTEGER,
      unit_id TEXT,
      sector_id TEXT,
      answers_json TEXT NOT NULL,
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(form_id) REFERENCES nr1_forms(id),
      FOREIGN KEY(unit_id) REFERENCES units(id),
      FOREIGN KEY(sector_id) REFERENCES sectors(id)
    );

    -- Action Plans & Evidence
    CREATE TABLE IF NOT EXISTS action_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      unit_id TEXT,
      sector_id TEXT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT CHECK(status IN ('open', 'in_progress', 'completed')) DEFAULT 'open',
      due_date DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(unit_id) REFERENCES units(id),
      FOREIGN KEY(sector_id) REFERENCES sectors(id)
    );

    CREATE TABLE IF NOT EXISTS evidence_gallery (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      unit_id TEXT,
      action_plan_id INTEGER,
      campaign_id INTEGER,
      type TEXT CHECK(type IN ('before', 'after', 'execution', 'campaign')),
      url TEXT NOT NULL,
      description TEXT,
      month INTEGER,
      year INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(unit_id) REFERENCES units(id),
      FOREIGN KEY(action_plan_id) REFERENCES action_plans(id)
    );

    -- Campaigns
    CREATE TABLE IF NOT EXISTS campaigns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      month INTEGER, -- 1-12
      banner_url TEXT,
      active BOOLEAN DEFAULT 1
    );

    -- Admissional (Cinesiofuncional)
    CREATE TABLE IF NOT EXISTS admission_templates (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      role_name TEXT NOT NULL,
      version INTEGER DEFAULT 1,
      is_published BOOLEAN DEFAULT 1,
      fields_json TEXT NOT NULL, -- JSON array of field definitions
      rules_json TEXT, -- JSON object for scoring rules
      created_by TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(tenant_id) REFERENCES tenants(id)
    );

    CREATE TABLE IF NOT EXISTS admission_evaluations (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      unit_id TEXT NOT NULL,
      sector_id TEXT NOT NULL,
      role_name TEXT NOT NULL,
      template_id TEXT,
      evaluation_date TEXT NOT NULL,
      result TEXT CHECK(result IN ('RECOMMENDED', 'RESTRICTED', 'NOT_RECOMMENDED')) NOT NULL,
      reasons_json TEXT, -- JSON array of reasons
      scores_json TEXT, -- JSON object of test results
      notes TEXT,
      status TEXT DEFAULT 'COMPLETED',
      created_by TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(tenant_id) REFERENCES tenants(id),
      FOREIGN KEY(unit_id) REFERENCES units(id),
      FOREIGN KEY(sector_id) REFERENCES sectors(id),
      FOREIGN KEY(template_id) REFERENCES admission_templates(id)
    );
  `);

  // Seed initial data if empty
  const tenantCount = db.prepare("SELECT count(*) as count FROM tenants").get() as { count: number };
  if (tenantCount.count === 0) {
    const toyotaId = 'toyota-br';
    const pilonId = 'usina-pilon';
    
    db.prepare("INSERT INTO tenants (id, name) VALUES (?, ?)").run(toyotaId, 'Toyota Brasil');
    db.prepare("INSERT INTO tenants (id, name) VALUES (?, ?)").run(pilonId, 'Usina Pilon');
    
    db.prepare("INSERT INTO units (id, tenant_id, name) VALUES (?, ?, ?)").run('toyota-sorocaba', toyotaId, 'Unidade Sorocaba');
    db.prepare("INSERT INTO sectors (id, unit_id, name) VALUES (?, ?, ?)").run('toyota-montagem', 'toyota-sorocaba', 'Montagem Cross');
    db.prepare("INSERT INTO shifts (id, unit_id, name) VALUES (?, ?, ?)").run('toyota-t1', 'toyota-sorocaba', 'Turno 1');
    
    db.prepare("INSERT INTO users (id, name, email, password, role, tenant_id) VALUES (?, ?, ?, ?, ?, ?)")
      .run('admin-1', 'Admin Atividade', 'admin@atividade.com', '123456', 'admin_atividade', null);
    db.prepare("INSERT INTO users (id, name, email, password, role, tenant_id) VALUES (?, ?, ?, ?, ?, ?)")
      .run('prof-1', 'Ricardo Prof', 'ricardo@atividade.com', '123456', 'professional', toyotaId);
    db.prepare("INSERT INTO users (id, name, email, password, role, tenant_id) VALUES (?, ?, ?, ?, ?, ?)")
      .run('client-1', 'Engenheiro Toyota', 'eng@toyota.com', '123456', 'client', toyotaId);

    // Seed initial schedules
    const toyotaUnit = 'toyota-sorocaba';
    const toyotaSector = 'toyota-montagem';
    
    db.prepare(`
      INSERT INTO schedules (id, tenant_id, unit_id, sector_id, shift_id, day_of_week, start_time, duration_minutes, assigned_user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run('sch-1', toyotaId, toyotaUnit, toyotaSector, 'toyota-t1', 1, '08:00', 15, 'prof-1');

    db.prepare(`
      INSERT INTO schedules (id, tenant_id, unit_id, sector_id, shift_id, day_of_week, start_time, duration_minutes, assigned_user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run('sch-2', toyotaId, toyotaUnit, toyotaSector, 'toyota-t1', 1, '10:00', 15, 'prof-1');

    // Create some planned sessions for today
    const today = new Date().toISOString().split('T')[0];
    db.prepare(`
      INSERT INTO class_sessions (id, schedule_id, tenant_id, unit_id, sector_id, shift_id, date_time_start, instructor_user_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run('sess-1', 'sch-1', toyotaId, toyotaUnit, toyotaSector, 'toyota-t1', `${today}T08:00:00`, 'prof-1', 'planned');

    db.prepare(`
      INSERT INTO class_sessions (id, schedule_id, tenant_id, unit_id, sector_id, shift_id, date_time_start, instructor_user_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run('sess-2', 'sch-2', toyotaId, toyotaUnit, toyotaSector, 'toyota-t1', `${today}T10:00:00`, 'prof-1', 'planned');

    // Seed absenteeism
    db.prepare(`
      INSERT INTO absenteeism_records (id, tenant_id, unit_id, sector_id, start_date, end_date, days_lost, range_class, cid_group, cid_code, status, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run('abs-1', toyotaId, toyotaUnit, toyotaSector, '2026-03-01', '2026-03-03', 3, 'LT15', 'F', 'F32', 'CONFIRMED', 'admin-1');

    db.prepare(`
      INSERT INTO absenteeism_records (id, tenant_id, unit_id, sector_id, start_date, end_date, days_lost, range_class, cid_group, cid_code, status, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run('abs-2', toyotaId, toyotaUnit, toyotaSector, '2026-02-20', '2026-03-10', 19, 'GT15', 'I', 'I10', 'CONFIRMED', 'admin-1');

    // Seed Admissional
    const templateId = 'tpl-1';
    db.prepare(`
      INSERT INTO admission_templates (id, tenant_id, role_name, fields_json, created_by)
      VALUES (?, ?, ?, ?, ?)
    `).run(templateId, toyotaId, 'Operador de Empilhadeira', JSON.stringify([
      { name: 'flexibility', label: 'Flexibilidade', type: 'number' },
      { name: 'strength', label: 'Força', type: 'number' },
      { name: 'pain', label: 'Dor preexistente', type: 'boolean' }
    ]), 'admin-1');

    db.prepare(`
      INSERT INTO admission_evaluations (id, tenant_id, unit_id, sector_id, role_name, template_id, evaluation_date, result, reasons_json, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run('eval-1', toyotaId, toyotaUnit, toyotaSector, 'Operador de Empilhadeira', templateId, today, 'RECOMMENDED', '[]', 'admin-1');

    db.prepare(`
      INSERT INTO admission_evaluations (id, tenant_id, unit_id, sector_id, role_name, template_id, evaluation_date, result, reasons_json, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run('eval-2', toyotaId, toyotaUnit, toyotaSector, 'Operador de Empilhadeira', templateId, today, 'NOT_RECOMMENDED', JSON.stringify(['Dor lombar']), 'admin-1');
  }
}

export default db;
