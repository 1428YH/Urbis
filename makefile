## Start backend 
back:
	go run src/backend/cmd/main.go

## Start Moderation 
mod:
	cd src/Moderation && npm start

### Start frontend 
front:
	cd src/frontend/frontend-urbis && npm run dev

### install dependencies
install:
	cd src/Moderation && bun install
	cd src/frontend/frontend-urbis && npm install
	cd src/backend && go mod tidy
	@echo "✅ All dependencies installed"


