document.addEventListener('DOMContentLoaded', () => {
    // Check auth
    if (!api.getToken()) { window.location.href = '/frontend/index.html'; return; }
    initSidebar();
    initUserInfo();
});

function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    const user = api.getUser();
    const isAdmin = user && ['super_admin', 'office_admin'].includes(user.role);
    const currentPage = window.location.pathname.split('/').pop();

    const navItems = [
        { section: 'Main', items: [
            { icon: 'bi-speedometer2', label: 'Dashboard', href: 'dashboard.html' },
            { icon: 'bi-chat-dots', label: 'AI Chat', href: 'chat.html' },
            { icon: 'bi-file-earmark-text', label: 'Documents', href: 'documents.html' },
            { icon: 'bi-cloud-upload', label: 'Upload', href: 'upload.html' },
            { icon: 'bi-clock-history', label: 'Office History', href: 'history.html' },
            { icon: 'bi-calendar-event', label: 'Timeline', href: 'timeline.html' },
            { icon: 'bi-graph-up', label: 'Reports', href: 'reports.html' },
        ]},
        ...(isAdmin ? [{ section: 'Admin', items: [
            { icon: 'bi-people', label: 'Users', href: 'admin-users.html' },
            { icon: 'bi-building', label: 'Departments', href: 'admin-departments.html' },
            { icon: 'bi-journal-text', label: 'Audit Logs', href: 'admin-logs.html' },
            { icon: 'bi-robot', label: 'AI Monitor', href: 'admin-ai-monitor.html' },
        ]}] : [])
    ];

    let html = `<div class="sidebar-brand"><h2>🧠 Office Intelligence</h2><span>AI Knowledge System</span></div><nav class="sidebar-nav">`;
    navItems.forEach(sec => {
        html += `<div class="nav-section"><div class="nav-section-title">${sec.section}</div>`;
        sec.items.forEach(item => {
            const active = currentPage === item.href ? 'active' : '';
            html += `<a href="${item.href}" class="nav-item ${active}"><i class="bi ${item.icon}"></i>${item.label}</a>`;
        });
        html += '</div>';
    });
    html += '</nav>';
    html += `<div class="sidebar-footer"><div class="user-info"><div class="user-avatar">${(user?.name || 'U')[0]}</div><div><div class="user-name">${user?.name || 'User'}</div><div class="user-role">${(user?.role || 'employee').replace('_', ' ')}</div></div></div><button class="btn btn-secondary btn-sm btn-block" style="margin-top:12px" onclick="api.logout()"><i class="bi bi-box-arrow-left"></i>Logout</button></div>`;
    sidebar.innerHTML = html;

    // Mobile toggle
    const toggle = document.querySelector('.sidebar-toggle');
    if (toggle) toggle.addEventListener('click', () => sidebar.classList.toggle('open'));
}

function initUserInfo() {
    const el = document.getElementById('userGreeting');
    const user = api.getUser();
    if (el && user) el.textContent = `Welcome, ${user.name}`;
}

function showToast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) { container = document.createElement('div'); container.className = 'toast-container'; document.body.appendChild(container); }
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatDateTime(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function getCategoryBadge(cat) {
    const colors = { meeting: 'blue', joining: 'green', transfer: 'yellow', promotion: 'purple', compliance: 'red', inspection: 'blue', event: 'green', order: 'yellow', retirement: 'red' };
    return `<span class="badge badge-${colors[cat] || 'blue'}">${(cat || 'general').replace('_', ' ')}</span>`;
}
