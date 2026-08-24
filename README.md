# Task Management Application - Frontend UI

Production-ready React 19 + TypeScript + Vite frontend foundation for the Task Management Application using Material UI, React Router v7, TanStack Query v5, and Axios.

## Tech Stack

- **Framework**: React 19
- **Build Tool**: Vite 8
- **Language**: TypeScript (Strict Mode)
- **UI Component Library**: Material UI (MUI v9) + Emotion
- **Routing**: React Router v7
- **Data Fetching / Caching**: TanStack Query v5
- **HTTP Client**: Axios
- **Testing Framework**: Vitest & React Testing Library (with jsdom)

---

## Directory Architecture

```text
src/
├── components/          # Shared reusable UI components (Header, Footer, LoadingSpinner)
├── features/            # Feature-based modular structure (auth, tasks)
├── hooks/               # Custom React hooks (useThemeMode)
├── layouts/             # Reusable page layouts (MainLayout)
├── lib/                 # Centralized HTTP client (apiClient) & TanStack Query client (queryClient)
├── routes/              # React Router setup & route definitions (AppRoutes)
├── theme/               # Material UI theme system, palettes (light/dark mode), & ThemeContext
├── types/               # Shared TypeScript interfaces & types (api.types)
├── test/                # Vitest setup & testing utilities (testUtils)
├── App.tsx              # Main App entry with providers
└── main.tsx             # ReactDOM entry point
```

---

## Environment Variables

Configuration is loaded via Vite environment variables:

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `VITE_API_URL` | `http://localhost:5000/api` | Backend REST API Base URL |

Copy `.env.example` to `.env` before running the development server:

```bash
cp .env.example .env
```

---

## Available Scripts

- `npm run dev`: Starts Vite local development server (`http://localhost:5173`).
- `npm run build`: Runs TypeScript strict type checking and compiles Vite production build into `dist/`.
- `npm run preview`: Previews the compiled production build locally.
- `npm test`: Runs Vitest test suite.
- `npm run type-check`: Verifies TypeScript strict typing (`tsc --noEmit`).

---

## Technical Features

1. **Strict TypeScript Compliance**: Full strict mode checking, no implicit `any`, path aliases (`@/*`).
2. **Material UI Theme System**: Dynamic Light/Dark mode toggling via `ThemeContext`, custom curated palettes, typography, and component border/elevation overrides.
3. **Axios Centralized API Client**:
   - Dynamic `baseURL` from `import.meta.env.VITE_API_URL`.
   - Automatic `Authorization: Bearer <token>` header injection.
   - Standardized response error interceptor.
4. **TanStack Query Configuration**: Default stale time (5 minutes), retry limits, and global error handling.
5. **Vitest & React Testing Library**:
   - Basic application render test (`App.test.tsx`).
   - Router setup & navigation test (`routes.test.tsx`).
   - API client configuration test (`apiClient.test.ts`).
