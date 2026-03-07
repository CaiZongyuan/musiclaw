# Music Claw

**English | [中文](README-zh.md)**

A parity-focused web rewrite of [YesPlayMusic](https://github.com/qier222/YesPlayMusic) built with `TanStack Start`, `React 19`, and `Bun`.

This project ports the original Vue 2 web experience to a modern SSR-capable React stack while keeping the original routes, shell layout, and playback flows as the product baseline.

## Status

- Active rewrite of the YesPlayMusic web app, not a brand-new product
- Meaningful parity is already in place for the app shell, player dock, home, search, playlist, album, artist, login, library, liked songs, explore, and queue flows
- Some routes still use transition-state UI or placeholder shells, especially `new album`, `mv`, `settings`, and parts of the daily recommendation experience
- Remaining gaps, blockers, and next priorities are tracked in `docs/progress.md` and `docs/handoff-2026-03-07-latest.md`

## What Works Today

- Top navigation, responsive app shell, player dock, queue, and source-aware navigation back from the player
- Home recommendations including `Daily Tracks` and `Personal FM` entry cards
- Search with route-state restoration for query, type, and pagination
- Playlist, album, artist, library, liked songs, and explore category browsing
- Direct playback from search, explore, playlist-like lists, and queue-aware playback flows
- NetEase login flows for both username mode and account mode

## Still In Progress

- `/new-album` is reserved and linked, but still uses a placeholder page body
- `/mv/$id` and `/settings` are route stubs for future parity work
- `/daily/songs` already loads real account-scoped data, but its page layout is still a transitional implementation rather than a full YesPlayMusic-style screen
- Some secondary detail interactions and pixel-level parity are still being refined

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

Open `http://localhost:3000` after startup.

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

Routes with meaningful product coverage today:

- `/` home
- `/search`
- `/playlist/$id`
- `/album/$id`
- `/artist/$id`
- `/explore`
- `/next`
- `/library` and `/library/liked-songs`
- `/login`, `/login/account`, and `/login/username`

Routes that exist but are still partial or transitional:

- `/daily/songs`
- `/new-album`
- `/mv/$id`
- `/settings`

Additional parity work is still in progress for these routes and for some secondary interaction details.

## Login Modes

- `Username mode` is useful for lightweight identity and browsing flows
- `Account mode` unlocks NetEase account-scoped capabilities such as likes, daily recommendations, Personal FM, and more reliable playback source fetching
- Some playback and recommendation behavior depends on browser-local NetEase session data by design

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
- `docs/handoff-2026-03-07-latest.md` is the quickest handoff snapshot for the current migration state

## Related Links

- [YesPlayMusic](https://github.com/qier222/YesPlayMusic)
- [TanStack Start](https://tanstack.com/start/latest)
- [TanStack Router](https://tanstack.com/router/latest)
- [ParaglideJS](https://inlang.com/m/gerre34r/library-inlang-paraglideJs)
- [Better Auth](https://www.better-auth.com/)

## License

MIT
