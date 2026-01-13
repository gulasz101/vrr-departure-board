const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Logging helper
function log(level, message, data) {
    const timestamp = new Date().toISOString();
    const dataStr = data ? ' ' + JSON.stringify(data) : '';
    console.log(`[${timestamp}] [${level}] ${message}${dataStr}`);
}

// Request logging middleware
app.use((req, res, next) => {
    log('INFO', `${req.method} ${req.path}`, { query: req.query });
    next();
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Proxy endpoint for stop search
app.get('/api/stops', async (req, res) => {
    const query = req.query.q;
    if (!query || query.length < 3) {
        log('DEBUG', 'Stop search: query too short', { query });
        return res.json({ stops: [] });
    }

    const vrrUrl = 'https://efa.vrr.de/vrr/XSLT_STOPFINDER_REQUEST';

    try {
        const params = new URLSearchParams({
            outputFormat: 'JSON',
            type_sf: 'any',
            name_sf: query,
            coordOutputFormat: 'WGS84[DD.ddddd]',
            locationServerActive: '1',
            odvSugMacro: 'true'
        });

        const fullUrl = `${vrrUrl}?${params}`;
        log('DEBUG', 'Fetching stops from VRR API', { url: fullUrl });

        const response = await fetch(fullUrl);

        log('DEBUG', 'VRR API response', {
            status: response.status,
            statusText: response.statusText
        });

        if (!response.ok) {
            const errorMsg = `VRR API returned ${response.status} ${response.statusText}`;
            log('ERROR', 'Stop search failed', {
                status: response.status,
                statusText: response.statusText,
                url: fullUrl
            });
            return res.status(502).json({
                error: errorMsg,
                details: {
                    type: 'VRR_API_ERROR',
                    status: response.status,
                    statusText: response.statusText
                }
            });
        }

        const data = await response.json();
        const pointCount = data?.stopFinder?.points?.length ||
                          (data?.stopFinder?.points?.point ? 1 : 0);
        log('INFO', 'Stop search successful', { query, resultsCount: pointCount });

        res.json(data);
    } catch (err) {
        log('ERROR', 'Stop search exception', {
            error: err.message,
            stack: err.stack,
            query
        });

        let errorType = 'UNKNOWN_ERROR';
        let userMessage = err.message;

        if (err.code === 'ENOTFOUND' || err.code === 'EAI_AGAIN') {
            errorType = 'DNS_ERROR';
            userMessage = 'Cannot resolve VRR API hostname - check internet connection';
        } else if (err.code === 'ECONNREFUSED') {
            errorType = 'CONNECTION_REFUSED';
            userMessage = 'Connection to VRR API refused';
        } else if (err.code === 'ETIMEDOUT' || err.code === 'ESOCKETTIMEDOUT') {
            errorType = 'TIMEOUT';
            userMessage = 'Connection to VRR API timed out';
        } else if (err.name === 'TypeError' && err.message.includes('fetch')) {
            errorType = 'NETWORK_ERROR';
            userMessage = 'Network error connecting to VRR API';
        }

        res.status(500).json({
            error: userMessage,
            details: {
                type: errorType,
                code: err.code,
                originalMessage: err.message
            }
        });
    }
});

// Proxy endpoint for departures
app.get('/api/departures', async (req, res) => {
    const stopId = req.query.stop;
    if (!stopId) {
        log('WARN', 'Departures request missing stop parameter');
        return res.status(400).json({
            error: 'Missing stop parameter',
            details: { type: 'MISSING_PARAMETER' }
        });
    }

    const vrrUrl = 'https://efa.vrr.de/vrr/XSLT_DM_REQUEST';

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

        const fullUrl = `${vrrUrl}?${params}`;
        log('DEBUG', 'Fetching departures from VRR API', { stopId, url: fullUrl });

        const response = await fetch(fullUrl);

        log('DEBUG', 'VRR API response', {
            status: response.status,
            statusText: response.statusText,
            stopId
        });

        if (!response.ok) {
            const errorMsg = `VRR API returned ${response.status} ${response.statusText}`;
            log('ERROR', 'Departures fetch failed', {
                status: response.status,
                statusText: response.statusText,
                stopId,
                url: fullUrl
            });
            return res.status(502).json({
                error: errorMsg,
                details: {
                    type: 'VRR_API_ERROR',
                    status: response.status,
                    statusText: response.statusText,
                    stopId
                }
            });
        }

        const data = await response.json();
        const departureCount = Array.isArray(data.departureList)
            ? data.departureList.length
            : (data.departureList ? 1 : 0);

        log('INFO', 'Departures fetch successful', { stopId, departureCount });

        res.json(data);
    } catch (err) {
        log('ERROR', 'Departures fetch exception', {
            error: err.message,
            stack: err.stack,
            stopId
        });

        let errorType = 'UNKNOWN_ERROR';
        let userMessage = err.message;

        if (err.code === 'ENOTFOUND' || err.code === 'EAI_AGAIN') {
            errorType = 'DNS_ERROR';
            userMessage = 'Cannot resolve VRR API hostname - check internet connection';
        } else if (err.code === 'ECONNREFUSED') {
            errorType = 'CONNECTION_REFUSED';
            userMessage = 'Connection to VRR API refused';
        } else if (err.code === 'ETIMEDOUT' || err.code === 'ESOCKETTIMEDOUT') {
            errorType = 'TIMEOUT';
            userMessage = 'Connection to VRR API timed out';
        } else if (err.name === 'TypeError' && err.message.includes('fetch')) {
            errorType = 'NETWORK_ERROR';
            userMessage = 'Network error connecting to VRR API';
        }

        res.status(500).json({
            error: userMessage,
            details: {
                type: errorType,
                code: err.code,
                stopId,
                originalMessage: err.message
            }
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    log('INFO', `Departure board running at http://localhost:${PORT}`);
    log('INFO', 'Logging level: DEBUG (all requests and responses logged)');
});
