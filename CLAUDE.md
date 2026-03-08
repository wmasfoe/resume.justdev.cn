# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Next.js 14 resume showcase with floating AI chat. The page renders a static JSON resume alongside a floating chat widget powered by Dify (an external AI platform).

## Commands

```bash
npm run dev          # Start dev server (port 3000, with Node inspector)
npm run build        # Production build
npm run lint         # Check lint errors
npm run fix          # Auto-fix lint errors
npm run build:pdf    # Generate resume PDF via Puppeteer (requires running server on port 3001)
```

## Environment Setup

Copy `.env.local` (already committed) or set these variables:
```
NEXT_PUBLIC_APP_ID=       # Dify app ID
NEXT_PUBLIC_APP_KEY=      # Dify API key
NEXT_PUBLIC_API_URL=      # Dify API base URL (e.g. https://api.dify.ai/v1)
```

Central config is `config/index.ts` — app title, prompt template, and API prefix live here.

## Architecture

### Request Flow
1. Frontend calls `/api/*` (Next.js route handlers in `app/api/`)
2. Route handlers use `app/api/utils/common.ts` to create a `ChatClient` from `dify-client` and proxy requests to the Dify API
3. Streaming responses use SSE via `service/base.ts` (`ssePost`) which parses `data:` events and dispatches typed callbacks (`onData`, `onThought`, `onWorkflowStarted`, etc.)

### Key Patterns
- **Resume content**: All resume data is in `app/components/RenderResume/resume.json` — edit this to update resume content
- **Chat state**: `app/components/Chat/index.tsx` is the main orchestrator; it manages conversation list, chat history, and sends messages. `ChatCore.tsx` is the presentational inner component.
- **Shared responding state**: `useSharedState` from `app/components/common.ts` shares `isResponding` across sibling components without prop drilling
- **Floating chat mode**: `Chat` accepts `isFloatingMode` prop — when true it renders a collapsible floating widget over the resume; `useUIState` manages expand/collapse animation state
- **Workflow visualization**: `app/components/workflow/` renders Dify workflow node tracing data shown in chat responses

### Build Notes
- ESLint and TypeScript errors are **ignored during builds** (`next.config.js`) — the project may have type errors that won't block building
- Pre-commit hooks run ESLint via Husky + lint-staged on `.js(x)` and `.ts(x)` files
- PDF generation (`script/pdf.js`) spawns a Next.js server on port 3001, uses Puppeteer to capture the page, then kills the server
