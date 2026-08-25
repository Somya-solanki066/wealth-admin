# Admin Panel Login Credentials

## Default Admin Credentials

**Email:** `admin@fyies.com`  
**Password:** `Admin@123`

## How to Login

1. Start the admin panel:
   ```bash
   cd FYIes-Admin
   npm run dev
   ```

2. Open browser: `http://localhost:5173`

3. Use the credentials above to login

## If Admin User Doesn't Exist

If the admin user is not in the database, you can create it using the seeder:

### Option 1: Run the Seeder (if available)
```bash
cd FYIes-Api
npx sequelize-cli db:seed:all
```

### Option 2: Reset Admin Password (if admin exists but password doesn't work)
```bash
cd FYIes-Api
node resetAdminPassword.js
```

### Option 3: Create Admin Manually via API
You can register a new admin user via the API:
```bash
POST http://localhost:5000/api/auth/register
{
  "name": "Admin",
  "email": "admin@fyies.com",
  "password": "Admin@123",
  "role": "admin"
}
```

## Important Notes

- The admin user must have `role: 'admin'` in the database
- Only users with `role: 'admin'` can access the admin panel
- The password is case-sensitive: `Admin@123` (capital A, @ symbol, numbers)

## Security Recommendation

⚠️ **Change the default password in production!**

After first login, consider:
1. Changing the password through the profile settings
2. Using a stronger password
3. Keeping credentials secure

