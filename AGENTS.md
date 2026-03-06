## Project Overview

This is a **TanStack Start** application - a React SSR framework built on Vite with file-based routing. The project uses:
- **TanStack Router** for file-based routing with loaders and server functions
- **TanStack Query** for data fetching and caching
- **Better Auth** for authentication
- **ParaglideJS** for i18n (English and German)
- **Tailwind CSS v4** for styling with Shadcn UI components
- **Cloudflare Workers** for deployment

## Package Manager

The project uses **bun** as the package manager (note `pnpm.onlyBuiltDependencies` in package.json for esbuild/lightningcss). Always use `bun` for installing dependencies and running scripts.

## Common Commands

```bash
# Development (runs on port 3000)
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview

# Deploy to Cloudflare Workers
bun run deploy

# Testing (Vitest)
bun run test

# Linting and formatting
bun run lint      # ESLint
bun run format    # Prettier check
bun run check     # Prettier write + ESLint fix
```

## Architecture

### Path Aliases

The project uses import aliases defined in both `package.json` and `tsconfig.json`:
- `#/*` → `./src/*` (primary alias, use this)
- `@/*` → `./src/*` (also available)

**Shadcn components** are configured to use:
- `#/components` for components
- `#/lib/utils` for utilities
- `#/components/ui` for UI components

### Routing Structure

- **File-based routing** in `src/routes/`
- **Root layout**: `src/routes/__root.tsx` - contains the HTML shell, theme initialization, and global providers
- **Route context**: Provides `queryClient` to all routes via `TanStackQueryProvider`
- **Theme**: Auto/light/dark theme initialized via inline script to prevent flash

### Authentication

- **Server auth**: `src/lib/auth.ts` - Better Auth server instance with email/password
- **Client auth**: `src/lib/auth-client.ts` - React auth client for components
- **API routes**: `src/routes/api/auth/$.ts` - Auth endpoints
- **Demo page**: `src/routes/demo/better-auth.tsx` - Reference implementation

### i18n (ParaglideJS)

- **Messages**: `messages/{locale}.json` (en, de)
- **Runtime**: `src/paraglide/` - Auto-generated, DO NOT edit
- **Strategy**: URL-based localization with baseLocale fallback
- **Usage**: Import from `#/paraglide/runtime` to get `getLocale()`, `setLocale()`, and message functions

### Data Fetching

Two patterns available:

1. **Route loaders** (preferred for route-specific data):
   ```tsx
   export const Route = createFileRoute('/path')({
     loader: async () => { /* fetch data */ },
     component: Component,
   })
   const data = Route.useLoaderData()
   ```

2. **Server functions** (for general server-side logic):
   ```tsx
   const fn = createServerFn({ method: 'GET' }).handler(async () => { /* */ })
   ```

3. **TanStack Query** (for client-side fetching):
   ```tsx
   import { useQuery } from '@tanstack/react-query'
   ```

### Styling

- **Tailwind CSS v4** with Vite plugin
- **Theme classes**: `light` and `dark` on `<html>` element
- **Shadcn components**: Add via `pnpm dlx shadcn@latest add <component>`
- **Component variants**: Use `class-variance-authority` and `tailwind-merge`

### Integrations

- `src/integrations/tanstack-query/` - Query provider and devtools
- `src/integrations/better-auth/` - Auth-related components

## Adding Shadcn Components

```bash
pnpm dlx shadcn@latest add button
```

Components are added to `src/components/ui/` using the configured aliases.

## Better Auth Setup

The project uses stateless mode. To add a database:
1. Add database pool to `src/lib/auth.ts`
2. Run `bunx @better-auth/cli migrate`

Generate auth secret:
```bash
bunx @better-auth/cli secret
```

Set `BETTER_AUTH_SECRET` in `.env.local`.

## Deployment

Deployed to **Cloudflare Workers** via `wrangler`. The `wrangler.jsonc` config uses `@tanstack/react-start/server-entry` as the entrypoint with Node.js compatibility.
