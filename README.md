<img src="img.png"></img>
# Urbis
Real-time city safety map. Citizens report street incidents, an AI moderator (Mistral LLM) filters spam and hate speech, corrects threat levels, and publishes verified reports as colored map markers — all in under a second, no human review needed.

**Stack: Go · TypeScript · React · PostgreSQL · Mistral AI**

---
## Architecture
 
```
React → Go :9091 → Moderation Service :3000 (Mistral AI) → PostgreSQL
```
---
## API
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/create` | Submit an incident (→ AI moderation → DB) |
| `GET` | `/incidents` | Published incidents from the last 2 hours |
| `PATCH` | `/confirm/{id}` | Operator approves a review-pending incident |
| `POST` | `/upload` | Upload a photo |
| `GET` | `/uploaded_img/{file}` | Serve uploaded photo |
---
## Moderation
Every incident is sent to Mistral AI, which returns:
 
| action | Condition |
|--------|-----------|
| `publish` | Recognizable incident → live on map immediately |
| `review` | Level 3 or ambiguous → waits for operator |
| `reject` | Hate speech or gibberish → 400 returned |
 
Threat levels: `1 = green`, `2 = yellow`, `3 = red`

---
 
## Environment Variables
 
**Backend** (`.env`):
```
DATABASE_URL=postgres://postgres:password@localhost:5432/urbis
MODERATION_URL=http://localhost:3000/api/agent/moderation
```
 
**Moderation** (`.env`):
```
MISTRAL_API_KEY=...
MISTRAL_MODEL=mistral-large-latest
```

**Frontend** (`.env`):
```
VITE_YANDEX_MAPS_API_KEY=your_yandex_maps_api_key
```
---
## Quick start

**Prerequisites**
- Go 1.21+
- Node.js 18+ & npm
- Bun (for Moderation service)
- PostgreSQL 14+
- Mistral AI API key

### instalation
```
# Clone repository
git clone https://github.com/yourusername/urbis.git
cd urbis

# Install all dependencies
make install
```

### Start all services
```
# Terminal 1: Backend 
make back

# Terminal 2: Moderation service 
make mod

# Terminal 3: Frontend 
make front
```

