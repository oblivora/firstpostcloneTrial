const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../db/database');
const authMiddleware = require('../middleware/authMiddleware');

const COOKIE_OPTS = {
    httpOnly: true,
    secure: true, // Required for cross-origin cookies (SameSite=none)
    sameSite: 'none', // Required because Render and Cloudflare Pages are on different domains
    maxAge: 7 * 24 * 60 * 60 * 1000,
};

function signToken(user) {
    return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
        return res.status(400).json({ error: 'All fields required' });
    if (password.length < 6)
        return res.status(400).json({ error: 'Password must be at least 6 characters' });

    try {
        const db = getDb();
        const hash = await bcrypt.hash(password, 12);
        const result = await db.query(
            'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
            [name.trim(), email.toLowerCase().trim(), hash]
        );

        const user = { id: result.rows[0].id, email: email.toLowerCase().trim() };
        const token = signToken(user);
        res.cookie('token', token, COOKIE_OPTS)
            .status(201)
            .json({ user: { id: user.id, name: name.trim(), email: user.email } });
    } catch (e) {
        if (e.code === '23505' || (e.message && e.message.includes('UNIQUE')))
            return res.status(409).json({ error: 'An account with this email already exists' });
        console.error('Register error:', e);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ error: 'Email and password required' });

    const db = getDb();
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    const user = result.rows[0];

    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

    const token = signToken(user);
    res.cookie('token', token, COOKIE_OPTS)
        .json({ user: { id: user.id, name: user.name, email: user.email } });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
    res.clearCookie('token').json({ message: 'Logged out successfully' });
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
    const db = getDb();
    const result = await db.query('SELECT id, name, email, created_at FROM users WHERE id = $1', [req.user.id]);
    const user = result.rows[0];

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
});

module.exports = router;
