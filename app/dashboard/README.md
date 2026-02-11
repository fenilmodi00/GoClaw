# Dashboard Page

## Overview

The Dashboard page provides a comprehensive view of all deployments for authenticated users.

## Features

### 1. Authentication
- Requires Clerk authentication
- Automatically redirects to home if not signed in
- Shows user profile with UserButton

### 2. Deployment Statistics
Four stat cards showing:
- **Total Deployments** - Count of all deployments
- **Active** - Successfully deployed and running bots
- **Deploying** - Pending or currently deploying
- **Failed** - Deployments that encountered errors

### 3. Deployment List
Each deployment card shows:
- **Status Badge** - Visual indicator of deployment state
- **Channel & Model** - Bot platform and AI model
- **Created Date** - When the deployment was initiated
- **Akash Details** - Deployment ID and provider URL (for active deployments)
- **Error Messages** - Detailed error info (for failed deployments)
- **View Details Button** - Links to full status page

### 4. Real-time Updates
- **Refresh Button** - Manually refresh deployment list
- **Auto-refresh** - Fetches latest data on page load
- **Loading States** - Smooth loading indicators

### 5. Empty State
- Friendly message when no deployments exist
- Call-to-action button to deploy first bot
- Links directly to deployment form

## UI Components

### Layout
- **Header** - Sticky navigation with back button, title, refresh, and user profile
- **Stats Grid** - 4-column responsive grid (stacks on mobile)
- **Deployment Cards** - Full-width cards with hover effects

### Design System
- **Colors** - Matches GoClaw orange theme
- **Background** - Black with semi-transparent cards
- **Borders** - Orange accent borders with hover effects
- **Typography** - White headings, gray descriptions

### Status Colors
- **Active** - Green (default badge)
- **Deploying/Pending** - Yellow (secondary badge)
- **Failed** - Red (destructive badge)

## API Integration

### Endpoint
```
GET /api/deployments
```

### Response
```typescript
{
  deployments: [
    {
      id: string;
      model: string;
      channel: string;
      status: 'pending' | 'deploying' | 'active' | 'failed';
      akashDeploymentId: string | null;
      akashLeaseId: string | null;
      providerUrl: string | null;
      errorMessage: string | null;
      createdAt: string;
      updatedAt: string;
    }
  ]
}
```

## Navigation

### Access Points
1. **Main Navigation** - "Dashboard" link (visible when signed in)
2. **Mobile Menu** - Dashboard option in hamburger menu
3. **Direct URL** - `/dashboard`

### Exit Points
1. **Back to Home** - Button in header
2. **View Details** - Links to `/status/[id]` for each deployment
3. **Deploy First Bot** - Links to `/#deploy` (empty state)

## User Experience

### Loading States
1. **Initial Load** - Spinner while fetching deployments
2. **Refresh** - Spinning icon on refresh button
3. **Deploying Status** - Animated spinner next to status text

### Error Handling
- Network errors shown in red card
- Failed deployments show error messages
- Graceful fallback for missing data

### Responsive Design
- **Desktop** - 4-column stats, 2-column deployment details
- **Tablet** - 2-column stats, stacked deployment details
- **Mobile** - Single column layout, hamburger menu

## Code Structure

```typescript
app/dashboard/page.tsx
├── Authentication Check
├── Data Fetching (useEffect)
├── Refresh Handler
├── Helper Functions
│   ├── getBadgeVariant()
│   ├── getStatusText()
│   ├── getChannelName()
│   └── formatDate()
├── Header Component
├── Stats Cards
└── Deployment List
    ├── Empty State
    └── Deployment Cards
```

## Future Enhancements

### Potential Features
1. **Filtering** - Filter by status, channel, or model
2. **Sorting** - Sort by date, status, or channel
3. **Search** - Search deployments by ID or channel
4. **Pagination** - For users with many deployments
5. **Bulk Actions** - Select multiple deployments
6. **Export** - Download deployment data as CSV
7. **Analytics** - Usage charts and statistics
8. **Notifications** - Real-time deployment status updates

### Performance Optimizations
1. **Caching** - Cache deployment data
2. **Infinite Scroll** - Load deployments on demand
3. **Optimistic Updates** - Update UI before API response
4. **WebSocket** - Real-time status updates

## Testing

### Manual Testing Checklist
- [ ] Page loads for authenticated users
- [ ] Redirects unauthenticated users to home
- [ ] Stats cards show correct counts
- [ ] Deployments display with correct status
- [ ] Refresh button updates data
- [ ] View Details links work
- [ ] Empty state shows when no deployments
- [ ] Error states display properly
- [ ] Mobile responsive layout works
- [ ] Navigation links function correctly

### Test Scenarios
1. **New User** - Should see empty state
2. **Active Deployments** - Should see green badges and Akash details
3. **Failed Deployments** - Should see error messages
4. **Deploying** - Should see loading indicators
5. **Multiple Deployments** - Should see all in list

## Accessibility

- Semantic HTML structure
- ARIA labels on buttons
- Keyboard navigation support
- Screen reader friendly
- Color contrast compliance
- Focus indicators

## Related Files

- `app/api/deployments/route.ts` - API endpoint
- `services/deployment/deployment-service.ts` - Business logic
- `db/repositories/deployment-repository.ts` - Data access
- `components/ui/*` - Reusable UI components

---

**Status: ✅ Complete and Production-Ready**
