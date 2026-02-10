# Implementation Plan: Deploy Page with Animated Hero Design

## Overview

This implementation plan outlines the tasks for creating a new `/deploy` page that uses the animated hero design style from the minimal-animated-hero template. The page will feature a black background with animated orange flowing threads, integrate Clerk authentication, and display the SimpleClaw deployment form in a clean, minimal layout.

## Tasks

- [x] 1. Merge CSS animations into globals.css
  - Copy animation keyframes from mnimal-animated-hero/app/globals.css to app/globals.css
  - Add line-shadow, shimmer-slide, and spin-around keyframe definitions
  - Add --speed CSS variable definition
  - Preserve existing Tailwind configuration and color variables
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.6_

- [ ]* 1.1 Write unit tests for CSS animations
  - Test that globals.css contains line-shadow keyframes
  - Test that globals.css contains shimmer-slide keyframes
  - Test that globals.css contains spin-around keyframes
  - Test that globals.css defines --speed variable
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ]* 1.2 Write property test for CSS animation definitions
  - **Property 6: CSS Animation Definitions Presence**
  - **Validates: Requirements 8.1, 8.2, 8.3, 8.4**

- [x] 2. Create deploy page directory and base structure
  - Create app/deploy directory
  - Create app/deploy/page.tsx file
  - Add "use client" directive
  - Set up basic page component structure with imports
  - Import Clerk hooks (useUser)
  - Import custom components (LineShadowText, ShimmerButton)
  - Import existing DeploymentForm component
  - _Requirements: 2.1, 2.2_

- [ ] 3. Implement animated SVG background
  - [x] 3.1 Copy SVG structure from template
    - Copy complete SVG element from mnimal-animated-hero/app/page.tsx
    - Include all defs (gradients and filters)
    - Include all 36 thread paths
    - Include all 36 animated circles with animateMotion
    - Wrap in absolute positioned div with bg-black
    - _Requirements: 2.3, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [ ]* 3.2 Write unit tests for SVG structure
    - Test SVG contains exactly 36 path elements
    - Test SVG contains exactly 36 circle elements
    - Test all gradient definitions are present
    - Test all filter definitions are present
    - _Requirements: 2.3, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 3.3 Write property test for SVG background completeness
    - **Property 2: SVG Background Structure Completeness**
    - **Validates: Requirements 2.3, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5**

- [ ] 4. Implement navigation header
  - [x] 4.1 Create header component structure
    - Add header element with z-10 for proper layering
    - Add SimpleClaw branding/logo
    - Add Link to home page ("/")
    - Add responsive spacing with Tailwind classes
    - _Requirements: 9.1, 9.2, 9.3, 9.6_

  - [x] 4.2 Integrate Clerk authentication UI
    - Use useUser() hook to get auth state
    - Show loading indicator when isLoaded is false
    - Show UserButton when authenticated
    - Show SignInButton and SignUpButton when not authenticated
    - Use modal mode for auth buttons
    - Style SignUpButton with ShimmerButton component
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.7, 9.4_

  - [ ]* 4.3 Write unit tests for header
    - Test header contains SimpleClaw branding
    - Test header contains link to "/"
    - Test header has z-10 class
    - Test loading state shows loading indicator
    - Test authenticated state shows UserButton
    - Test unauthenticated state shows auth buttons
    - _Requirements: 9.1, 9.2, 9.3, 9.6, 5.2, 5.3, 5.7_

  - [ ]* 4.4 Write property test for navigation header structure
    - **Property 7: Navigation Header Structure**
    - **Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.6**

- [x] 5. Checkpoint - Ensure header and background render correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement main content area for unauthenticated state
  - [x] 6.1 Create unauthenticated UI
    - Add main element with z-10 and centered layout
    - Add page heading with "Deploy Your OpenClaw Bot"
    - Use LineShadowText component for "OpenClaw" emphasis
    - Add description text with white/70 opacity
    - Add authentication buttons (SignInButton and SignUpButton)
    - Style buttons with ShimmerButton component
    - Use orange gradient colors for buttons
    - Add responsive text sizes (text-4xl md:text-6xl)
    - _Requirements: 4.2, 4.3, 4.5, 5.2, 5.4, 7.1, 7.2_

  - [ ]* 6.2 Write unit tests for unauthenticated state
    - Test heading contains "Deploy Your OpenClaw Bot"
    - Test LineShadowText is used for emphasis
    - Test description text is present
    - Test SignIn and SignUp buttons are present
    - Test ShimmerButton component is used
    - _Requirements: 4.2, 4.3, 5.2, 7.1, 7.2_

  - [ ]* 6.3 Write property test for component integration
    - **Property 5: Component Integration Completeness**
    - **Validates: Requirements 7.1, 7.2**

- [ ] 7. Implement main content area for authenticated state
  - [x] 7.1 Create authenticated UI
    - Add conditional rendering based on isSignedIn
    - Add page heading "Deploy Your Bot"
    - Add description text
    - Wrap DeploymentForm in Card component
    - Style Card with bg-gray-900/80 and border-white/10
    - Add backdrop-blur-sm for glass effect
    - Add CardHeader with title and description
    - Add CardContent with DeploymentForm
    - Make Card responsive with max-w-3xl
    - _Requirements: 6.1, 6.2, 6.6_

  - [ ]* 7.2 Write unit tests for authenticated state
    - Test authenticated state shows DeploymentForm
    - Test DeploymentForm is wrapped in Card
    - Test Card has correct styling classes
    - Test unauthenticated state does not show DeploymentForm
    - _Requirements: 6.1, 6.2, 6.6, 6.7_

  - [ ]* 7.3 Write property test for authentication conditional rendering
    - **Property 3: Authentication State Conditional Rendering**
    - **Validates: Requirements 5.2, 5.3, 5.7, 6.1, 6.7**

- [x] 8. Checkpoint - Ensure authentication flow works correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Implement responsive design
  - [x] 9.1 Add responsive classes
    - Add mobile-specific text sizes (text-4xl)
    - Add tablet breakpoint classes (md:text-6xl)
    - Add desktop breakpoint classes (lg:text-)
    - Add responsive padding and spacing
    - Ensure SVG scales with preserveAspectRatio
    - Add responsive header spacing
    - Make Card responsive with proper max-width
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

  - [ ]* 9.2 Write unit tests for responsive behavior
    - Test mobile viewport (375px) renders without horizontal scroll
    - Test tablet viewport (768px) has appropriate layout
    - Test desktop viewport (1440px) has full layout
    - Test text sizes change at breakpoints
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [ ]* 9.3 Write property test for responsive layout
    - **Property 8: Responsive Layout Adaptation**
    - **Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5**

- [ ] 10. Implement color scheme consistency
  - [x] 10.1 Apply color scheme
    - Use bg-black for main background
    - Use orange-500 and orange-600 for primary actions
    - Use white/80, white/70, white/60 for text hierarchy
    - Use orange gradients for CTA buttons
    - Use white/10 for card borders
    - Ensure all colors match design system
    - _Requirements: 2.4, 11.1, 11.2, 11.3, 11.4, 11.5_

  - [ ]* 10.2 Write unit tests for color scheme
    - Test background has bg-black class
    - Test buttons have orange colors
    - Test text uses white with opacity
    - Test card borders use white/10
    - _Requirements: 2.4, 11.1, 11.2, 11.3, 11.4, 11.5_

  - [ ]* 10.3 Write property test for color consistency
    - **Property 4: Color Scheme Consistency**
    - **Validates: Requirements 2.4, 11.1, 11.2, 11.3, 11.4, 11.5**

- [ ] 11. Implement accessibility features
  - [x] 11.1 Add accessibility attributes
    - Add proper ARIA labels to buttons
    - Ensure sufficient color contrast (4.5:1 minimum)
    - Add focus states for keyboard navigation
    - Ensure all interactive elements are keyboard accessible
    - Add alt text for any images/icons
    - _Requirements: 11.6_

  - [ ]* 11.2 Write unit tests for accessibility
    - Test buttons have proper ARIA labels
    - Test focus states are visible
    - Test keyboard navigation works
    - _Requirements: 11.6_

  - [ ]* 11.3 Write property test for contrast requirements
    - **Property 9: Accessibility Contrast Requirements**
    - **Validates: Requirements 11.6**

- [ ] 12. Optimize animation performance
  - [x] 12.1 Ensure GPU acceleration
    - Verify animations use transform and opacity
    - Avoid layout-triggering properties (width, height, top, left)
    - Ensure no animation-delay on initial load
    - Add will-change hints where appropriate
    - Test animations run at 60fps
    - _Requirements: 12.1, 12.2, 12.5, 12.6_

  - [ ]* 12.2 Write unit tests for animation properties
    - Test animations use transform/opacity
    - Test no animation-delay on load
    - Test will-change is set appropriately
    - _Requirements: 12.5, 12.6_

  - [ ]* 12.3 Write property test for animation performance
    - **Property 10: Animation Performance Attributes**
    - **Validates: Requirements 12.5, 12.6**

- [ ] 13. Final integration and testing
  - [x] 13.1 Test complete user flows
    - Test unauthenticated user can sign in
    - Test authenticated user sees deployment form
    - Test deployment form submission works
    - Test navigation between pages works
    - Test responsive behavior across devices
    - _Requirements: All_

  - [ ]* 13.2 Write property test for route accessibility
    - **Property 1: Deploy Page Route Accessibility**
    - **Validates: Requirements 2.1**

- [x] 14. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The minimal-animated-hero template remains unchanged throughout implementation
- Custom components (LineShadowText, ShimmerButton) already exist and should not be duplicated
