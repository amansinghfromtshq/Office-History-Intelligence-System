const API_BASE = 'http://localhost:3000/api';

const api = {
    getToken() { return localStorage.getItem('token'); },
    setToken(token) { localStorage.setItem('token', token); },
    setUser(user) { localStorage.setItem('user', JSON.stringify(user)); },
    getUser() { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } },
    logout() { localStorage.clear(); window.location.href = '/frontend/index.html'; },

    async request(endpoint, options = {}) {
        const token = this.getToken();
        const headers = { ...options.headers };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        if (!(options.body instanceof FormData)) headers['Content-Type'] = 'application/json';

        try {
            const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
            const data = await res.json();
            if (res.status === 401) { this.logout(); return; }
            return data;
        } catch (err) {
            console.error('API Error:', err);
            return { success: false, message: 'Network error. Please try again.' };
        }
    },

    get(endpoint) { return this.request(endpoint); },
    post(endpoint, body) {
        return this.request(endpoint, {
            method: 'POST',
            body: body instanceof FormData ? body : JSON.stringify(body)
        });
    },
    put(endpoint, body) {
        return this.request(endpoint, { method: 'PUT', body: JSON.stringify(body) });
    },
    delete(endpoint) { return this.request(endpoint, { method: 'DELETE' }); }
};
