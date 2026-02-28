#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

NO_BUILD=false
FOREGROUND=false

for arg in "$@"; do
  case "$arg" in
    --no-build) NO_BUILD=true ;;
    --foreground) FOREGROUND=true ;;
    *)
      echo "Unknown option: $arg"
      echo "Usage: ./scripts/start-all.sh [--no-build] [--foreground]"
      exit 1
      ;;
  esac
done

if [[ ! -f .env ]]; then
  cp .env.example .env
  echo "Created .env from .env.example. Review values if needed."
fi

cmd=(docker compose up --remove-orphans)
if [[ "$NO_BUILD" == false ]]; then
  cmd+=(--build)
fi
if [[ "$FOREGROUND" == false ]]; then
  cmd+=(-d)
fi

"${cmd[@]}"
docker compose ps

echo
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:8080/v1/health"
echo "Swagger:  http://localhost:8080/swagger/index.html"
