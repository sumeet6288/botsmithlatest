# 🔐 Supabase Auth Integration - Complete Setup Guide

## 📋 Overview

This application now supports **Full Supabase Authentication** including:
- ✅ Email/Password authentication
- ✅ Automatic email verification
- ✅ Password reset with email templates
- ✅ OAuth providers (Google, GitHub, etc.)
- ✅ User sync between Supabase and MongoDB
- ✅ Backward compatibility with legacy auth

## 🚀 Quick Start

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose organization and fill in project details
4. Wait for project to be provisioned (~2 minutes)

### Step 2: Get Supabase Credentials

#### Backend Environment Variables
Add these to `/app/backend/.env`:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWT_SECRET=your-jwt-secret-from-settings
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (optional, for admin operations)
```

**Where to find these:**
- Go to your Supabase project dashboard
- Click "Project Settings" (gear icon)
- Navigate to "API" section
- Copy the values:
  - **URL**: Project URL
  - **anon/public key**: anon public
  - **JWT Secret**: JWT Secret (click "Reveal" to see)
  - **service_role key**: service_role secret (optional)

#### Frontend Environment Variables
Add these to `/app/frontend/.env`:

```bash
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 3: Configure Supabase Auth Settings

1. In Supabase dashboard, go to **Authentication** → **URL Configuration**
2. Add your site URL: `https://your-domain.com` (or `http://localhost:3000` for development)
3. Add redirect URLs:
   ```
   https://your-domain.com/auth/callback
   https://your-domain.com/reset-password
   http://localhost:3000/auth/callback (for development)
   http://localhost:3000/reset-password (for development)
   ```

### Step 4: Configure Email Templates (Optional)

1. Go to **Authentication** → **Email Templates**
2. Customize templates for:
   - **Confirm signup**: Email verification
   - **Reset password**: Password reset
   - **Magic Link**: Passwordless login (optional)

### Step 5: Enable OAuth Providers (Optional)

#### Google OAuth Setup:
1. In Supabase dashboard: **Authentication** → **Providers**
2. Enable "Google"
3. Follow instructions to create Google OAuth credentials:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`
4. Copy Client ID and Client Secret to Supabase

#### Other Providers:
- GitHub, Twitter, Facebook, Discord, etc. can be enabled similarly
- Each provider requires app registration and credentials

### Step 6: Restart Services

```bash
# Backend
cd /app/backend
pip install supabase==2.10.0
sudo supervisorctl restart backend

# Frontend (if needed)
cd /app/frontend
yarn install
sudo supervisorctl restart frontend
```

## 🔄 How It Works

### Authentication Flow

#### Sign Up Flow:
1. User enters email, password, and name on signup page
2. Frontend calls `signUpWithEmail()` → Supabase Auth
3. Supabase creates user and sends verification email
4. User clicks verification link in email
5. User is redirected to app (auth/callback)
6. Backend syncs Supabase user → MongoDB
7. User is logged in with app JWT token

#### Sign In Flow:
1. User enters email and password
2. Frontend calls `signInWithEmail()` → Supabase Auth
3. Supabase verifies credentials
4. Frontend receives Supabase session with access_token
5. Frontend calls backend `/api/auth/supabase/callback`
6. Backend verifies token and syncs user to MongoDB
7. Backend returns app JWT token
8. User is logged in

#### Password Reset Flow:
1. User clicks "Forgot Password"
2. Enters email address
3. Frontend calls `resetPasswordForEmail()` → Supabase Auth
4. Supabase sends password reset email with secure link
5. User clicks link (valid for 1 hour)
6. User is redirected to /reset-password page
7. User enters new password
8. Frontend calls `updatePassword()` → Supabase Auth
9. Password is updated
10. User can sign in with new password

#### OAuth Flow (Google):
1. User clicks "Sign in with Google"
2. Frontend calls `signInWithGoogle()` → Supabase Auth
3. User is redirected to Google OAuth consent
4. After consent, redirected to /auth/callback
5. Backend syncs Google user → MongoDB
6. User is logged in

### User Synchronization

**MongoDB User Document:**
```javascript
{
  id: "uuid",
  supabase_user_id: "supabase-uuid",
  email: "user@example.com",
  name: "John Doe",
  email_verified: true,
  avatar_url: "https://...",
  oauth_provider: "google" | "email",
  role: "user" | "admin",
  plan_id: "free",
  // ... app-specific fields (chatbots, subscriptions, etc.)
}
```

**Key Points:**
- Supabase handles authentication only
- MongoDB stores all app data (chatbots, messages, subscriptions)
- Users are linked via `supabase_user_id` field
- Existing MongoDB data is preserved

## 📧 Email Configuration

### Email Provider Options:

Supabase uses its own SMTP service by default (development only).

**For Production:**
1. Go to **Project Settings** → **Auth**
2. Scroll to "SMTP Settings"
3. Configure your own SMTP server:
   - Host: `smtp.gmail.com` (or your provider)
   - Port: `587` (TLS) or `465` (SSL)
   - Username: Your email
   - Password: App password

**Recommended Email Providers:**
- SendGrid (free tier: 100 emails/day)
- AWS SES (free tier: 62,000 emails/month)
- Mailgun (free tier: 5,000 emails/month)
- Gmail (requires app password)

## 🔒 Security Best Practices

1. **Never commit credentials to Git**
   - Add `.env` to `.gitignore`
   - Use environment variables

2. **Use Service Role Key carefully**
   - Only on backend
   - Never expose to frontend
   - Has admin privileges

3. **Configure Row Level Security (RLS)**
   - Not required for this app (using MongoDB)
   - But recommended if using Supabase database

4. **Set proper redirect URLs**
   - Only allow your domains
   - Prevents phishing attacks

5. **Enable email verification**
   - Configured in Auth settings
   - Prevents spam signups

## 🧪 Testing

### Test Supabase Configuration:

#### Backend:
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

#### Frontend:
Open browser console and check for:
```
✅ Supabase client initialized successfully
```

### Test Sign Up:
1. Go to `/signup`
2. Enter test email and password
3. Check email for verification link
4. Click link to verify
5. Check if user appears in MongoDB users collection

### Test Password Reset:
1. Go to `/forgot-password`
2. Enter email
3. Check email for reset link
4. Click link
5. Set new password
6. Sign in with new password

## 🔧 Troubleshooting

### Issue: "Supabase client not initialized"
**Solution:** Check that `.env` files have correct `SUPABASE_URL` and `SUPABASE_ANON_KEY`

### Issue: "Invalid token" error
**Solution:** Check that `SUPABASE_JWT_SECRET` matches your project's JWT secret

### Issue: Email not being sent
**Solution:**
1. Check Supabase email logs: Authentication → Logs
2. Verify SMTP settings if using custom provider
3. Check spam folder
4. Ensure redirect URLs are configured

### Issue: User not syncing to MongoDB
**Solution:**
1. Check backend logs: `tail -50 /var/log/supervisor/backend.err.log`
2. Verify MongoDB connection
3. Check `/api/auth/supabase/callback` endpoint

### Issue: OAuth redirect not working
**Solution:**
1. Verify redirect URLs in Supabase dashboard
2. Check OAuth provider settings (Google Cloud Console)
3. Ensure authorized redirect URI is correct

## 📚 API Endpoints

### Supabase Auth Endpoints:

#### POST `/api/auth/supabase/callback`
Sync Supabase user to MongoDB and return app JWT token.

**Request:**
```json
{
  "access_token": "supabase-access-token"
}
```

**Response:**
```json
{
  "access_token": "app-jwt-token",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "email_verified": true,
    "role": "user",
    "plan_id": "free"
  }
}
```

#### GET `/api/auth/supabase/status`
Check if Supabase is configured.

**Response:**
```json
{
  "configured": true,
  "message": "Supabase authentication is configured and ready"
}
```

## 🔄 Migration from Legacy Auth

### Backward Compatibility:

The app supports **both** Supabase and legacy auth simultaneously:

- If Supabase is configured → uses Supabase auth
- If Supabase is NOT configured → falls back to legacy auth
- Existing users with legacy auth continue working
- New users can use Supabase auth

### Migrating Existing Users:

**Option 1: Gradual Migration**
- Keep both auth methods active
- Let users naturally migrate by resetting passwords via Supabase

**Option 2: Bulk Migration**
- Export users from MongoDB
- Import to Supabase via API
- Trigger password reset for all users

**Option 3: Hybrid Approach**
- New users → Supabase auth
- Existing users → legacy auth (until they reset password)

## 🎉 Benefits of Supabase Auth

✅ **No SMTP Configuration Required** - Built-in email service  
✅ **Professional Email Templates** - Customizable, mobile-responsive  
✅ **Automatic Token Management** - Refresh tokens, expiration handling  
✅ **OAuth Providers** - Google, GitHub, Twitter, etc.  
✅ **Security Features** - Rate limiting, brute force protection  
✅ **Email Verification** - Automatic, no custom code needed  
✅ **Password Reset** - Secure, one-time use tokens  
✅ **Magic Links** - Passwordless authentication option  
✅ **Multi-factor Auth** - TOTP support (can be added)  
✅ **Admin API** - Manage users programmatically  

## 📞 Support

If you encounter issues:
1. Check Supabase dashboard logs
2. Check backend logs: `/var/log/supervisor/backend.err.log`
3. Check frontend console for errors
4. Verify environment variables are set correctly
5. Test with Supabase CLI: `supabase status`

## 🚀 Next Steps

After basic setup, consider:
1. Customize email templates with your branding
2. Enable additional OAuth providers
3. Set up custom domain for emails
4. Configure rate limiting
5. Enable multi-factor authentication
6. Set up monitoring and alerts

---

**Created:** January 3, 2025  
**Status:** ✅ Fully Functional (awaiting Supabase credentials)  
**Version:** 1.0.0
