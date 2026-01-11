# AI Workflow Documentation

## Tools Used

- **Claude Code (CLI)** - Primary AI assistant for development
- **Cursor IDE** - Code editor with AI integration

## AI-Assisted Parts

- [x] Project setup / boilerplate
- [x] TypeScript types/interfaces
- [x] Mock WebSocket implementation
- [x] UI components
- [x] Tests
- [x] Theme configuration
- [x] Other: TanStack Query integration, form validation with Zod

## Example Prompts

### Prompt 1: WebSocket with Reconnection Logic

**Prompt:**

```
Implement a MockWebSocket class that simulates real-time order updates with
reconnection logic, exponential backoff, and proper cleanup. Emit random events
every 3-5 seconds and handle connection drops gracefully.
```

**What AI generated:**

- Complete WebSocket class with event subscription system
- Exponential backoff reconnection (1s → 2s → 4s → 8s, max 30s)
- Proper cleanup methods and memory leak prevention
- Random event generation with configurable intervals
- TypeScript discriminated unions for event types

**What I modified:**

- Worked perfectly out of the box
- No changes needed - the implementation was production-ready

### Prompt 2: Integration Tests with Real Interactions

**Prompt:**

```
Create integration tests for OrdersTable that test filtering, searching,
and sorting with actual user interactions using React Testing Library.
Include tests for debounced search functionality.
```

**What AI generated:**

- Complete test suite with 5 integration tests covering all major workflows
- Realistic DataGrid mock that simulates column header click interactions
- Proper use of userEvent for realistic user interactions
- Tests for debounced search with 300ms delay verification
- Combined filtering and searching test scenarios

**What I modified:**

- Tests worked correctly on first implementation
- Only updated TypeScript types to remove `any` for strict mode compliance

### Prompt 3: Theme System with Dark Mode

**Prompt:**

```
Add dark mode toggle to the application with theme persistence using
localStorage, MUI theme integration, and proper React Fast Refresh support.
```

**What AI generated:**

- Complete theme context with localStorage persistence
- Theme toggle component with color-coded icons (purple moon, yellow sun)
- Proper MUI theme integration with light/dark color variants
- Responsive header styling that adapts to both themes

**What I modified:**

- Initially used ESLint disable comment (quick fix approach)
- After user feedback, correctly refactored into separate files for React Fast Refresh compliance:
  - `themeContext.ts` - Context and types only
  - `ThemeProvider.tsx` - Provider component only
  - `useThemeMode.ts` - Hook only

## AI Mistakes Caught

### 1. Mixed WebSocket, Common and Order Types

**What was wrong:**
AI initially mixed type definitions across `websocket.ts`, `common.ts`, and `order.ts` files without clear separation of concerns.

**How I caught it:**
During code review, noticed that `OrderStatus` type was duplicated and `WebSocketStatus` was defined alongside order-related types.

**How I fixed it:**
Reorganized types into proper files:

- `order.ts` - Order-specific types only
- `websocket.ts` - WebSocket event and status types
- `common.ts` - Shared pagination and sorting types

### 2. Feature-Specific Types Mixed with Shared Types

**What was wrong:**
After the first fix, AI still placed feature-specific types (like `OrderSortField`) in the shared `common.ts` file.

**How I caught it:**
Realized that `common.ts` was importing from `order.ts`, creating circular dependency potential.

**How I fixed it:**
Moved `OrderSortField` to `order.ts` where it belongs, keeping `common.ts` truly generic and reusable.

### 3. Vite Config Path Resolution Issues

**What was wrong:**
AI generated Vite config didn't properly resolve `@/` path aliases, causing import errors.

**How I caught it:**
Build failed with module resolution errors.

**How I fixed it:**
Updated `vite.config.ts` to include proper path resolution configuration and ensured `tsconfig.json` paths matched.

### 4. MUI DataGrid Ghost Column Issue

**What was wrong:**
MUI DataGrid was injecting an "actions/empty" gutter column during state transitions (search/filter), causing visual layout shifts. AI initially didn't recognize this as a known MUI quirk.

**How I caught it:**
Visual observation during testing - noticed ~50px ghost column appearing during transitions.

**How I fixed it:**
Simply add the `autoHeight` property.

## Time Breakdown

- **Total time spent:** ~10 hours
- **Time with AI assistance:** ~9 hours
- **Time reviewing/fixing AI output:** ~1 hours
- **Time writing code manually:** ~15 minutes

## Reflection

### Where did AI help the most?

- **Boilerplate reduction:** Project setup, file structure, and initial configurations were generated quickly
- **Test scaffolding:** Creating test structure and mock setups was significantly faster
- **Type definitions:** Initial type structures were good starting points, though required refinement
- **Documentation:** README generation and code comments were helpful

### Where did AI slow me down?

- **Type organization:** Had to refactor type definitions multiple times to get proper separation
- **TypeScript strict mode:** AI sometimes suggested `any` types or unsafe assertions that needed fixing
- **Framework-specific quirks:** MUI DataGrid behavior issues weren't immediately recognized

### What would I do differently?

- **Start with type architecture:** Define clear type boundaries before implementing features
- **Specify testing approach upfront:** Be more explicit about test patterns and mock strategies
- **Request incremental validation:** Ask AI to verify TypeScript strict mode compliance at each step
- **Include framework version specifics:** Mention exact MUI version to get more accurate guidance on known issues
