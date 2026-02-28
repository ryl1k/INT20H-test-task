# Backend structure

This document describes the source tree for the backend service and the purpose
of each top‑level directory.  It is intended for new engineers, auditors and
external reviewers who need to understand where code lives and how the system
is organized.

```
/ 
├── cmd/
│   └── api/             # entry‑point for the HTTP server
│       └── main.go
├── config/              # configuration loading and environment parsing
├── docs/                # auxiliary documentation (CI/CD, architecture, etc.)
├── internal/            # private application code
│   ├── config/          # runtime configuration structures
│   ├── controller/      # HTTP layer (handlers, routing, middleware)
│   │   ├── http/
│   │   │   ├── v1/       # versioned REST controllers
│   │   │   ├── middleware/
│   │   │   ├── request/  # validator implementation
│   │   │   └── response/ # response templates and error mapping
│   ├── entity/          # domain models and shared constants/errors
│   ├── repo/            # repository interfaces and DTOs
│   │   ├── persistent/  # postgres implementations
│   │   └── tax/         # in‑memory tax lookup
│   └── usecase/         # business logic/use‑case implementations
│       └── order/        # order‑related orchestration
├── pkg/                 # reusable libraries (httpserver, logger, postgres helpers)
├── docs/                # project documentation (this file, ci‑cd, etc.)
├── Makefile             # convenient development targets
├── Dockerfile           # container build definition
├── go.mod / go.sum      # dependency management
└── .github/             # CI/CD workflows
```

## Layers and conventions

* **cmd/api** – application bootstrap: configuration, connectivity, and wiring of
  dependencies.  This package is the only one that imports packages outside of
  `internal/` or `pkg/`.

* **internal/** – code that is not published as a library.  It is organized by
  functional concern:

  * **config** – read environment variables, load static files (jurisdictions,
    geojson) and expose a `Config` struct.
  * **controller/http** – HTTP API implementation using Echo.  Routes are
    versioned under `v1` and each handler is thin: it binds/validates payloads,
    invokes a use‑case and converts results to `response.Response` objects.
    Middleware (API key, pagination) and request validation are also defined
    here.
  * **entity** – domain entities (`Order`, `JurisdictionTax`, error definitions,
    status constants) and shared keys for context.
  * **repo** – data access abstractions (`OrderRepo`, `TaxRepo`) plus concrete
    implementations.  `persistent` contains PostgreSQL code; `tax` holds the
    spatial lookup using GeoJSON, R‑tree and the `orb` package.
  * **usecase** – application/business logic.  Each feature (currently only
    orders) has a service that encapsulates behavior, performs tax lookups,
    handles idempotency, batch processing and interacts with repositories.

* **pkg/** – utility packages which may be imported by other projects.  It
  contains helpers for HTTP server setup, logger configuration and Postgres pool
  creation.

## Tests and tooling

* Unit tests live alongside the packages they test (`*_test.go`).
* Integration tests are marked with the `integration` build tag and executed in
  CI with a Postgres container.
* Mocks are generated with `go generate` and `mockgen`; the Makefile exposes
  `make gen-mock`.
* Swagger/OpenAPI annotations are located in controller files; documentation is
  generated with `make gen-swag` and served under `/swagger/`.

## Development helpers

* `Makefile` defines common targets: `start`, `start-deps`, `test`, `lint`,
  `gen-swag`, etc.
* `docker-compose.deps.yaml` brings up database services for local testing.

---

This layout follows a clean‑architecture / hexagonal style.  Domain logic is
isolated from transport and persistence; dependencies are inverted via
interfaces declared in `repo/contracts.go` and `usecase/contracts.go`.  The
project is intentionally kept small but structured to facilitate unit testing,
security review and future expansion (multiple versions, additional services,
external integrations).