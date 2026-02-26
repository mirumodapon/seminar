# Copilot Instructions for Seminar Project

## Project Overview

This is a monorepo containing a full-stack application with:
- **Backend**: NestJS API with MySQL (via Knex) and Redis
- **Frontend**: React Router v7 with SSR and Tailwind CSS

Managed with pnpm workspaces.

## Build, Test, and Lint Commands

### Backend (`apps/backend`)

```bash
# Development
pnpm --filter @seminar/backend start:dev

# Build
pnpm --filter @seminar/backend build

# Testing
pnpm --filter @seminar/backend test                # Run all tests
pnpm --filter @seminar/backend test -- <file>      # Run specific test file
pnpm --filter @seminar/backend test:watch          # Watch mode
pnpm --filter @seminar/backend test:e2e            # E2E tests
pnpm --filter @seminar/backend test:cov            # With coverage

# Database migrations
cd apps/backend
npx knex migrate:latest --knexfile knexfile.ts
npx knex migrate:make <migration_name> --knexfile knexfile.ts
```

### Frontend (`apps/frontend`)

```bash
# Development
pnpm --filter @seminar/frontend dev

# Build
pnpm --filter @seminar/frontend build

# Type checking
pnpm --filter @seminar/frontend typecheck
```

### Workspace Root

```bash
# Lint entire codebase
eslint .
```

## Architecture

### Backend Structure

- **Module-based architecture**: Each feature (auth, activity) is a separate NestJS module
- **Database access**: Knex.js for MySQL, injected via `KNEX_PROVIDER` token
- **Session management**: Redis-backed sessions via `connect-redis`
- **Configuration**: Centralized in `config/config.factory.ts` using `@nestjs/config`
- **Authentication**: Google OAuth 2.0 via Passport strategy (`auth/provider/google.provider.ts`)
- **Global API prefix**: All routes prefixed with `/api`

### Frontend Structure

- **React Router v7** with file-based routing
- **SSR enabled** by default (configured in `react-router.config.ts`)
- **Root layout**: `root.tsx` provides app shell and error boundary
- **Routes definition**: `routes.ts` configures route structure

### Database

- **Migrations**: Located in `apps/backend/migrations/`
- **Tables**: `user`, `activity`, `page`
- **Configuration**: `knexfile.ts` loads from `.env.local` or `.env`

## Key Conventions

### Code Style (enforced by ESLint)

- **No semicolons**: `'style/semi': ['error', 'never']`
- **Single quotes**: `quotes: 'single'`
- **camelCase required**: `'camelcase': ['error']`
- **2-space indentation**
- **console.log warnings**: Use proper logging in production code

### Backend Conventions

- **DTO naming**: `create-*.dto.ts`, `update-*.dto.ts`
- **Module structure**: Each feature has `<feature>.module.ts`, `<feature>.controller.ts`, `<feature>.service.ts`
- **Test files**: Co-located in `__test__/` directories within feature folders
- **Database timestamps**: All tables use `createdAt`, `updatedAt`, `deletedAt` (soft deletes)
- **Validation**: Global `ValidationPipe` with `whitelist: true` to strip unknown properties
- **Environment files**: Backend uses `.env.local` (preferred) or `.env`

### Frontend Conventions

- **Route files**: Export `LinksFunction`, `MetaFunction`, loader, action, and default component
- **Type-safe routes**: Use `Route.*` types from `+types` directory
- **Error boundaries**: Centralized in `root.tsx` with dev stack traces

### Monorepo

- **Package names**: Use `@seminar/<app>` scope
- **Workspaces**: Defined in `pnpm-workspace.yaml` as `apps/*`
- **Filter commands**: Use `--filter @seminar/<app>` for workspace-specific commands
- **Shared ESLint**: Root-level config applies React rules only to `apps/frontend/**`

## Environment Variables

### Backend Required

```
PORT=3000
SESSION_SECRET=<secret>
DB_HOST=localhost
DB_PORT=3306
DB_USER=<user>
DB_PASSWORD=<password>
DB_DATABASE=<database>
REDIS_URL=<redis-connection-url>
GOOGLE_CLIENT_ID=<google-oauth-client-id>
GOOGLE_CLIENT_SECRET=<google-oauth-client-secret>
GOOGLE_CALLBACK_URL=<callback-url>
GOOGLE_OAUTH_SCOPE=<comma-separated-scopes>
```

### Frontend

Environment variables accessed via `import.meta.env`

## Testing

- **Backend**: Jest with `ts-jest`
- **Unit tests**: `*.spec.ts` files in `src/` subdirectories
- **E2E tests**: Separate config in `test/jest-e2e.json`
- **Coverage directory**: `apps/backend/coverage/`
