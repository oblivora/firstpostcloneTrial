const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', async (req, res) => {
    const db = getDb();
    const result = await db.query(
        `SELECT id, display_name, ga_property_id, google_email, connected, created_at
     FROM websites WHERE user_id = $1 ORDER BY created_at DESC`,
        [req.user.id]
    );
    res.json(result.rows);
});

router.post('/', async (req, res) => {
    const { display_name, ga_property_id } = req.body;
    if (!ga_property_id) return res.status(400).json({ error: 'GA4 Property ID is required' });
    const db = getDb();
    const result = await db.query(
        'INSERT INTO websites (user_id, display_name, ga_property_id) VALUES ($1, $2, $3) RETURNING id',
        [req.user.id, (display_name || 'My Website').trim(), ga_property_id.trim()]
    );
    res.status(201).json({ id: result.rows[0].id });
});

router.put('/:id', async (req, res) => {
    const { display_name, ga_property_id } = req.body;
    const db = getDb();
    await db.query(
        `UPDATE websites SET display_name = COALESCE($1, display_name),
     ga_property_id = COALESCE($2, ga_property_id) WHERE id = $3 AND user_id = $4`,
        [display_name, ga_property_id, req.params.id, req.user.id]
    );
    res.json({ ok: true });
});

router.delete('/:id', async (req, res) => {
    const db = getDb();
    await db.query('DELETE FROM websites WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.json({ ok: true });
});

module.exports = router;
