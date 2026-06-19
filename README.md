# Air Charters — Microservices Monorepo

This repository contains the Air Charters backend implemented as a NestJS monorepo. It houses multiple microservices, shared libraries, database migrations, and local tooling used for development and deployment.

**Status (local repo):** Active development — multiple services present and runnable via npm scripts, `start-services.sh`, or `docker-compose.yml`.

## Quick Links
- **Project root:** [README.md](README.md)
- **Migration plan:** [MICROSERVICES_MIGRATION_PLAN.md](MICROSERVICES_MIGRATION_PLAN.md)
- **Local compose:** [docker-compose.yml](docker-compose.yml)
- **Start/stop scripts:** [start-services.sh](start-services.sh), [stop-services.sh](stop-services.sh)

## What’s in this repo
- `apps/` — All NestJS services (api-gateway, user-service, charter-service, booking-service, payment-service, communication-service, location-service, direct-charter-service, experience-service, yacht-service).
- `libs/` — Shared code (common utilities, database helpers, DTOs).
- `migrations/` — SQL migration scripts used by the project.
- `docker-compose.yml` — Compose for local development.
- `package.json` — Monorepo scripts (start:all, build:all, start:<service>, etc.).

## Services (short)
- `api-gateway` — HTTP entry point and request routing
- `user-service` — Authentication, users, passengers, wallet
- `charter-service` — Charter deals, aircraft, amenities
- `booking-service` — Booking lifecycle, inquiries, trips
- `payment-service` — Payment integrations and ledger
- `communication-service` — Email/SMS/notifications
- `location-service` — Locations and mapping
- `direct-charter-service`, `experience-service`, `yacht-service` — additional domain services

## Prerequisites
- Node.js 18+ (as used by the codebase)
- MySQL 8+ (or compatible database)
- Redis (for microservices transport / cache)
- Docker & Docker Compose (optional, recommended for local full-stack)

## Install
Run from the repo root:

```bash
npm install
```

Copy and edit environment files for services you run (examples may exist as `.env.example` in service folders).

## Run (local)

1) Run individual services (recommended during development):

```bash
# Example: start the charter service
npm run start:charter-service

# Start the API gateway
npm run start:api-gateway
```

2) Start all services together (uses `concurrently`):

```bash
npm run start:all
```

3) Use Docker Compose for a local full-stack environment:

```bash
docker-compose up --build
```

There are helper scripts at the repository root: `start-services.sh` and `stop-services.sh`.

## Build & Test

- Build all services: `npm run build:all`
- Run tests: `npm run test` (per-service test configs exist under `apps/<service>/test` sometimes)

## Migrations & DB

SQL migration files are in `migrations/` and service-specific migration files are under `apps/*/migrations` or `location-service/migrations`.

## Notes & Known Items
- The repo is a work-in-progress: some docs reference migration plans and API references located elsewhere in project documentation — check `MICROSERVICES_MIGRATION_PLAN.md` and other top-level docs.
- Use the `package.json` scripts (`start:all`, `start:<service>`, `build:all`) for consistent local runs.

## Contributing
1. Create a feature branch
2. Run the service's unit tests
3. Open a pull request with a description and testing notes

## License
MIT

---

**Last Updated:** June 19, 2026
**Version:** 1.0.0

