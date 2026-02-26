start:
	go run cmd/api/main.go
gen-swag:
	@swag init -g ./internal/controller/http/router.go
start-deps:
	@docker compose -f docker-compose.deps.yaml up --build -d 