# Settings Components

"Set your minds on things above, not on earthly things" - Colossians 3:2

## Overview

Comprehensive settings and preferences management system for ScrollUniversity, providing users with granular control over their account, privacy, security, and accessibility preferences.

## Components

### ProfileSettings.tsx
Account profile management with avatar upload and personal information editing.

**Features:**
- Avatar upload with validation (5MB max, image files only)
- Profile information editing (name, bio, email)
- Real-time validation with Zod schema
- Integration with Supabase storage

### NotificationSettings.tsx
Granular notification preferences across multiple channels.

**Features:**
- Email notifications toggle
- Push notifications control
- SMS notifications settings
- Marketing email preferences
- Per-category notification controls

### PrivacySettings.tsx
Comprehensive privacy controls for profile visibility and data sharing.

**Features:**
- Profile visibility (public, private, friends only)
- Contact information visibility toggles
- Activity visibility controls
- Communication preferences
- Data analytics and personalization settings
- Search and discovery controls

**Requirements Validated:** 12.3

### SecuritySettings.tsx
Advanced security features including 2FA and session management.

**Features:**
- Two-factor authentication setup (SMS, Email, Authenticator)
- QR code generation for authenticator apps
- Backup codes for 2FA recovery
- Active session management
- Session termination
- Password change functionality
- Login history display

**Requirements Validated:** 12.1, 12.4

### LanguageSettings.tsx
Language and localization preferences for global accessibility.

**Features:**
- 9+ language support (English, Spanish, French, German, Portuguese, Chinese, Arabic, Hindi, Swahili)
- Time zone selection
- Date format customization
- Time format (12h/24h)
- Real-time preview of settings

**Requirements Validated:** 12.2

### ThemeSettings.tsx
Visual theme customization for user preference.

**Features:**
- Light/Dark/System theme modes
- Theme persistence
- Immediate theme application
- Integration with next-themes

**Requirements Validated:** 12.2

### AccessibilitySettings.tsx
Comprehensive accessibility features for inclusive design.

**Features:**
- Screen reader optimization
- High contrast mode
- Font size adjustment (small, medium, large)
- Reduced motion support
- Keyboard navigation enhancements
- Closed captions toggle
- Video auto-play control
- Video quality preferences

**Requirements Validated:** 12.5

### InstitutionSwitch.tsx
Multi-institution support for users affiliated with multiple organizations.

## API Integration

All settings components integrate with the backend API through `src/services/settingsService.ts`:

### Endpoints Used:
- `GET /api/profile/preferences/:userId` - Fetch user settings
- `PUT /api/profile/preferences` - Update user settings
- `GET /api/profile/privacy/:userId` - Fetch privacy settings
- `PUT /api/profile/privacy` - Update privacy settings
- `GET /api/profile/security/:userId` - Fetch security settings
- `POST /api/profile/security/2fa/setup` - Setup 2FA
- `POST /api/profile/security/2fa/verify` - Verify 2FA
- `POST /api/profile/security/2fa/disable` - Disable 2FA
- `DELETE /api/profile/security/sessions/:sessionId` - Terminate session

## State Management

Uses React Query for:
- Caching settings data
- Optimistic updates
- Automatic refetching
- Error handling

Query keys:
- `["user-settings"]` - General user settings
- `["privacy-settings"]` - Privacy preferences
- `["security-settings"]` - Security configuration

## Form Validation

All forms use:
- React Hook Form for form state management
- Zod for schema validation
- Type-safe form data with TypeScript

## Accessibility

All components follow WCAG 2.1 AA standards:
- Keyboard navigation support
- Screen reader friendly labels
- Focus indicators
- Semantic HTML
- ARIA attributes where needed

## Spiritual Integration

Each component includes:
- Biblical verse in header comment
- Christ-centered logging
- Kingdom-focused design philosophy

## Usage Example

```tsx
import { SettingsPage } from '@/pages/Settings';

// The Settings page automatically includes all tabs
<SettingsPage />
```

## Testing

Components should be tested for:
- Form validation
- API integration
- Error handling
- Accessibility compliance
- Responsive design

## Future Enhancements

- [ ] Export settings as JSON
- [ ] Import settings from file
- [ ] Settings sync across devices
- [ ] Advanced notification scheduling
- [ ] Custom theme creation
- [ ] Accessibility audit tool
- [ ] Settings search functionality
- [ ] Settings history/versioning

## Related Files

- `src/types/settings.ts` - TypeScript type definitions
- `src/services/settingsService.ts` - API service layer
- `src/hooks/useSettings.ts` - React hooks for settings
- `backend/src/types/profile.types.ts` - Backend type definitions
- `backend/src/services/ProfileService.ts` - Backend service implementation

## Requirements Coverage

This implementation satisfies:
- **Requirement 12.1**: Profile and account settings management
- **Requirement 12.2**: Notification and theme preferences
- **Requirement 12.3**: Privacy settings with granular controls
- **Requirement 12.4**: Security settings with 2FA
- **Requirement 12.5**: Accessibility settings

All components are production-ready and follow ScrollUniversity's development standards.
