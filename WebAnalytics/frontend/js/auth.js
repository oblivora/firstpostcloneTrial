/**
 * auth.js — login and register page logic
 */

// ── Login ──────────────────────────────────────────────────
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = loginForm.querySelector('.auth-submit');
        const errorEl = document.getElementById('auth-error');
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> Signing in…';
        errorEl.classList.remove('show');

        try {
            await api.login({ email, password });
            window.location.href = '/dashboard.html';
        } catch (err) {
            errorEl.textContent = err.message;
            errorEl.classList.add('show');
            btn.disabled = false;
            btn.textContent = 'Sign In';
        }
    });
}

// ── Register ───────────────────────────────────────────────
const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = registerForm.querySelector('.auth-submit');
        const errorEl = document.getElementById('auth-error');
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirm = document.getElementById('confirm-password')?.value;

        errorEl.classList.remove('show');
        if (confirm !== undefined && confirm !== password) {
            errorEl.textContent = 'Passwords do not match';
            errorEl.classList.add('show');
            return;
        }

        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> Creating account…';

        try {
            await api.register({ name, email, password });
            window.location.href = '/dashboard.html';
        } catch (err) {
            errorEl.textContent = err.message;
            errorEl.classList.add('show');
            btn.disabled = false;
            btn.textContent = 'Create Account';
        }
    });
}

// ── Password toggle ────────────────────────────────────────
document.querySelectorAll('.toggle-password').forEach((btn) => {
    btn.addEventListener('click', () => {
        const input = btn.previousElementSibling;
        const shown = input.type === 'text';
        input.type = shown ? 'password' : 'text';
        btn.innerHTML = shown
            ? `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`
            : `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
    });
});

// ── Redirect if already logged in ─────────────────────────
(async () => {
    if (window.location.pathname.includes('login') || window.location.pathname.includes('register')) {
        try {
            await api.me();
            window.location.href = '/dashboard.html';
        } catch { /* not logged in, stay */ }
    }
})();
