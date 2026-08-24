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
├── components/          # Shared reusable UI components (Header, Footer, LoadingState, ErrorState, EmptyState, TableSkeleton)
├── features/            # Feature-based modular structure
│   ├── auth/            # Auth pages, forms, hooks, and AuthContext
│   └── tasks/           # Tasks board, TaskTable, TaskForm, TaskFilterToolbar, DeleteTaskConfirmDialog
├── hooks/               # Custom React hooks (useThemeMode)
├── layouts/             # Reusable page layouts (MainLayout)
├── lib/                 # Centralized HTTP client (apiClient) & TanStack Query client (queryClient)
├── routes/              # React Router setup & protected route definitions (AppRoutes)
├── theme/               # Material UI theme system, palettes (light/dark mode), & ThemeContext
├── types/               # Shared TypeScript interfaces & types (api.types, task.types)
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
- `npm run build`: Runs TypeScript strict type checking (`tsc --noEmit`) and compiles Vite production build into `dist/`.
- `npm run preview`: Previews the compiled production build locally.
- `npm test`: Runs complete Vitest test suite (`99 tests across 17 test files`).
- `npm run type-check`: Verifies TypeScript strict typing (`tsc --noEmit`).

---

## Architecture & Production Readiness Features

1. **Strict TypeScript Compliance**: Full strict mode checking, explicit interfaces for API payloads, component props, and query params. Zero `any` casts.
2. **Task Management Dashboard & CRUD**:
   - **Task Board (`TasksPage`)**: Integrated debounced search (`300ms`), status filtering (`TODO`, `IN_PROGRESS`, `DONE`), and priority filtering (`LOW`, `MEDIUM`, `HIGH`).
   - **Task Creation & Editing (`TaskFormDialog` & `TaskForm`)**: Single reusable form component supporting create and edit modes with field-level validation rules.
   - **Task Deletion Flow (`DeleteTaskConfirmDialog`)**: Modal confirmation dialog with repeat click locking (`isDeleting`) and server error banner handling.
3. **TanStack Query State & Cache Management**:
   - Query keys management (`TASK_QUERY_KEYS`).
   - Automatic cache invalidation (`invalidateQueries`) and deleted item cache purging (`removeQueries`).
4. **UX Reliability & Accessibility**:
   - **7 Core UX States**: Skeleton table loader (`TableSkeleton`), progress spinner, sanitized error banners (`ErrorState`), workspace empty prompts (`EmptyState`), filter no-results prompts, form validation helper texts, and auto-dismissing snackbar feedback (`Snackbar`).
   - **WCAG 2.1 AA Compliance**: Color-independent status indicators (`StatusChip` & `PriorityChip` with icons and text labels), accessible ARIA bindings (`aria-labelledby`, `aria-describedby`), and `Tab` keyboard focus rings.
   - **Responsive Viewport Support**: Adaptable navigation drawer for mobile/tablet (`xs`, `sm`) and desktop (`md`). Table horizontal overflow protection.
5. **Axios Centralized API Client**:
   - Dynamic `baseURL` from `import.meta.env.VITE_API_URL`.
   - Automatic `Authorization: Bearer <token>` header injection.
   - Standardized response error interceptor hiding raw stack traces.
