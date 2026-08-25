# FYIes Admin Panel - Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd FYIes-Admin
npm install
```

### 2. Environment Configuration
`.env` file already created with:
```
VITE_API_URL=http://localhost:5000/api
```

**Note:** Agar aapka API different port par chal raha hai, to `.env` file me update karein.

### 3. Start Development Server
```bash
npm run dev
```

Admin panel khulega: `http://localhost:5173`

### 4. Login Credentials
- **Email:** `admin@fyies.com`
- **Password:** `Admin@123`

## 📋 Prerequisites

1. **Backend API Running:**
   - FYIes-Api server chalna chahiye
   - Default: `http://localhost:5000`
   - API endpoints available hone chahiye

2. **Admin User in Database:**
   - Admin user database me hona chahiye
   - Role: `admin`
   - Email: `admin@fyies.com`

## 🔧 Configuration

### API URL Change Karna
Agar aapka API different URL par hai:

1. `.env` file me update karein:
   ```
   VITE_API_URL=https://your-api-url.com/api
   ```

2. Ya `src/config/api.js` me directly change karein

### CORS Issues
Agar CORS error aaye, to `FYIes-Api/server.js` me CORS settings check karein:
```javascript
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
```

## 🎯 Features

- ✅ Dashboard with statistics
- ✅ Users Management (View, Search, Delete)
- ✅ Posts Management
- ✅ Pages Management
- ✅ Messages Management
- ✅ Connections Management
- ✅ Notifications Management
- ✅ Students Management
- ✅ Teachers Management

## 🐛 Troubleshooting

### Login Nahi Ho Raha?
1. Check karein backend API chal raha hai ya nahi
2. Admin user database me hai ya nahi
3. Browser console me errors check karein
4. Network tab me API calls check karein

### API Calls Fail Ho Rahe Hain?
1. `.env` file me API URL sahi hai ya nahi
2. Backend CORS settings check karein
3. Token localStorage me save ho raha hai ya nahi

### Build for Production
```bash
npm run build
```
Build files `dist/` folder me generate honge.

## 📝 Notes

- Admin panel sirf `role: 'admin'` wale users ke liye hai
- Token automatically localStorage me save hota hai
- Logout karne par token clear ho jata hai
- All API calls automatically token include karte hain

