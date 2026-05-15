document.addEventListener('DOMContentLoaded', () => {
    const page = window.location.pathname.split('/').pop();
    if (page === 'history.html') loadHistory();
    if (page === 'timeline.html') loadTimeline();
});

async function loadHistory() {
    const container = document.getElementById('historyList');
    if (!container) return;
    container.innerHTML = '<div class="spinner"></div>';
    const res = await api.get('/history?limit=30');
    if (!res?.success) return;
    if (res.data.length === 0) { container.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:40px">No history records yet.</p>'; return; }
    container.innerHTML = `<table><thead><tr><th>Title</th><th>Category</th><th>Department</th><th>Date</th><th>Actions</th></tr></thead><tbody>${
        res.data.map(h => `<tr>
            <td><strong>${h.title}</strong><br><small style="color:var(--text-muted)">${(h.description || '').substring(0, 80)}...</small></td>
            <td>${getCategoryBadge(h.category)}</td>
            <td>${h.departments?.name || '-'}</td>
            <td>${formatDate(h.event_date)}</td>
            <td><button class="btn btn-sm btn-secondary" onclick="viewHistory('${h.id}')"><i class="bi bi-eye"></i></button></td>
        </tr>`).join('')
    }</tbody></table>`;
}

async function loadTimeline() {
    const container = document.getElementById('timelineContainer');
    if (!container) return;
    container.innerHTML = '<div class="spinner"></div>';
    const res = await api.get('/history/timeline');
    if (!res?.success) return;
    if (res.data.length === 0) { container.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:40px">No timeline data.</p>'; return; }
    container.innerHTML = '<div class="timeline">' + res.data.map(h => `
        <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="card">
                <div class="timeline-date">${formatDate(h.event_date)}</div>
                <div class="timeline-title">${h.title}</div>
                <div class="timeline-desc">${h.description}</div>
                <div style="margin-top:8px">${getCategoryBadge(h.category)} <small style="color:var(--text-muted)">${h.departments?.name || ''}</small></div>
            </div>
        </div>
    `).join('') + '</div>';
}

function viewHistory(id) { showToast('Detail view coming soon', 'info'); }

async function submitHistory(e) {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    const res = await api.post('/history', {
        title: document.getElementById('histTitle').value,
        description: document.getElementById('histDesc').value,
        department: document.getElementById('histDept').value || null,
        category: document.getElementById('histCategory').value || 'event',
        event_date: document.getElementById('histDate').value,
        persons_involved: document.getElementById('histPersons').value || ''
    });
    if (res?.success) {
        showToast('History entry created!', 'success');
        document.querySelector('.modal-overlay')?.classList.remove('active');
        loadHistory();
    } else { showToast(res?.message || 'Failed', 'error'); }
    btn.disabled = false;
}

function openAddHistoryModal() {
    document.getElementById('addHistoryModal')?.classList.add('active');
}
function closeModal(el) {
    el.closest('.modal-overlay')?.classList.remove('active');
}
