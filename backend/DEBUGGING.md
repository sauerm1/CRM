# Debugging Guide for Go REST API

## Method 1: VS Code Debugger (Easiest)

### Setup:
1. Install the Go extension in VS Code (if not already installed)
2. The `.vscode/launch.json` file is already configured

### How to Debug:
1. Set breakpoints by clicking in the gutter (left of line numbers) in any `.go` file
2. Press `F5` or click "Run > Start Debugging"
3. Make API requests to trigger breakpoints
4. Use the Debug toolbar to:
   - Continue (F5)
   - Step Over (F10)
   - Step Into (F11)
   - Step Out (Shift+F11)
5. Inspect variables in the Variables pane
6. Watch expressions in the Watch pane

### Common Breakpoint Locations:
- `handlers/handlers.go`: Start of each handler function
- `database/database.go`: Connection establishment
- `main.go`: Server startup

---

## Method 2: Delve Command Line

### Install Delve:
```bash
go install github.com/go-delve/delve/cmd/dlv@latest
```

### Start debugging:
```bash
dlv debug
```

### Common Delve Commands:
```
break main.main              # Set breakpoint at main function
break handlers.go:75         # Set breakpoint at specific line
continue                     # Continue execution
next                         # Step over
step                         # Step into
print variableName           # Print variable value
locals                       # Print all local variables
goroutines                   # List all goroutines
help                         # Show all commands
```

---

## Method 3: Enhanced Logging

### Add logging to handlers:

Add this at the start of each handler function:
```go
log.Printf("[%s] %s - Request received", r.Method, r.URL.Path)
```

### Example for debugging createItem:
```go
func (h *Handler) createItem(w http.ResponseWriter, r *http.Request) {
    log.Printf("[DEBUG] createItem: Request started")
    
    var item models.Item
    if err := json.NewDecoder(r.Body).Decode(&item); err != nil {
        log.Printf("[ERROR] createItem: Failed to decode body: %v", err)
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }
    
    log.Printf("[DEBUG] createItem: Decoded item: %+v", item)
    
    // ... rest of the code
}
```

### Run with verbose output:
```bash
go run -v main.go
```

---

## Method 4: HTTP Request Debugging

### Using curl with verbose output:
```bash
# Verbose mode shows request/response headers
curl -v http://localhost:8080/health

# Save response to file for inspection
curl -o response.json http://localhost:8080/api/members

# Show timing information
curl -w "\nTime: %{time_total}s\n" http://localhost:8080/health
```

### Using httpie (more readable):
```bash
# Install httpie
brew install httpie

# Make requests with nice formatting
http GET http://localhost:8080/health
http GET http://localhost:8080/api/members
```

---

## Method 5: MongoDB Debugging

### View MongoDB data directly:
```bash
# Connect to MongoDB
mongosh

# Switch to database
use goapi

# View all items
db.items.find().pretty()

# Count items
db.items.countDocuments()

# Find specific item
db.items.findOne()

# Clear collection (for testing)
db.items.deleteMany({})
```

---

## Method 6: Testing Individual Components

### Test database connection:
```bash
go run -c 'package main; import ("fmt"; "go-api-mongo/database"); func main() { db, err := database.Connect(); if err != nil { panic(err) }; fmt.Println("Connected!"); db.Disconnect() }'
```

---

## Method 7: Race Condition Detection

### Run with race detector:
```bash
go run -race main.go
```

This detects data races in concurrent code.

---

## Method 8: Profiling

### CPU Profiling:
```go
// Add to main.go
import _ "net/http/pprof"

// In main(), add before srv.ListenAndServe():
go func() {
    log.Println(http.ListenAndServe("localhost:6060", nil))
}()
```

Then access:
- `http://localhost:6060/debug/pprof/`
- `go tool pprof http://localhost:6060/debug/pprof/profile?seconds=30`

---

## Quick Debug Checklist

When things aren't working:

1. ✅ Check MongoDB is running: `mongosh --eval "db.version()"`
2. ✅ Check port 8080 is available: `lsof -i :8080`
3. ✅ Check environment variables: `printenv | grep MONGODB`
4. ✅ Check Go module dependencies: `go mod verify`
5. ✅ Check for compilation errors: `go build`
6. ✅ View server logs in terminal
7. ✅ Test health endpoint: `curl http://localhost:8080/health`
8. ✅ Check request format matches API specification

---

## Common Issues & Solutions

### Issue: "connection refused"
**Solution**: MongoDB not running. Start with `brew services start mongodb-community`

### Issue: "no documents in result"
**Solution**: Database is empty. Create items via POST first.

### Issue: "invalid ID format"
**Solution**: Use valid MongoDB ObjectId (24 hex characters)

### Issue: Port already in use
**Solution**: Kill existing process with `lsof -ti:8080 | xargs kill -9`

---

## VS Code Keyboard Shortcuts for Debugging

- **F5**: Start/Continue debugging
- **Shift+F5**: Stop debugging
- **F9**: Toggle breakpoint
- **F10**: Step over
- **F11**: Step into
- **Shift+F11**: Step out
- **Ctrl+Shift+F5**: Restart debugging
