# Backend API Start Guide

## ⚠️ Important: Backend API must be running before using Admin Panel

### Quick Start

1. **Open a new terminal window**

2. **Navigate to Backend folder:**
   ```bash
   cd FYIes-Api
   ```

3. **Start the backend server:**
   ```bash
   npm start
   ```
   
   OR for development with auto-reload:
   ```bash
   npm run dev
   ```

4. **Wait for this message:**
   ```
   🚀 Server running on port 5000
   📡 Socket.IO ready for connections
   ```

5. **Keep this terminal open** - Backend must keep running

### Verify Backend is Running

Open browser and go to:
- http://localhost:5000/api/auth/test-cookie

You should see a response (even if it's an error, it means server is running)

### Common Issues

#### Port 5000 Already in Use
If you see: `Port 5000 is in use`

**Solution:**
```bash
# Option 1: Kill the process using port 5000
npx kill-port 5000

# Option 2: Use a different port
# Create/edit .env file in FYIes-Api folder:
PORT=5001

# Then update FYIes-Admin/.env:
VITE_API_URL=http://localhost:5001/api
```

#### Database Connection Error
If you see database errors:
1. Check PostgreSQL is running
2. Check `.env` file has correct database credentials
3. Run migrations: `npm run migrate`

#### Module Not Found Errors
```bash
cd FYIes-Api
npm install
```

### Running Both Servers

You need **TWO terminal windows**:

**Terminal 1 - Backend:**
```bash
cd FYIes-Api
npm start
```

**Terminal 2 - Admin Panel:**
```bash
cd FYIes-Admin
npm run dev
```

### Check if Backend is Running

**Method 1: Browser**
- Go to: http://localhost:5000/api/auth/test-cookie
- If page loads (even with error), server is running

**Method 2: Command Line**
```bash
# Windows PowerShell
Test-NetConnection -ComputerName localhost -Port 5000

# Or use curl
curl http://localhost:5000/api/auth/test-cookie
```

**Method 3: Check Process**
```bash
# Windows
netstat -ano | findstr :5000

# If you see output, port 5000 is in use
```

### Default Ports

- **Backend API:** `http://localhost:5000`
- **Admin Panel:** `http://localhost:5173`

Make sure both are running before trying to login!

