# Upstream Literacy — Community for Literacy Leaders with Search & Matching Tool

## Project Context

This is a **Gauntlet AI hiring partner project** for **Upstream Literacy** — a pre-launch EdTech startup likely led by John Hass (former Rosetta Stone CEO, $792M exit, built Lexia Learning into the #1 US literacy platform). They're a Silver-tier partner evaluating candidates for an **AI Engineer (fullstack)** role.

**Category: AI-Solution** — The AI-powered matching is the core value proposition. Connecting district leaders based on demographics AND literacy challenges requires intelligent matching, not just filters.

**Why this project matters to Upstream Literacy:** This IS their product. They're building a B2B network for K-12 literacy decision-makers. The Science of Reading legislative wave (half of US states now mandate science-based reading instruction) is creating a time-sensitive window where districts need peer connections. No dominant platform exists for this.

## What to Build

A **community platform** where school district literacy leaders find and connect with peers facing similar challenges. The platform matches users based on both **public demographic data** (district type, size, student demographics) and **self-selected problem statements** (literacy challenges they're working on).

Think: **LinkedIn meets intelligent matchmaking for district literacy leaders.**

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | **React 18+ (Vite)** | Fast to build, assignment says "TBD by developer". Use Tailwind CSS for styling. |
| Backend | **Python / FastAPI** | Comfortable stack, good for AI matching logic. |
| Database | **PostgreSQL** | Via Railway. Relational modeling for users, districts, problems, matches, messages. |
| Search/Matching | **OpenAI embeddings + cosine similarity** | Semantic matching on problem statements. Store embeddings in Postgres with pgvector. |
| District Data | **NCES (National Center for Education Statistics)** | Public API/data for district demographics (type, size, free/reduced lunch, ESL). |
| Frontend Deploy | **Vercel** | React static build. |
| Backend Deploy | **Railway** | FastAPI + PostgreSQL with pgvector. |

## Features (Priority Order)

### 1. User Onboarding & Profile (MUST HAVE)
- User signs up with email, name, title, district
- Select or search for their district → auto-populate demographics from NCES data:
  - District type (urban, suburban, rural)
  - District size (enrollment)
  - Free and reduced lunch rate (%)
  - English as a second language population (%)
  - State
- Select problem statements from a curated list (multi-select):
  - "Implementing a new core curriculum"
  - "Transitioning from balanced literacy to structured literacy"
  - "Improving K-2 foundational reading scores"
  - "Supporting multilingual learners in literacy"
  - "Building teacher capacity in phonics instruction"
  - "Addressing chronic absenteeism affecting literacy outcomes"
  - "Selecting and adopting HQIM (High-Quality Instructional Materials)"
  - "Aligning RTI/MTSS with science of reading"
  - "Managing post-ESSER budget constraints for literacy programs"
  - "Scaling literacy coaching across the district"
  - "Engaging families in early literacy at home"
  - "Improving middle/high school reading comprehension"
- Optional: free-text description of their biggest challenge (used for semantic matching)

### 2. Smart Search & Discovery (MUST HAVE — Core AI Feature)
- **Filter panel** with demographic sliders/selectors:
  - District type (urban/suburban/rural)
  - District size range
  - Free/reduced lunch rate range
  - ESL population range
  - State/region
- **Problem-based matching:** Show leaders who selected the same problem statements
- **AI-powered semantic matching:** If user wrote a free-text challenge, find others with semantically similar challenges (even if they used different words)
- **Match score:** Each result shows a relevance percentage based on combined demographic + problem overlap
- **Sort by:** Best match, district similarity, problem overlap, recently active

### 3. Member Profiles & Directory (MUST HAVE)
- View another leader's profile: name, title, district, demographics, problem areas
- See what you have in common (shared problems, similar demographics)
- "Leaders like you" recommendation section on dashboard

### 4. Messaging (MUST HAVE)
- Direct messaging between members
- Message threads with read receipts
- Conversation list view
- Notification badge for unread messages

### 5. Company-Side Moderation (SHOULD HAVE)
- Admin dashboard to view all conversations
- Ability to enter/join any conversation (as "Upstream Literacy Team")
- Flag/remove inappropriate content
- View user activity metrics (sign-ups, messages sent, matches made)

### 6. Community Feed (NICE TO HAVE)
- Public discussion board / forum
- Posts tagged by problem area
- Upvoting and commenting
- Admin can pin/feature posts

## Data Model

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Users (literacy leaders)
users (
  id, email, password_hash, name, title,
  role ENUM('member','moderator','admin'),
  district_id FK, created_at, last_active_at
)

-- Districts (populated from NCES data)
districts (
  id, nces_id VARCHAR UNIQUE,
  name, state, city,
  type ENUM('urban','suburban','rural'),
  enrollment INT,
  free_reduced_lunch_pct FLOAT,
  esl_pct FLOAT,
  updated_at
)

-- Curated problem statements
problem_statements (
  id, title, description, category VARCHAR, display_order INT
)

-- User's selected problems (many-to-many)
user_problems (
  user_id FK, problem_id FK, selected_at
)

-- User's free-text challenge + embedding
user_profiles_extended (
  id, user_id FK UNIQUE,
  challenge_text TEXT,
  challenge_embedding VECTOR(1536),  -- OpenAI text-embedding-3-small
  bio TEXT,
  updated_at
)

-- Messages
conversations (
  id, created_at
)
conversation_participants (
  conversation_id FK, user_id FK, joined_at, last_read_at
)
messages (
  id, conversation_id FK, sender_id FK, body TEXT,
  is_system BOOLEAN DEFAULT FALSE,  -- for moderation messages
  created_at
)

-- Admin moderation log
moderation_actions (
  id, admin_id FK, target_type ENUM('user','message','conversation'),
  target_id INT, action ENUM('flag','remove','warn','join_conversation'),
  reason TEXT, created_at
)
```

## API Endpoints

```
# Auth
POST   /api/auth/register       — Create account
POST   /api/auth/login           — Returns JWT
GET    /api/auth/me              — Current user + profile

# Onboarding / Profile
GET    /api/districts/search     — Search NCES districts by name/state
GET    /api/districts/:id        — Get district demographics
GET    /api/problems             — List curated problem statements
PUT    /api/profile              — Update profile (district, problems, challenge text)

# Discovery & Matching
GET    /api/members/search       — Search/filter members
  Query params: district_type, size_min, size_max, frl_min, frl_max, esl_min, esl_max,
                state, problem_ids[], sort_by, page, limit
GET    /api/members/:id          — View member profile
GET    /api/members/recommended  — AI-recommended matches for current user
GET    /api/members/:id/commonality — What you have in common with this member

# Messaging
GET    /api/conversations                    — List conversations
POST   /api/conversations                    — Start conversation (recipient_id)
GET    /api/conversations/:id/messages       — Get messages (paginated)
POST   /api/conversations/:id/messages       — Send message
PUT    /api/conversations/:id/read           — Mark as read

# Admin / Moderation
GET    /api/admin/users                      — List all users (admin only)
GET    /api/admin/conversations              — List all conversations
POST   /api/admin/conversations/:id/join     — Join conversation as moderator
GET    /api/admin/stats                      — Platform metrics (sign-ups, messages, matches)
POST   /api/admin/moderation                 — Flag/remove content
```

## AI Matching Logic

### Matching Score Algorithm
```python
def calculate_match_score(user_a, user_b):
    # 1. Problem overlap (40% weight)
    shared_problems = set(user_a.problem_ids) & set(user_b.problem_ids)
    problem_score = len(shared_problems) / max(len(user_a.problem_ids), 1)

    # 2. Semantic similarity of free-text challenges (30% weight)
    if user_a.challenge_embedding and user_b.challenge_embedding:
        semantic_score = cosine_similarity(user_a.challenge_embedding, user_b.challenge_embedding)
    else:
        semantic_score = problem_score  # fallback to problem overlap

    # 3. Demographic similarity (30% weight)
    demo_score = average([
        1.0 if user_a.district.type == user_b.district.type else 0.0,
        1.0 - abs(user_a.district.enrollment - user_b.district.enrollment) / max_enrollment,
        1.0 - abs(user_a.district.frl_pct - user_b.district.frl_pct),
        1.0 - abs(user_a.district.esl_pct - user_b.district.esl_pct),
    ])

    return 0.4 * problem_score + 0.3 * semantic_score + 0.3 * demo_score
```

### Embedding Generation
- When user saves their free-text challenge, generate embedding via `text-embedding-3-small`
- Store in pgvector column
- Query nearest neighbors for semantic matching

## Project Structure

```
upstream-literacy/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── district.py
│   │   │   ├── problem.py
│   │   │   ├── message.py
│   │   │   └── moderation.py
│   │   ├── schemas/
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   ├── profile.py
│   │   │   ├── districts.py
│   │   │   ├── members.py
│   │   │   ├── conversations.py
│   │   │   └── admin.py
│   │   ├── services/
│   │   │   ├── matching.py      — Match score calculation
│   │   │   ├── embedding.py     — OpenAI embedding generation
│   │   │   └── nces.py          — NCES data import/lookup
│   │   ├── data/
│   │   │   └── nces_districts.csv  — Pre-downloaded NCES data
│   │   └── seed.py
│   ├── tests/
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.tsx           — App shell with nav
│   │   │   ├── MemberCard.tsx       — Search result card with match %
│   │   │   ├── FilterPanel.tsx      — Demographic sliders + problem filters
│   │   │   ├── MessageThread.tsx    — Conversation view
│   │   │   ├── MatchScore.tsx       — Visual match indicator
│   │   │   └── OnboardingWizard.tsx — Multi-step profile setup
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx        — Home with recommended matches
│   │   │   ├── Search.tsx           — Member discovery with filters
│   │   │   ├── Profile.tsx          — View/edit own profile
│   │   │   ├── MemberProfile.tsx    — View another member
│   │   │   ├── Messages.tsx         — Conversation list
│   │   │   ├── Conversation.tsx     — Message thread
│   │   │   └── admin/
│   │   │       ├── Dashboard.tsx    — Admin metrics
│   │   │       ├── Users.tsx        — User management
│   │   │       └── Moderation.tsx   — Conversation monitoring
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   └── auth.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── tsconfig.json
├── README.md
├── docker-compose.yml
└── DEMO_SCRIPT.md
```

## UI Guidelines

- **Clean, professional, educational feel** — think Notion meets LinkedIn
- **Tailwind CSS** — utility-first, fast to style
- Color scheme: deep blue primary (#1e3a5f), warm accent (#e8a838), white/light gray backgrounds
- **Dashboard:** recommended matches in card grid, each showing name, district, match %, shared problems
- **Search page:** left sidebar filters, right side results grid
- **Member profile:** demographics at top, shared problems highlighted, "Send Message" CTA
- **Responsive** — desktop-first but works on tablet/mobile

## Demo Narrative (3-5 min video)

1. **Onboarding** — Sign up as "Sarah Chen, Literacy Director, Denver Public Schools" → select district (auto-populates demographics) → choose problems: "Transitioning to structured literacy", "Supporting multilingual learners", "Managing post-ESSER budget"
2. **Dashboard** — See recommended matches: "You match 87% with Maria Rodriguez, El Paso ISD — she's also transitioning to structured literacy with a large ESL population"
3. **Search & Filter** — Filter for urban districts, 20%+ ESL, facing "curriculum implementation" → see ranked results with match scores
4. **View profile** — Click into a match, see what you have in common, read their challenge description
5. **Send message** — Start a conversation, receive a reply
6. **Admin view** — Switch to admin, see platform metrics, monitor conversations, join one as moderator
7. **Closing** — Show AI matching (semantic similarity on free-text challenges), explain tech stack, mention NCES data integration

## Seed Data

Pre-populate with ~20 realistic literacy leader profiles:
- Mix of urban/suburban/rural districts across different states
- Varied demographics (enrollment 2K-200K, FRL 15-85%, ESL 5-50%)
- Each with 2-4 selected problems and a free-text challenge
- Some with existing conversations
- **District data:** Import top 100 largest US school districts from NCES

### Sample Profiles:
- Sarah Chen, Literacy Director, Denver Public Schools (urban, 90K students, 62% FRL, 38% ESL)
- Marcus Williams, Asst. Superintendent, Birmingham City Schools (urban, 20K, 85% FRL, 8% ESL)
- Jennifer Park, Curriculum Coordinator, Naperville CUSD 203 (suburban, 17K, 12% FRL, 15% ESL)
- David Thornton, Reading Specialist, Elko County SD (rural, 10K, 42% FRL, 22% ESL)

## NCES Data Integration

Download district-level data from NCES:
- **Source:** https://nces.ed.gov/ccd/elsi/
- **Fields needed:** District name, state, locale code (urban/suburban/rural), total enrollment, free/reduced lunch count, EL (English Learner) count
- **Approach:** Pre-download CSV for the ~14,000 largest districts. Import into districts table at seed time.
- **Fallback:** If NCES API is unavailable, include a static CSV in the repo with the top 500 districts.

## Testing

- **Backend:** pytest — test matching algorithm (known inputs → expected scores), test auth, test CRUD, test embedding generation (mock OpenAI)
- **Frontend:** Vitest + React Testing Library — test key components (FilterPanel, MemberCard, OnboardingWizard)
- **Minimum:** Matching score calculation, search with filters, message send/receive, onboarding flow

## Deployment

### Backend (Railway)
- Dockerfile with Python 3.11+
- Railway PostgreSQL addon (ensure pgvector extension is available)
- Environment variables: DATABASE_URL, JWT_SECRET, OPENAI_API_KEY, CORS_ORIGINS

### Frontend (Vercel)
- `npm run build` (Vite)
- Environment: VITE_API_URL pointing to Railway backend
- vercel.json with SPA rewrites

## Environment Variables Needed

```
DATABASE_URL=postgresql://...        # Railway provides this
JWT_SECRET=...                       # Generate a random string
OPENAI_API_KEY=...                   # For embeddings (text-embedding-3-small)
CORS_ORIGINS=*                       # For development
```

## Default Ports

To avoid conflicts when multiple projects run in parallel:
- **Backend:** `http://localhost:8003`
- **Frontend:** `http://localhost:5173` (Vite default)
- **PostgreSQL:** Use Railway remote DB or local on default 5432

## Build & Verification Workflow

Follow this workflow when building. Do NOT consider the project done until all steps pass.

### Step 1: Build
Build the backend and React frontend following the architecture above.

### Step 2: Test in Chrome
Use Chrome browser automation tools to verify the app works end-to-end:
- Navigate to the frontend URL
- Complete the onboarding flow (select district, choose problems, write challenge)
- Test search with demographic filters and problem-based matching
- Verify match scores display and make sense
- Test messaging (send and receive)
- Test admin moderation view
- Verify "Leaders like you" recommendations on dashboard

### Step 3: Verify Assignment Requirements
Go through EVERY requirement from the assignment and verify it's implemented:
- [ ] Users enter the community and sort/filter who they engage with based on criteria
- [ ] Demographic matching auto-ingested from public sources (district type, size, FRL rates, ESL population)
- [ ] Problem statement matching from a curated pre-set list
- [ ] Users select which problems they face and system matches with others who selected the same
- [ ] Users can identify and message other members based on matching criteria
- [ ] Company-side moderation functionality to enter into conversations

If any requirement is missing or broken, fix it and re-test. **Iterate until all requirements pass.**

### Step 4: Write Demo Video Script
Create a `DEMO_SCRIPT.md` file with a 3-5 minute video script that Abhi will record himself. Include:
- Exact steps to walk through
- What to say at each step
- Which demo accounts to use
- Key points to highlight for Upstream Literacy evaluators (especially the AI matching)

### Step 5: Deploy
Deploy backend to Railway, frontend to Vercel. Verify deployed URLs work.

### Step 6: Final Polish
- README with screenshots, architecture, matching algorithm explanation, deployed URLs
- Seed data loaded on deployed instance (20+ realistic profiles)
- All tests passing

## Important Notes

- **This is AI-Solution.** The semantic matching on free-text challenges is what makes this more than a filtered directory. The AI must add real value.
- **Domain knowledge matters.** Use realistic literacy terminology (Science of Reading, HQIM, structured literacy, MTSS, phonics instruction, etc.). Show you understand the education space.
- **NCES data is real and public.** Using actual district demographics makes the demo credible and impressive.
- **The matching algorithm should be defensible.** Be able to explain why you weighted problem overlap at 40%, semantic at 30%, demographics at 30%.
- **Privacy consideration:** Even though this is a demo, treat district leader profiles with care. Don't use real people's names — create fictional but realistic profiles.
- **The README matters.** Include: what it is, screenshots, tech stack, matching algorithm explanation, NCES data source, how to run, deployed URLs.
