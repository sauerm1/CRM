# 🏋️ Gym CRM - Quick Start Guide

## ⚡ ONE COMMAND STARTUP (Recommended)

**Stop juggling terminals! Start everything with one command:**

```bash
./dev.sh
```

**What it does:**
- ✅ Checks and starts MongoDB automatically
- ✅ Stops any conflicting processes on ports 8080/3000
- ✅ Creates `.env` with defaults if missing
- ✅ Installs `node_modules` if needed
- ✅ Fixes Next.js build issues (SWC, lightningcss)
- ✅ Starts backend with health checks
- ✅ Starts frontend with health checks
- ✅ Logs everything to `logs/` directory

**Other commands:**
```bash
./stop-dev.sh   # Stop all services
./status.sh     # Check service status
./logs.sh       # View logs (backend/frontend/all)
```

**URLs when running:**
- Frontend: http://localhost:3000
- Backend: http://localhost:8080
- Health: http://localhost:8080/health

---

## Manual Setup (Original Method)

If you prefer manual control or the automated script doesn't work:

### First Time Setup

### 1. Start MongoDB
```bash
# Make sure MongoDB is running
brew services start mongodb-community
# Or check if it's already running
brew services list
```

### 2. Seed the Database with Sample Data
```bash
cd backend
make seed
```

This will populate your database with:
- ✅ 5 gym clubs (various locations)
- ✅ 15 instructors (with different specialties)
- ✅ 100 members (with realistic data)

### 3. Start the Backend Server
```bash
cd backend
make run
# Or
go run main.go
```

Backend will be available at: `http://localhost:8080`

### 4. Start the Frontend Server
```bash
cd frontend
npm install  # First time only
npm run dev
```

Frontend will be available at: `http://localhost:3000`

## Quick Commands Reference

### Backend
```bash
cd backend

make seed          # Populate database with sample data
make run           # Start the backend server
make test          # Run all tests
make test-unit     # Run unit tests only
make build         # Build the application
make clean         # Clean build artifacts
make help          # Show all available commands
```

### Frontend
```bash
cd frontend

npm run dev        # Start development server
npm run build      # Build for production
npm test           # Run tests
npm run lint       # Run linter
```

## Database Management

### View Data
```bash
# Connect to MongoDB shell
mongosh goapi

# List all collections
show collections

# Count documents
db.clubs.countDocuments({})
db.instructors.countDocuments({})
db.members.countDocuments({})

# View sample data
db.clubs.findOne()
db.instructors.findOne()
db.members.findOne()
```

### Reset Data
```bash
cd backend
make seed  # This clears and re-seeds all data
```

## Development Workflow

1. **Make sure MongoDB is running**
2. **Seed the database** (first time or when you need fresh data)
3. **Start backend** in one terminal
4. **Start frontend** in another terminal
5. **Open browser** to `http://localhost:3000`

## Troubleshooting

### MongoDB not connecting
```bash
# Check if MongoDB is running
brew services list

# Start MongoDB if not running
brew services start mongodb-community
```

### Go command not found
```bash
# Check Go installation
which go

# If not found, install Go
brew install go
```

### Frontend dependencies issues
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Port already in use
```bash
# Backend (port 8080)
lsof -ti:8080 | xargs kill -9

# Frontend (port 3000)
lsof -ti:3000 | xargs kill -9
```

## API Endpoints to Test

Once both servers are running, try these:

- **Health Check**: `GET http://localhost:8080/health`
- **Get Clubs**: `GET http://localhost:8080/api/clubs`
- **Get Instructors**: `GET http://localhost:8080/api/instructors`
- **Get Members**: `GET http://localhost:8080/api/members`

## Next Steps

- Check [backend/README.md](backend/README.md) for API documentation
- Check [frontend/README.md](frontend/README.md) for frontend details
- Check [backend/scripts/README.md](backend/scripts/README.md) for seeding options
