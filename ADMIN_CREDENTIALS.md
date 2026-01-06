# Admin Credentials

## Default Admin Account
- **Email:** sumeetemail26@gmail.com
- **Password:** admin123
- **Role:** admin

## Supabase Configuration

### Backend Environment Variables
Located in `/app/backend/.env`:
```
SUPABASE_URL=https://lvtotvdzlsulgycgupcy.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2dG90dmR6bHN1bGd5Y2d1cGN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3ODAzNjMsImV4cCI6MjA4MDM1NjM2M30.ooWVboxMsTUgkgT9iACeaAgF8V5J7z5JaOhn4qau7EM
SUPABASE_JWT_SECRET=6mfoeyz+zOTIylGoRdHVDvm5Iyo8vU2yYftPDQJrotLqCe0NDkCwDljQ2ZtoayHcUmLk3rK/Sr7tJ9w1kPduvg==
```

### Frontend Environment Variables
Located in `/app/frontend/.env`:
```
REACT_APP_SUPABASE_URL=https://lvtotvdzlsulgycgupcy.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2dG90dmR6bHN1bGd5Y2d1cGN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3ODAzNjMsImV4cCI6MjA4MDM1NjM2M30.ooWVboxMsTUgkgT9iACeaAgF8V5J7z5JaOhn4qau7EM
```

## Authentication Methods

### 1. Traditional Email/Password Login
- Use the credentials above to log in via `/signin` page
- Works with the default admin account

### 2. Google OAuth via Supabase
- Users can sign in with their Google account
- Google OAuth users don't need passwords
- Supabase handles the OAuth flow

## Important Notes

- Supabase authentication is now fully configured and working
- Both authentication methods (email/password and Google OAuth) are active
- Admin can create users from admin panel without requiring passwords (for OAuth-only users)
- Login count tracking has been fixed to only increment on actual new login sessions (not on token refreshes)

## Status Check

To verify Supabase configuration:
```bash
curl http://localhost:8001/api/auth/supabase/status
```

Expected response:
```json
{
  "configured": true,
  "message": "Supabase authentication is configured and ready"
}
```
