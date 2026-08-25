# FYIes Admin Panel

A simple and modern React admin panel for managing the FYIes platform.

## Features

- 🔐 Authentication & Authorization
- 📊 Dashboard with statistics
- 👥 Users Management
- 📝 Posts Management
- 🏢 Pages Management
- 💬 Messages Management
- 🔗 Connections Management
- 🔔 Notifications Management
- 🎓 Students Management
- 👨‍🏫 Teachers Management

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (already created):
```
VITE_API_URL=http://localhost:5000/api
```

3. Start development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Usage

1. Open the admin panel in your browser (usually `http://localhost:5173`)
2. Login with admin credentials
3. Navigate through different sections using the sidebar

## API Integration

All API endpoints are integrated:
- Authentication endpoints
- User management endpoints
- Post management endpoints
- Page management endpoints
- Message management endpoints
- Connection management endpoints
- Notification management endpoints
- Student/Teacher profile endpoints

## Project Structure

```
FYIes-Admin/
├── src/
│   ├── components/       # Reusable components
│   ├── pages/           # Page components
│   ├── services/        # API services
│   ├── config/          # Configuration files
│   └── App.jsx         # Main app component
├── public/              # Static files
└── package.json        # Dependencies
```

## Technologies

- React 19
- React Router DOM
- Axios
- Vite
- CSS3
