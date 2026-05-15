document.addEventListener('DOMContentLoaded', () => {
    const page = window.location.pathname.split('/').pop();
    if (page === 'admin-users.html') loadUsers();
    if (page === 'admin-departments.html') loadDepts();
    if (page === 'admin-logs.html') loadLogs();
    if (page === 'admin-ai-monitor.html') loadAIMonitor();
});

async function loadUsers() {
    const container = document.getElementById('usersTable');
    if (!container) return;
    const res = await api.get('/admin/users?limit=50');
    if (!res?.success) return;
    container.innerHTML = res.data.map(u => `<tr>
        <td><strong>${u.name}</strong></td><td>${u.email}</td>
        <td>${getCategoryBadge(u.role)}</td><td>${u.departments?.name || '-'}</td>
        <td><span class="badge ${u.is_active ? 'badge-green' : 'badge-red'}">${u.is_active ? 'Active' : 'Inactive'}</span></td>
        <td>${formatDateTime(u.last_login)}</td>
        <td>
            <select class="form-control" style="padding:6px;font-size:0.75rem;width:auto" onchange="updateUserRole('${u.id}', this.value)">
                <option value="employee" ${u.role==='employee'?'selected':''}>Employee</option>
                <option value="viewer" ${u.role==='viewer'?'selected':''}>Viewer</option>
                <option value="dept_officer" ${u.role==='dept_officer'?'selected':''}>Dept Officer</option>
                <option value="office_admin" ${u.role==='office_admin'?'selected':''}>Office Admin</option>
                <option value="super_admin" ${u.role==='super_admin'?'selected':''}>Super Admin</option>
            </select>
        </td>
    </tr>`).join('');
}

async function updateUserRole(id, role) {
    const res = await api.put(`/admin/users/${id}`, { role });
    if (res?.success) showToast('User role updated', 'success');
    else showToast('Failed to update', 'error');
}

async function loadDepts() {
    const container = document.getElementById('deptsTable');
    if (!container) return;
    const res = await api.get('/admin/departments');
    if (!res?.success) return;
    container.innerHTML = res.data.map(d => `<tr>
        <td><strong>${d.name}</strong></td><td>${d.description || '-'}</td>
        <td>${d.head_officer || '-'}</td><td>${formatDate(d.created_at)}</td>
        <td><button class="btn btn-sm btn-danger" onclick="deleteDept('${d.id}')"><i class="bi bi-trash"></i></button></td>
    </tr>`).join('');
}

async function deleteDept(id) {
    if (!confirm('Delete this department?')) return;
    const res = await api.delete(`/admin/departments/${id}`);
    if (res?.success) { showToast('Deleted', 'success'); loadDepts(); }
    else showToast('Failed', 'error');
}

async function createDept(e) {
    e.preventDefault();
    const res = await api.post('/admin/departments', {
        name: document.getElementById('deptName').value,
        description: document.getElementById('deptDesc').value,
        head_officer: document.getElementById('deptHead').value
    });
    if (res?.success) { showToast('Department created!', 'success'); loadDepts(); document.querySelector('.modal-overlay')?.classList.remove('active'); }
    else showToast(res?.message || 'Failed', 'error');
}

async function loadLogs() {
    const container = document.getElementById('logsTable');
    if (!container) return;
    const res = await api.get('/admin/audit-logs?limit=50');
    if (!res?.success) return;
    container.innerHTML = (res.data || []).map(l => `<tr>
        <td>${l.user_name || 'System'}</td><td>${getCategoryBadge(l.action.toLowerCase())}</td>
        <td>${l.entity_type || '-'}</td><td>${l.ip_address || '-'}</td>
        <td>${formatDateTime(l.created_at)}</td>
    </tr>`).join('');
}

async function loadAIMonitor() {
    const res = await api.get('/admin/ai-monitoring');
    if (!res?.success) return;
    const statsEl = document.getElementById('aiStats');
    if (statsEl) {
        statsEl.innerHTML = `
            <div class="card kpi-card blue"><div class="kpi-icon blue"><i class="bi bi-chat-dots"></i></div><div class="kpi-value">${res.data.stats.totalQueries}</div><div class="kpi-label">Total Queries</div></div>
            <div class="card kpi-card green"><div class="kpi-icon green"><i class="bi bi-speedometer"></i></div><div class="kpi-value">${res.data.stats.avgResponseTime}ms</div><div class="kpi-label">Avg Response Time</div></div>`;
    }
    const table = document.getElementById('aiLogsTable');
    if (table) {
        table.innerHTML = (res.data.logs || []).map(l => `<tr>
            <td>${(l.question || '').substring(0, 60)}...</td>
            <td>${(l.response || '').substring(0, 80)}...</td>
            <td>${l.response_time_ms || 0}ms</td>
            <td>${formatDateTime(l.created_at)}</td>
        </tr>`).join('');
    }
}
