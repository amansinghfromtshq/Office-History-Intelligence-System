document.addEventListener('DOMContentLoaded', () => {
    loadSuggestions();
    loadChatHistory();
    const input = document.getElementById('chatInput');
    if (input) input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } });
});

async function loadSuggestions() {
    const container = document.getElementById('suggestions');
    if (!container) return;
    const res = await api.get('/chat/suggestions');
    if (!res?.success) return;
    container.innerHTML = res.data.map(s => `<button class="suggestion-chip" onclick="askQuestion('${s}')">${s}</button>`).join('');
}

async function loadChatHistory() {
    const list = document.getElementById('chatHistoryList');
    if (!list) return;
    const res = await api.get('/chat/history');
    if (!res?.success) return;
    list.innerHTML = (res.data || []).slice(0, 20).map(c => `<div class="nav-item" onclick="askQuestion('${c.question.replace(/'/g, "\\'")}')"><i class="bi bi-chat"></i><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c.question}</span></div>`).join('') || '<p style="color:var(--text-muted);padding:12px;font-size:0.8rem">No chat history yet</p>';
}

function askQuestion(q) {
    const input = document.getElementById('chatInput');
    if (input) { input.value = q; sendMessage(); }
}

async function sendMessage() {
    const input = document.getElementById('chatInput');
    const messages = document.getElementById('chatMessages');
    if (!input || !messages) return;
    const question = input.value.trim();
    if (!question) return;
    input.value = '';

    // Add user message
    messages.innerHTML += `<div class="message user">${escapeHtml(question)}</div>`;

    // Add typing indicator
    const typingId = 'typing-' + Date.now();
    messages.innerHTML += `<div class="typing-indicator" id="${typingId}"><span></span><span></span><span></span></div>`;
    messages.scrollTop = messages.scrollHeight;

    const res = await api.post('/chat', { question });
    document.getElementById(typingId)?.remove();

    if (res?.success) {
        let sourcesHtml = '';
        if (res.data.sources?.length > 0) {
            sourcesHtml = `<div class="message-sources"><span>Sources: </span>${res.data.sources.map(s => `<span class="source-tag">${s.title}</span>`).join('')}</div>`;
        }
        messages.innerHTML += `<div class="message ai">${formatMarkdown(res.data.answer)}${sourcesHtml}</div>`;
    } else {
        messages.innerHTML += `<div class="message ai" style="border-left:3px solid var(--danger)">Sorry, I couldn't process your question. ${res?.message || 'Please try again.'}</div>`;
    }
    messages.scrollTop = messages.scrollHeight;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatMarkdown(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^- (.*)/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
        .replace(/\n/g, '<br>');
}
