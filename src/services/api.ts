export async function fetchTenants() {
  const response = await fetch('/api/tenants');
  return response.json();
}

export async function fetchUnits(tenantId: string) {
  const response = await fetch(`/api/units/${tenantId}`);
  return response.json();
}

export async function fetchDashboardStats(tenantId: string) {
  const response = await fetch(`/api/dashboard/stats/${tenantId}`);
  return response.json();
}

export async function fetchComplaintsBodyParts(tenantId: string) {
  const response = await fetch(`/api/complaints/body-parts/${tenantId}`);
  return response.json();
}

export async function registerAttendance(data: any) {
  const response = await fetch('/api/attendance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function fetchNR1Forms(tenantId: string) {
  const response = await fetch(`/api/nr1/forms/${tenantId}`);
  return response.json();
}

export async function fetchStrategicDashboard(tenantId: string, params: { year?: number, compareYear?: number, baselineYear?: number } = {}) {
  const query = new URLSearchParams(params as any).toString();
  const response = await fetch(`/api/dashboard/strategic/${tenantId}?${query}`);
  return response.json();
}

// --- Aula + Presença (Gym/Classes) ---
export async function fetchTodayClasses(tenantId: string, userId: string) {
  const response = await fetch(`/api/classes/today?tenantId=${tenantId}&userId=${userId}`);
  return response.json();
}

export async function startClassSession(sessionId: string) {
  const response = await fetch('/api/classes/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scheduleId: sessionId }),
  });
  return response.json();
}

export async function launchAdhocClass(data: any) {
  const response = await fetch('/api/classes/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function saveAttendance(classId: string, data: { expectedCount: number, presentCount: number, method: string }) {
  const response = await fetch(`/api/classes/${classId}/attendance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function finishClassSession(classId: string, notes: string) {
  const response = await fetch(`/api/classes/${classId}/finish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notes }),
  });
  return response.json();
}

export async function cancelClassSession(classId: string, reason: string, userId: string) {
  const response = await fetch(`/api/classes/${classId}/cancel`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason, userId }),
  });
  return response.json();
}

export async function deleteClassSession(classId: string, userId: string) {
  const response = await fetch(`/api/classes/${classId}?userId=${encodeURIComponent(userId)}`, {
    method: 'DELETE',
  });
  return response.json();
}

export async function copySchedulesWeek(data: any) {
  const response = await fetch('/api/schedules/copy-week', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function createScheduleException(scheduleId: string, data: any) {
  const response = await fetch(`/api/schedules/${scheduleId}/exceptions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function fetchAttendanceBySector(tenantId: string, month: string) {
  const response = await fetch(`/api/reports/attendance/by-sector?tenantId=${tenantId}&month=${month}`);
  return response.json();
}

export async function fetchAttendanceTimeline(tenantId: string, from: string, to: string) {
  const response = await fetch(`/api/reports/attendance/timeline?tenantId=${tenantId}&from=${from}&to=${to}`);
  return response.json();
}

export async function fetchBelowTarget(tenantId: string, month: string, target = 80) {
  const response = await fetch(`/api/reports/attendance/below-target?tenantId=${tenantId}&month=${month}&target=${target}`);
  return response.json();
}

export async function uploadClassEvidence(classId: string, data: any) {
  const response = await fetch(`/api/classes/${classId}/evidence`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function fetchSchedules(tenantId: string) {
  const response = await fetch(`/api/schedules?tenantId=${tenantId}`);
  return response.json();
}

export async function createSchedule(data: any) {
  const response = await fetch('/api/schedules', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function updateSchedule(id: string, data: any) {
  const response = await fetch(`/api/schedules/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function deleteSchedule(id: string) {
  const response = await fetch(`/api/schedules/${id}`, {
    method: 'DELETE',
  });
  return response.json();
}

export async function fetchMonthlyAttendanceReport(params: any) {
  const query = new URLSearchParams(params as any).toString();
  const response = await fetch(`/api/reports/attendance/monthly?${query}`);
  return response.json();
}

export async function fetchPendingClasses(params: any) {
  const query = new URLSearchParams(params as any).toString();
  const response = await fetch(`/api/pending/monthly?${query}`);
  return response.json();
}

export async function closeMonth(data: any) {
  const response = await fetch('/api/closing/month/close', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function fetchAttendanceSummary(tenantId: string, year: number) {
  const response = await fetch(`/api/reports/attendance/summary?tenantId=${tenantId}&year=${year}`);
  return response.json();
}

// --- Absenteísmo (Absenteeism) ---
export async function fetchAbsenteeismRecords(params: any) {
  const query = new URLSearchParams(params as any).toString();
  const response = await fetch(`/api/absenteeism?${query}`);
  return response.json();
}

export async function createAbsenteeismRecord(data: any) {
  const response = await fetch('/api/absenteeism', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function updateAbsenteeismStatus(id: string, status: string, userId: string) {
  const response = await fetch(`/api/absenteeism/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, updated_by: userId }),
  });
  return response.json();
}

export async function deleteAbsenteeismRecord(id: string, userId: string) {
  const response = await fetch(`/api/absenteeism/${id}?deleted_by=${userId}`, {
    method: 'DELETE',
  });
  return response.json();
}

export async function fetchAbsenteeismRecord(id: string) {
  const response = await fetch(`/api/absenteeism/${id}`);
  return response.json();
}

export async function updateAbsenteeismRecord(id: string, data: any) {
  const response = await fetch(`/api/absenteeism/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function fetchAbsenteeismAttachments(recordId: string) {
  const response = await fetch(`/api/absenteeism/${recordId}/attachments`);
  return response.json();
}

export async function uploadAbsenteeismAttachment(recordId: string, data: any) {
  const response = await fetch(`/api/absenteeism/${recordId}/attachments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function deleteAbsenteeismAttachment(id: string) {
  const response = await fetch(`/api/absenteeism/attachments/${id}`, {
    method: 'DELETE',
  });
  return response.json();
}

export async function fetchAbsenteeismHistory(id: string) {
  const response = await fetch(`/api/absenteeism/${id}/history`);
  return response.json();
}

export async function fetchAbsenteeismSummary(params: any) {
  const query = new URLSearchParams(params as any).toString();
  const response = await fetch(`/api/reports/absenteeism/summary?${query}`);
  return response.json();
}

// --- Admissional (Cinesiofuncional) ---
export async function fetchAdmissionTemplates(tenantId: string) {
  const response = await fetch(`/api/admission/templates?tenantId=${tenantId}`);
  return response.json();
}

export async function createAdmissionTemplate(data: any) {
  const response = await fetch('/api/admission/templates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function fetchAdmissionEvaluations(params: any) {
  const query = new URLSearchParams(params as any).toString();
  const response = await fetch(`/api/admission/evaluations?${query}`);
  return response.json();
}

export async function createAdmissionEvaluation(data: any) {
  const response = await fetch('/api/admission/evaluations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}


export async function fetchAdmissionEvaluationById(id: string) {
  const response = await fetch(`/api/admission/evaluations/${id}`);
  return response.json();
}

export async function updateAdmissionEvaluation(id: string, data: any) {
  const response = await fetch(`/api/admission/evaluations/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function deleteAdmissionEvaluation(id: string) {
  const response = await fetch(`/api/admission/evaluations/${id}`, { method: 'DELETE' });
  return response.json();
}

export async function uploadAdmissionAttachment(id: string, data: any) {
  const response = await fetch(`/api/admission/evaluations/${id}/attachments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function fetchAdmissionAttachments(id: string) {
  const response = await fetch(`/api/admission/evaluations/${id}/attachments`);
  return response.json();
}

export async function fetchAdmissionTemplateById(id: string) {
  const response = await fetch(`/api/admission/templates/${id}`);
  return response.json();
}

export async function updateAdmissionTemplate(id: string, data: any) {
  const response = await fetch(`/api/admission/templates/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function publishAdmissionTemplate(id: string) {
  const response = await fetch(`/api/admission/templates/${id}/publish`, { method: 'POST' });
  return response.json();
}

export async function duplicateAdmissionTemplate(id: string) {
  const response = await fetch(`/api/admission/templates/${id}/duplicate`, { method: 'POST' });
  return response.json();
}

export async function disableAdmissionTemplate(id: string) {
  const response = await fetch(`/api/admission/templates/${id}/disable`, { method: 'PATCH' });
  return response.json();
}

export async function fetchPublishedAdmissionTemplate(tenantId: string, role: string) {
  const response = await fetch(`/api/admission/templates/${encodeURIComponent(role)}/published?tenantId=${tenantId}`);
  return response.json();
}

export async function generateAdmissionReport(data: any) {
  const response = await fetch('/api/reports/admission/pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function fetchAdmissionReportJob(jobId: string) {
  const response = await fetch(`/api/reports/admission/jobs/${jobId}`);
  return response.json();
}

export async function fetchAdmissionReportHistory(tenantId: string) {
  const response = await fetch(`/api/reports/admission/history?tenantId=${tenantId}`);
  return response.json();
}
export async function fetchAdmissionSummary(tenantId: string) {
  const response = await fetch(`/api/reports/admission/summary?tenantId=${tenantId}`);
  return response.json();
}
