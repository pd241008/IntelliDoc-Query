.PHONY: install dev-auth dev-frontend dev-backend dev-all test-auth test-frontend-unit test-frontend-e2e test-backend test-all docker-up docker-down

# --- Installation ---
install:
	@echo "Installing Auth dependencies..."
	cd auth && npm install
	@echo "Installing Frontend dependencies..."
	cd frontend && npm install
	@echo "Installing Backend dependencies..."
	cd backend && pip install -r requirements.api.txt -r requirements.worker.txt -r requirements.test.txt -r requirements.rag.txt

# --- Development Servers ---
dev-auth:
	@echo "Starting Auth Service..."
	cd auth && npm run dev

dev-frontend:
	@echo "Starting Frontend..."
	cd frontend && npm run dev

dev-backend:
	@echo "Starting Backend Service..."
	cd backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000

dev-all:
	@echo "Starting all services concurrently..."
	$(MAKE) -j3 dev-auth dev-frontend dev-backend

# --- Testing ---
test-auth:
	@echo "Running Auth tests..."
	cd auth && npm run test

test-frontend-unit:
	@echo "Running Frontend Unit tests..."
	cd frontend && npm run test:unit

test-frontend-e2e:
	@echo "Running Frontend E2E tests..."
	cd frontend && npm run test:e2e

test-backend:
	@echo "Running Backend tests..."
	cd backend && pytest -v

test-all: test-auth test-backend test-frontend-unit test-frontend-e2e

# --- Docker / Infrastructure ---
docker-up:
	@echo "Starting infrastructure (Docker)..."
	cd backend && docker-compose up -d

docker-down:
	@echo "Stopping infrastructure..."
	cd backend && docker-compose down
