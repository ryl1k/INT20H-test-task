# INT20H Test Task Server - Technical Documentation
---
## 1. Executive Summary

### 1.1 Purpose


The backend service designed to process and manage tax jurisdiction orders. The system calculates composite tax rates based on geographic coordinates, retrieves jurisdiction-specific tax information, and stores order data.

### 1.2 High-Level Architecture

Entities and DTOs mostly are passed by value to reduce GC pressure and keep objects on the stack. All layers communicate with each other via interface.

The system follows a layered hexagonal architecture pattern with separation of concerns:

- **Presentation Layer:** HTTP REST API (Echo framework)
- **Application Layer:** Use cases and business logic orchestration
- **Infrastructure Layer:** Database persistence, external service integrations.

---

## 2. System Architecture

### 2.1 Architecture Overview

The system architecture is organized into four primary layers, each with distinct responsibilities:

1. **Presentation Layer:** Exposes the HTTP REST API using the Echo framework. It handles incoming requests, delegates processing to the application layer, and returns responses.
2. **Application Layer:** Contains use cases that orchestrate business logic execution. It coordinates between infrastructure services.
3. **Infrastructure Layer:** Manages data persistence, tax calculations. It ensures that the application can store and retrieve data as needed.

## 3. Security Considerations

### 3.1 Authentication and Authorization

- Api key is required for all API requests and must be included in the `x-api-key` header.

---

## 4. Operational Procedures

### 4.1 Deployment

- The application is containerized using Docker.
- Deployment is automated using GitHub Actions, with separate workflows for CI and CD.

---

## 5. Technology Stack

- **Programming Language:** Go
- **Web Framework:** Echo
- **Database:** PostgreSQL
- **Containerization:** Docker
- **CI/CD:** GitHub Actions
- **Documentation** Swagger

---

## 6. References

- [Echo Framework](https://echo.labstack.com/)
- [PostgreSQL](https://www.postgresql.org/)
- [Redis](https://redis.io/)
- [Docker](https://www.docker.com/)
- [GitHub Actions](https://github.com/features/actions)

---

# Setup Guide

### 1. Install Go Dependencies

```bash
make install-dependencies
```

This installs:
- `swag` - Swagger/OpenAPI documentation generation
- `mockgen` - Mock code generation for testing

### 2. Configure Environment

Copy example configuration files:

```bash
cp .env.example .env
```

Update with your settings:
- Database credentials (PostgreSQL)

### 3. Start Dependencies

```bash
make start-deps
```
This starts PostgreSQL via Docker Compose.

### 4. Start the Application

**Server:**
```bash
make start
```

## Development Workflow

### Code Linting

```bash
make lint
```

### Running Tests

```bash
make test
```

### Generate Mocks

```bash
make gen-mock
```

### Update API Documentation

After modifying controllers or adding endpoints:

```bash
make gen-swag
```

Then visit: `http://localhost:<PORT>/swagger/index.html`

## API Documentation

### OpenAPI/Swagger

The complete API documentation is available at:

```
http://localhost:8080/swagger/index.html
```

## Testing

### Unit Tests

```bash
make test
```

## Code Generation

### Swagger/OpenAPI Documentation

```bash
make gen-swag
```

This reads route annotations and generates OpenAPI spec in `docs/swagger.json` and `docs/swagger.yaml`.

### Mock Code for Testing

```bash
make gen-mock
```

Generates mocks from interfaces defined in `internal/usecase/contracts.go` and in `internal/repo/contracts.go`.