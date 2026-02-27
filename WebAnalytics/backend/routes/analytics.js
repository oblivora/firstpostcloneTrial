const express = require('express');
const router = express.Router();
const { BetaAnalyticsDataClient } = require('@google-analytics/data');
const { OAuth2Client } = require('google-auth-library');
const { getDb } = require('../db/database');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

async function getAnalyticsClient(siteId, userId) {
    const db = getDb();
    const site = db.prepare('SELECT * FROM websites WHERE id = ? AND user_id = ?').get(siteId, userId);

    if (!site) throw Object.assign(new Error('Website not found'), { status: 404 });
    if (!site.connected || !site.google_refresh_token)
        throw Object.assign(new Error('Website not connected to Google Analytics. Go to Settings to connect.'), { status: 403 });

    const auth = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
    auth.setCredentials({ refresh_token: site.google_refresh_token });

    const client = new BetaAnalyticsDataClient({ authClient: auth });
    const propertyId = site.ga_property_id.startsWith('properties/')
        ? site.ga_property_id
        : `properties/${site.ga_property_id}`;

    return { client, propertyId };
}

function handleError(res, err) {
    console.error('Analytics error:', err.message);
    res.status(err.status || 500).json({ error: err.message });
}

// GET /api/analytics/realtime?siteId=
router.get('/realtime', async (req, res) => {
    try {
        const { client, propertyId } = await getAnalyticsClient(req.query.siteId, req.user.id);
        const [response] = await client.runRealtimeReport({
            property: propertyId,
            dimensions: [{ name: 'unifiedScreenName' }],
            metrics: [{ name: 'activeUsers' }],
        });
        const pages = (response.rows || []).map(row => ({
            page: row.dimensionValues[0].value,
            users: parseInt(row.metricValues[0].value),
        }));
        res.json({ totalUsers: pages.reduce((s, p) => s + p.users, 0), pages });
    } catch (e) { handleError(res, e); }
});

// GET /api/analytics/overview?siteId=&startDate=&endDate=
router.get('/overview', async (req, res) => {
    try {
        const { client, propertyId } = await getAnalyticsClient(req.query.siteId, req.user.id);
        const startDate = req.query.startDate || '7daysAgo';
        const endDate = req.query.endDate || 'today';

        const [[trend], [totalsResp]] = await Promise.all([
            client.runReport({
                property: propertyId,
                dateRanges: [{ startDate, endDate }],
                dimensions: [{ name: 'date' }],
                metrics: [{ name: 'sessions' }, { name: 'activeUsers' }, { name: 'bounceRate' }, { name: 'averageSessionDuration' }],
                orderBys: [{ dimension: { dimensionName: 'date' } }],
            }),
            client.runReport({
                property: propertyId,
                dateRanges: [{ startDate, endDate }],
                metrics: [{ name: 'sessions' }, { name: 'activeUsers' }, { name: 'bounceRate' }, { name: 'averageSessionDuration' }, { name: 'screenPageViews' }, { name: 'newUsers' }],
            }),
        ]);

        const rows = (trend.rows || []).map(row => ({
            date: row.dimensionValues[0].value,
            sessions: parseInt(row.metricValues[0].value),
            users: parseInt(row.metricValues[1].value),
            bounceRate: (parseFloat(row.metricValues[2].value) * 100).toFixed(1),
            avgDuration: parseFloat(row.metricValues[3].value).toFixed(0),
        }));

        const t = totalsResp.rows?.[0];
        const totals = t ? {
            sessions: parseInt(t.metricValues[0].value),
            users: parseInt(t.metricValues[1].value),
            bounceRate: (parseFloat(t.metricValues[2].value) * 100).toFixed(1) + '%',
            avgDuration: parseFloat(t.metricValues[3].value).toFixed(0) + 's',
            pageViews: parseInt(t.metricValues[4].value),
            newUsers: parseInt(t.metricValues[5].value),
        } : {};

        res.json({ rows, totals });
    } catch (e) { handleError(res, e); }
});

// GET /api/analytics/audience?siteId=
router.get('/audience', async (req, res) => {
    try {
        const { client, propertyId } = await getAnalyticsClient(req.query.siteId, req.user.id);
        const [[devices], [countries]] = await Promise.all([
            client.runReport({
                property: propertyId,
                dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
                dimensions: [{ name: 'deviceCategory' }],
                metrics: [{ name: 'activeUsers' }],
            }),
            client.runReport({
                property: propertyId,
                dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
                dimensions: [{ name: 'country' }],
                metrics: [{ name: 'activeUsers' }, { name: 'sessions' }],
                orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
                limit: 10,
            }),
        ]);

        res.json({
            devices: (devices.rows || []).map(r => ({ device: r.dimensionValues[0].value, users: parseInt(r.metricValues[0].value) })),
            countries: (countries.rows || []).map(r => ({ country: r.dimensionValues[0].value, users: parseInt(r.metricValues[0].value), sessions: parseInt(r.metricValues[1].value) })),
        });
    } catch (e) { handleError(res, e); }
});

// GET /api/analytics/acquisition?siteId=
router.get('/acquisition', async (req, res) => {
    try {
        const { client, propertyId } = await getAnalyticsClient(req.query.siteId, req.user.id);
        const [[response]] = await Promise.all([
            client.runReport({
                property: propertyId,
                dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
                dimensions: [{ name: 'sessionDefaultChannelGroup' }],
                metrics: [{ name: 'sessions' }, { name: 'activeUsers' }, { name: 'bounceRate' }, { name: 'conversions' }],
                orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
            }),
        ]);

        res.json({
            channels: (response.rows || []).map(r => ({
                channel: r.dimensionValues[0].value,
                sessions: parseInt(r.metricValues[0].value),
                users: parseInt(r.metricValues[1].value),
                bounceRate: (parseFloat(r.metricValues[2].value) * 100).toFixed(1) + '%',
                conversions: parseInt(r.metricValues[3].value),
            })),
        });
    } catch (e) { handleError(res, e); }
});

// GET /api/analytics/behavior?siteId=
router.get('/behavior', async (req, res) => {
    try {
        const { client, propertyId } = await getAnalyticsClient(req.query.siteId, req.user.id);
        const [[pages], [events]] = await Promise.all([
            client.runReport({
                property: propertyId,
                dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
                dimensions: [{ name: 'pagePath' }],
                metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }, { name: 'averageSessionDuration' }, { name: 'bounceRate' }],
                orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
                limit: 15,
            }),
            client.runReport({
                property: propertyId,
                dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
                dimensions: [{ name: 'eventName' }],
                metrics: [{ name: 'eventCount' }, { name: 'eventCountPerUser' }],
                orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
                limit: 10,
            }),
        ]);

        res.json({
            pages: (pages.rows || []).map(r => ({
                path: r.dimensionValues[0].value,
                views: parseInt(r.metricValues[0].value),
                users: parseInt(r.metricValues[1].value),
                avgDuration: parseFloat(r.metricValues[2].value).toFixed(0) + 's',
                bounceRate: (parseFloat(r.metricValues[3].value) * 100).toFixed(1) + '%',
            })),
            events: (events.rows || []).map(r => ({
                event: r.dimensionValues[0].value,
                count: parseInt(r.metricValues[0].value),
                perUser: parseFloat(r.metricValues[1].value).toFixed(2),
            })),
        });
    } catch (e) { handleError(res, e); }
});

module.exports = router;
