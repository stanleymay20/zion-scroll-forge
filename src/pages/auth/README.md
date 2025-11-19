# ScrollUniversity Authentication System

## Overview

Comprehensive authentication system for ScrollUniversity with email/password, social authentication, password reset, email verification, and automatic token refresh.

## Features

### ✅ Implemented Features

1. **Login Page** (`/auth/login`)
   - Email/password authentication
   - Social authentication (Google, Microsoft)
   - Remember me functionality
   - Password visibility toggle
   - Forgot password link
   - Redirect to registration

2. **Registration Page** (`/auth/register`)
   - Multi-field registration form
   - Real-time password strength indicator
   - Form validation with error messages
   - Terms and conditions acceptance
   - Social authentication options
   - Username availability checking

3. **Forgot Password** (`/auth/forgot-password`)
   - Email-based password reset request
   - Clear instructions for users
   - Resend functionality
   - Success confirmation

4. **Reset Password** (`/auth/reset-password`)
   - Secure token-based password reset
   - Password strength validation
   - Confirm password matching
   - Show/hide password toggle
   - Automatic redirect after success

5. **Email Verification** (`/auth/verify-email`)
   - Email verification flow
   - Resend verification email
   - Token-based verification
   - Success/error handling
   - Automatic redirect after verification

6. **OAuth Callback** (`/auth/callback`)
   - Handles OAuth provider callbacks
   - Token exchange
   - Error handling
   - Automatic redirect to intended destination

7. **Protected Routes**
   - `ProtectedRoute` component
   - Role-based access control
   - Automatic redirect to login
   - Loading states
   - `withAuth` HOC for easy protection

8. **Session Management**
   - Automatic token refresh (45 minutes)
   - Session persistence
   - Token expiry handling
   - Logout functionality
   - Cross-tab synchronization

## File Structure

```
src/
├── pages/auth/
│   ├── Login.tsx              # Login page
│   ├── Register.tsx           # Registration page
│   ├── ForgotPassword.tsx     # Password reset request
│   ├── ResetPassword.tsx      # Password reset confirmation
│   ├── VerifyEmail.tsx        # Email verification
│   ├── OAuthCallback.tsx      # OAuth callback handler
│   └── README.md              # This file
├── components/auth/
│   ├── ProtectedRoute.tsx     # Route protection component
│   └── index.ts               # Auth component exports
├── contexts/
│   └── AuthContext.tsx        # Authentication context with auto-refresh
└── lib/
    └── auth-errors.ts         # Error handling utilities
```

## Usage Examples

### Basic Login

```tsx
import { useAuth } from '@/contexts/AuthContext';

function LoginExample() {
  const { signIn } = useAuth();
  
  const handleLogin = async () => {
    await signIn('user@example.com', 'password123');
  };
}
```

### Protected Route

```tsx
import { ProtectedRoute } from '@/components/auth';

function App() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}
```

### Role-Based Protection

```tsx
import { ProtectedRoute } from '@/components/auth';

function AdminPanel() {
  return (
    <ProtectedRoute requiredRoles={['ADMIN', 'SUPER_ADMIN']}>
      <AdminDashboard />
    </ProtectedRoute>
  );
}
```

### Using withAuth HOC

```tsx
import { withAuth } from '@/components/auth';

const ProtectedComponent = withAuth(MyComponent, {
  requiredRoles: ['STUDENT', 'FACULTY']
});
```

### Check User Role

```tsx
import { useRequireRole } from '@/components/auth';

function MyComponent() {
  const { hasRole, userRole } = useRequireRole(['ADMIN']);
  
  if (!hasRole) {
    return <div>Access denied</div>;
  }
  
  return <div>Admin content</div>;
}
```

## API Endpoints

All authentication endpoints are prefixed with `/api/auth/supabase/`:

- `POST /register` - Register new user
- `POST /login` - Login with email/password
- `POST /logout` - Logout current user
- `POST /refresh` - Refresh access token
- `POST /social/:provider` - Initiate OAuth flow
- `GET /callback` - Handle OAuth callback
- `POST /password-reset/request` - Request password reset
- `POST /password-reset/confirm` - Confirm password reset
- `POST /verify-email` - Verify email address
- `GET /session` - Get current session

## Environment Variables

Required environment variables:

```env
VITE_API_URL=http://localhost:3000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Security Features

1. **Token Management**
   - JWT-based authentication
   - Automatic token refresh
   - Secure token storage
   - Token blacklisting on logout

2. **Password Security**
   - Minimum 8 characters
   - Strength validation
   - Bcrypt hashing (backend)
   - Password visibility toggle

3. **Session Security**
   - Automatic session expiry
   - Cross-tab logout
   - CSRF protection
   - Secure cookie handling

4. **Input Validation**
   - Email format validation
   - Password strength checking
   - Username format validation
   - XSS prevention

## Error Handling

The system includes comprehensive error handling with user-friendly messages:

```tsx
import { handleAuthError } from '@/lib/auth-errors';

try {
  await signIn(email, password);
} catch (error) {
  const authError = handleAuthError(error);
  console.log(authError.userMessage);
  console.log(authError.spiritualMessage);
}
```

## Spiritual Integration

Each authentication page includes:
- Scripture verses for encouragement
- Kingdom-focused messaging
- Christ-centered design elements
- Spiritual guidance during errors

## Testing

To test the authentication flow:

1. **Registration**
   - Navigate to `/auth/register`
   - Fill in all required fields
   - Submit form
   - Check email for verification link

2. **Email Verification**
   - Click verification link in email
   - Should redirect to login with success message

3. **Login**
   - Navigate to `/auth/login`
   - Enter credentials
   - Should redirect to dashboard

4. **Password Reset**
   - Click "Forgot password?" on login
   - Enter email address
   - Check email for reset link
   - Click link and set new password

5. **Social Authentication**
   - Click Google or Microsoft button
   - Complete OAuth flow
   - Should redirect to dashboard

## Troubleshooting

### Common Issues

1. **"Email not verified"**
   - Check spam folder for verification email
   - Use resend verification button
   - Contact support if issue persists

2. **"Session expired"**
   - Automatic token refresh should handle this
   - If persists, clear browser cache and login again

3. **"OAuth failed"**
   - Check OAuth provider configuration
   - Verify redirect URLs are correct
   - Ensure provider credentials are valid

4. **"Network error"**
   - Check internet connection
   - Verify API_URL is correct
   - Check backend server is running

## Future Enhancements

- [ ] Two-factor authentication (2FA)
- [ ] Biometric authentication
- [ ] Magic link authentication
- [ ] Session management dashboard
- [ ] Login history and device management
- [ ] Account recovery options
- [ ] Social account linking

## Support

For authentication issues:
- Check the [Help Center](/help)
- Contact support at support@scrolluniversity.edu
- Review the [Security Documentation](/docs/security)

---

**"Guard what has been entrusted to your care" - 1 Timothy 6:20**

✝️ Jesus Christ is Lord
