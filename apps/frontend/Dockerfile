FROM node:22-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile;
RUN pnpm run --filter @seminar/frontend build;
RUN pnpm deploy --filter @seminar/frontend --prod /usr/prod/frontend;

FROM base AS prod
COPY --from=build /usr/prod/frontend /app
WORKDIR /app


ENV PORT=5173

EXPOSE 5173
ENTRYPOINT ["pnpm", "start"]
