require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { initDb } = require('./db/database');

const app = express();

// ── Security headers ────────────────────────────────────────────────────────
app.use(helmet());

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(cookieParser());

// ── Rate limiting on auth endpoints ─────────────────────────────────────────
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' },
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/google', require('./routes/google'));
app.use('/api/websites', require('./routes/websites'));
app.use('/api/analytics', require('./routes/analytics'));

// Fallback: serve frontend for any unknown route
app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'API route not found' });
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ── Start server only after DB is ready ───────────────────
const PORT = process.env.PORT || 3000;
initDb().then(() => {
    app.listen(PORT, () => {
        console.log(`\n🚀 WebAnalytics running at http://localhost:${PORT}`);
        console.log(`   → Landing:   http://localhost:${PORT}/`);
        console.log(`   → Dashboard: http://localhost:${PORT}/dashboard.html\n`);
    });
}).catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
});
