# 📋 Work Logger

A lightweight local work logger API with a beautiful admin dashboard, designed for **GitHub Copilot** agents to track daily work activities.

![Node.js](https://img.shields.io/badge/Node.js-20-green) ![Express](https://img.shields.io/badge/Express-4.x-blue) ![License](https://img.shields.io/badge/License-MIT-yellow)

---

## ✨ Features

- **RESTful API** — Log and retrieve work tasks via simple HTTP endpoints
- **Admin Dashboard** — Beautiful dark-themed web UI to visualize daily logs
- **Docker Support** — One-command deployment with Docker Compose
- **GitHub Copilot Agent** — Auto-log tasks through Copilot agent integration
- **Complexity Tracking** — Rate task complexity from very-low to very-high
- **Token & Duration Tracking** — Monitor estimated tokens used and work duration
- **Per-Day Storage** — Logs organized by date for easy management
- **Auto-Refresh** — Dashboard auto-refreshes every 30 seconds

---

## 🚀 Quick Start

### Option 1: Run Directly with Node.js

```bash
# Clone the repository
git clone https://github.com/babaecip/work-logger.git
cd work-logger

# Install dependencies
npm install

# Start the server
npm start
```

The server will start at `http://localhost:6395`.

### Option 2: Run with Docker

```bash
# Clone the repository
git clone https://github.com/babaecip/work-logger.git
cd work-logger

# Start with Docker Compose
docker-compose up -d
```

This will build and run the container on port `6395` with persistent data volume.

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
| `task` | string | Short task name (required) |
| `git_branch` | string | Current git branch name (required) |
| `complexity` | string | One of: `very-low`, `low`, `medium`, `high`, `very-high` (required) |

**Optional Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `summary` | string | Description of what was done |
| `files` | array | List of changed files |
| `status` | string | `completed` (default), `in-progress`, or `failed` |
| `estimated_tokens` | number | Estimated tokens used |
| `duration_minutes` | number | Work duration in minutes |
| `timestamp` | string | ISO 8601 timestamp (defaults to now) |

**Example:**

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
    "estimated_tokens": 1500,
    "duration_minutes": 12
  }'
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

Returns server uptime and total number of log dates.

---

## 🌐 Admin Dashboard

Access the dashboard at: **http://localhost:6395/admin**

The dashboard provides:
- 📊 **Stats Overview** — Total tasks, completed, failed, total tokens, total minutes, avg complexity
- 📅 **Date Navigation** — Quick date picker and clickable date chips
- 📋 **Log List** — Detailed view of each log entry with status, complexity badge, files, and metadata
- 🔄 **Auto-Refresh** — Updates every 30 seconds

---

## 🤖 GitHub Copilot Agent Integration

This project includes a **Copilot Agent** that can log tasks automatically.

### Setup

1. Make sure the Work Logger server is running (`npm start` or `docker-compose up -d`)
2. Copy the agent file to your project:
   ```bash
   cp .github/agents/work-logger.agent.md /path/to/your-project/.github/agents/
   ```
3. Use the agent in VS Code Copilot Chat

### Usage Examples

Simply ask Copilot:
- `"Log work: Fixed login bug"`
- `"Report task: Refactored auth module"`
- `"Catat kerjaan: Add dark mode support"`

The agent will automatically:
1. Detect the current git branch
2. Compose the log entry with complexity assessment
3. POST it to the Work Logger API
4. Confirm the logged entry

### Complexity Levels

| Level | Duration | Examples |
|-------|----------|----------|
| `very-low` | < 5 min | File read, search, config change |
| `low` | 5-15 min | Small bug fix, minor tweak |
| `medium` | 15-45 min | Feature implementation, refactoring |
| `high` | 45-120 min | Complex feature, architectural changes |
| `very-high` | 120+ min | Major feature, system redesign |

---

## 📁 Project Structure

```
work-logger/
├── .github/
│   └── agents/
│       └── work-logger.agent.md    # Copilot agent config
├── public/
│   └── admin.html                  # Dashboard UI
├── server.js                       # Express API server
├── package.json                    # Dependencies
├── Dockerfile                      # Docker image
├── docker-compose.yml              # Docker Compose config
├── .env                            # Environment config (git-ignored)
├── .dockerignore                   # Docker ignore rules
├── .gitignore                      # Git ignore rules
└── README.md                       # This file
```

> 📌 Log data is stored externally (see [Data Persistence](#-data-persistence) below) and is **not** part of this repo.

---

## ⚙️ Configuration

| Environment | Default | Description |
|-------------|---------|-------------|
| `PORT` | `6395` | Server port (hardcoded in server.js) |
| `WORK_LOGGER_DATA_DIR` | `./data` | External path for log storage (via `.env`) |

Create a `.env` file in the project root:

```bash
# Point to your preferred data folder
WORK_LOGGER_DATA_DIR=C:/YourProject/WorkLogger/data
```

---

## 🐳 Docker

### Build & Run

```bash
docker-compose up -d --build
```

### View Logs

```bash
docker logs -f work-logger
```

### Stop

```bash
docker-compose down
```

### Data Persistence

By default, `docker-compose.yml` uses a **bind mount** configured via the `WORK_LOGGER_DATA_DIR` environment variable:

```yaml
volumes:
  - ${WORK_LOGGER_DATA_DIR:-./data}:/app/data
```

This means your log files are stored **outside the container** in a folder you specify, making them:

- ✅ **Safe from redeploys** — `docker-compose down` + `up` does not delete your data
- ✅ **Easy to backup** — files are plain JSON on your host filesystem
- ✅ **Version-controllable** — you can optionally track your logs in a separate git repo

#### ⚠️ Avoid Named Volumes for Production

If you see `work-logger-data:/app/data` in your compose file (Docker named volume), your data lives inside Docker's internal storage. To switch to a bind mount:

```bash
# 1. Copy data out of the named volume first
docker cp work-logger:/app/data/ ./backup/

# 2. Update docker-compose.yml to use bind mount (already done in this repo)

# 3. Rebuild
docker-compose down
docker-compose up -d --build
```

---

## 📄 License

MIT License — feel free to use and modify.

---

## 🙏 Credits

Built for developers who want to track their coding work with GitHub Copilot.
