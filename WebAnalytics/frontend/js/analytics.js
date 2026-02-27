/**
 * analytics.js — fetches GA4 data and renders every dashboard section
 * Called by dashboard.html after currentSiteId is set.
 */

let currentSiteId = null;
let realtimeInterval = null;
let currentDateRange = '7daysAgo';

// ── Section loaders (called by router when section becomes active) ───

async function loadSection(sectionName) {
    if (!currentSiteId) return;
    switch (sectionName) {
        case 'overview': return loadOverview();
        case 'realtime': return loadRealtime();
        case 'audience': return loadAudience();
        case 'acquisition': return loadAcquisition();
        case 'behavior': return loadBehavior();
    }
}

// ── OVERVIEW ────────────────────────────────────────────────
async function loadOverview() {
    setLoading('overview', true);
    try {
        const data = await api.overview(currentSiteId, currentDateRange, 'today');

        // KPI cards
        const { totals } = data;
        setText('kpi-sessions', formatNumber(totals.sessions || 0));
        setText('kpi-users', formatNumber(totals.users || 0));
        setText('kpi-new-users', formatNumber(totals.newUsers || 0));
        setText('kpi-pageviews', formatNumber(totals.pageViews || 0));
        setText('kpi-bounce', totals.bounceRate || '—');
        setText('kpi-duration', formatDuration(parseInt(totals.avgDuration) || 0));

        // Line chart
        const labels = data.rows.map(r => formatDate(r.date));
        const sessions = data.rows.map(r => r.sessions);
        const users = data.rows.map(r => r.users);
        initLineChart('overview-chart', labels, [
            { label: 'Sessions', data: sessions },
            { label: 'Users', data: users },
        ]);
    } catch (err) {
        showSectionError('overview', err.message);
    }
    setLoading('overview', false);
}

// ── REAL-TIME ────────────────────────────────────────────────
async function loadRealtime() {
    clearInterval(realtimeInterval);
    await fetchRealtimeData();
    realtimeInterval = setInterval(fetchRealtimeData, 10000);
}

async function fetchRealtimeData() {
    try {
        const data = await api.realtime(currentSiteId);
        setText('rt-count', data.totalUsers);
        setText('rt-updated', `Updated ${new Date().toLocaleTimeString()}`);

        const listEl = document.getElementById('rt-pages-list');
        if (!listEl) return;
        if (!data.pages.length) {
            listEl.innerHTML = `<tr><td colspan="2" class="text-muted" style="text-align:center;padding:20px">No active pages</td></tr>`;
            return;
        }
        listEl.innerHTML = data.pages.map(p => `
      <tr>
        <td>${escapeHtml(p.page)}</td>
        <td style="text-align:right;">
          <span class="badge badge-green">${p.users}</span>
        </td>
      </tr>
    `).join('');
    } catch (err) {
        setText('rt-count', '—');
    }
}

// Stop polling when leaving realtime section
function stopRealtime() { clearInterval(realtimeInterval); }

// ── AUDIENCE ────────────────────────────────────────────────
async function loadAudience() {
    setLoading('audience', true);
    try {
        const data = await api.audience(currentSiteId);

        initDoughnutChart(
            'device-chart',
            data.devices.map(d => d.device),
            data.devices.map(d => d.users)
        );

        const tbody = document.getElementById('country-table-body');
        if (tbody) {
            tbody.innerHTML = data.countries.map((c, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${escapeHtml(c.country)}</td>
          <td>${formatNumber(c.users)}</td>
          <td>${formatNumber(c.sessions)}</td>
        </tr>
      `).join('') || '<tr><td colspan="4" class="text-muted">No data</td></tr>';
        }
    } catch (err) {
        showSectionError('audience', err.message);
    }
    setLoading('audience', false);
}

// ── ACQUISITION ─────────────────────────────────────────────
async function loadAcquisition() {
    setLoading('acquisition', true);
    try {
        const data = await api.acquisition(currentSiteId);

        initBarChart(
            'acquisition-chart',
            data.channels.map(c => c.channel),
            [{ label: 'Sessions', data: data.channels.map(c => c.sessions) }],
            true
        );

        const tbody = document.getElementById('acq-table-body');
        if (tbody) {
            tbody.innerHTML = data.channels.map(c => `
        <tr>
          <td>${escapeHtml(c.channel)}</td>
          <td>${formatNumber(c.sessions)}</td>
          <td>${formatNumber(c.users)}</td>
          <td>${c.bounceRate}</td>
          <td>${formatNumber(c.conversions)}</td>
        </tr>
      `).join('') || '<tr><td colspan="5" class="text-muted">No data</td></tr>';
        }
    } catch (err) {
        showSectionError('acquisition', err.message);
    }
    setLoading('acquisition', false);
}

// ── BEHAVIOR ────────────────────────────────────────────────
async function loadBehavior() {
    setLoading('behavior', true);
    try {
        const data = await api.behavior(currentSiteId);

        initBarChart(
            'events-chart',
            data.events.map(e => e.event),
            [{ label: 'Event Count', data: data.events.map(e => e.count) }],
            false
        );

        const tbody = document.getElementById('pages-table-body');
        if (tbody) {
            tbody.innerHTML = data.pages.map((p, i) => `
        <tr>
          <td>${i + 1}</td>
          <td style="max-width:280px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${escapeHtml(p.path)}">${escapeHtml(p.path)}</td>
          <td>${formatNumber(p.views)}</td>
          <td>${formatNumber(p.users)}</td>
          <td>${p.avgDuration}</td>
          <td>${p.bounceRate}</td>
        </tr>
      `).join('') || '<tr><td colspan="6" class="text-muted">No data</td></tr>';
        }
    } catch (err) {
        showSectionError('behavior', err.message);
    }
    setLoading('behavior', false);
}

// ── Helpers ─────────────────────────────────────────────────
function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function setLoading(section, loading) {
    const el = document.getElementById(`${section}-loading`);
    const content = document.getElementById(`${section}-content`);
    if (el) el.style.display = loading ? 'flex' : 'none';
    if (content) content.style.display = loading ? 'none' : 'block';
}

function showSectionError(section, message) {
    const content = document.getElementById(`${section}-content`);
    if (content) {
        content.style.display = 'block';
        content.innerHTML = `
      <div class="empty-state">
        <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
        </svg>
        <h3>Could not load data</h3>
        <p>${escapeHtml(message)}</p>
      </div>`;
    }
}
