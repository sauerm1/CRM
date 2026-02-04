# Development Scripts Overview

## Created Files

Four powerful scripts to manage your development environment:

### 1. `dev.sh` - Smart Startup ⭐
**The main script - starts everything automatically**

```bash
./dev.sh
```

**Features:**
- Checks MongoDB status, starts if needed
- Stops any conflicting processes on ports 8080/3000
- Creates `.env` with defaults if missing
- Installs npm dependencies if `node_modules/` missing
- Cleans Next.js build cache (`.next/`)
- Fixes Next.js SWC compiler issues on macOS
- Starts backend with health check (`/health` endpoint)
- Starts frontend with health check (actual HTTP test)
- Logs all output to `logs/` directory
- Shows helpful startup info with URLs and commands

**Health Checks:**
- Backend: Waits up to 30 seconds, tests `/health` endpoint
- Frontend: Waits up to 45 seconds, tests actual HTTP response
- Exits with error if services fail to start

**Exit Codes:**
- `0` - Success, all services running
- `1` - Failed (MongoDB, Backend, or Frontend didn't start)

---

### 2. `stop-dev.sh` - Clean Shutdown
**Stops all services gracefully**

```bash
./stop-dev.sh
```

**What it does:**
- Kills processes on ports 8080 and 3000
- Kills any remaining Go or Node processes
- Removes PID tracking files
- Shows how many processes were stopped

**Safe to run:**
- Even if nothing is running
- Multiple times in a row
- Before starting new instance

---

### 3. `status.sh` - Health Monitor
**Check what's running**

```bash
./status.sh
```

**Shows:**
- ✅ MongoDB status (running/not running)
- ✅ Backend status (online with health check)
- ✅ Frontend status (online with HTTP test)
- 📊 Active process list with PIDs
- 🔗 Available URLs

**Use cases:**
- Quick check if services are up
- Get process IDs for manual debugging
- Verify everything started correctly

---

### 4. `logs.sh` - Log Viewer
**Tail logs easily**

```bash
./logs.sh           # Both backend and frontend
./logs.sh backend   # Backend only
./logs.sh frontend  # Frontend only
```

**Features:**
- Live tail (`-f`) of log files
- Color-coded output
- Easy to switch between logs
- Press Ctrl+C to exit

**Log locations:**
- `logs/backend.log` - Go API output
- `logs/frontend.log` - Next.js output

---

## Workflow Examples

### Daily Development
```bash
# Morning
./dev.sh

# Check everything started
./status.sh

# Work all day...

# Evening
./stop-dev.sh
```

### Debugging
```bash
# Terminal 1
./dev.sh

# Terminal 2
./logs.sh

# Or check specific logs
./logs.sh backend
./logs.sh frontend
```

### Quick Restart
```bash
./stop-dev.sh && ./dev.sh
```

### Check Status
```bash
./status.sh
```

---

## Troubleshooting

### Script Won't Run
```bash
chmod +x dev.sh stop-dev.sh status.sh logs.sh
```

### Services Won't Start
```bash
# Check logs
./logs.sh

# Or manually
tail -f logs/backend.log
tail -f logs/frontend.log
```

### Port Already in Use
```bash
./stop-dev.sh  # This should fix it
./dev.sh
```

### MongoDB Not Running
```bash
# macOS with Homebrew
brew services start mongodb-community

# Check status
brew services list
```

### Nuclear Option (Clean Everything)
```bash
./stop-dev.sh
rm -rf logs/
cd frontend && rm -rf .next node_modules
cd ../backend && rm -rf tmp/
cd ..
./dev.sh
```

---

## Before vs After

### Before (Manual - ~10-15 commands)
```bash
# Terminal 1
brew services start mongodb-community
cd backend
go run main.go

# Terminal 2
cd frontend
npm install
rm -rf .next
npm run dev

# When things break
lsof -ti:8080 | xargs kill -9
lsof -ti:3000 | xargs kill -9
pkill -f "next dev"
# ... repeat debugging ...
```

### After (Automated - 1 command)
```bash
./dev.sh
```

**Time saved:** ~5-10 minutes per day  
**Errors prevented:** Port conflicts, missing dependencies, cache issues  
**Happiness increased:** Significantly 😊

---

## Technical Details

### Error Handling
- `set -e` - Exit on any error
- Health checks with retry loops
- Timeout protection (30s backend, 45s frontend)
- Clear error messages with log locations

### Process Management
- Background processes with PID tracking
- Graceful cleanup on exit
- Port conflict detection
- Process cleanup before starting

### Logging
- All stdout/stderr to log files
- Timestamped entries
- Easy to tail and search
- Persists across restarts

### Environment Setup
- Auto-creates `.env` with defaults
- Checks and installs dependencies
- Platform-specific fixes (macOS SWC)
- Build cache management

---

Made with ❤️ to make development easier!
