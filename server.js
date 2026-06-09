const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 6395;
const DATA_DIR = path.join(__dirname, 'data');

app.use(cors());
app.use(express.json());

// Initialize data directory
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// --- Helpers: daily log files ---
function getDailyFilePath(dateStr) {
    // dateStr format: "YYYY-MM-DD"
    return path.join(DATA_DIR, `${dateStr}.json`);
}

function getTodayStr() {
    return new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
}

function readDailyLogs(dateStr) {
    const filePath = getDailyFilePath(dateStr);
    if (!fs.existsSync(filePath)) return [];
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch {
        return [];
    }
}

function writeDailyLogs(dateStr, logs) {
    const filePath = getDailyFilePath(dateStr);
    fs.writeFileSync(filePath, JSON.stringify(logs, null, 2));
}

function getAllLogDates() {
    return fs.readdirSync(DATA_DIR)
        .filter(f => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
        .map(f => f.replace('.json', ''))
        .sort()
        .reverse();
}

// --- Serve admin page ---
app.use(express.static(path.join(__dirname, 'public')));

// GET /admin — Admin dashboard
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// --- API Routes ---

// POST /api/work-log — Log a completed task (auto-saved to today's file)
app.post('/api/work-log', (req, res) => {
    const { task, summary, files, status, timestamp, git_branch, complexity, estimated_tokens, duration_minutes } = req.body;

    if (!task) {
        return res.status(400).json({ error: 'task is required' });
    }

    if (!git_branch) {
        return res.status(400).json({ error: 'git_branch is required' });
    }

    if (!complexity || !['very-low', 'low', 'medium', 'high', 'very-high'].includes(complexity)) {
        return res.status(400).json({ error: 'complexity must be one of: very-low, low, medium, high, very-high' });
    }

    const ts = timestamp || new Date().toISOString();
    const dateStr = ts.split('T')[0];

    const log = {
        id: Date.now(),
        task: task || '',
        summary: summary || '',
        files: files || [],
        status: status || 'completed',
        git_branch: git_branch,
        complexity: complexity,
        estimated_tokens: estimated_tokens || null,
        duration_minutes: duration_minutes || null,
        timestamp: ts,
        logged_at: new Date().toISOString()
    };

    const logs = readDailyLogs(dateStr);
    logs.push(log);
    writeDailyLogs(dateStr, logs);

    console.log(`[WORK LOG] ${dateStr} — ${log.task}`);
    res.status(201).json({ success: true, log, date: dateStr });
});

// GET /api/work-log — Get logs (optional ?date=YYYY-MM-DD, default today)
app.get('/api/work-log', (req, res) => {
    const dateStr = req.query.date || getTodayStr();
    const logs = readDailyLogs(dateStr);
    res.json({ date: dateStr, logs, total: logs.length });
});

// GET /api/work-log/all/dates — List all dates that have logs
app.get('/api/work-log/all/dates', (req, res) => {
    const dates = getAllLogDates();
    res.json({ dates, total: dates.length });
});

// GET /api/work-log/:id — Get a specific log by ID (searches all dates)
app.get('/api/work-log/:id', (req, res) => {
    const targetId = parseInt(req.params.id);
    const dates = getAllLogDates();
    for (const d of dates) {
        const logs = readDailyLogs(d);
        const found = logs.find(l => l.id === targetId);
        if (found) return res.json(found);
    }
    res.status(404).json({ error: 'Not found' });
});

// DELETE /api/work-log — Clear logs (optional ?date=YYYY-MM-DD, default today)
app.delete('/api/work-log', (req, res) => {
    const dateStr = req.query.date || getTodayStr();
    const filePath = getDailyFilePath(dateStr);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
    res.json({ success: true, message: `Logs for ${dateStr} cleared` });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime(), dates: getAllLogDates().length });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Work Logger API running on http://localhost:${PORT}`);
    console.log(`🌐 Admin dashboard: http://localhost:${PORT}/admin`);
    console.log(`📝 POST /api/work-log — Log a task`);
    console.log(`📋 GET  /api/work-log?date=YYYY-MM-DD — View logs by date`);
    console.log(`📅 GET  /api/work-log/all/dates — List all log dates`);
    console.log(`❤️  GET  /health — Health check`);
});
