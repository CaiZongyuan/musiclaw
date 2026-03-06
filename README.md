# Music Claw

**English | [中文](README-zh.md)**

> A modern NetEase Cloud Music player rewritten from **YesPlayMusic** using **TanStack Start** and **React**.

This is a web rewrite of [YesPlayMusic](https://github.com/qier222/YesPlayMusic), migrating from **Vue 2** to **React + TanStack Start**.

---

## Why TanStack Start?

[TanStack Start](https://tanstack.com/start/latest) is a modern full-stack React framework that brings significant advantages over traditional Vue SPA architecture:

### Core Features

| Feature | Description |
|---------|-------------|
| **Full-Document SSR** | Server-side rendering for faster initial load and better SEO |
| **Streaming** | Progressive page loading for smoother user experience |
| **Type-Safe Routing** | End-to-end TypeScript type safety with TanStack Router |
| **Server Functions** | Type-safe RPC between client and server |
| **File-Based Routing** | Intuitive filesystem-based routing like Next.js |
| **Built-in Data Loading** | Loaders preload data to prevent page flicker |
| **Search Params Management** | Type-safe URL search parameter handling |
| **Code Splitting** | Automatic route-based splitting for optimal performance |
| **Full-Stack Bundling** | Unified client and server builds with Vite |
| **Universal Deployment** | Deploy to any Vite-compatible hosting platform (Cloudflare Workers for this project) |

### Vue vs TanStack Start

| Vue 2 (Original) | TanStack Start (This Project) |
|------------------|-------------------------------|
| Vue Router | TanStack Router (type-safe) |
| Vuex | Zustand + TanStack Query |
| vue-i18n | ParaglideJS |
| Vue CLI | Vite (faster HMR) |
| SPA only | SSR + SPA hybrid |
| No type safety | End-to-end type safety |

---

## Tech Stack

```json
{
  "Framework": "TanStack Start + React 19",
  "Routing": "TanStack Router (file-based)",
  "State Management": "Zustand + TanStack Query",
  "Styling": "Tailwind CSS v4 + Shadcn UI",
  "Audio Player": "Howler.js",
  "Local Storage": "Dexie (IndexedDB)",
  "i18n": "ParaglideJS",
  "Auth": "Better Auth",
  "Testing": "Vitest",
  "Deployment": "Cloudflare Workers"
}
```

---

## Quick Start

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or pnpm
- Node.js 18+

### Install Dependencies

```bash
bun install
```

### Configure Environment Variables

Copy `.env.example` to `.env.local` and configure the NetEase API URL:

```bash
cp .env.example .env.local
```

### Start Development Server

```bash
bun run dev
```

Visit http://localhost:3000

### Build for Production

```bash
bun run build
bun run preview
```

### Deploy to Cloudflare Workers

```bash
bun run deploy
```

---

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── app/            # App-level components
│   └── ui/             # UI components (Shadcn)
├── features/           # Business logic modules
│   ├── player/         # Audio player
│   ├── auth/           # Authentication
│   ├── music/          # Music API
│   └── track/          # Track details
├── lib/                # Utilities
│   ├── api/            # API client
│   ├── db/             # Database (Dexie)
│   └── constants/      # Constants
├── routes/             # File-based routes
│   ├── __root.tsx      # Root layout
│   ├── index.tsx       # Home page
│   └── ...
└── paraglide/          # i18n (auto-generated)
```

---

## Development Progress

The project is migrating in phases. See [`docs/progress.md`](docs/progress.md) for details.

- [x] Phase 0: Infrastructure
- [x] Phase 1: Routing & Page Skeleton
- [x] Phase 2: Read-Only API Migration
- [ ] Phase 3: Player Core (in progress)
- [ ] Phase 4: Core Page Features
- [ ] Phase 5: Login & User Features
- [ ] Phase 6: Settings & Caching
- [ ] Phase 7: Extended Features

---

## Common Commands

```bash
# Development
bun run dev

# Build
bun run build

# Preview
bun run preview

# Testing
bun run test

# Linting
bun run lint
bun run format
bun run check

# Deploy
bun run deploy
```

---

## Documentation

- [Migration Analysis](docs/yesplaymusic-web-rewrite-analysis.md) — Dependency replacement and architecture decisions
- [Development Plan](docs/yesplaymusic-web-rewrite-plan.md) — Phased implementation plan
- [Progress Tracking](docs/progress.md) — Current development status
- [Collaboration Guidelines](docs/developer-collaboration.md) — Development workflow

---

## Related Links

- [TanStack Start Docs](https://tanstack.com/start/latest)
- [TanStack Router Docs](https://tanstack.com/router/latest)
- [YesPlayMusic Original](https://github.com/qier222/YesPlayMusic)
- [NetEase Cloud Music API](https://github.com/Binaryify/NeteaseCloudMusicApi)

---

## License

MIT

---

*A learning and refactoring project. Thanks to the original YesPlayMusic author for their open-source contribution.*
