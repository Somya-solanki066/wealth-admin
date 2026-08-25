# Login Error Troubleshooting Guide

## Error: "Login failed. Please check your credentials."

### Step 1: Check Backend API is Running
```bash
cd FYIes-Api
npm start
# or
npm run dev
```

Backend should be running on: `http://localhost:5000`

### Step 2: Verify Admin User Exists
```bash
cd FYIes-Api
node resetAdminPassword.js
```

This will verify admin user exists and password is correct.

### Step 3: Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Try to login
4. Check for errors:
   - CORS errors
   - Network errors
   - API connection errors

### Step 4: Check Network Tab
1. Open browser DevTools (F12)
2. Go to Network tab
3. Try to login
4. Look for the `/auth/email-login` request
5. Check:
   - Request URL: Should be `http://localhost:5000/api/auth/email-login`
   - Request Status: Should be 200 (success) or 401/403 (auth error)
   - Response: Check the error message

### Step 5: Verify Credentials
- **Email:** `admin@fyies.com` (exact, case-sensitive)
- **Password:** `Admin@123` (exact, case-sensitive)

### Step 6: Check CORS Configuration
Backend `server.js` should have:
```javascript
const localhostOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:5173', // Admin Panel
    'http://localhost:5174'
];
```

**Important:** After updating CORS, restart the backend server!

### Step 7: Test API Directly
Test the login endpoint directly using curl or Postman:

```bash
curl -X POST http://localhost:5000/api/auth/email-login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fyies.com","password":"Admin@123"}'
```

Expected response:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "...",
  "user": {...}
}
```

### Common Issues:

#### 1. CORS Error
**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:** 
- Check backend CORS settings include `http://localhost:5173`
- Restart backend server after CORS changes

#### 2. Network Error
**Error:** `Network Error` or `ERR_CONNECTION_REFUSED`

**Solution:**
- Backend API is not running
- Start backend: `cd FYIes-Api && npm start`

#### 3. 401 Unauthorized
**Error:** `Invalid email or password`

**Solution:**
- Verify admin user exists: `node resetAdminPassword.js`
- Check email/password are correct
- Check admin user has `role: 'admin'` in database

#### 4. 403 Forbidden
**Error:** `Access denied. Admin privileges required.`

**Solution:**
- User exists but role is not 'admin'
- Update user role in database to 'admin'

#### 5. 500 Server Error
**Error:** `Server error during login`

**Solution:**
- Check backend console for error logs
- Verify database connection
- Check JWT_SECRET is set in .env

### Quick Fix Checklist:
- [ ] Backend API is running on port 5000
- [ ] Admin user exists in database
- [ ] Admin user has `role: 'admin'`
- [ ] Password is correct: `Admin@123`
- [ ] CORS includes `http://localhost:5173`
- [ ] Backend server restarted after CORS changes
- [ ] Browser console shows no errors
- [ ] Network tab shows API request is being made

