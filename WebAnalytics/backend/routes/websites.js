const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', (req, res) => {
    const db = getDb();
    const sites = db.prepare(
        `SELECT id, display_name, ga_property_id, google_email, connected, created_at
     FROM websites WHERE user_id = ? ORDER BY created_at DESC`
    ).all(req.user.id);
    res.json(sites);
});

router.post('/', (req, res) => {
    const { display_name, ga_property_id } = req.body;
    if (!ga_property_id) return res.status(400).json({ error: 'GA4 Property ID is required' });
    const db = getDb();
    const result = db.prepare(
        'INSERT INTO websites (user_id, display_name, ga_property_id) VALUES (?, ?, ?)'
    ).run(req.user.id, (display_name || 'My Website').trim(), ga_property_id.trim());
    res.status(201).json({ id: result.lastInsertRowid });
});

router.put('/:id', (req, res) => {
    const { display_name, ga_property_id } = req.body;
    const db = getDb();
    db.prepare(
        `UPDATE websites SET display_name = COALESCE(?, display_name),
     ga_property_id = COALESCE(?, ga_property_id) WHERE id = ? AND user_id = ?`
    ).run(display_name, ga_property_id, req.params.id, req.user.id);
    res.json({ ok: true });
});

router.delete('/:id', (req, res) => {
    const db = getDb();
    db.prepare('DELETE FROM websites WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    res.json({ ok: true });
});

module.exports = router;
