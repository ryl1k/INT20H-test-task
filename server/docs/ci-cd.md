# Backend CI/CD

## Branch behavior

- `dev` / `develop` / `main`: run CI (`.github/workflows/backend-ci.yml`).
- Pull requests into `dev` / `develop` / `main`: run CI.
- `main` only: run CD (`.github/workflows/backend-cd.yml`).

## CI checks

CI runs four independent jobs:

1. `Lint`: `gofmt -l` and `go vet ./...`.
2. `Unit Tests`: `go test -count=1 ./...`.
3. `Integration Tests`: `go test -count=1 -tags=integration ./...` with Postgres service.
4. `Build`: build `./cmd/api` into `dist/api` and upload as an artifact.

## CD flow

CD builds a Docker image from `Dockerfile`.

- On push to `main`: build and push image to GHCR (`ghcr.io/<owner>/<repo>`).
- On manual run (`workflow_dispatch`): optionally skip push with `push_image=false`.

## Required secrets and permissions

- `GITHUB_TOKEN` is used automatically for GHCR auth.
- Repository needs `packages: write` permission (already set in workflow).

## Notes

- This CD is intentionally package-focused and does not auto-deploy to Heroku.
- To deploy to Heroku, pull the image from GHCR or run manual Heroku container release in a separate deployment step.
