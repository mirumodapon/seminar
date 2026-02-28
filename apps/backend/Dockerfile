FROM node:22-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile;
RUN pnpm run --filter @seminar/backend build;
RUN pnpm deploy --filter @seminar/backend --prod /usr/prod/backend;

FROM base AS prod
COPY --from=build /usr/prod/backend /app
WORKDIR /app

EXPOSE 3000
ENTRYPOINT ["pnpm", "start:prod"]
