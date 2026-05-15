document.addEventListener('DOMContentLoaded', async () => {
    await loadStats();
    await loadCharts();
    await loadActivity();
});

async function loadStats() {
    const res = await api.get('/dashboard/stats');
    if (!res?.success) return;
    const d = res.data;
    const grid = document.getElementById('kpiGrid');
    if (!grid) return;
    grid.innerHTML = `
        <div class="card kpi-card blue"><div class="kpi-icon blue"><i class="bi bi-file-earmark-text"></i></div><div class="kpi-value">${d.totalDocuments}</div><div class="kpi-label">Total Documents</div></div>
        <div class="card kpi-card green"><div class="kpi-icon green"><i class="bi bi-people"></i></div><div class="kpi-value">${d.totalEmployees}</div><div class="kpi-label">Total Users</div></div>
        <div class="card kpi-card yellow"><div class="kpi-icon yellow"><i class="bi bi-clock-history"></i></div><div class="kpi-value">${d.totalHistory}</div><div class="kpi-label">History Records</div></div>
        <div class="card kpi-card purple"><div class="kpi-icon purple"><i class="bi bi-robot"></i></div><div class="kpi-value">${d.aiQueries}</div><div class="kpi-label">AI Queries</div></div>`;
}

async function loadCharts() {
    const res = await api.get('/dashboard/charts');
    if (!res?.success) return;
    const d = res.data;

    // Department Activity Chart
    const ctx1 = document.getElementById('deptChart')?.getContext('2d');
    if (ctx1) {
        new Chart(ctx1, {
            type: 'bar',
            data: { labels: d.departmentActivity.labels, datasets: [{ label: 'Documents', data: d.departmentActivity.values, backgroundColor: ['#667eea','#764ba2','#10b981','#f59e0b','#ef4444'], borderRadius: 8 }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }, x: { grid: { display: false }, ticks: { color: '#94a3b8' } } } }
        });
    }

    // History Categories Chart
    const ctx2 = document.getElementById('categoryChart')?.getContext('2d');
    if (ctx2) {
        new Chart(ctx2, {
            type: 'doughnut',
            data: { labels: d.historyCategories.labels, datasets: [{ data: d.historyCategories.values, backgroundColor: ['#667eea','#764ba2','#10b981','#f59e0b','#ef4444','#3b82f6','#8b5cf6','#ec4899'] }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: '#94a3b8', padding: 12 } } } }
        });
    }
}

async function loadActivity() {
    const res = await api.get('/dashboard/activity');
    if (!res?.success) return;
    const list = document.getElementById('activityList');
    if (!list) return;
    list.innerHTML = (res.data || []).map(a => `
        <tr><td><strong>${a.user_name || 'System'}</strong></td><td>${getCategoryBadge(a.action.toLowerCase())}</td><td>${a.entity_type || '-'}</td><td>${formatDateTime(a.created_at)}</td></tr>
    `).join('') || '<tr><td colspan="4" style="text-align:center;color:var(--text-muted)">No recent activity</td></tr>';
}
