install-dependencies:
	@go install github.com/swaggo/swag/cmd/swag@latest
	@go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
	@go install go.uber.org/mock/mockgen@latest

start:
	go run cmd/api/main.go

start-deps:
	@docker compose -f docker-compose.deps.yaml up --build -d 

start-dockerized:
	@docker compose -f docker-compose.yaml up --build

gen-swag:
	@swag init -g ./internal/controller/http/router.go

gen-mock:
	@go generate ./...
test:
	@go test -v --race ./... 
lint:
	@golangci-lint run