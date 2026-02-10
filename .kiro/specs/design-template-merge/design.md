# Design Document: Deploy Page with Animated Hero Design

## Overview

This design document specifies the implementation approach for creating a new deployment page (`/deploy`) that adopts the animated hero design style from the minimal-animated-hero template. The page will feature a black background with animated orange flowing wave threads, integrate Clerk authentication, and display the SimpleClaw deployment form in a clean, minimal layout.

### Key Design Principles

1. **Visual Consistency**: Reuse the exact animated background SVG code from the template to ensure identical visual effects
2. **Simplicity**: Focus on authentication and deployment functionality without marketing content
3. **Component Reuse**: Leverage existing LineShadowText and ShimmerButton components already in the codebase
4. **Authentication-First**: Show authentication options prominently for unauthenticated users, deployment form for authenticated users
5. **Performance**: Maintain 60fps animations using CSS transforms and GPU acceleration

## Architecture

### Page Structure

```
/deploy route (app/deploy/page.tsx)
├── Animated Background Layer (SVG with flowing threads)
├── Navigation Header
│   ├── Logo/Branding
│   ├── Home Link
│   └── Authentication (UserButton or SignIn/SignUp buttons)
├── Main Content Area
│   ├── Page Heading (with LineShadowText)
│   ├── Description
│   └── Conditional Content:
│       ├── If NOT authenticated: Authentication Buttons (ShimmerButton)
│       └── If authenticated: Deployment Form (in Card)
└── Footer (optional, minimal)
```

### Component Hierarchy

```
DeployPage (Client Component)
├── AnimatedBackground (inline SVG)
├── Header
│   ├── Link (to home)
│   ├── UserButton (from Clerk)
│   ├── SignInButton (from Clerk)
│   └── SignUpButton (from Clerk)
├── Main
│   ├── LineShadowText (heading emphasis)
│   ├── ShimmerButton (auth CTAs)
│   └── DeploymentForm (existing component)
└── Footer
```

### Routing

- **Route**: `/deploy`
- **File Location**: `app/deploy/page.tsx`
- **Type**: Client Component (uses `"use client"` directive)
- **Authentication**: Uses Clerk's `useUser()` hook to check auth state

## Components and Interfaces

### 1. DeployPage Component

**Location**: `app/deploy/page.tsx`

**Purpose**: Main page component that renders the deployment interface with animated background

**Props**: None (page component)

**State**:
```typescript
const { isSignedIn, isLoaded } = useUser(); // From Clerk
```

**Key Features**:
- Client-side component (`"use client"`)
- Conditional rendering based on authentication state
- Embedded animated SVG background
- Responsive layout with Tailwind CSS

### 2. AnimatedBackground (Inline SVG)

**Implementation**: Embedded directly in DeployPage component

**Structure**:
```typescript
<div className="absolute inset-0 bg-black">
  <div className="absolute inset-0">
    <svg viewBox="0 0 1200 800" ...>
      <defs>
        {/* Gradients and filters */}
      </defs>
      <g>
        {/* 36 animated thread paths with particles */}
      </g>
    </svg>
  </div>
</div>
```

**SVG Elements**:
- **Radial Gradients**: `neonPulse1`, `neonPulse2`, `neonPulse3` for particle glow effects
- **Linear Gradients**: `threadFade1`, `threadFade2`, `threadFade3` for thread color fading
- **Filters**: `heroTextBlur`, `backgroundBlur`, `neonGlow` for visual effects
- **Paths**: 36 SVG paths defining the flowing wave threads
- **Animated Circles**: Particles that move along paths using `<animateMotion>`

**Animation Timing**:
- Particle animation durations: 4s to 6.3s (varied for organic feel)
- All animations use `repeatCount="indefinite"`
- Smooth easing with natural motion paths

### 3. Header Component (Inline)

**Structure**:
```typescript
<header className="relative z-10 flex items-center justify-between px-4 py-4">
  <div className="flex items-center space-x-2">
    <Link href="/">SimpleClaw</Link>
  </div>
  
  <nav className="flex items-center space-x-4">
    <Link href="/">Home</Link>
    {!isLoaded ? (
      <LoadingIndicator />
    ) : isSignedIn ? (
      <UserButton />
    ) : (
      <>
        <SignInButton mode="modal">
          <button>Sign In</button>
        </SignInButton>
        <SignUpButton mode="modal">
          <ShimmerButton>Sign Up</ShimmerButton>
        </SignUpButton>
      </>
    )}
  </nav>
</header>
```

**Styling**:
- `z-10` to appear above animated background
- White text with opacity for links
- Orange ShimmerButton for primary CTA
- Responsive spacing with Tailwind breakpoints

### 4. Main Content Area

**Unauthenticated State**:
```typescript
<main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
  <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
    Deploy Your{" "}
    <LineShadowText shadowColor="white">OpenClaw</LineShadowText>
    {" "}Bot
  </h1>
  
  <p className="text-white/70 text-lg mb-8 max-w-2xl text-center">
    Sign in to deploy your OpenClaw AI bot to Akash Network in minutes
  </p>
  
  <div className="flex gap-4">
    <SignInButton mode="modal">
      <ShimmerButton>Sign In</ShimmerButton>
    </SignInButton>
    <SignUpButton mode="modal">
      <ShimmerButton>Sign Up</ShimmerButton>
    </SignUpButton>
  </div>
</main>
```

**Authenticated State**:
```typescript
<main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 py-8">
  <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 text-center">
    Deploy Your Bot
  </h1>
  
  <p className="text-white/70 text-base mb-8 max-w-xl text-center">
    Configure your OpenClaw bot deployment below
  </p>
  
  <Card className="bg-gray-900/80 border-white/10 max-w-3xl w-full backdrop-blur-sm">
    <CardHeader>
      <CardTitle className="text-white">Deployment Configuration</CardTitle>
      <CardDescription className="text-white/70">
        Enter your credentials to deploy
      </CardDescription>
    </CardHeader>
    <CardContent>
      <DeploymentForm />
    </CardContent>
  </Card>
</main>
```

### 5. Reused Components

#### LineShadowText
- **Location**: `components/line-shadow-text.tsx` (already exists)
- **Usage**: Emphasize key words in headings
- **Props**: `shadowColor="white"`, `className`
- **Animation**: Uses `animate-line-shadow` from globals.css

#### ShimmerButton
- **Location**: `components/shimmer-button.tsx` (already exists)
- **Usage**: Authentication CTAs
- **Props**: `className`, `children`
- **Styling**: Orange background with shimmer effect
- **Animation**: Uses `animate-shimmer-slide` and `animate-spin-around` from globals.css

#### DeploymentForm
- **Location**: `components/DeploymentForm.tsx` (already exists)
- **Usage**: Bot deployment configuration
- **Props**: None (self-contained)
- **Functionality**: Handles credential input, validation, Stripe payment, Akash deployment

## Data Models

### Authentication State

```typescript
interface AuthState {
  isSignedIn: boolean;
  isLoaded: boolean;
  user: User | null | undefined; // From Clerk
}
```

**Source**: Clerk's `useUser()` hook

**Usage**:
- `isLoaded`: Check if auth state has been determined
- `isSignedIn`: Determine which UI to show (auth buttons vs deployment form)
- `user`: Access user information if needed

### Page State

```typescript
interface DeployPageState {
  // No additional state needed beyond Clerk's auth state
  // DeploymentForm manages its own internal state
}
```

The page is primarily stateless, relying on:
1. Clerk's authentication state
2. DeploymentForm's internal state management
3. CSS animations (no JavaScript state)

## Data Flow

```
User visits /deploy
    ↓
DeployPage component mounts
    ↓
useUser() hook checks auth state
    ↓
    ├─→ isLoaded = false → Show loading indicator
    ├─→ isLoaded = true, isSignedIn = false → Show auth buttons
    └─→ isLoaded = true, isSignedIn = true → Show deployment form
         ↓
    User fills deployment form
         ↓
    Form submits to existing backend
         ↓
    Stripe payment → Akash deployment
```

### Authentication Flow

```
Unauthenticated User
    ↓
Clicks "Sign In" or "Sign Up" ShimmerButton
    ↓
Clerk modal opens (mode="modal")
    ↓
User completes authentication
    ↓
Clerk updates auth state
    ↓
useUser() hook returns isSignedIn = true
    ↓
Page re-renders with DeploymentForm
```

## Error Handling

### Authentication Errors

**Scenario**: Clerk fails to load or authenticate
```typescript
if (!isLoaded) {
  return <LoadingIndicator />;
}

// Clerk handles auth errors internally via modal
// No additional error handling needed in page component
```

### Deployment Form Errors

**Scenario**: Form validation or submission errors

**Handling**: Managed by existing DeploymentForm component
- Form validation errors displayed inline
- Stripe payment errors shown in modal/alert
- Akash deployment errors tracked via status page

### Animation Performance Errors

**Scenario**: Browser doesn't support SVG animations

**Handling**: Graceful degradation
- SVG still renders as static background
- CSS animations use `@supports` queries where needed
- No JavaScript fallback required (pure CSS/SVG)


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Deploy Page Route Accessibility

*For any* valid HTTP request to the `/deploy` route, the server should return a successful response (200 status) with the Deploy Page component rendered.

**Validates: Requirements 2.1**

### Property 2: SVG Background Structure Completeness

*For any* render of the Deploy Page, the animated background SVG should contain all required elements: 36 path elements for threads, 36 circle elements for particles, 3 radial gradient definitions (neonPulse1-3), 3 linear gradient definitions (threadFade1-3), and 3 filter definitions (heroTextBlur, backgroundBlur, neonGlow).

**Validates: Requirements 2.3, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5**

### Property 3: Authentication State Conditional Rendering

*For any* authentication state (loading, unauthenticated, authenticated), the Deploy Page should render exactly one of: loading indicator, authentication buttons, or deployment form - never multiple simultaneously and never none.

**Validates: Requirements 5.2, 5.3, 5.7, 6.1, 6.7**

### Property 4: Color Scheme Consistency

*For any* rendered element on the Deploy Page, if it uses a color from the design system, that color should be one of the approved values: black (#000000) for backgrounds, orange-500 (#f97316) or orange-600 (#ea580c) for primary actions, or white with opacity (80%, 70%, 60%) for text hierarchy.

**Validates: Requirements 2.4, 11.1, 11.2, 11.3, 11.4, 11.5**

### Property 5: Component Integration Completeness

*For any* render of the Deploy Page, the page should include instances of LineShadowText component for emphasized text and ShimmerButton component for authentication CTAs, both properly imported and rendered with correct props.

**Validates: Requirements 7.1, 7.2**

### Property 6: CSS Animation Definitions Presence

*For any* inspection of the globals.css file, it should contain all three required animation keyframe definitions: `@keyframes line-shadow`, `@keyframes shimmer-slide`, and `@keyframes spin-around`, along with the `--speed` CSS variable definition.

**Validates: Requirements 8.1, 8.2, 8.3, 8.4**

### Property 7: Navigation Header Structure

*For any* render of the Deploy Page, the navigation header should contain: SimpleClaw branding, a link to the home page ("/"), and authentication UI (either UserButton for authenticated users or SignIn/SignUp buttons for unauthenticated users), with proper z-index layering above the background.

**Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.6**

### Property 8: Responsive Layout Adaptation

*For any* viewport width between 320px and 1920px, the Deploy Page should render without horizontal scrollbars and with appropriate text sizes and spacing for the viewport category (mobile < 768px, tablet 768-1024px, desktop > 1024px).

**Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5**

### Property 9: Accessibility Contrast Requirements

*For any* text element on the Deploy Page, the contrast ratio between the text color and its background should meet WCAG AA standards (minimum 4.5:1 for normal text, 3:1 for large text).

**Validates: Requirements 11.6**

### Property 10: Animation Performance Attributes

*For any* animated element on the Deploy Page, the animation should use CSS transforms or GPU-accelerated properties (transform, opacity) rather than layout-triggering properties (width, height, top, left), and should have no animation-delay property that would prevent immediate start.

**Validates: Requirements 12.5, 12.6**


## Testing Strategy

### Dual Testing Approach

This feature will use both unit tests and property-based tests to ensure comprehensive coverage:

- **Unit tests**: Verify specific examples, edge cases, and error conditions
- **Property tests**: Verify universal properties across all inputs
- Both are complementary and necessary for comprehensive coverage

### Unit Tests

Unit tests will focus on specific examples, edge cases, and integration points:

1. **Route Rendering**
   - Test: `/deploy` route renders without errors
   - Test: Page contains main structural elements (header, main, background)

2. **Authentication State Handling**
   - Test: Loading state (isLoaded=false) shows loading indicator
   - Test: Unauthenticated state shows SignIn and SignUp buttons
   - Test: Authenticated state shows UserButton and DeploymentForm
   - Test: Transition from loading to authenticated state

3. **SVG Background Elements**
   - Test: SVG contains exactly 36 path elements
   - Test: SVG contains exactly 36 circle elements with animateMotion
   - Test: All gradient definitions are present (neonPulse1-3, threadFade1-3)
   - Test: All filter definitions are present (heroTextBlur, backgroundBlur, neonGlow)

4. **Component Integration**
   - Test: LineShadowText renders with shadowColor="white"
   - Test: ShimmerButton renders with orange styling
   - Test: DeploymentForm renders when authenticated
   - Test: Card component wraps DeploymentForm with correct styling

5. **Responsive Behavior**
   - Test: Mobile viewport (375px) renders without horizontal scroll
   - Test: Tablet viewport (768px) adjusts layout appropriately
   - Test: Desktop viewport (1440px) displays full layout
   - Test: Text sizes change at breakpoints (text-4xl md:text-6xl)

6. **Color Scheme**
   - Test: Background has bg-black class
   - Test: Primary buttons have orange-500/orange-600 colors
   - Test: Text elements use white with opacity (white/80, white/70, white/60)
   - Test: Card borders use white/10

7. **Navigation**
   - Test: Header contains link to "/"
   - Test: Header contains SimpleClaw branding
   - Test: Header has z-10 class for proper layering

8. **CSS Animations**
   - Test: globals.css contains line-shadow keyframes
   - Test: globals.css contains shimmer-slide keyframes
   - Test: globals.css contains spin-around keyframes
   - Test: globals.css defines --speed variable

### Property-Based Tests

Property-based tests will validate universal properties across many generated inputs. We'll use **fast-check** for TypeScript property-based testing, configured to run a minimum of 100 iterations per test.

Each property test must:
- Run minimum 100 iterations
- Reference its design document property number
- Use the tag format: **Feature: design-template-merge, Property {number}: {property_text}**

### Testing Tools

- **Unit Tests**: Vitest + React Testing Library
- **Property-Based Tests**: fast-check (minimum 100 iterations per property)
- **Integration Tests**: Playwright or Cypress
- **Visual Regression**: Percy or Chromatic (optional)
- **Accessibility**: axe-core for automated a11y testing

### Test Coverage Goals

- **Unit Test Coverage**: 80% of component code
- **Property Test Coverage**: All 10 correctness properties implemented
- **Integration Test Coverage**: All critical user flows
- **Accessibility Coverage**: All interactive elements tested with axe-core
