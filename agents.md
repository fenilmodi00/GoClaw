# GoClaw Agent Guidelines

This document provides guidelines for agents working on the GoClaw project.

## Project Overview

GoClaw is a Next.js 15 application with React 19, TypeScript, Tailwind CSS, Drizzle ORM, and Vitest for testing. It provides AI-powered bot deployment infrastructure with Telegram/Discord/WhatsApp integrations deployed on Akash Network.

## Commands

### Development
```bash
npm run dev          # Start Next.js dev server
npm run dev:turbo   # Start with Turbopack
```

### Building
```bash
npm run build        # Production build
npm run start        # Start production server
```

### Testing
```bash
npm test             # Run all tests (Vitest)
npm test:ui         # Run tests with Vitest UI
```

**Running a single test:**
```bash
# By file path
npm test -- src/services/akash/akash.service.test.ts

# With vitest directly (faster for single file)
npx vitest run src/services/akash/akash.service.test.ts
```

### Database
```bash
npm run db:generate  # Generate Drizzle migrations
npm run db:migrate   # Run Drizzle migrations
```

### Linting & Type Checking
```bash
npm run lint         # Run ESLint (Next.js config: next/core-web-vitals, next/typescript)
```

## Code Style Guidelines

### TypeScript

- **Strict mode enabled** - All TypeScript strict checks are on (`tsconfig.json`)
- Use explicit types for function parameters and return types
- Use `type` for type aliases, `interface` for object shapes
- Prefer `const` over `let`, avoid `var`

### Naming Conventions

- **Files**: kebab-case (e.g., `akash.service.ts`, `deployment-form.tsx`)
- **Components**: PascalCase (e.g., `DeploymentForm.tsx`)
- **Interfaces/Types**: PascalCase with descriptive names (e.g., `DeploymentParams`, `AkashBid`)
- **Functions**: camelCase, use verb prefixes (e.g., `generateSDL`, `createDeployment`)
- **Constants**: SCREAMING_SNAKE_CASE for configuration values (e.g., `MAX_BID_POLL_ATTEMPTS`)

### Imports

- Use path alias `@/` for src-relative imports (e.g., `@/lib/utils`, `@/components/ui/button`)
- Order imports: external libraries → internal modules → relative paths
- Use explicit named imports (no barrel imports from `index.ts` unless necessary)

```typescript
// Good
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { generateSDL } from "./sdl.template";

// Avoid
import * as React from "react"
import { something } from "../../../lib/utils"
```

### React Components

- Use `"use client"` directive for client-side components
- Use functional components with explicit prop typing
- Prefer `React.forwardRef` for components that need ref forwarding
- Use `cn()` utility for conditional className merging
- Use `class-variance-authority` (cva) for component variants

```typescript
// Component with variants example
const buttonVariants = cva("base-classes", {
  variants: {
    variant: { default: "...", destructive: "..." },
    size: { default: "...", sm: "...", lg: "..." },
  },
  defaultVariants: { variant: "default", size: "default" },
});
```

### Error Handling

- Use custom error codes from `@/lib/errors` for API errors
- Always handle async errors with try/catch
- Log errors appropriately (console.error for non-critical, throw for critical)

```typescript
// Use error codes
import { ErrorCodes, type ApiError } from "@/lib/errors";

throw new Error(`Failed to create deployment (${response.status}): ${errorText}`);
```

### Database

- Use Drizzle ORM with TypeScript
- Define schemas in `@/db/schema.ts`
- Use repositories pattern for data access (e.g., `@/db/repositories/user-repository.ts`)

### Styling

- Use Tailwind CSS exclusively
- Use `cn()` utility for conditional classes
- Follow existing color scheme (orange primary as seen in button variants)
- Use dark theme colors from CSS variables

### Form Handling

- Use `@tanstack/react-form` with Valibot validation
- Define schemas using Valibot's `v` object
- Use `form.useStore()` for reactive subscriptions

### Testing

- Use Vitest with jsdom environment
- Place tests next to source files with `.test.ts` suffix
- Use `@testing-library/react` for component tests
- Follow AAA pattern (Arrange, Act, Assert)

```typescript
import { describe, it, expect } from 'vitest';

describe('AkashService', () => {
  const service = new AkashService();

  describe('generateSDL', () => {
    it('should generate SDL with sanitized values', () => {
      // Arrange
      const params = { telegramBotToken: '123456:ABC-DEF' };
      
      // Act
      const sdl = service.generateSDL(params);
      
      // Assert
      expect(sdl).toContain('TELEGRAM_BOT_TOKEN=123456:ABC-DEF');
    });
  });
});
```

### API Routes

- Place in `src/app/api/` (Next.js App Router)
- Use standard Request/Response types
- Handle errors with appropriate status codes

### Environment Variables

- Never commit secrets to repository
- Use `.env.local` for local development
- Document required env vars in code with fallbacks

```typescript
const AKASH_CONSOLE_API_BASE = process.env.AKASH_CONSOLE_API_URL || 'https://console-api.akash.network';
```

## Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/       # React components
│   ├── ui/          # Base UI components (shadcn)
│   ├── features/    # Feature-specific components
│   ├── layout/      # Layout components
│   └── marketing/   # Marketing page components
├── config/          # Configuration files
├── db/              # Database (Drizzle schema, repositories)
├── hooks/           # Custom React hooks
├── lib/             # Utilities, helpers, services
├── middleware/      # Next.js middleware
├── services/        # Business logic services
└── types/           # TypeScript type definitions
```

## Key Dependencies

- **Framework**: Next.js 15, React 19
- **Styling**: Tailwind CSS, class-variance-authority, clsx, tailwind-merge
- **Forms**: @tanstack/react-form, valibot
- **Database**: drizzle-orm, @libsql/client
- **Auth**: @clerk/nextjs
- **Testing**: Vitest, @testing-library/react, jsdom
- **UI Components**: Radix UI primitives

## Important Notes

- Always run `npm run lint` and `npm test` before submitting changes
- Use TypeScript strict mode - fix all type errors
- Test client components that use hooks
- Follow the existing code patterns in the codebase

# Agent Rules

- Always use Context7 MCP when i need library/API documentation, code generation, setup or configuration steps without me having to explicitly ask.
