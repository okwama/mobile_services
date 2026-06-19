# Air Charters — Microservices Monorepo

This repository contains the Air Charters backend implemented as a NestJS monorepo. It houses multiple microservices, shared libraries, database migrations, and local tooling used for development and deployment.

Status: Active development — services runnable via `npm` scripts or PM2 in production.

## Where to find documentation
- All project documentation has been consolidated under the `docs/` folder and grouped by topic (architecture, deployment, monitoring, security, integration, tests, planning).
- Key docs:
	- Architecture: [docs/architecture](docs/architecture)
	- Deployment & guides: [docs/deploy](docs/deploy)
	- Monitoring: [docs/monitoring](docs/monitoring)
	- Security: [docs/security](docs/security)
	- Integration & testing: [docs/integration](docs/integration)
	- Tests & troubleshooting: [docs/tests](docs/tests)
	- Migration & planning: [docs/planning](docs/planning)

## Quick start
1) Install dependencies

```bash
npm install
```

2) Copy `.env.example` to `.env` and edit values as needed

3) Build and run (development)

```bash
npm run build:all
npm start
```

4) Production with PM2 (example)

```bash
# set any port overrides, e.g. export USER_SERVICE_PORT=3101
pm2 start ecosystem.config.js --env production
pm2 save
```

## Health & monitoring
- API Gateway exposes health endpoints: `/api/health` and `/api/health/all` and an HTML dashboard at `/api/health/dashboard`.
- Uptime Kuma can be installed and run (see [docs/monitoring/UPTIME_KUMA_LOCAL_SETUP.md](docs/monitoring/UPTIME_KUMA_LOCAL_SETUP.md)).

## Build & test
- Build all services: `npm run build:all`
- Run tests: `npm run test`

## Contributing
1. Create a feature branch
2. Run the service's unit tests
3. Open a pull request with a description and testing notes

## License
MIT

---

**Last Updated:** June 19, 2026
**Version:** 1.0.0

