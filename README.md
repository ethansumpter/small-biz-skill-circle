# Small Biz Skill Circle

An app that matches small business owners by their skills, so they can trade
expertise, collaborate and grow together.

**Live preview:** https://preview--small-biz-skill-circle.lovable.app/

Built with [Lovable](https://lovable.dev). You can also edit the project in the
[Lovable editor](https://lovable.dev/projects/c29cf07a-8795-430e-be7e-3e119eb22a98).

## Features

| Page | Route | What it does |
| --- | --- | --- |
| Home | `/` | Landing page and overview |
| Discover | `/discover` | Browse businesses and their skills |
| Matches | `/matches` | Saved skill matches |
| Profiles | `/profiles` | Business profiles |
| Messages | `/messages` | Conversations with matched businesses |
| Cooperation | `/cooperation` | Active cooperations and the joint campaign builder |
| Subscription | `/subscription` | Subscription plans (preview only) |

> **Note:** This is a preview build. Matches, messages and cooperations are held
> in memory and reset when you reload the page. No messages are actually sent
> and no billing takes place.

## Tech stack

- [TanStack Start](https://tanstack.com/start) + TanStack Router (file-based routes in `src/routes/`)
- React 19 and TypeScript
- Vite
- Tailwind CSS v4 with [shadcn/ui](https://ui.shadcn.com) components (Radix UI)
- Vitest and Testing Library for tests

## Running locally

### Prerequisites

- [Node.js](https://nodejs.org) 20 or later (install via [nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- npm, or [Bun](https://bun.sh) (the repo includes a `bun.lock`)

No environment variables or API keys are needed.

### Setup

```sh
git clone <this-repository-url>
cd small-biz-skill-circle
npm install        # or: bun install
npm run dev        # or: bun run dev
```

Then open the local URL Vite prints in the terminal (usually http://localhost:8080 or http://localhost:5173).

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server with hot reload |
| `npm run build` | Build for production |
| `npm run build:dev` | Build in development mode |
| `npm run preview` | Serve the production build locally |
| `npm test` | Run the test suite once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Lint with ESLint |
| `npm run format` | Format with Prettier |

## Project structure

```
src/
├── routes/        # One file per page (TanStack file-based routing)
├── components/    # App shell, shared components and shadcn/ui primitives (ui/)
├── lib/           # Business data, campaign logic and helpers
├── hooks/         # React hooks
├── test/          # Vitest tests
└── styles.css     # Global styles and Tailwind theme
```

`src/routeTree.gen.ts` is generated automatically; don't edit it by hand.

## Deploying and syncing with Lovable

This repo is connected to Lovable:

- Changes made in the Lovable editor are committed to this repository.
- Commits pushed to `main` sync back into Lovable.
- Publish from the Lovable editor to update the live site.

Avoid force-pushing or rewriting history that has already been pushed, as it
breaks the project history on Lovable's side.
