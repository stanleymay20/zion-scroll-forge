# ScrollBadge Gallery Components

"By the Spirit of Excellence, we establish verifiable credentials"

## Overview

The ScrollBadge Gallery is a comprehensive frontend system for displaying, managing, and verifying NFT-based digital credentials earned through course completion and academic achievements. All badges are blockchain-verified and can be shared publicly or kept private.

## Components

### BadgeGallery
Main component for displaying a user's badge collection with filtering, searching, and sorting capabilities.

**Features:**
- Grid and list view modes
- Search by course name or credential type
- Filter by credential type, course, and minimum grade
- Sort by date or grade
- Real-time badge statistics
- Badge detail modal integration

**Props:**
- `userId: string` - User ID to fetch badges for
- `isOwnProfile?: boolean` - Whether viewing own profile (enables edit features)

**Usage:**
```tsx
import { BadgeGallery } from '@/components/scrollbadge/BadgeGallery';

<BadgeGallery userId={user.id} isOwnProfile={true} />
```

### BadgeCard
Individual badge display component supporting both grid and list layouts.

**Features:**
- Responsive grid/list layouts
- Visual credential type indicators
- Grade display with color coding
- Privacy status indicators
- Blockchain verification badges
- Click to view details

**Props:**
- `badge: ScrollBadge` - Badge data to display
- `viewMode: 'grid' | 'list'` - Display mode
- `onClick: () => void` - Click handler
- `isOwnProfile?: boolean` - Whether viewing own profile

### BadgeDetailModal
Comprehensive modal for viewing detailed badge information.

**Features:**
- Full badge metadata display
- Blockchain verification details
- IPFS storage information
- Visibility toggle (public/private)
- Badge download functionality
- Tabbed interface for details, verification, and sharing

**Props:**
- `badge: ScrollBadge` - Badge to display
- `isOpen: boolean` - Modal open state
- `onClose: () => void` - Close handler
- `isOwnProfile?: boolean` - Whether viewing own profile
- `onBadgeUpdated?: () => void` - Callback after badge update

### BadgeFilters
Advanced filtering component for refining badge search.

**Features:**
- Credential type filter
- Minimum grade slider
- Clear all filters button
- Active filter indicators

**Props:**
- `filters: BadgeFilter` - Current filter state
- `onFilterChange: (filters: BadgeFilter) => void` - Filter change handler
- `onClearFilters: () => void` - Clear filters handler

### BadgeStats
Statistics dashboard showing badge collection metrics.

**Features:**
- Total badge count
- Average grade calculation
- Highest grade display
- Badge type distribution
- Visual stat cards

**Props:**
- `badges: ScrollBadge[]` - Array of badges to analyze

### BadgeSharing
Social media sharing component for badges.

**Features:**
- Share to LinkedIn, Twitter, Facebook, Email
- Custom message composition
- Direct link copying
- Embed code generation
- Privacy status warnings

**Props:**
- `badge: ScrollBadge` - Badge to share

### BadgeVerification
Blockchain verification interface for badges.

**Features:**
- Quick blockchain verification
- Employer verification requests
- Blockchain explorer links
- Verification result display
- Detailed verification information

**Props:**
- `badge: ScrollBadge` - Badge to verify

### BadgeAchievementProgress
Achievement tracking component showing progress towards milestones.

**Features:**
- Multiple achievement types
- Progress bars and percentages
- Reward display
- Completion status
- Achievement summary statistics

**Props:**
- `userId: string` - User ID to fetch achievements for

## Pages

### ScrollBadgeGallery
Main page for viewing and managing badge collection.

**Features:**
- Tabbed interface (Gallery / Achievements)
- Full badge gallery integration
- Achievement progress tracking
- Authentication required

**Route:** `/badges` or `/my-badges`

### PublicBadgeProfile
Public-facing page for viewing a user's badge collection.

**Features:**
- Public badge display only
- User profile information
- Achievement showcase
- Shareable profile URL
- No authentication required

**Route:** `/badges/public/:userId`

## Types

### ScrollBadge
```typescript
interface ScrollBadge {
  id: string;
  tokenId: number;
  userId: string;
  courseId: string;
  courseName: string;
  studentName: string;
  completionDate: string;
  grade: number;
  credentialType: BadgeCredentialType;
  ipfsHash: string;
  metadataUri: string;
  blockchainTxHash?: string;
  blockNumber?: number;
  isRevoked: boolean;
  isPublic: boolean;
  ownerAddress: string;
}
```

### BadgeCredentialType
```typescript
enum BadgeCredentialType {
  COURSE_COMPLETION = 'COURSE_COMPLETION',
  SKILL_MASTERY = 'SKILL_MASTERY',
  DEGREE_COMPLETION = 'DEGREE_COMPLETION',
  CERTIFICATE = 'CERTIFICATE',
  SPECIALIZATION = 'SPECIALIZATION',
  ACHIEVEMENT = 'ACHIEVEMENT'
}
```

## API Integration

### Endpoints Used

- `GET /api/scrollbadge/user/:userId` - Fetch user's badges
- `GET /api/scrollbadge/:badgeId` - Get badge by ID
- `GET /api/scrollbadge/token/:tokenId` - Get badge by token ID
- `PUT /api/scrollbadge/:badgeId/visibility` - Update badge visibility
- `POST /api/scrollbadge/verify` - Verify badge authenticity
- `POST /api/scrollbadge/verify/employer` - Request employer verification
- `POST /api/scrollbadge/share` - Share badge on social media
- `GET /api/scrollbadge/profile/:userId` - Get public badge profile
- `GET /api/scrollbadge/statistics` - Get badge statistics

## Styling

All components use:
- Tailwind CSS for styling
- Shadcn UI components for consistency
- Responsive design (mobile-first)
- Dark mode support
- Accessibility compliance (WCAG 2.1 AA)

## Features

### Badge Display
- Grid and list view modes
- Responsive layouts
- Visual credential type indicators
- Grade color coding
- Privacy status badges
- Blockchain verification indicators

### Filtering & Search
- Text search by course name
- Filter by credential type
- Filter by minimum grade
- Sort by date or grade
- Clear all filters

### Badge Details
- Full metadata display
- Blockchain information
- IPFS storage details
- Verification status
- Revocation information

### Sharing
- Social media integration
- Direct link sharing
- Embed code generation
- Custom message composition
- Privacy controls

### Verification
- Quick blockchain verification
- Employer verification requests
- Blockchain explorer integration
- Verification result display
- Detailed verification information

### Achievements
- Progress tracking
- Multiple achievement types
- Reward display
- Completion status
- Summary statistics

## Best Practices

1. **Always check authentication** before displaying sensitive badge information
2. **Respect privacy settings** - only show public badges to non-owners
3. **Handle loading states** gracefully with skeleton screens
4. **Provide clear error messages** when operations fail
5. **Use optimistic updates** for better UX (e.g., visibility toggle)
6. **Cache badge data** to reduce API calls
7. **Implement proper error boundaries** for component failures
8. **Use toast notifications** for user feedback
9. **Validate blockchain data** before displaying
10. **Support keyboard navigation** for accessibility

## Future Enhancements

- Badge marketplace integration
- Advanced filtering (date ranges, multiple types)
- Badge comparison tools
- Export badge collection as PDF
- Badge analytics dashboard
- Social feed integration
- Badge recommendations
- Gamification features
- Mobile app support
- Offline badge viewing

## Dependencies

- React 18+
- TypeScript 5+
- Tailwind CSS
- Shadcn UI components
- date-fns (date formatting)
- sonner (toast notifications)
- lucide-react (icons)

## Testing

Components should be tested for:
- Proper badge display in grid/list modes
- Filter and search functionality
- Visibility toggle operations
- Sharing functionality
- Verification processes
- Achievement progress calculations
- Responsive layouts
- Accessibility compliance
- Error handling
- Loading states

## Support

For issues or questions:
- Check the API documentation
- Review the backend ScrollBadge service
- Consult the blockchain integration guide
- Contact the development team

---

**"By the Spirit of Excellence, we establish verifiable credentials on the blockchain"**
