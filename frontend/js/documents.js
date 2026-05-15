document.addEventListener('DOMContentLoaded', () => {
    loadDocuments();
    initUpload();
});

async function loadDocuments() {
    const container = document.getElementById('docGrid');
    if (!container) return;
    container.innerHTML = '<div class="spinner"></div>';
    const params = new URLSearchParams(window.location.search);
    const search = params.get('search') || '';
    const category = params.get('category') || '';
    let url = '/documents?limit=20';
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (category) url += `&category=${category}`;
    const res = await api.get(url);
    if (!res?.success) { container.innerHTML = '<p style="color:var(--text-muted)">Failed to load documents.</p>'; return; }
    if (res.data.length === 0) { container.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:40px">No documents found. Upload your first document!</p>'; return; }
    container.innerHTML = res.data.map(doc => {
        const icon = getFileIcon(doc.file_type);
        const tags = (doc.tags || []).map(t => `<span class="source-tag">${t}</span>`).join('');
        return `<div class="card doc-card" onclick="viewDocument('${doc.id}')">
            <div class="doc-icon">${icon}</div>
            <div class="doc-title">${doc.title}</div>
            <div class="doc-meta">${doc.departments?.name || 'General'} · ${getCategoryBadge(doc.category)} · ${formatDate(doc.created_at)}</div>
            <div class="doc-meta" style="margin-top:4px">Uploaded by ${doc.users?.name || 'Unknown'}</div>
            <div class="doc-tags">${tags}</div>
        </div>`;
    }).join('');
}

function getFileIcon(type) {
    if (type?.includes('pdf')) return '📄';
    if (type?.includes('word') || type?.includes('docx')) return '📝';
    if (type?.includes('sheet') || type?.includes('excel')) return '📊';
    return '📃';
}

function viewDocument(id) {
    showToast('Document preview - feature in progress', 'info');
}

function initUpload() {
    const zone = document.getElementById('uploadZone');
    const input = document.getElementById('fileInput');
    const form = document.getElementById('uploadForm');
    if (!zone || !input) return;

    zone.addEventListener('click', () => input.click());
    zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('dragover'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
    zone.addEventListener('drop', (e) => { e.preventDefault(); zone.classList.remove('dragover'); input.files = e.dataTransfer.files; showFileName(); });
    input.addEventListener('change', showFileName);

    function showFileName() {
        if (input.files.length > 0) {
            document.getElementById('fileName').textContent = input.files[0].name;
            document.getElementById('fileName').style.display = 'block';
        }
    }

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!input.files.length) { showToast('Please select a file', 'error'); return; }
            const btn = form.querySelector('button[type="submit"]');
            btn.disabled = true; btn.textContent = 'Uploading...';
            const progress = document.getElementById('progressFill');
            if (progress) progress.style.width = '30%';

            const fd = new FormData();
            fd.append('file', input.files[0]);
            fd.append('title', document.getElementById('docTitle').value);
            fd.append('description', document.getElementById('docDesc').value || '');
            fd.append('department', document.getElementById('docDept').value || '');
            fd.append('category', document.getElementById('docCategory').value || 'general');
            fd.append('tags', document.getElementById('docTags').value || '');

            if (progress) progress.style.width = '60%';
            const res = await api.post('/documents/upload', fd);
            if (progress) progress.style.width = '100%';

            if (res?.success) {
                showToast('Document uploaded successfully!', 'success');
                setTimeout(() => window.location.href = 'documents.html', 1000);
            } else {
                showToast(res?.message || 'Upload failed', 'error');
                btn.disabled = false; btn.textContent = 'Upload Document';
                if (progress) progress.style.width = '0%';
            }
        });
    }
}

function searchDocuments() {
    const q = document.getElementById('searchInput')?.value;
    if (q) window.location.href = `documents.html?search=${encodeURIComponent(q)}`;
}
