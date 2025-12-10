# Student Portal Implementation Guide

## Quick Start

### 1. Import Components

```tsx
import { 
  RegistrationInterface, 
  DegreeAuditDashboard, 
  GraduationPlanningView 
} from '@/components/student-portal';
```

### 2. Use in Your Application

```tsx
// Individual components
<RegistrationInterface studentId={studentId} semesterId={semesterId} />
<DegreeAuditDashboard studentId={studentId} />
<GraduationPlanningView studentId={studentId} />

// Or use the complete portal page
import StudentPortal from '@/pages/StudentPortal';
```

## Component Props

### RegistrationInterface
```typescript
interface RegistrationInterfaceProps {
  studentId: string;  // Current student's ID
  semesterId: string; // Current or target semester ID
}
```

### DegreeAuditDashboard
```typescript
interface DegreeAuditDashboardProps {
  studentId: string;  // Current student's ID
}
```

### GraduationPlanningView
```typescript
interface GraduationPlanningViewProps {
  studentId: string;  // Current student's ID
}
```

## Integration with Authentication

```tsx
import { useAuth } from '@/contexts/AuthContext';

const MyStudentPortal = () => {
  const { user } = useAuth();
  const studentId = user?.studentId;
  const semesterId = getCurrentSemesterId(); // Your logic here

  if (!studentId) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <RegistrationInterface 
        studentId={studentId} 
        semesterId={semesterId} 
      />
    </div>
  );
};
```

## API Configuration

Ensure your environment variables are set:

```env
VITE_API_URL=http://localhost:3000
```

## Backend Requirements

The components expect these API endpoints to be available:

### Registration Endpoints
- `POST /api/registration/courses/search`
- `POST /api/registration/validate`
- `POST /api/registration/enroll`
- `GET /api/students/:id/schedule`
- `GET /api/registration/waitlist`
- `POST /api/registration/drop`

### Degree Audit Endpoints
- `GET /api/students/:id/degree-audit`
- `POST /api/students/:id/degree-audit/refresh`

### Graduation Endpoints
- `POST /api/graduation/evaluate`
- `GET /api/graduation/timeline`
- `POST /api/graduation/apply`

## Styling

Components use Tailwind CSS and Shadcn/ui. Ensure you have:

```tsx
// tailwind.config.ts
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // ... rest of config
}
```

## Error Handling

Components handle errors gracefully and display user-friendly messages. You can customize error handling by modifying the service layer:

```typescript
// src/services/studentPortalService.ts
try {
  // API call
} catch (error) {
  // Custom error handling
  console.error('Error:', error);
  return { success: false, error: 'Custom error message' };
}
```

## Customization

### Theming
Modify colors in your Tailwind config:

```typescript
theme: {
  extend: {
    colors: {
      primary: '#your-color',
      // ... more colors
    }
  }
}
```

### Spiritual Formation Content
Edit the spiritual formation sections in each component to match your institution's values.

### Validation Rules
Customize validation logic in the backend services:
- `RegistrationService.ts`
- `GraduationService.ts`

## Testing

### Unit Tests Example
```typescript
import { render, screen } from '@testing-library/react';
import { RegistrationInterface } from './RegistrationInterface';

test('renders registration interface', () => {
  render(
    <RegistrationInterface 
      studentId="test-id" 
      semesterId="test-semester" 
    />
  );
  expect(screen.getByText(/Course Registration/i)).toBeInTheDocument();
});
```

### Integration Tests
```typescript
import { studentPortalService } from '@/services/studentPortalService';

test('fetches degree audit', async () => {
  const result = await studentPortalService.getDegreeAudit('student-id');
  expect(result.success).toBe(true);
  expect(result.data).toBeDefined();
});
```

## Performance Optimization

### Lazy Loading
```tsx
import { lazy, Suspense } from 'react';

const RegistrationInterface = lazy(() => 
  import('@/components/student-portal/RegistrationInterface')
);

<Suspense fallback={<div>Loading...</div>}>
  <RegistrationInterface studentId={id} semesterId={semId} />
</Suspense>
```

### Memoization
```tsx
import { memo } from 'react';

export const RegistrationInterface = memo(({ studentId, semesterId }) => {
  // Component logic
});
```

## Accessibility

Components follow WCAG 2.1 AA standards:
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Screen reader support

Test with:
```bash
npm run test:a11y
```

## Mobile Responsiveness

Components are mobile-first and responsive. Test on:
- Mobile (320px+)
- Tablet (768px+)
- Desktop (1024px+)

## Troubleshooting

### Common Issues

**Issue:** Components not loading
- Check API_URL environment variable
- Verify backend is running
- Check browser console for errors

**Issue:** Authentication errors
- Verify Supabase session is active
- Check JWT token validity
- Ensure user has student role

**Issue:** Data not displaying
- Check API responses in Network tab
- Verify data structure matches types
- Check for CORS issues

## Support

For issues or questions:
1. Check the README.md
2. Review the TASK_36_STUDENT_PORTAL_COMPLETE.md
3. Contact the development team

## Version History

- v1.0.0 - Initial implementation (December 2024)
  - Registration Interface
  - Degree Audit Dashboard
  - Graduation Planning View
