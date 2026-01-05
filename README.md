# AI Game Judge - Angular

A production-ready Angular application for reviewing AI NPC behavior and conversation quality across game sessions.

## Tech Stack

- **Angular 18**: Frontend framework with standalone components
- **TypeScript**: Type-safe development
- **TailwindCSS 3**: Utility-first CSS framework
- **Express**: Backend API server
- **RxJS**: Reactive programming for data streams

## Project Structure

```
src/                    # Angular application source
├── app/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Route components
│   ├── services/       # Angular services (API, state management)
│   ├── types/          # TypeScript interfaces
│   ├── app.component.ts
│   ├── app.config.ts
│   └── app.routes.ts
├── assets/             # Static assets
├── index.html
├── main.ts
└── styles.css          # Global styles with TailwindCSS

server/                 # Express API backend
├── index.ts            # Server setup
└── routes/             # API handlers

shared/                 # Types used by both client & server
└── api.ts              # Shared API interfaces
```

## Development Commands

```bash
# Install dependencies
pnpm install

# Start development server (Angular + Express)
pnpm dev

# Start only Angular dev server
pnpm start

# Start only Express server
pnpm start:server

# Build for production
pnpm build

# Type checking
pnpm typecheck
```

## Development Setup

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Start the development servers:**
   ```bash
   pnpm dev
   ```
   This will start:
   - Express server on `http://localhost:3000`
   - Angular dev server on `http://localhost:4200` (proxies API calls to Express)

3. **Access the application:**
   Open `http://localhost:4200` in your browser.

## Features

- **Session Review Dashboard**: View and analyze game sessions
- **NPC Behavior Analysis**: Review fairness scores, tone, and escalation warnings
- **Conversation Viewer**: View full conversations between players and NPCs
- **Real-time Updates**: Reactive data loading with RxJS

## API Endpoints

- `GET /api/ping` - Health check
- `GET /api/demo` - Demo endpoint
- `GET /api/sessions/summary/:sessionId` - Get NPC summaries for a session
- `GET /api/sessions/:sessionId/conversation/:npcId` - Get conversation between player and NPC

## Styling

The project uses TailwindCSS 3 with a custom dark theme. All styles are defined in `src/styles.css` using Tailwind's utility classes and custom component classes.

## Architecture Notes

- **Standalone Components**: All components are standalone (no NgModules)
- **Services**: State management and API calls are handled through Angular services
- **Reactive Programming**: Uses RxJS Observables for data streams
- **Type Safety**: Full TypeScript support with shared types between client and server
- **Proxy Configuration**: Angular dev server proxies API calls to Express server during development
