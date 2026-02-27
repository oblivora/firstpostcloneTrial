/**
 * charts.js — Chart.js wrapper with dark theme
 */

Chart.defaults.color = '#94a3b8';
Chart.defaults.borderColor = '#1e2d45';
Chart.defaults.font.family = 'Inter, sans-serif';

const CHART_COLORS = {
    indigo: '#6366f1',
    cyan: '#06b6d4',
    green: '#22c55e',
    yellow: '#f59e0b',
    red: '#ef4444',
    purple: '#a855f7',
    pink: '#ec4899',
};

const PALETTE = Object.values(CHART_COLORS);

function gradientFill(ctx, color) {
    const gradient = ctx.createLinearGradient(0, 0, 0, 280);
    gradient.addColorStop(0, color + '44');
    gradient.addColorStop(1, color + '00');
    return gradient;
}

// Store chart instances so we can destroy before re-creating
const _charts = {};
function destroyChart(id) {
    if (_charts[id]) { _charts[id].destroy(); delete _charts[id]; }
}

/* ── Line Chart (Overview trend) ─────────────────────────── */
function initLineChart(canvasId, labels, datasets) {
    destroyChart(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const styledDatasets = datasets.map((ds, i) => {
        const color = PALETTE[i % PALETTE.length];
        return {
            label: ds.label,
            data: ds.data,
            borderColor: color,
            backgroundColor: gradientFill(ctx, color),
            borderWidth: 2,
            pointRadius: 3,
            pointHoverRadius: 5,
            pointBackgroundColor: color,
            fill: true,
            tension: 0.4,
        };
    });

    _charts[canvasId] = new Chart(ctx, {
        type: 'line',
        data: { labels, datasets: styledDatasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: {
                    display: datasets.length > 1,
                    labels: { boxWidth: 10, padding: 16, usePointStyle: true },
                },
                tooltip: {
                    backgroundColor: '#161b27',
                    borderColor: '#1e2d45',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 8,
                },
            },
            scales: {
                x: { grid: { display: false }, ticks: { maxTicksLimit: 8 } },
                y: { grid: { color: '#1e2d45' }, ticks: { maxTicksLimit: 6 } },
            },
        },
    });
}

/* ── Doughnut Chart (Device / Audience) ──────────────────── */
function initDoughnutChart(canvasId, labels, data) {
    destroyChart(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    _charts[canvasId] = new Chart(canvas.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: PALETTE.map(c => c + 'cc'),
                borderColor: PALETTE.map(c => c + '33'),
                borderWidth: 1,
                hoverOffset: 6,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '68%',
            plugins: {
                legend: { position: 'right', labels: { boxWidth: 10, padding: 14, usePointStyle: true } },
                tooltip: {
                    backgroundColor: '#161b27',
                    borderColor: '#1e2d45',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 8,
                },
            },
        },
    });
}

/* ── Horizontal Bar Chart (Acquisition channels) ─────────── */
function initBarChart(canvasId, labels, datasets, horizontal = false) {
    destroyChart(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const styledDatasets = datasets.map((ds, i) => {
        const color = PALETTE[i % PALETTE.length];
        return {
            label: ds.label,
            data: ds.data,
            backgroundColor: color + 'bb',
            borderColor: color,
            borderWidth: 1,
            borderRadius: 4,
            borderSkipped: false,
        };
    });

    _charts[canvasId] = new Chart(canvas.getContext('2d'), {
        type: 'bar',
        data: { labels, datasets: styledDatasets },
        options: {
            indexAxis: horizontal ? 'y' : 'x',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: datasets.length > 1 },
                tooltip: {
                    backgroundColor: '#161b27',
                    borderColor: '#1e2d45',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 8,
                },
            },
            scales: {
                x: { grid: { color: horizontal ? '#1e2d45' : 'transparent' } },
                y: { grid: { color: horizontal ? 'transparent' : '#1e2d45' } },
            },
        },
    });
}

/* ── Format helpers ──────────────────────────────────────── */
function formatDate(yyyymmdd) {
    const s = String(yyyymmdd);
    return `${s.slice(4, 6)}/${s.slice(6, 8)}`;
}

function formatNumber(n) {
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return String(n);
}

function formatDuration(seconds) {
    const s = parseInt(seconds);
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return m > 0 ? `${m}m ${rem}s` : `${rem}s`;
}
