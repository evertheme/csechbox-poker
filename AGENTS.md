<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project Conventions

- Game server: active tables are registered in `server/src/game/table-registry.ts`; socket handlers for create/list/join/leave are in `server/src/socket/handlers/table-handler.ts` (events use `*table*` names, e.g. `create-table`, `list-tables`).
- Use Zustand for all global state — no React Context for shared state
- Shared UI lives in `src/components/`; route-specific UI under `src/app/` as usual for Next.js
- Use `clsx` + `tailwind-merge` via a `cn()` utility for className merging
- Form validation uses Zod schemas with react-hook-form + @hookform/resolvers
- Use Supabase for auth and database — never roll your own auth

# Code Style

- Prefer named exports over default exports
- Use TypeScript strict mode — no `any` types
- Server Components by default; add `"use client"` only when needed

# Agent Behavior

- Let me review and approve changes before applying them
- Let me push changes to the GitHub repo — never push automatically


