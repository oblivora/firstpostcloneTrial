const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const { getDb } = require('../db/database');
const authMiddleware = require('../middleware/authMiddleware');

function getOAuth2Client() {
    return new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.REDIRECT_URI
    );
}

// GET /api/google/connect?siteId=<id>
router.get('/connect', authMiddleware, (req, res) => {
    const { siteId } = req.query;
    if (!siteId) return res.status(400).json({ error: 'siteId required' });

    const db = getDb();
    const site = db.prepare('SELECT id FROM websites WHERE id = ? AND user_id = ?').get(siteId, req.user.id);
    if (!site) return res.status(404).json({ error: 'Website not found' });

    const oauth2Client = getOAuth2Client();
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: ['https://www.googleapis.com/auth/analytics.readonly'],
        state: JSON.stringify({ userId: req.user.id, siteId }),
    });
    res.redirect(authUrl);
});

// GET /api/google/callback
router.get('/callback', async (req, res) => {
    const { code, state, error } = req.query;

    if (error) {
        return res.redirect(`${process.env.FRONTEND_URL}/dashboard.html?error=access_denied`);
    }

    let userId, siteId;
    try {
        ({ userId, siteId } = JSON.parse(state));
    } catch {
        return res.redirect(`${process.env.FRONTEND_URL}/dashboard.html?error=invalid_state`);
    }

    try {
        const oauth2Client = getOAuth2Client();
        const { tokens } = await oauth2Client.getToken(code);

        if (!tokens.refresh_token) {
            return res.redirect(
                `${process.env.FRONTEND_URL}/dashboard.html?error=no_refresh_token`
            );
        }

        // Get the Google account email
        oauth2Client.setCredentials(tokens);
        const { google } = require('googleapis');
        const oauth2Info = google.oauth2({ version: 'v2', auth: oauth2Client });
        const { data: googleUser } = await oauth2Info.userinfo.get();

        const db = getDb();
        db.prepare(
            `UPDATE websites SET google_refresh_token = ?, google_email = ?, connected = 1 WHERE id = ? AND user_id = ?`
        ).run(tokens.refresh_token, googleUser.email, siteId, userId);

        res.redirect(`${process.env.FRONTEND_URL}/dashboard.html?connected=true&siteId=${siteId}`);
    } catch (e) {
        console.error('OAuth callback error:', e);
        res.redirect(`${process.env.FRONTEND_URL}/dashboard.html?error=oauth_failed`);
    }
});

module.exports = router;
