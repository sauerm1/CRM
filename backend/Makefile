# Makefile for Go OAuth API

.PHONY: help test test-unit test-integration test-coverage run build clean

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

test: ## Run all tests
	@echo "Running all tests..."
	@go test -v ./...

test-unit: ## Run unit tests only (skip integration tests)
	@echo "Running unit tests..."
	@go test -short -v ./...

test-integration: ## Run integration tests only
	@echo "Running integration tests..."
	@go test -v ./middleware -run Integration
	@go test -v ./database -run Integration

test-coverage: ## Run tests with coverage report
	@echo "Running tests with coverage..."
	@go test -short -coverprofile=coverage.out ./...
	@go tool cover -func=coverage.out
	@echo ""
	@echo "Generating HTML coverage report..."
	@go tool cover -html=coverage.out -o coverage.html
	@echo "Coverage report saved to coverage.html"

test-watch: ## Run tests in watch mode (requires entr)
	@echo "Watching for changes..."
	@find . -name '*.go' | entr -c go test -short ./...

run: ## Run the application
	@echo "Starting server..."
	@go run main.go

build: ## Build the application
	@echo "Building..."
	@go build -o bin/go-api-mongo main.go
	@echo "Binary created at bin/go-api-mongo"

clean: ## Clean build artifacts and test files
	@echo "Cleaning..."
	@rm -f coverage.out coverage.html
	@rm -rf bin/
	@echo "Clean complete"

seed: ## Seed database with sample data (clubs, instructors, members)
	@go run scripts/seed_data.go

deps: ## Download dependencies
	@echo "Downloading dependencies..."
	@go mod download
	@go mod tidy

lint: ## Run linter (requires golangci-lint)
	@echo "Running linter..."
	@golangci-lint run

fmt: ## Format code
	@echo "Formatting code..."
	@go fmt ./...

vet: ## Run go vet
	@echo "Running go vet..."
	@go vet ./...
