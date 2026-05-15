document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = loginForm.querySelector('button[type="submit"]');
            btn.disabled = true; btn.textContent = 'Signing in...';

            const res = await api.post('/auth/login', {
                email: document.getElementById('email').value,
                password: document.getElementById('password').value
            });

            if (res && res.success) {
                api.setToken(res.data.token);
                api.setUser(res.data.user);
                showToast('Login successful!', 'success');
                setTimeout(() => window.location.href = '/frontend/pages/dashboard.html', 500);
            } else {
                showToast(res?.message || 'Login failed', 'error');
                btn.disabled = false; btn.textContent = 'Sign In';
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = registerForm.querySelector('button[type="submit"]');
            btn.disabled = true; btn.textContent = 'Creating account...';
            const password = document.getElementById('password').value;
            const confirm = document.getElementById('confirmPassword').value;

            if (password !== confirm) {
                showToast('Passwords do not match', 'error');
                btn.disabled = false; btn.textContent = 'Create Account';
                return;
            }

            const res = await api.post('/auth/register', {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                password,
                department: document.getElementById('department').value || null,
                role: 'employee'
            });

            if (res && res.success) {
                api.setToken(res.data.token);
                api.setUser(res.data.user);
                showToast('Account created!', 'success');
                setTimeout(() => window.location.href = '/frontend/pages/dashboard.html', 500);
            } else {
                showToast(res?.message || 'Registration failed', 'error');
                btn.disabled = false; btn.textContent = 'Create Account';
            }
        });
    }
});

function showToast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) { container = document.createElement('div'); container.className = 'toast-container'; document.body.appendChild(container); }
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}
