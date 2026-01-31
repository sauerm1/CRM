#!/bin/bash

# Run all tests script for Go OAuth API

set -e

echo "======================================"
echo "Running Go OAuth API Test Suite"
echo "======================================"
echo ""

# Check if MongoDB is running for integration tests
echo "Checking MongoDB connection..."
if mongosh --eval "db.adminCommand('ping')" --quiet > /dev/null 2>&1; then
    echo "✓ MongoDB is running - integration tests will be executed"
    MONGO_AVAILABLE=true
else
    echo "⚠ MongoDB is not running - integration tests will be skipped"
    echo "  To run integration tests, start MongoDB: brew services start mongodb-community"
    MONGO_AVAILABLE=false
fi
echo ""

# Run unit tests (short mode - skips integration tests)
echo "======================================"
echo "Running Unit Tests"
echo "======================================"
go test -short -v ./...
echo ""

# Run integration tests if MongoDB is available
if [ "$MONGO_AVAILABLE" = true ]; then
    echo "======================================"
    echo "Running Integration Tests"
    echo "======================================"
    go test -v ./middleware -run Integration
    go test -v ./database -run Integration
    echo ""
fi

# Run tests with coverage
echo "======================================"
echo "Running Tests with Coverage"
echo "======================================"
go test -short -coverprofile=coverage.out ./...
echo ""

# Display coverage report
echo "======================================"
echo "Coverage Summary"
echo "======================================"
go tool cover -func=coverage.out
echo ""

# Optional: Generate HTML coverage report
echo "Generating HTML coverage report..."
go tool cover -html=coverage.out -o coverage.html
echo "✓ Coverage report saved to coverage.html"
echo ""

echo "======================================"
echo "All Tests Completed Successfully!"
echo "======================================"
