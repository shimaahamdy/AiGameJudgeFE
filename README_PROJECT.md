# AI Game Judge - Frontend

> **Created with Vibe Coding & Prompt Engineering** 

##  Created With

This project was built using:
- **Vibe Coding** - Creative vision & UX design direction
- **Prompt Engineering** - AI-assisted code generation & architecture guidance

A modern approach to web development combining human creativity with intelligent automation.

This project showcases a modern, AI-powered game NPC interaction and analysis platform built entirely through collaborative development combining creative vision with intelligent prompt-driven engineering.

---

## 📋 Project Description

**AI Game Judge Frontend** is an Angular-based web application that enables users to:
- **Interact with Game NPCs** - Engage in conversations with AI-controlled non-player characters
- **Analyze Session Reports** - Use an AI reporting agent to generate insights, charts, and summaries from session data
- **Track NPC Behavior** - View comprehensive analytics on NPC tone distribution, fairness ratings, and performance metrics
- **Manage Sessions** - Review conversation history, explore NPC profiles, and examine detailed session reviews

The frontend communicates with a backend REST API to fetch and process game session data, providing a rich, interactive dashboard for game analysis and NPC evaluation.

---

## 🛠️ Frontend Tech Stack

### Core Framework & Language
- **Angular 19+** - Modern, standalone component architecture
- **TypeScript** - Strongly-typed JavaScript for robust development
- **RxJS** - Reactive programming for async data handling

### Styling & UI
- **Tailwind CSS** - Utility-first CSS framework for rapid, responsive design
- **PostCSS** - CSS processing for advanced styling capabilities
- **Custom CSS** - Dark-mode theme with slate palette and gradient accents

### Build & Development Tools
- **Vite** - Lightning-fast build tool and dev server
- **pnpm** - Fast, disk-efficient package manager
- **Angular CLI** - Angular project scaffolding and utilities

### State Management & HTTP
- **RxJS BehaviorSubject** - For authentication state management
- **Angular HttpClient** - RESTful API communication
- **HTTP Interceptors** - Token-based authentication and request middleware

---

## 🚀 How to Run

### Prerequisites
- Node.js 18+ installed
- pnpm installed (`npm install -g pnpm`)

### Installation & Setup
```bash
# Navigate to project directory
cd AiGameJudgeFE

# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

The development server runs on `http://localhost:4200` by default.

### Build for Production
```bash
pnpm run build
```

Output is generated in the `dist/` directory.

### Running Tests
```bash
pnpm run test
```

---

## 📁 Project Structure

```
AiGameJudgeFE/
├── src/
│   ├── index.html                    # Main HTML entry point
│   ├── main.ts                       # Application bootstrap
│   ├── styles.css                    # Global styles
│   │
│   └── app/
│       ├── app.component.ts/.html    # Root component
│       ├── app.config.ts             # App configuration (providers, interceptors)
│       ├── app.routes.ts             # Route definitions
│       │
│       ├── services/
│       │   ├── api.service.ts        # ⭐ API calls (see "API Calls" section)
│       │   ├── sessions.service.ts   # Session-specific data fetching
│       │   └── auth.service.ts       # Authentication state management
│       │
│       ├── guards/
│       │   └── auth.guard.ts         # Route protection for logged-in users
│       │
│       ├── pages/
│       │   ├── landing-page/         # Welcome/intro page
│       │   ├── login-page/           # User authentication
│       │   ├── register-page/        # User registration
│       │   ├── main-page/            # Dashboard hub
│       │   ├── npc-summary/          # ⭐ NPC overview cards with portraits
│       │   ├── session-review-dashboard/  # ⭐ Session management & conversation viewer
│       │   ├── npc-summary/          # NPC profile page
│       │   └── not-found/            # 404 error page
│       │
│       ├── components/
│       │   ├── reporting-ai-chat/    # ⭐ AI reporting chat with pagination & PDF
│       │   ├── npc-badge/            # NPC indicator component
│       │   ├── npc-row/              # NPC list row component
│       │   ├── session-selector/     # Session picker component
│       │   ├── sidebar/              # Navigation sidebar
│       │   └── view-conversation-modal/  # Conversation preview modal
│       │
│       └── types/
│           └── index.ts              # TypeScript interfaces & DTOs
│
├── angular.json                      # Angular build configuration
├── tsconfig.json                     # TypeScript compiler options
├── tailwind.config.ts                # Tailwind CSS configuration
├── postcss.config.js                 # PostCSS configuration
├── vite.config.ts                    # Vite development server config
├── package.json                      # Dependencies & scripts
└── pnpm-lock.yaml                    # Lockfile for reproducible builds
```

---

## 🔌 API Integration & Configuration

### Where to Edit API Calls

All API endpoints are defined in **`src/app/services/api.service.ts`**. This is the **single source of truth** for backend communication.

#### Key API Methods:

```typescript
// Authentication
login(email: string, password: string)
register(email: string, password: string)
logout()

// NPC Data
fetchNPCOverviewAll()  // Get all NPC profiles with analytics

// Sessions
fetchSessions(npcId?: string)
fetchSessionDetails(sessionId: string)
loadConversation(npcId: string)

// Reporting Agent
getReportingMessages(page: number, pageSize: number)  // Paginated chat history
sendReportingMessage(message: string)

// Demo / Testing
tryDemo()
```

#### Interceptor Configuration

Token-based authentication is handled in **`src/app/app.config.ts`** via the **HTTP Interceptor**:
- Automatically attaches `Authorization: Bearer {token}` header to all requests
- Token is stored in `AuthService` (BehaviorSubject)
- Interceptor is registered as a provider in `app.config.ts`

To modify interceptor logic, edit:
```
src/app/services/auth.service.ts  (token storage & retrieval)
src/app/app.config.ts             (HTTP interceptor registration)
```

#### Backend Base URL

Proxy configuration for development is in **`proxy.conf.json`**. Update the target URL if your backend changes:
```json
{
  "/api": {
    "target": "http://backend-url:port",
    "changeOrigin": true
  }
}
```

---

## 🎯 Key Features & Components

### 1. **NPC Summary Dashboard** (`npc-summary/`)
- Displays game character profiles with portrait images
- Shows analytics: fairness rating, tone distribution, session count
- Responsive grid: 1 col (mobile) → 2 (tablet) → 3 (desktop) → 4 (ultra-wide)
- **Edit API calls in**: `api.service.ts` → `fetchNPCOverviewAll()`

### 2. **Reporting AI Chat** (`reporting-ai-chat/`)
- Paginated message history with scroll-up to load older messages
- Parses AI responses: text, charts, summaries, and PDF reports
- Download & preview PDF reports from chat messages
- **Edit API calls in**: `api.service.ts` → `getReportingMessages()`, `sendReportingMessage()`

### 3. **Session Review Dashboard** (`session-review-dashboard/`)
- View conversation transcripts between players and NPCs
- Modal-based conversation viewer with smooth scrolling
- **Edit API calls in**: `api.service.ts` → `fetchSessions()`, `loadConversation()`

### 4. **Authentication**
- Login & Register pages with email/password
- Token persisted in browser localStorage
- Protected routes via `AuthGuard`
- **Edit auth logic in**: `auth.service.ts`, `app.config.ts`

---

## 📡 Common Development Tasks

### Add a New API Endpoint
1. Open `src/app/services/api.service.ts`
2. Add a new method:
```typescript
fetchNewData(): Observable<YourDataType> {
  return this.http.get<YourDataType>('/api/endpoint');
}
```
3. Import & use in your component via `ApiService` injection

### Change API Response Mapping
Many components map API DTOs to internal interfaces (e.g., `DeveloperMessageWithResponseDto` → `ChatMessage`).
- **Reporting chat mapping**: `src/app/components/reporting-ai-chat/reporting-ai-chat.component.ts` → `mapApiItemToChatMessage()`
- **NPC overview mapping**: `src/app/pages/npc-summary/npc-summary.component.ts` → `getCharacterImage()`, display helpers

### Update Dark Mode Theme
Colors are defined in:
- **CSS variables**: `src/app/pages/npc-summary/npc-summary.component.css`, `reporting-ai-chat.component.css`
- **Tailwind overrides**: `tailwind.config.ts`

---

## 🔐 Environment Variables

Create a `.env` file in the root (if needed):
```env
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_NAME=AI Game Judge
```

Access in TypeScript:
```typescript
const apiUrl = import.meta.env.VITE_API_BASE_URL;
```

---

## 📝 Development Notes

- **Standalone Components**: All components use Angular's new standalone API (no NgModule needed)
- **Reactive Forms**: Forms use `[(ngModel)]` two-way binding; consider upgrading to Reactive Forms for complex forms
- **CSS Strategy**: Mix of Tailwind utilities + custom CSS for dark theme consistency
- **Performance**: Pagination implemented for large chat histories (default pageSize=2 for testing, adjust in `reporting-ai-chat.component.ts`)

---



---

## 📚 Resources

- [Angular Docs](https://angular.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [RxJS Guide](https://rxjs.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Last Updated**: January 8, 2026 | **Version**: 1.0.0
