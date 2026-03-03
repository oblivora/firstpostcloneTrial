/**
 * api.js — centralized fetch wrapper
 * All API calls go through here; credentials (cookies) are always included.
 */

// For local development (Express serves the frontend):
// const API_BASE = ''; 
// For production (Frontend on Cloudflare, Backend on Render):
const API_BASE = 'https://webanalytic-api.onrender.com'; // <-- RENDER URL

async function apiFetch(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
        ...options,
        body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        const err = new Error(data.error || `Request failed (${res.status})`);
        err.status = res.status;
        throw err;
    }
    return data;
}

const api = {
    // Auth
    register: (body) => apiFetch('/api/auth/register', { method: 'POST', body }),
    login: (body) => apiFetch('/api/auth/login', { method: 'POST', body }),
    logout: () => apiFetch('/api/auth/logout', { method: 'POST' }),
    me: () => apiFetch('/api/auth/me'),

    // Websites
    getWebsites: () => apiFetch('/api/websites'),
    addWebsite: (body) => apiFetch('/api/websites', { method: 'POST', body }),
    deleteWebsite: (id) => apiFetch(`/api/websites/${id}`, { method: 'DELETE' }),

    // Google OAuth — redirect-based, not fetch
    connectGoogle: (siteId) => {
        window.location.href = `${API_BASE}/api/google/connect?siteId=${siteId}`;
    },

    // Analytics
    realtime: (siteId) => apiFetch(`/api/analytics/realtime?siteId=${siteId}`),
    overview: (siteId, startDate, endDate) =>
        apiFetch(`/api/analytics/overview?siteId=${siteId}&startDate=${startDate}&endDate=${endDate}`),
    audience: (siteId) => apiFetch(`/api/analytics/audience?siteId=${siteId}`),
    acquisition: (siteId) => apiFetch(`/api/analytics/acquisition?siteId=${siteId}`),
    behavior: (siteId) => apiFetch(`/api/analytics/behavior?siteId=${siteId}`),
};

// Toast notification helper
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

// Auth guard — call on dashboard pages
async function requireAuth() {
    try {
        const user = await api.me();
        return user;
    } catch {
        window.location.href = '/login.html';
        return null;
    }
}
