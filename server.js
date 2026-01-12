const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Proxy endpoint for stop search
app.get('/api/stops', async (req, res) => {
    const query = req.query.q;
    if (!query || query.length < 3) {
        return res.json({ stops: [] });
    }

    try {
        const params = new URLSearchParams({
            outputFormat: 'JSON',
            type_sf: 'any',
            name_sf: query,
            coordOutputFormat: 'WGS84[DD.ddddd]',
            locationServerActive: '1',
            odvSugMacro: 'true'
        });

        const response = await fetch(`https://efa.vrr.de/vrr/XSLT_STOPFINDER_REQUEST?${params}`);
        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error('Stop search error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Proxy endpoint for departures
app.get('/api/departures', async (req, res) => {
    const stopId = req.query.stop;
    if (!stopId) {
        return res.status(400).json({ error: 'Missing stop parameter' });
    }

    try {
        const now = new Date();
        const params = new URLSearchParams({
            outputFormat: 'JSON',
            language: 'de',
            stateless: '1',
            coordOutputFormat: 'WGS84[DD.ddddd]',
            type_dm: 'any',
            name_dm: stopId,
            itdDateDay: now.getDate(),
            itdDateMonth: now.getMonth() + 1,
            itdDateYear: now.getFullYear(),
            itdTimeHour: now.getHours(),
            itdTimeMinute: now.getMinutes(),
            mode: 'direct',
            ptOptionsActive: '1',
            deleteAssignedStops_dm: '1',
            useProxFootSearch: '0',
            useRealtime: '1'
        });

        const response = await fetch(`https://efa.vrr.de/vrr/XSLT_DM_REQUEST?${params}`);
        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error('Departures error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Departure board running at http://localhost:${PORT}`);
});
