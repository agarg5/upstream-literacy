# Upstream Literacy — Community Platform for K-12 Literacy Leaders

A community platform where school district literacy leaders find and connect with peers facing similar challenges, powered by AI-driven matching on demographics, shared problem statements, and semantic similarity of challenge descriptions.

[Screenshot: Dashboard with recommended matches]

[Screenshot: Search page with filters and results]

[Screenshot: Member profile with commonalities]

[Screenshot: Messaging conversation]

[Screenshot: Admin moderation dashboard]

## Live Demo

- **Frontend:** https://frontend-two-bay-88.vercel.app
- **Backend API:** https://backend-production-5972f.up.railway.app
- **GitHub:** https://github.com/agarg5/upstream-literacy

Demo accounts:
- Member: `sarah.chen@example.com` / `password123`
- Admin: `admin@upstreamliteracy.com` / `admin123`

---

## Features

**User Onboarding and Profiles**
- Guided registration with district search and auto-populated NCES demographics
- Selection from 12 curated literacy problem statements
- Optional free-text challenge description for semantic matching

**AI-Powered Matching**
- Match scoring based on problem overlap, semantic similarity, and demographic similarity
- "Leaders Like You" dashboard recommendations
- Semantic search using OpenAI embeddings on free-text challenge descriptions

**Search and Discovery**
- Filter by district type, enrollment range, FRL rate, ESL population, and state
- Filter by specific problem statements
- Sort by best match, problem overlap, demographic similarity, or recent activity

**Messaging**
- Direct messaging between members
- Conversation threads with read receipts
- Unread message indicators

**Admin Moderation**
- Platform-wide metrics dashboard (users, conversations, messages, matches)
- View all conversations on the platform
- Join any conversation as "Upstream Literacy Team"
- Flag and remove inappropriate content

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18, Vite, Tailwind CSS | SPA with responsive UI |
| Backend | Python, FastAPI | REST API, matching logic |
| Database | PostgreSQL + pgvector | Relational data + vector similarity search |
| AI/Embeddings | OpenAI text-embedding-3-small | Semantic matching on challenge descriptions |
| District Data | NCES (National Center for Education Statistics) | Real public demographic data for school districts |
| Frontend Deploy | Vercel | Static build hosting |
| Backend Deploy | Railway | API server + managed PostgreSQL |

---

## Architecture

```
Browser (React SPA)
    |
    | REST API (JWT auth)
    v
FastAPI Backend
    |
    |--- Auth (JWT tokens, bcrypt password hashing)
    |--- Profile / Onboarding (district lookup, problem selection)
    |--- Matching Engine (scoring algorithm + pgvector queries)
    |--- Messaging (conversations, messages, read tracking)
    |--- Admin (metrics, moderation, conversation join)
    |
    v
PostgreSQL + pgvector
    |--- users, districts, problem_statements
    |--- user_problems (many-to-many)
    |--- user_profiles_extended (challenge text + embedding vector)
    |--- conversations, messages
    |--- moderation_actions
```

---

## AI Matching Algorithm

Each pair of users receives a match score from 0-100% based on three weighted components:

| Component | Weight | What It Measures |
|-----------|--------|-----------------|
| Problem Overlap | 40% | Fraction of shared problem statements out of the user's total selected problems |
| Semantic Similarity | 30% | Cosine similarity between OpenAI embeddings of free-text challenge descriptions |
| Demographic Similarity | 30% | Average similarity across district type, enrollment, FRL rate, and ESL rate |

### Why This Weighting

**Problem overlap at 40%** — Shared challenges drive the most valuable peer conversations. Two leaders both working on transitioning to structured literacy have an immediate reason to connect, regardless of district size.

**Semantic similarity at 30%** — Free-text descriptions capture nuance that predefined categories miss. A leader writing about "struggling to train teachers on phonics-based approaches" is semantically close to one writing about "building teacher capacity in systematic phonics instruction," even though they used completely different words. This is where AI adds value beyond simple filtering.

**Demographic similarity at 30%** — Context matters. Solutions that work in a large urban district with 80% FRL may not transfer to a small rural district with 15% FRL. Matching on demographics ensures recommendations are practically relevant.

### Fallback Behavior

If a user has not written a free-text challenge, the semantic similarity component falls back to the problem overlap score, effectively making the weights 70% problem / 30% demographic.

### Embedding Generation

When a user saves their free-text challenge, the backend generates an embedding using OpenAI's `text-embedding-3-small` model (1536 dimensions) and stores it in a pgvector column. Nearest-neighbor queries use cosine distance for efficient similarity search.

---

## NCES Data Integration

District demographic data is sourced from the National Center for Education Statistics (NCES) Common Core of Data.

- **Source:** https://nces.ed.gov/ccd/elsi/
- **Fields:** District name, state, locale code (mapped to urban/suburban/rural), total enrollment, free/reduced lunch count, English Learner count
- **Scope:** 100+ of the largest US school districts pre-loaded
- **Import:** CSV file in `backend/app/data/` imported during database seeding
- **Benefit:** Users search for their district by name and demographics auto-populate — no manual data entry, and the data is real and verifiable

---

## How to Run

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL with pgvector extension
- OpenAI API key

### Option 1: Docker Compose

```bash
# From the project root
docker-compose up --build
```

This starts the backend (port 8003), frontend (port 5173), and PostgreSQL.

### Option 2: Manual Setup

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Set environment variables (see below)
export DATABASE_URL="postgresql://user:pass@localhost:5432/upstream_literacy"
export JWT_SECRET="your-secret-key"
export OPENAI_API_KEY="sk-..."

# Run migrations and seed data
python -m app.seed

# Start the server
uvicorn app.main:app --host 0.0.0.0 --port 8003 --reload
```

**Frontend:**
```bash
cd frontend
npm install

# Set API URL
echo "VITE_API_URL=http://localhost:8003" > .env

npm run dev
```

The frontend runs at `http://localhost:5173` and the backend at `http://localhost:8003`.

### Seed Data

The seed script creates:
- **20+ realistic literacy leader profiles** across urban, suburban, and rural districts
- **12 curated problem statements** covering Science of Reading topics (structured literacy, HQIM, multilingual learners, MTSS, phonics instruction, etc.)
- **100+ school districts** with real NCES demographic data
- **Sample conversations** with realistic literacy-focused content
- **1 admin account** for moderation demo

Demo accounts:
- Member: `sarah.chen@example.com` / `password123`
- Admin: `admin@upstreamliteracy.com` / `admin123`

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Current user and profile |

### Profile and Onboarding
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/districts/search` | Search districts by name/state |
| GET | `/api/districts/:id` | Get district demographics |
| GET | `/api/problems` | List curated problem statements |
| PUT | `/api/profile` | Update profile, problems, challenge text |

### Discovery and Matching
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/members/search` | Search/filter members with match scores |
| GET | `/api/members/:id` | View member profile |
| GET | `/api/members/recommended` | AI-recommended matches for current user |
| GET | `/api/members/:id/commonality` | What you have in common with a member |

### Messaging
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/conversations` | List conversations |
| POST | `/api/conversations` | Start conversation with a member |
| GET | `/api/conversations/:id/messages` | Get messages (paginated) |
| POST | `/api/conversations/:id/messages` | Send message |
| PUT | `/api/conversations/:id/read` | Mark conversation as read |

### Admin and Moderation
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | List all users |
| GET | `/api/admin/conversations` | List all conversations |
| POST | `/api/admin/conversations/:id/join` | Join conversation as moderator |
| GET | `/api/admin/stats` | Platform metrics |
| POST | `/api/admin/moderation` | Flag or remove content |

---

## Deployment

### Backend — Railway

1. Connect the repository to Railway
2. Add a PostgreSQL addon (ensure pgvector extension is available)
3. Set environment variables: `DATABASE_URL`, `JWT_SECRET`, `OPENAI_API_KEY`, `CORS_ORIGINS`
4. Deploy from the `backend/` directory with the included Dockerfile
5. Run the seed script after first deploy

### Frontend — Vercel

1. Connect the repository to Vercel
2. Set root directory to `frontend/`
3. Set `VITE_API_URL` to the Railway backend URL
4. Build command: `npm run build`
5. Output directory: `dist`
6. Add SPA rewrite rule in `vercel.json`

---

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/upstream_literacy` |
| `JWT_SECRET` | Secret key for JWT token signing | Random 32+ character string |
| `OPENAI_API_KEY` | OpenAI API key for embedding generation | `sk-...` |
| `CORS_ORIGINS` | Allowed origins for CORS | `http://localhost:5173` or `*` for dev |
| `VITE_API_URL` | Backend API URL (frontend only) | `http://localhost:8003` |

---

## Project Structure

```
upstream-literacy/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entry point
│   │   ├── config.py            # Environment config
│   │   ├── database.py          # SQLAlchemy setup
│   │   ├── models/              # Database models
│   │   ├── schemas/             # Pydantic request/response schemas
│   │   ├── routers/             # API route handlers
│   │   ├── services/
│   │   │   ├── matching.py      # Match score algorithm
│   │   │   ├── embedding.py     # OpenAI embedding generation
│   │   │   └── nces.py          # NCES data import
│   │   └── data/
│   │       └── nces_districts.csv
│   ├── tests/
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Route-level page components
│   │   ├── services/            # API client and auth
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── docker-compose.yml
├── DEMO_SCRIPT.md
└── README.md
```

---

## License

This project was built as part of a hiring evaluation for Upstream Literacy.
