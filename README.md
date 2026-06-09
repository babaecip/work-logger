# 📋 Work Logger

A lightweight local work logger API with a beautiful admin dashboard, designed for **GitHub Copilot** agents to **mandatorily** track every completed task across all workspaces.

![Node.js](https://img.shields.io/badge/Node.js-20-green) ![Express](https://img.shields.io/badge/Express-4.x-blue) ![License](https://img.shields.io/badge/License-MIT-yellow)

---

## ✨ Features

- **🔒 Mandatory Task Logging** — Every completed task is logged automatically via Copilot agent
- **RESTful API** — Log and retrieve work tasks via simple HTTP endpoints
- **Admin Dashboard** — Beautiful dark-themed web UI to visualize daily logs
- **Docker Support** — One-command deployment with Docker Compose
- **GitHub Copilot Agent** — Auto-log tasks through Copilot agent integration
- **Complexity Tracking** — Rate task complexity from very-low to very-high
- **Token & Duration Tracking** — Monitor estimated tokens used and work duration
- **Per-Day Storage** — Logs organized by date for easy management
- **Auto-Refresh** — Dashboard auto-refreshes every 30 seconds
- **Cross-Workspace** — Works across all VS Code workspaces via global instructions

---

## 📋 Prerequisites

Before installing, make sure you have:

| Requirement | Minimum Version | Check Command | Install |
|------------|----------------|---------------|---------|
| **Node.js** | 18+ (20 recommended) | `node --version` | [Download](https://nodejs.org/) |
| **npm** | 9+ | `npm --version` | Comes with Node.js |
| **Git** | Any recent version | `git --version` | [Download](https://git-scm.com/) |
| **Docker** *(optional)* | 20.10+ | `docker --version` | [Download](https://docker.com/) |

---

## 🚀 Installation

### Step 1: Clone the Repository

```bash
# Clone to your preferred location
git clone https://github.com/babaecip/work-logger.git

# Navigate into the project
cd work-logger
```

**Recommended locations:**
- Windows: `C:\Users\%USERNAME%\work-logger`
- macOS/Linux: `~/work-logger`

### Step 2: Install Dependencies

```bash
npm install
```

This installs:
- `express` — Web framework for the API server
- `cors` — Cross-origin resource sharing middleware

### Step 3: Start the Server

**Option A: Run directly with Node.js**
```bash
npm start
```

You should see:
```
🚀 Work Logger API running on http://localhost:6395
🌐 Admin dashboard: http://localhost:6395/admin
📝 POST /api/work-log — Log a task
📋 GET  /api/work-log?date=YYYY-MM-DD — View logs by date
📅 GET  /api/work-log/all/dates — List all log dates
❤️  GET  /health — Health check
```

**Option B: Run with Docker Compose**
```bash
docker-compose up -d
```

This will:
- Build the Docker image from the Dockerfile
- Start the container on port `6395`
- Mount a persistent data volume (default: `./data`)
- Auto-restart on crash (`unless-stopped`)

**Option C: Run in background (Windows)**
```powershell
# Start in background using PowerShell
Start-Process -NoNewWindow -FilePath "node" -ArgumentList "server.js" -WorkingDirectory "C:\Users\%USERNAME%\work-logger"

# Or use PM2 for production
npm install -g pm2
pm2 start server.js --name work-logger
pm2 save
pm2 startup
```

### Step 4: Verify Installation

Open your browser and go to:
- **Dashboard:** http://localhost:6395/admin
- **Health Check:** http://localhost:6395/health

You should see the dashboard with "No tasks logged yet" message.

---

## 🤖 Mandatory Agent Setup (Per-Workspace)

To enforce mandatory task logging in **every workspace**, you need to set up two things:

### A. Global Instructions (One-time setup)

Create or edit the file:
```
C:\Users\%USERNAME%\AppData\Roaming\Code\User\prompts\global-instructions.md
```

Add this content:
```markdown
# ⚠️ MANDATORY: Work Logger (Global)

## Rule
**After EVERY completed task (code edit, bug fix, feature, refactoring, etc.), you MUST call the Work Logger agent.**

## How to Call
1. After task completion, run agent `Work Logger` via `runSubagent` with `agentName: "Work Logger"`
2. Include these parameters in the prompt:
   - `task`: Short task name
   - `git_branch`: Current active branch
   - `complexity`: very-low / low / medium / high / very-high
   - `summary`: Brief explanation of what was done
   - `files`: Array of changed files
   - `status`: completed / in-progress / failed
   - `duration_minutes`: Estimated duration

## Example Call
runSubagent(agentName: "Work Logger", description: "Log task", prompt: "Log work: [task details]")

## If Server is Down
If the work logger server is not running (http://localhost:6395), inform the user that the logger failed to report.
```

### B. Per-Workspace Agent File

Copy the agent file to each workspace you work in:

```bash
# Windows
copy "%USERPROFILE%\work-logger\.github\agents\work-logger.agent.md" ".github\agents\"

# macOS/Linux
cp ~/work-logger/.github/agents/work-logger.agent.md .github/agents/
```

Or create `.github/agents/work-logger.agent.md` in your workspace with the content from the repo.

### C. VS Code Settings (Optional but Recommended)

Add to your VS Code `settings.json`:
```json
{
  "github.copilot.chat.codeGeneration.instructions": [
    { "text": "After completing any task, always log it using the Work Logger agent via runSubagent." }
  ]
}
```

---

## 📡 API Reference

### Log a Task

```http
POST /api/work-log
Content-Type: application/json
```

**Required Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `task` | string | Short task name |
| `git_branch` | string | Current git branch name |
| `complexity` | string | One of: `very-low`, `low`, `medium`, `high`, `very-high` |

**Optional Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `summary` | string | Description of what was done |
| `files` | array | List of changed files |
| `status` | string | `completed` (default), `in-progress`, or `failed` |
| `repo_url` | string | GitHub repository URL |
| `estimated_tokens` | number | Estimated tokens used |
| `duration_minutes` | number | Work duration in minutes |
| `timestamp` | string | ISO 8601 timestamp (defaults to now) |

**Example Request:**
```bash
curl -X POST http://localhost:6395/api/work-log \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Fix login timeout",
    "summary": "Resolved auth timeout by increasing JWT expiry to 24h",
    "files": ["auth/controller.js", "config/jwt.js"],
    "status": "completed",
    "git_branch": "main",
    "complexity": "low",
    "repo_url": "https://github.com/user/my-project",
    "estimated_tokens": 1500,
    "duration_minutes": 12
  }'
```

**Example Response (201 Created):**
```json
{
  "success": true,
  "log": {
    "id": 1717945200000,
    "task": "Fix login timeout",
    "summary": "Resolved auth timeout by increasing JWT expiry to 24h",
    "files": ["auth/controller.js", "config/jwt.js"],
    "status": "completed",
    "git_branch": "main",
    "complexity": "low",
    "repo_url": "https://github.com/user/my-project",
    "estimated_tokens": 1500,
    "duration_minutes": 12,
    "timestamp": "2026-06-09T10:00:00.000Z",
    "logged_at": "2026-06-09T10:00:00.123Z"
  },
  "date": "2026-06-09"
}
```

### Get Logs

```http
# Get today's logs
GET /api/work-log

# Get logs for a specific date
GET /api/work-log?date=2026-06-09

# Get a specific log by ID (searches all dates)
GET /api/work-log/:id

# List all dates that have logs
GET /api/work-log/all/dates
```

### Delete Logs

```http
# Clear today's logs
DELETE /api/work-log

# Clear logs for a specific date
DELETE /api/work-log?date=2026-06-09
```

### Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "uptime": 3600.5,
  "dates": 15
}
```

---

## 🌐 Admin Dashboard

Access the dashboard at: **http://localhost:6395/admin**

The dashboard provides:
- 📊 **Stats Overview** — Total tasks, completed, failed, total tokens, total minutes, avg complexity
- 📅 **Date Navigation** — Quick date picker and clickable date chips
- 📋 **Log List** — Detailed view of each log entry with status, complexity badge, files, and metadata
- 🔄 **Auto-Refresh** — Updates every 30 seconds

### Dashboard URL Shortcuts

| URL | Description |
|-----|-------------|
| `http://localhost:6395/admin` | Main dashboard |
| `http://localhost:6395/health` | Health check |
| `http://localhost:6395/api/work-log/all/dates` | All log dates (JSON) |

---

## 🤖 GitHub Copilot Agent Integration

### How the Mandatory Logging Works

The Work Logger agent is designed to be called **automatically** after every task completion:

1. **You complete a task** (edit code, fix bug, add feature, etc.)
2. **Copilot detects** the task completion (via global instructions)
3. **Copilot calls** the Work Logger agent via `runSubagent`
4. **Agent logs** the task to the Work Logger API
5. **Confirmation** is shown with task details and dashboard link

### Agent Call Flow

```
User: "Fix the login bug"
  ↓
Copilot: [Fixes the bug in code]
  ↓
Copilot: [Calls Work Logger agent]
  ↓
Agent: POST http://localhost:6395/api/work-log
  ↓
User sees: ✅ Logged: Fix login bug | Branch: main | Complexity: low
```

### Trigger Phrases

The agent responds to these trigger phrases:
- "Log work"
- "Log task"
- "Report task"
- "Work log"
- "What did I do"
- "Daily log"
- "Kirim laporan" (Indonesian)
- "Catat kerjaan" (Indonesian)

### Complexity Levels

| Level | Duration | Examples |
|-------|----------|----------|
| `very-low` | < 5 min | File read, search, config change |
| `low` | 5-15 min | Small bug fix, minor tweak |
| `medium` | 15-45 min | Feature implementation, refactoring |
| `high` | 45-120 min | Complex feature, architectural changes |
| `very-high` | 120+ min | Major feature, system redesign |

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file (git-ignored) to customize behavior:

```env
PORT=6395
```

### Data Storage

Logs are stored as daily JSON files in the `data/` directory:
```
data/
├── 2026-06-09.json
├── 2026-06-08.json
├── 2026-06-07.json
└── ...
```

Each file contains an array of log entries for that day.

---

## 🐛 Troubleshooting

### Server won't start
```bash
# Check if port 6395 is already in use
netstat -ano | findstr :6395

# Kill the process using the port
taskkill /PID <PID> /F
```

### Agent not logging
1. Verify server is running: `curl http://localhost:6395/health`
2. Check the agent file exists in `.github/agents/work-logger.agent.md`
3. Ensure global instructions include the mandatory logging rule
4. Check VS Code Output panel for errors

### Docker issues
```bash
# Rebuild from scratch
docker-compose down -v
docker-compose up -d --build

# View logs
docker-compose logs -f
```

---

## 📁 Project Structure

```
work-logger/
├── .github/
│   └── agents/
│       └── work-logger.agent.md    # Copilot agent config
├── data/                           # Daily log files (auto-created)
│   └── YYYY-MM-DD.json
├── public/
│   └── admin.html                  # Dashboard UI
├── server.js                       # Express API server
├── package.json                    # Dependencies
├── Dockerfile                      # Docker image
├── docker-compose.yml              # Docker Compose config
├── .env                            # Environment config (git-ignored)
├── .dockerignore                   # Docker ignore rules
└── README.md                       # This file
```

---

## 📝 Changelog

### v1.1.0 (2026-06-09)
- ✅ Added mandatory task logging enforcement
- ✅ Improved README with comprehensive installation guide
- ✅ Added cross-workspace global instructions
- ✅ Enhanced agent with better error handling

### v1.0.0 (2026-06-08)
- ✅ Initial release with API and dashboard
- ✅ Docker support
- ✅ Copilot agent integration
- ✅ Complexity and duration tracking

---

## 📄 License

MIT License — use freely in your projects.

---

## 🙏 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request
