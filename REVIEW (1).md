# Code Review — Task Management Web App (Frontend)

**Reviewer scope:** `task-mgmt-ui/` (React 19 + TypeScript + Vite + MUI + TanStack Query + `@dnd-kit`)
**Reviewed against:** the assignment brief (MERN task manager), and modern React/TypeScript best practices (new JSX transform, functional idioms, hooks correctness, memory-leak safety, naming conventions, clean code).

> ⚠️ **Scope limitation:** Only a `task-mgmt-ui` folder exists in this workspace. There is **no backend (`Express`/`MongoDB`/`Node`) in this repo** — I could not review JWT signing, bcrypt hashing, Mongoose schemas/validation, or ownership-scoped queries because that code isn't present here. If the backend lives in a separate repo, it needs its own review before submission. Everything below is a **frontend-only** review.

---

## 1. Overall Verdict

This is a **solid, above-average take-home submission** for a junior/mid frontend candidate. The feature set is actually broader than required (Kanban drag-and-drop, file attachments, pagination, dark mode, debounced search) — all "bonus" items per the brief. Code is generally readable, consistently formatted, uses TypeScript strict mode, and is organized by feature (`features/auth`, `features/tasks`). Commit history is real and incremental (21 commits over ~24 hours, well inside the 48h window), which is a good signal for the technical review.

However, there are **real gaps** the candidate must be able to explain and ideally fix before submitting:

- 3 test files / 5 tests currently **fail** (`npm test`).
- The README **overclaims** a couple of features that aren't actually implemented (theme persistence, functional header search).
- Heavy use of `any` in `catch` blocks and one data-normalization function — not idiomatic strict TypeScript.
- No `useCallback`/`React.memo` anywhere, dead/unused component (`LoadingSpinner`), an unused `@/*` path alias while every real import uses fragile `../../../` relative paths.
- A few components manage state that can update after unmount (a soft memory-leak / stale-update smell), and the `.oxlintrc.json` config exists but there's no lint script and no linter installed — so it does nothing.

None of these are disqualifying, but they are exactly the kind of thing a 30–45 minute technical review will probe. See the actionable checklist in [§6](#6-actionable-fix-list-before-submitting).

---

## 2. Verification Performed

| Check | Result |
|---|---|
| `npx tsc --noEmit` | ✅ Passes, zero type errors |
| `npm test` (Vitest) | ❌ **3 files / 5 tests failing** (22 files, 137 tests total → 132 pass) |
| `git log` | ✅ 21 real, incremental commits, conventional-ish messages, all within a ~24h window |
| Secrets in git history | ✅ No `.env` ever committed; `.gitignore` correctly excludes `.env*` |
| `.env.example` | ✅ Present, no secrets, matches the one variable actually used (`VITE_API_URL`) |

Failing tests (needs a fix before submission — a reviewer running `npm test` will see red immediately):

```
FAIL  src/features/tasks/components/DeleteTask.test.tsx > successful deletion & task list update: dispatches DELETE /api/tasks/:id and updates UI
FAIL  src/features/tasks/components/TaskFormEdit.test.tsx > task list update & filter preservation: executes PATCH request and refreshes query cache
FAIL  src/features/tasks/pages/TasksPage.test.tsx > dashboard renders heading, count badge, and task list
FAIL  src/features/tasks/pages/TasksPage.test.tsx > search & filters: passes search input and clear action correctly
FAIL  src/features/tasks/pages/TasksPage.test.tsx > delete task interaction: opens confirm dialog and deletes task
```

These look like fixture/mock data drift (tests expect fixed seed titles like `"Design Material UI Layout"` that don't match current mock data) rather than real regressions — but **an interviewer running `npm test` will see failures**, which is a bad first impression. Fix before submitting.

---

## 3. Architecture & Structure — Good

```12:29:task-mgmt-ui/package.json
  "dependencies": {
    "@dnd-kit/core": "^6.3.1",
    ...
    "react": "^19.2.8",
    "react-router-dom": "^7.18.2"
  },
```

- Clean **feature-based structure** (`features/auth`, `features/tasks`, each with `api/`, `hooks/`, `components/`, `pages/`, `types/`). This is a genuinely good, scalable pattern and better than what most take-home submissions do.
- Clear separation of concerns: Axios client (`lib/apiClient.ts`) → API functions (`*Api.ts`) → TanStack Query hooks (`use*Queries.ts`) → components. This is textbook "data layer / presentation layer" separation.
- Query key factories (`TASK_QUERY_KEYS`, `AUTH_QUERY_KEYS`) are a nice touch — avoids typo'd cache keys.
- `ProtectedRoute` / `PublicOnlyRoute` route guards are implemented correctly with redirect-back-to-origin (`location.state.from`).

**This part is defensible and the candidate should be able to explain it confidently.**

---

## 4. React / TypeScript Best-Practice Findings

### 4.1 `React.FC` is used everywhere — outdated convention

All 33 components use the `React.FC<Props>` pattern:

```29:35:task-mgmt-ui/src/features/tasks/components/TaskCard.tsx
export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEditTask,
  onDeleteTask,
  onUpdateTask,
  onError,
}) => {
```

Current React/TS style guides (including the official React docs and most 2024+ style guides) recommend **not** using `React.FC`:
- It used to implicitly add an unwanted `children?: ReactNode` prop (fixed in newer `@types/react`, but still true in many teams' lint configs).
- It doesn't play well with generic components.
- Plain typed function declarations are simpler and are what `create-react-app`/Vite's own templates and the React team currently recommend.

**Suggested modern form:**

```tsx
interface TaskCardProps {
  task: Task;
  onEditTask: (task: Task) => void;
  // ...
}

export function TaskCard({ task, onEditTask, onDeleteTask, onUpdateTask, onError }: TaskCardProps) {
  // ...
}
```

This is consistent across the whole codebase, so it's a mechanical, low-risk rename — a good "explain your decision" opportunity if you keep `React.FC`, or a good 30-minute cleanup if you switch.

### 4.2 `any` leaks strict-mode guarantees away

`tsconfig.app.json` correctly enables `"strict": true`, `noImplicitAny`, `noUnusedLocals`, etc. — great. But the code re-introduces `any` in a dozen places, mostly in `catch` blocks and one normalization helper:

```76:80:task-mgmt-ui/src/features/tasks/components/TaskCard.tsx
    } catch (err: any) {
      setCurrentStatus(previousStatus); // Rollback on failure
      const errorMsg = err?.message || 'Failed to update status. Previous status restored.';
```

```18:28:task-mgmt-ui/src/features/auth/api/authApi.ts
const normalizeUser = (userData: any): AuthUser => {
  if (!userData) return userData;
  return {
    id: userData.id || userData._id || '',
```

Occurrences: `TaskCard.tsx` (×2), `TaskDetailsDialog.tsx` (×2), `TaskBoard.tsx`, `TasksPage.tsx` (×3), `LoginPage.tsx`, `RegisterPage.tsx`, `authApi.ts` (×2).

**Why it matters:** the whole point of strict TS is that `catch` variables and unknown API payloads are exactly where runtime type errors sneak in. `catch (err: any)` defeats that; TypeScript 4.4+ defaults `catch` to `unknown`, and this code is opting back into `any`.

**Fix pattern:**

```ts
function getErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
    return err.message;
  }
  return fallback;
}

try {
  await onUpdateTask(task._id, { status: newStatus });
} catch (err) {
  setCurrentStatus(previousStatus);
  onError?.(getErrorMessage(err, 'Failed to update status. Previous status restored.'));
}
```

This single helper (put it in `src/lib/` or `src/utils/`) would remove ~10 `any`s at once and centralize error-message extraction — also reduces duplicated `err?.message || 'fallback'` logic repeated in 8+ places.

For `normalizeUser`, define a loose "raw" shape instead of `any`:

```ts
interface RawUser {
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

const normalizeUser = (userData: RawUser | null | undefined): AuthUser | null => {
  if (!userData) return null;
  return { id: userData.id ?? userData._id ?? '', name: userData.name ?? '', email: userData.email ?? '', role: userData.role, createdAt: userData.createdAt, updatedAt: userData.updatedAt };
};
```

(Also: the original returns `userData` — the *raw*, un-normalized object — when it's falsy, but the function's declared return type is `AuthUser`. That's a real type-safety hole that only "works" because of the `any` param.)

### 4.3 Unused path alias, fragile deep-relative imports

`tsconfig.app.json` and `vite.config.ts` both define a `@` → `src/` alias:

```27:31:task-mgmt-ui/tsconfig.app.json
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
```

But **it is never used**. Instead, 18 files import with `../../../` chains:

```1:4:task-mgmt-ui/src/features/tasks/api/tasksApi.ts
import { apiClient } from '../../../lib/apiClient';
import type {
  Task,
  ...
```

Either use the alias consistently (`import { apiClient } from '@/lib/apiClient'`) or remove the unused config. Leaving dead config in a take-home is a small but real "did they actually use their own setup" flag for a reviewer.

### 4.4 Dead code

`LoadingSpinner.tsx` is exported from the shared `components/index.ts` barrel but is **never rendered anywhere in the app** (confirmed via full-repo search — only self-references). Meanwhile `LoadingState.tsx` (with `variant="spinner"|"skeleton"`) is the one actually used everywhere. Delete `LoadingSpinner.tsx` or explain why it exists.

Similarly, `components/index.ts` only re-exports 3 of the ~10 components in that folder (`EmptyState`, `ErrorState`, `StatusChip`, `PriorityChip`, `TableSkeleton` are all imported by deep relative path instead of through the barrel) — the barrel file is only partially maintained, which suggests it isn't actually relied on.

### 4.5 README overclaims two features that don't exist

The README's feature table says:

> **Dark / Light Mode** — Custom Material UI theme switcher with **persistent user preference**

But `ThemeContext.tsx` initializes `mode` with a plain `useState<PaletteMode>('light')` and never reads/writes `localStorage`:

```25:30:task-mgmt-ui/src/theme/ThemeContext.tsx
export const AppThemeProvider: React.FC<AppThemeProviderProps> = ({ children }) => {
  const [mode, setMode] = useState<PaletteMode>('light');

  const toggleThemeMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };
```

Refreshing the page always resets to light mode. Either implement persistence (a few lines: read `localStorage.getItem('theme')` on init, write on toggle) or fix the README wording — a reviewer **will** refresh the page and notice.

Also, the `Header` renders a fully-styled search input and a notification bell that do nothing:

```101:110:task-mgmt-ui/src/components/Header.tsx
            <SearchIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
            <InputBase
              placeholder="Search tasks, projects..."
              inputProps={{ 'aria-label': 'Search tasks, projects' }}
```

There's no `onChange`/`value`, and the bell (`NotificationsNone`) has no menu or state. This isn't necessarily wrong (the *real* search is in `TaskFilterToolbar`), but a reviewer who types into that header box and sees nothing happen will flag it as unfinished UI. Either wire it up, remove it, or (minimum bar) list it explicitly under "Known Issues" in the submission message as the brief requires.

### 4.6 Stale-state-after-unmount risk (soft memory leak)

`TaskCard.tsx`'s inline status/priority handlers do optimistic updates with manual rollback:

```65:85:task-mgmt-ui/src/features/tasks/components/TaskCard.tsx
  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (newStatus === currentStatus || isUpdatingStatus) return;

    const previousStatus = currentStatus;
    setCurrentStatus(newStatus); // Optimistic UI update
    setIsUpdatingStatus(true);

    try {
      if (onUpdateTask) {
        await onUpdateTask(task._id, { status: newStatus });
      }
    } catch (err: any) {
      setCurrentStatus(previousStatus); // Rollback on failure
      ...
    } finally {
      setIsUpdatingStatus(false);
    }
  };
```

If the card unmounts while the mutation is in flight (task gets filtered out, page changes, drag moves it to a column that re-renders/unmounts it, user navigates away), these `setState` calls fire on an unmounted component. React 19 silently no-ops this (no console warning like React 16–18), so it won't crash — but it's still wasted work and a sign the component isn't tracking its own lifecycle. It's not a classic "leak" (nothing accumulates), but it's exactly the kind of thing "avoid memory leaks" review criteria are checking for.

**Cleaner fix:** this is a textbook case for **TanStack Query's built-in optimistic-update support** (`onMutate`/`onError`/`onSettled` in the mutation itself, defined once in `useUpdateTaskMutation`) instead of hand-rolled local state + rollback duplicated in `TaskCard` *and* `TaskDetailsDialog` *and* `TaskBoard`. Centralizing this in the hook layer would:
1. Remove ~40 duplicated lines across 3 components.
2. Remove the unmount risk (the query cache doesn't care if the component is still mounted).
3. Make every place that changes a task's status/priority behave identically.

### 4.7 No memoization — fine today, but not "new syntax" best practice for lists/DnD

Nowhere in the codebase is `useCallback` used, and `useMemo` appears only twice (`TaskBoard.tsx` grouping, `ThemeContext.tsx` theme object). Every list-row component (`TaskCard`, `DraggableTaskCard`, `TaskColumn`) receives inline-defined callbacks from parents:

```200:206:task-mgmt-ui/src/features/tasks/pages/TasksPage.tsx
              <TaskTable
                tasks={tasks}
                onEditTask={(task) => setEditingTask(task)}
                onDeleteTask={(task) => setDeletingTask(task)}
                onUpdateTask={handleUpdateTaskInline}
                onError={(msg) => setSnackbar({ open: true, message: msg, severity: 'error' })}
              />
```

With only 9 tasks per page (`limit = 9`), this has **no real performance impact** — don't over-optimize for its own sake. But since none of the card components are wrapped in `React.memo` either, every keystroke in the search box (before debounce even fires) re-renders the entire visible task list. For a take-home this is acceptable, but if asked "how would you optimize this for 500 tasks," the answer is: wrap `TaskCard`/`DraggableTaskCard` in `React.memo`, and move the inline arrow functions in `TasksPage` into `useCallback`-wrapped handlers so the memoization actually holds.

### 4.8 Minor: `Grid` `justify` typo, unused `disabled` fallthrough

```303:309:task-mgmt-ui/src/features/tasks/components/TaskForm.tsx
            <Paper
              variant="outlined"
              sx={{
                p: 1.5,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justify: 'space-between',
```

`justify` is not a valid CSS/MUI `sx` property — it should be `justifyContent`. This is silently ignored by MUI's `sx` (no type error because `sx` accepts arbitrary CSSProperties-ish objects loosely), so it's a functional no-op, not a bug that breaks anything, but it means the intended "space-between" layout on that attachment row never actually applies. Repeated in two places in `TaskForm.tsx`.

### 4.9 Naming conventions — mostly good, one inconsistency

- Components: `PascalCase.tsx` ✅
- Hooks: `useXyz` ✅ (`useAuth`, `useTasksQuery`, `useThemeMode`)
- Types/interfaces: `PascalCase` ✅, consistent `TaskStatus`/`TaskPriority` union types reused everywhere instead of re-declared strings ✅
- One inconsistency: `useThemeMode.ts` is a **1-line pass-through** wrapper around `useAppTheme` from `ThemeContext.tsx` — it doesn't add behavior, just renames the hook. Either use `useAppTheme` directly everywhere and delete the extra file, or explain the intent (e.g., "abstraction seam for a future non-context theme implementation") — right now it just adds an indirection with no payoff, and only some files use one name vs the other.

### 4.10 `.oxlintrc.json` exists but does nothing

```1:8:task-mgmt-ui/.oxlintrc.json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "rules": {
    "react/rules-of-hooks": "error",
    ...
```

`oxlint` is **not** in `package.json`'s `devDependencies`, and there's no `lint` script. This config file currently has zero effect — it can't even run (`npx oxlint` would fail without the package installed, and there's nothing wired into `npm run build`/CI to invoke it). Either:
- add `oxlint` (or `eslint` + the React/TS plugins) as a real devDependency with a `"lint": "oxlint ."` script, or
- remove the file so it doesn't imply tooling that isn't actually there.

Given the brief doesn't require a linter, this is low priority, but a technical reviewer who notices the file will ask "does this run anywhere?" — be ready to answer, or just delete it.

---

## 5. UX / Responsiveness / Accessibility — Strong

This is genuinely a strength of the submission:

- Loading/Error/Empty states are implemented as **dedicated, reusable, `data-testid`-tagged components** (`LoadingState`, `ErrorState`, `EmptyState`) rather than inline conditionals scattered through pages — good separation and testability.
- Validation feedback is per-field with `helperText`/`error` props on every form field, and errors clear as the user types (`if (errors.title) setErrors(...)`) — good micro-UX.
- Sensible ARIA usage: `aria-label` on icon-only buttons, `aria-live="polite"` on loading regions, `aria-live="assertive"` on auth error alerts, `role="listbox"`/`aria-selected` on the custom status/priority dropdowns.
- Responsive drawer (mobile temporary vs. desktop permanent+collapsible), horizontal-scroll fallback for the Kanban board on narrow screens (`overflowX: { xs: 'auto', md: 'visible' }`), and drag/drop uses `PointerSensor` + `KeyboardSensor` (keyboard-accessible DnD, which most candidates skip entirely).
- Optimistic UI + rollback pattern for inline status/priority (see §4.6 for the implementation critique, but the *UX intent* is correct and a nice touch).

---

## 6. Actionable Fix List Before Submitting

Ordered by priority — do at least the "Must Fix" items before sending this to the company.

**Must fix (will be visibly noticed within minutes of review):**
1. Fix or update the 5 failing tests (`TasksPage.test.tsx`, `DeleteTask.test.tsx`, `TaskFormEdit.test.tsx`) — a red `npm test` is one of the first things a reviewer will run.
2. Fix the README claim about persistent dark-mode (either implement `localStorage` persistence — trivial — or remove the claim).
3. Confirm the backend actually exists, satisfies the MERN + JWT + bcrypt + per-user task scoping requirements, and is linked/included in the submission. This review could not verify any backend requirement (30% + 20% + 10% of the evaluation weight — completion, backend/API quality, and security — all depend on code not present in this workspace).

**Should fix (good technical-review talking points either way):**
4. Replace `catch (err: any)` with `catch (err: unknown)` + a shared `getErrorMessage()` helper (removes ~10 `any`s and ~8 duplicated one-liners).
5. Decide on `@/*` alias vs relative imports — pick one and apply consistently.
6. Delete unused `LoadingSpinner.tsx`, and either fully populate or remove the `components/index.ts` barrel.
7. Fix the two `justify: 'space-between'` → `justifyContent: 'space-between'` typos in `TaskForm.tsx`.
8. Wire up or remove the non-functional header search box and notification bell, or note them as "Known Issues" in the submission message.

**Nice to have / good to be ready to discuss verbally:**
9. Move the optimistic status/priority update + rollback logic out of `TaskCard`/`TaskDetailsDialog`/`TaskBoard` and into `useUpdateTaskMutation`'s `onMutate`/`onError`/`onSettled` (removes duplication and the unmount-safety concern).
10. Consider dropping `React.FC` for plain typed function components (mechanical, low-risk, matches current React style guidance).
11. Be ready to explain: why no `React.memo`/`useCallback` (answer: dataset is small — 9 items/page — so it wasn't necessary, but you know how you'd add it).

---

## 7. Suggested "Known Issues" Section for the Submission Message

Based on this review, a candid, reviewer-friendly "Known Issues / Incomplete Items" list would be:

- Header search bar and notification icon are placeholder UI (not wired to any state/handler); actual search/filtering lives in the Tasks toolbar.
- Dark/light theme preference is not persisted across page reloads.
- 5 Vitest tests currently rely on stale mock fixtures and need updating.
- No `React.memo`/`useCallback` optimization applied; acceptable at current page size (9 tasks/page) but would need revisiting for large datasets.

Being upfront about these (per the brief's explicit instruction to "clearly document what remains") will read better to a reviewer than having them discover it unprompted.
