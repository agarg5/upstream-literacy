# Demo Script: Upstream Literacy Community Platform (3-5 min)

A walkthrough script for recording the demo video. Abhi will screen-record while narrating.

---

## Setup

- Have the app open at `http://localhost:5173` (or the deployed Vercel URL)
- Open two browser tabs:
  - **Tab 1 (Member):** Login as Sarah Chen — `sarah.chen@example.com` / `password123`
  - **Tab 2 (Admin):** Login as Admin — `admin@upstreamliteracy.com` / `admin123`
- Start with Tab 1 active

---

## Act 1: Onboarding and Profile (45 seconds)

### Steps
1. Open the app landing page. Show the login/register screen briefly.
2. Mention: "New users go through a guided onboarding where they search for their school district by name, select it, and the system auto-populates demographics from real NCES public data."
3. Login as Sarah Chen (`sarah.chen@example.com` / `password123`).
4. Once on the Dashboard, pause to show the welcome section and Sarah's profile summary.

### What to Say
> "This is the Upstream Literacy community platform — a place where K-12 literacy leaders find and connect with peers facing similar challenges."
>
> "When a new user signs up, they search for their district and the system pulls in real demographic data from the National Center for Education Statistics. District type, enrollment, free and reduced lunch rates, ESL population — all auto-populated. No manual data entry."
>
> "Here we're logged in as Sarah Chen, Literacy Director at Denver Public Schools. You can see her district is urban, about 90,000 students, 62% free and reduced lunch, 38% ESL."

### Key Points to Highlight
- NCES data integration is real, not mocked — over 100 districts imported from public data
- Users also select from 12 curated problem statements relevant to literacy leadership (structured literacy, HQIM adoption, multilingual learners, etc.)
- Optional free-text challenge description enables AI semantic matching

---

## Act 2: AI-Powered Matching (60 seconds)

### Steps
1. On the Dashboard, scroll to the "Leaders Like You" recommendation section.
2. Point out the match percentage on each recommended leader card.
3. Explain the matching algorithm.
4. Click into Maria Rodriguez's profile (should show ~66% match or similar).
5. On Maria's profile, highlight the "What You Have in Common" section.

### What to Say
> "The dashboard shows recommended matches — leaders the AI thinks Sarah should connect with. Each card shows a match score."
>
> "The matching engine scores leaders based on three weighted factors: 40% problem statement overlap — do they face the same challenges? 30% semantic similarity — even if they described their challenges differently, the AI finds conceptual overlap using OpenAI embeddings. And 30% demographic similarity — similar district type, size, and student demographics."
>
> "Let's look at Maria Rodriguez from El Paso ISD. She's a 66% match. Both are in urban districts, both are working on transitioning to structured literacy and supporting multilingual learners. Maria's ESL population is 52%, Sarah's is 38% — similar enough to have meaningful conversations about what works."
>
> "This isn't just a directory with filters. The AI finds connections that a keyword search would miss."

### Key Points to Highlight
- The 40/30/30 weighting is intentional: problem overlap matters most because that drives the most valuable conversations
- Semantic matching catches cases where two leaders describe the same challenge differently
- Demographic similarity ensures recommendations are contextually relevant — a rural district of 2,000 students faces different constraints than an urban district of 200,000

---

## Act 3: Search and Filter (45 seconds)

### Steps
1. Navigate to the "Find Leaders" / Search page from the top navigation.
2. Show the filter panel on the left side.
3. Apply filters: select "Urban" for district type, set ESL minimum to 20%.
4. Show the results update with match scores.
5. Add a problem filter — select "Supporting multilingual learners."
6. Show how results narrow and match scores adjust.

### What to Say
> "Beyond recommendations, leaders can search and filter the full community. The filter panel lets you narrow by district type, enrollment range, free and reduced lunch rate, ESL population, and state."
>
> "Let's say Sarah wants to find other urban district leaders with significant ESL populations. I'll set district type to urban and ESL to 20% or higher."
>
> "Results update with match scores. Now I'll add a problem filter — Supporting multilingual learners. The results narrow to leaders who specifically selected that challenge, and match scores reflect the overlap."
>
> "You can sort by best match, problem overlap, or demographic similarity depending on what matters most for your search."

### Key Points to Highlight
- Filters use real NCES demographic data, not self-reported
- Problem-based filtering is the assignment's core requirement — users find peers by shared challenges
- Match scores dynamically update based on filter context

---

## Act 4: Messaging (45 seconds)

### Steps
1. From Maria Rodriguez's profile, click the "Send Message" button.
2. If there's an existing conversation, show it. If not, send a new message.
3. Show the conversation with realistic literacy-focused content.
4. Navigate to the Messages page to show the conversation list with unread indicators.

### What to Say
> "Once you find a relevant peer, you can message them directly. Let's message Maria."
>
> "Here's an existing conversation — Sarah asked Maria about her experience transitioning to structured literacy, and Maria shared how El Paso ISD approached HQIM selection with their multilingual population in mind."
>
> "The messaging system supports threaded conversations with read receipts. On the Messages page, you can see all your conversations with unread indicators."

### Key Points to Highlight
- Messaging is the core engagement mechanism — the platform's value is in connecting leaders
- Conversations use realistic literacy terminology (HQIM, structured literacy, MTSS, Science of Reading)
- Read receipts and unread badges support ongoing engagement

---

## Act 5: Admin Moderation (45 seconds)

### Steps
1. Switch to Tab 2 (Admin account) or open a new tab and login as `admin@upstreamliteracy.com` / `admin123`.
2. Show the Admin Dashboard with platform metrics (total users, conversations, messages, matches made).
3. Navigate to the Moderation section.
4. Show the list of all platform conversations.
5. Click "Join Conversation" on one of them.
6. Show the system message: "Upstream Literacy Team has joined the conversation."

### What to Say
> "Now let's look at the company side. Logged in as an admin, we see platform-wide metrics — total members, active conversations, messages sent, and matches made."
>
> "The moderation view shows every conversation on the platform. The admin can monitor activity, flag content if needed, and most importantly, join any conversation directly."
>
> "When I click Join Conversation, a system message appears: 'Upstream Literacy Team has joined the conversation.' This lets the company provide support, facilitate introductions, or moderate when needed — which is exactly what Upstream Literacy needs to manage their community."

### Key Points to Highlight
- Company-side moderation is a specific requirement from the assignment
- Admins can see all conversations and enter them as "Upstream Literacy Team"
- Platform metrics give visibility into community health and engagement
- Moderation actions are logged for accountability

---

## Closing (30 seconds)

### What to Say
> "To recap the tech stack: React frontend with Tailwind CSS, FastAPI backend, PostgreSQL with pgvector for embedding storage. AI matching uses OpenAI's text-embedding-3-small model to generate embeddings for free-text challenge descriptions, enabling semantic similarity search."
>
> "District demographics come from real NCES public data — not mocked. The matching algorithm combines problem overlap, semantic similarity, and demographic similarity to surface the most relevant peer connections."
>
> "This platform gives Upstream Literacy everything they need to launch a community where district literacy leaders find peers, share what's working, and get support — powered by intelligent matching that goes beyond simple filters."

### Key Points to Highlight
- AI is the core differentiator: semantic matching on challenge descriptions finds connections keyword search would miss
- Real NCES data makes demographics credible and eliminates manual data entry
- Full messaging and moderation enables community management at scale
- Built for the Science of Reading legislative moment — districts need peer connections now

---

## Backup Notes

If something doesn't load or behaves unexpectedly during recording:
- Refresh the page and try again
- If the backend is slow, mention "connecting to the database" and wait
- If match scores look different than expected, that's fine — they're dynamically calculated based on the full profile data
- The seed data includes 20+ realistic profiles, so there should always be meaningful search results and recommendations
