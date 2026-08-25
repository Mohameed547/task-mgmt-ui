# Task Management Application - Frontend UI

Production-ready React 19 + TypeScript + Vite frontend application for the Task Management System. Built with Material UI (MUI v6/v9), React Router v7, TanStack Query v5, Axios, `@dnd-kit`, and Vitest.

---

## Overview

The **Task Management UI** is a responsive, feature-rich web application that provides a modern, interactive dashboard for task management. It allows users to register, log in, create tasks, edit tasks, attach files (PDF, images, docs), filter tasks by status and priority, search tasks with debounced queries, drag and drop tasks between Kanban status columns, navigate through paginated task lists, and toggle between Light and Dark visual themes.

---

## Key Features

| Feature | Description | Status |
| :--- | :--- | :--- |
| **Authentication Flow** | User registration, login, logout, token persistence, and route protection | ✅ Implemented |
| **Kanban Tasks Board** | Visual status columns (`TODO`, `IN_PROGRESS`, `DONE`) with drag & drop reordering | ✅ Implemented |
| **Task CRUD Operations** | Modal dialogs for creating, editing, and deleting tasks | ✅ Implemented |
| **File Attachment Upload** | Upload optional attachments (`.pdf`, `.png`, `.jpg`, `.jpeg`, `.doc`, `.docx` up to 5 MB) | ✅ Implemented |
| **File Replacement & Removal**| Pre-submit file preview, single-click removal, and replacement mechanisms | ✅ Implemented |
| **Attachment Badges** | Clickable attachment badges on task cards opening safely in new tabs (`target="_blank"`) | ✅ Implemented |
| **Server-Side Pagination** | Paginated task list controls (`page`, `limit`) with dynamic total counts | ✅ Implemented |
| **Search & Filtering** | Debounced search input (300ms) with status and priority filter dropdowns | ✅ Implemented |
| **Dark / Light Mode** | Custom Material UI theme switcher with persistent user preference | ✅ Implemented |
| **Responsive Layout** | Mobile-first layout with collapsible navigation drawer and responsive grids | ✅ Implemented |
| **State & Cache Management** | TanStack Query v5 for caching, automatic re-fetching, and query invalidation | ✅ Implemented |
| **Form Validation** | Field-level validation for title length, description constraints, and file formats | ✅ Implemented |
| **Automated Testing** | Comprehensive Vitest & React Testing Library component and unit test suite | ✅ Implemented |

---

## Tech Stack

| Technology | Purpose | Version |
| :--- | :--- | :--- |
| **React** | Component-based UI library | `^19.0.0` |
| **Vite** | Next-generation frontend build tool and dev server | `^6.1.0` |
| **TypeScript** | Type safety with strict mode enabled | `~5.7.2` |
| **Material UI (MUI)** | Enterprise React UI component library | `^6.4.4` |
| **TanStack Query** | Server state management and caching library | `^5.66.0` |
| **React Router** | Declarative client-side routing | `^7.1.5` |
| **Axios** | Promise-based HTTP client for browser requests | `^1.7.9` |
| **@dnd-kit** | Accessible drag and drop toolkit for React | `^6.3.1` |
| **Vitest** | Unit & component test runner | `^3.0.5` |
| **React Testing Library** | DOM testing utilities for React components | `^16.2.0` |

---

## Architecture & Project Structure

```text
task-mgmt-ui/
├── src/
│   ├── components/                # Shared reusable UI components
│   │   ├── EmptyState.tsx         # Workspace & search empty prompts
│   │   ├── ErrorState.tsx         # Standardized error alert banners
│   │   ├── Footer.tsx             # Application footer
│   │   ├── Header.tsx             # App bar with theme toggle & user menu
│   │   ├── LoadingState.tsx       # Spinner & skeleton loading indicators
│   │   └── TableSkeleton.tsx      # Table loading skeleton
│   ├── features/                  # Feature-driven module design
│   │   ├── auth/                  # Authentication feature module
│   │   │   ├── api/               # Auth API calls (login, register, getMe)
│   │   │   ├── context/           # AuthContext & AuthProvider
│   │   │   ├── hooks/             # Custom auth hooks (useAuth)
│   │   │   ├── pages/             # LoginPage & RegisterPage
│   │   │   └── types/             # Auth TypeScript interfaces
│   │   └── tasks/                 # Task Management feature module
│   │       ├── api/               # Task API calls (getTasks, createTask, updateTask, deleteTask)
│   │       ├── components/        # Task UI components (TaskBoard, TaskCard, TaskColumn, TaskForm, TaskFilterToolbar)
│   │       ├── hooks/             # TanStack Query custom hooks (useTasksQuery, useCreateTaskMutation, etc.)
│   │       ├── pages/             # TasksPage dashboard
│   │       └── types/             # Task TypeScript interfaces (Task, TaskAttachment, etc.)
│   ├── hooks/                     # Application-wide custom hooks (useThemeMode)
│   ├── layouts/                   # Shared page layouts (MainLayout)
│   ├── lib/                       # API client (Axios interceptors) & QueryClient configuration
│   ├── routes/                    # Router configuration & ProtectedRoute guard
│   ├── theme/                     # Material UI palette, typography, & ThemeContext
│   ├── types/                     # Shared TypeScript interfaces (ApiErrorPayload, etc.)
│   ├── utils/                     # Formatting utilities (fileUtils)
│   ├── test/                      # Vitest test setup & custom testUtils render wrappers
│   ├── App.tsx                    # Main App entry with providers
│   └── main.tsx                   # ReactDOM render root
├── .env.example                   # Environment configuration template
├── .gitignore                     # Git version control exclusions
├── index.html                     # HTML entry template
├── package.json                   # Dependencies & npm scripts
├── tsconfig.json                  # TypeScript compiler options
└── vite.config.ts                 # Vite build & test configuration
```

---

## Environment Variables

Configuration is managed via Vite environment variables:

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `VITE_API_URL` | `http://localhost:5000/api` | Backend REST API Base URL |

Create a `.env` file from `.env.example` before starting the application:

```bash
cp .env.example .env
```

---

## Available Scripts

### Development Server
Starts Vite local development server on `http://localhost:5173`:
```bash
npm run dev
```

### Production Build
Executes TypeScript type checking and compiles Vite build output into `dist/`:
```bash
npm run build
```

### Preview Build
Previews the production build compiled in `dist/` locally:
```bash
npm run preview
```

### TypeScript Type-Check
Runs strict TypeScript type checking without emitting files:
```bash
npm run type-check
```

### Automated Testing
Runs Vitest unit and component test suite:
```bash
npm test
```

---

## Detailed Feature Implementation

### 1. Task Attachment Upload
- **`multipart/form-data` Support**: When a file is selected during task creation or editing, `tasksApi.ts` constructs a `FormData` object.
- **Header Boundary Interceptor**: `apiClient.ts` automatically removes default `Content-Type: application/json` headers when a `FormData` payload is detected, allowing Axios/browser to set the proper dynamic `multipart/form-data; boundary=...` header.
- **Client-Side File Validation**:
  - Accepted extensions: `.pdf`, `.png`, `.jpg`, `.jpeg`, `.doc`, `.docx`.
  - File size cap: 5 MB ($5,242,880\text{ bytes}$).
  - Rejects unsupported types and oversized files with user-friendly helper error text.
- **File Preview & Controls**: Selected files display filename, formatted size (`formatFileSize`), and a single-click remove icon button.
- **Replacement Mechanism**: Edit mode displays existing attachments with a "Replace" button to swap files seamlessly.
- **Task Card Badge**: Displays clickable attachment badges on `TaskCard` and `TaskDetailsDialog` that open Cloudinary URLs safely in a new browser tab (`target="_blank" rel="noopener noreferrer"`).

### 2. Server-Side Pagination & Filtering
- **Paginated Listing**: Displays 9 tasks per page with MUI `Pagination` controls.
- **Debounced Search**: Title search input is debounced by 300ms to minimize unnecessary API requests.
- **Status & Priority Filters**: Select dropdowns to filter tasks by status (`TODO`, `IN_PROGRESS`, `DONE`) or priority (`LOW`, `MEDIUM`, `HIGH`). Filters automatically reset pagination back to page 1.

### 3. Drag & Drop Kanban Board
- Integrates `@dnd-kit/core` and `@dnd-kit/sortable` to allow users to drag task cards between status columns (`TODO` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `DONE`).
- Triggers an optimistic status update mutation via `useUpdateTaskMutation`.

### 4. Authentication & Protected Routes
- **Session Management**: JWT token stored in `localStorage` and attached via Axios request interceptor (`Authorization: Bearer <token>`).
- **Route Guard**: `ProtectedRoute` component redirects unauthenticated users to `/login`.

---

## UX & Accessibility (WCAG 2.1 AA)

- **Contrast & Typography**: Modern custom theme with curated HSL dark/light palettes.
- **Interactive Feedback**: Auto-dismissing `Snackbar` notifications for success/error feedback.
- **Accessible Controls**: All form inputs, file pickers, and buttons feature accessible ARIA labels (`aria-label="Remove attachment"`).
- **Responsive Layout**: Fluid flexbox and grid layouts preventing horizontal overflow on mobile devices.

---

## AI-Assisted Development Disclosure

AI-assisted development tools were used during implementation for development assistance, component architectural suggestions, UI layout styling, documentation support, and test generation ideas. All generated code was manually reviewed, refined, tested, and integrated.

---

## Assessment Requirements Mapping

| Requirement | Status | Implementation File |
| :--- | :--- | :--- |
| **User Authentication UI** | ✅ Implemented | `LoginPage.tsx`, `RegisterPage.tsx`, `AuthContext.tsx` |
| **Tasks Board & Cards** | ✅ Implemented | `TasksPage.tsx`, `TaskBoard.tsx`, `TaskCard.tsx` |
| **Task Creation & Edit Forms** | ✅ Implemented | `TaskForm.tsx`, `TaskFormDialog.tsx` |
| **File Attachment Upload** | ✅ Implemented | `TaskForm.tsx`, `tasksApi.ts`, `apiClient.ts` |
| **Client-Side File Validation** | ✅ Implemented | `TaskForm.tsx` (5MB limit & extension check) |
| **File Removal & Replacement** | ✅ Implemented | `TaskForm.tsx` |
| **Task Card Attachment Badge** | ✅ Implemented | `TaskCard.tsx`, `TaskDetailsDialog.tsx` |
| **Server-Side Pagination** | ✅ Implemented | `TasksPage.tsx`, `useTaskQueries.ts` |
| **Search & Filtering** | ✅ Implemented | `TaskFilterToolbar.tsx`, `TasksPage.tsx` |
| **Drag & Drop Reordering** | ✅ Implemented | `TaskBoard.tsx` (`@dnd-kit`) |
| **Dark / Light Theme** | ✅ Implemented | `ThemeContext.tsx`, `palette.ts` |
| **Automated Component Tests** | ✅ Implemented | `TaskAttachment.test.tsx`, `TasksPage.test.tsx`, etc. |

---

## Author

**Mohamed Zohair**
