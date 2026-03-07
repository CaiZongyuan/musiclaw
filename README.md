# Music Claw

**English | [中文](README-zh.md)**

A parity-focused web rewrite of [YesPlayMusic](https://github.com/qier222/YesPlayMusic) built with `TanStack Start`, `React 19`, and `Bun`.

This project ports the original Vue 2 web experience to a modern SSR-capable React stack while keeping the original routes, shell layout, and playback flows as the product baseline.

## Status

- Active rewrite of the YesPlayMusic web app, not a brand-new product
- Current work focuses on parity for the app shell, home, search, playlist, album, artist, login, library, daily songs, explore, and queue flows
- Remaining gaps and blockers are tracked in `docs/progress.md` and `docs/navbar-player-home-parity.md`

## Stack

- `TanStack Start` + `React 19` for SSR and file-based routing
- `TanStack Router` + `TanStack Query` for navigation and data fetching
- `Zustand` for player and auth state
- `Better Auth` for the app auth foundation
- `ParaglideJS` for English and German localization
- `Tailwind CSS v4` + Shadcn UI patterns for styling
- `Howler.js` for audio playback
- `Dexie` for browser persistence
- `Cloudflare Workers` via `wrangler` for deployment

## Prerequisites

- `Bun`
- `Node.js 18+`
- A running standalone NetEase API service

## Environment

Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

Required variables:

```bash
NETEASE_API_URL=http://127.0.0.1:3002
```

Optional client overrides:

```bash
VITE_NETEASE_API_URL=http://127.0.0.1:3001
VITE_REAL_IP=211.161.244.70
```

If your local API service exposes Swagger docs, they are typically available at `http://localhost:3002/docs/`.

## Quick Start

Install dependencies:

```bash
bun install
```

Start the development server on port `3000`:

```bash
bun run dev
```

Run tests:

```bash
bun run test
```

Build and preview production output:

```bash
bun run build
bun run preview
```

Deploy to Cloudflare Workers:

```bash
bun run deploy
```

## Common Commands

```bash
bun run dev      # start local development server
bun run build    # build production bundle
bun run preview  # preview production build
bun run test     # run Vitest
bun run lint     # run ESLint
bun run format   # run Prettier check
bun run check    # write Prettier fixes and run ESLint --fix
bun run deploy   # build and deploy with Wrangler
```

## Project Layout

```text
src/
├── components/                     # app shell and shared UI
├── features/                       # domain modules (auth, player, album, artist, playlist, search...)
├── integrations/                   # TanStack Query and Better Auth integration helpers
├── lib/                            # API clients, utilities, theme, storage, music helpers
├── routes/                         # TanStack Start file-based routes
├── paraglide/                      # generated i18n runtime (do not edit)
messages/                           # translation source files
project.inlang/                     # Paraglide configuration
wrangler.jsonc                      # Cloudflare Workers deployment config
```

Primary import alias:

- `#/*` → `src/*`

## Route Coverage

Current route coverage already includes key YesPlayMusic web flows such as:

- `/` home
- `/search`
- `/playlist/$id`
- `/album/$id`
- `/artist/$id`
- `/daily/songs`
- `/new-album`
- `/explore`
- `/next`
- `/library` and `/library/liked-songs`
- `/login`, `/login/account`, and `/login/username`

Additional parity work is still in progress for some secondary views and interaction details.

## Documentation

Read these before continuing feature work:

- `docs/yesplaymusic-web-rewrite-analysis.md` — rewrite principles and product baseline
- `docs/yesplaymusic-web-rewrite-plan.md` — phased implementation plan
- `docs/progress.md` — current status, blockers, and next steps
- `docs/lessons-learned.md` — reusable pitfalls and fixes
- `docs/developer-collaboration.md` — collaboration workflow for this repo
- `docs/navbar-player-home-parity.md` — parity notes for the main shell UI

## Notes

- Use `bun` for dependency management and scripts in this repo
- `src/paraglide/` is generated code and should not be edited manually
- Playback capability can depend on browser-local NetEase session data, so some source fetching intentionally happens on the client

## Related Links

- [YesPlayMusic](https://github.com/qier222/YesPlayMusic)
- [TanStack Start](https://tanstack.com/start/latest)
- [TanStack Router](https://tanstack.com/router/latest)
- [ParaglideJS](https://inlang.com/m/gerre34r/library-inlang-paraglideJs)
- [Better Auth](https://www.better-auth.com/)

## License

MIT
