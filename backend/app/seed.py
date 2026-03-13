"""Seed script for Upstream Literacy platform.

Populates the database with NCES district data, curated problem statements,
20 fictional literacy leader profiles, an admin user, extended profiles with
challenge text and embeddings, and sample conversations.
"""

from app.database import SessionLocal, engine, Base
from app.models.user import User
from app.models.district import District
from app.models.problem import ProblemStatement, UserProblem
from app.models.profile import UserProfileExtended
from app.models.message import Conversation, ConversationParticipant, Message
from app.services.auth import hash_password
from app.services.nces import import_nces_data
from app.services.embedding import generate_embedding
import app.models  # noqa: F401 — register all models with SQLAlchemy

from datetime import datetime, timedelta
import random


# ---------------------------------------------------------------------------
# Problem statements (curated list)
# ---------------------------------------------------------------------------
PROBLEM_STATEMENTS = [
    {
        "title": "Implementing a new core curriculum",
        "description": "Planning and executing the rollout of a new core literacy curriculum across the district.",
        "category": "Curriculum",
        "display_order": 1,
    },
    {
        "title": "Transitioning from balanced literacy to structured literacy",
        "description": "Shifting instructional practices from balanced literacy to evidence-based structured literacy approaches.",
        "category": "Instruction",
        "display_order": 2,
    },
    {
        "title": "Improving K-2 foundational reading scores",
        "description": "Raising early literacy achievement in kindergarten through second grade.",
        "category": "Achievement",
        "display_order": 3,
    },
    {
        "title": "Supporting multilingual learners in literacy",
        "description": "Ensuring English learners and multilingual students receive effective literacy instruction.",
        "category": "Equity",
        "display_order": 4,
    },
    {
        "title": "Building teacher capacity in phonics instruction",
        "description": "Providing professional development so teachers deliver systematic, explicit phonics instruction.",
        "category": "Professional Development",
        "display_order": 5,
    },
    {
        "title": "Addressing chronic absenteeism affecting literacy outcomes",
        "description": "Tackling attendance issues that directly impact students' reading growth.",
        "category": "Student Support",
        "display_order": 6,
    },
    {
        "title": "Selecting and adopting HQIM (High-Quality Instructional Materials)",
        "description": "Evaluating and selecting evidence-aligned curriculum materials for district-wide adoption.",
        "category": "Curriculum",
        "display_order": 7,
    },
    {
        "title": "Aligning RTI/MTSS with science of reading",
        "description": "Restructuring tiered intervention systems to align with the science of reading research base.",
        "category": "Intervention",
        "display_order": 8,
    },
    {
        "title": "Managing post-ESSER budget constraints for literacy programs",
        "description": "Sustaining literacy initiatives as federal ESSER funding expires.",
        "category": "Budget",
        "display_order": 9,
    },
    {
        "title": "Scaling literacy coaching across the district",
        "description": "Expanding instructional coaching programs to support teachers in every building.",
        "category": "Professional Development",
        "display_order": 10,
    },
    {
        "title": "Engaging families in early literacy at home",
        "description": "Building family partnerships to reinforce literacy skills outside of school.",
        "category": "Family Engagement",
        "display_order": 11,
    },
    {
        "title": "Improving middle/high school reading comprehension",
        "description": "Strengthening reading comprehension and disciplinary literacy for adolescent learners.",
        "category": "Achievement",
        "display_order": 12,
    },
]

# ---------------------------------------------------------------------------
# User profiles (fictional names, real district names for NCES lookup)
# ---------------------------------------------------------------------------
SEED_USERS = [
    {
        "email": "sarah.chen@example.com",
        "name": "Sarah Chen",
        "title": "Literacy Director",
        "district_name": "Denver",
        "problem_indices": [1, 3, 8],
        "challenge_text": (
            "We are mid-transition from balanced literacy to structured literacy across 100+ "
            "schools, and our biggest hurdle is retraining veteran teachers who have used "
            "workshop-model approaches for over a decade while simultaneously supporting our "
            "large multilingual population."
        ),
    },
    {
        "email": "marcus.williams@example.com",
        "name": "Marcus Williams",
        "title": "Asst. Superintendent of Academics",
        "district_name": "Birmingham",
        "problem_indices": [2, 5, 8],
        "challenge_text": (
            "Our K-2 reading proficiency is at 22% and chronic absenteeism sits above 30%. "
            "We need to figure out how to raise foundational reading scores when a third of "
            "our students are missing critical instructional time."
        ),
    },
    {
        "email": "jennifer.park@example.com",
        "name": "Jennifer Park",
        "title": "Curriculum Coordinator",
        "district_name": "Naperville",
        "problem_indices": [0, 6, 4],
        "challenge_text": None,
    },
    {
        "email": "david.thornton@example.com",
        "name": "David Thornton",
        "title": "Reading Specialist",
        "district_name": "Elko",
        "problem_indices": [7, 9, 10],
        "challenge_text": (
            "In our rural district, we have limited access to literacy coaches and PD providers. "
            "I'm the only reading specialist for 15 schools spread across a vast geography, "
            "and we struggle to provide consistent tier-2 interventions."
        ),
    },
    {
        "email": "maria.rodriguez@example.com",
        "name": "Maria Rodriguez",
        "title": "Director of Bilingual Education",
        "district_name": "El Paso",
        "problem_indices": [3, 1, 10],
        "challenge_text": (
            "With 65% of our students classified as English learners, we need a structured "
            "literacy approach that honors bilingualism. Most HQIM options are English-only, "
            "and our dual-language programs need adapted materials."
        ),
    },
    {
        "email": "amanda.foster@example.com",
        "name": "Amanda Foster",
        "title": "Chief Academic Officer",
        "district_name": "Nashville",
        "problem_indices": [0, 8, 9],
        "challenge_text": None,
    },
    {
        "email": "james.morrison@example.com",
        "name": "James Morrison",
        "title": "Literacy Coach Lead",
        "district_name": "Portland",
        "problem_indices": [4, 9, 1],
        "challenge_text": (
            "We have 12 literacy coaches serving 80 schools and the coaching model is "
            "inconsistent. Some coaches focus on observation and feedback while others run "
            "small-group interventions. We need a unified coaching framework aligned to "
            "structured literacy."
        ),
    },
    {
        "email": "lisa.washington@example.com",
        "name": "Lisa Washington",
        "title": "Director of Curriculum & Instruction",
        "district_name": "DeKalb",
        "problem_indices": [6, 7, 2],
        "challenge_text": None,
    },
    {
        "email": "robert.kim@example.com",
        "name": "Robert Kim",
        "title": "Assistant Superintendent",
        "district_name": "Fairfax",
        "problem_indices": [3, 11, 6],
        "challenge_text": (
            "Our ESL population has grown 40% in five years and our secondary reading "
            "comprehension scores are declining. We need strategies that address both "
            "multilingual learners and adolescent literacy simultaneously."
        ),
    },
    {
        "email": "patricia.hernandez@example.com",
        "name": "Patricia Hernandez",
        "title": "Literacy Specialist",
        "district_name": "Tucson",
        "problem_indices": [3, 7, 8],
        "challenge_text": None,
    },
    {
        "email": "michael.obrien@example.com",
        "name": "Michael O'Brien",
        "title": "Reading First Coordinator",
        "district_name": "Boston",
        "problem_indices": [2, 4, 5],
        "challenge_text": (
            "Post-pandemic, our K-2 students are significantly behind in phonemic awareness "
            "and decoding. We adopted a new phonics program but teachers need intensive "
            "support to implement it with fidelity."
        ),
    },
    {
        "email": "aisha.johnson@example.com",
        "name": "Aisha Johnson",
        "title": "Director of Elementary Education",
        "district_name": "Charlotte",
        "problem_indices": [0, 2, 9],
        "challenge_text": (
            "We just adopted a new core curriculum for ELA and the implementation is uneven. "
            "Some schools are thriving while others have teachers reverting to old materials. "
            "We need a better coaching and monitoring strategy."
        ),
    },
    {
        "email": "thomas.garcia@example.com",
        "name": "Thomas Garcia",
        "title": "Curriculum Director",
        "district_name": "San Antonio",
        "problem_indices": [6, 3, 8],
        "challenge_text": None,
    },
    {
        "email": "rebecca.torres@example.com",
        "name": "Rebecca Torres",
        "title": "Literacy Program Manager",
        "district_name": "Austin",
        "problem_indices": [1, 10, 4],
        "challenge_text": (
            "Texas now mandates science-based reading instruction and we are scrambling to "
            "align our K-3 programs. We need peer districts who have successfully navigated "
            "the HB 4545 requirements while maintaining strong family engagement."
        ),
    },
    {
        "email": "daniel.wright@example.com",
        "name": "Daniel Wright",
        "title": "Chief Learning Officer",
        "district_name": "Columbus",
        "problem_indices": [8, 11, 5],
        "challenge_text": None,
    },
    {
        "email": "stephanie.lee@example.com",
        "name": "Stephanie Lee",
        "title": "Bilingual Literacy Coordinator",
        "district_name": "Houston",
        "problem_indices": [3, 10, 0],
        "challenge_text": None,
    },
    {
        "email": "christopher.davis@example.com",
        "name": "Christopher Davis",
        "title": "Director of Academic Services",
        "district_name": "Memphis",
        "problem_indices": [2, 5, 7, 8],
        "challenge_text": None,
    },
    {
        "email": "nicole.anderson@example.com",
        "name": "Nicole Anderson",
        "title": "Literacy Interventionist Lead",
        "district_name": "Milwaukee",
        "problem_indices": [7, 2, 9],
        "challenge_text": None,
    },
    {
        "email": "ryan.murphy@example.com",
        "name": "Ryan Murphy",
        "title": "Asst. Superintendent for Teaching & Learning",
        "district_name": "Boise",
        "problem_indices": [1, 4, 11],
        "challenge_text": None,
    },
    {
        "email": "kimberly.jackson@example.com",
        "name": "Kimberly Jackson",
        "title": "Director of ELA",
        "district_name": "Atlanta",
        "problem_indices": [0, 11, 9],
        "challenge_text": None,
    },
]

# ---------------------------------------------------------------------------
# Sample conversations
# ---------------------------------------------------------------------------
SAMPLE_CONVERSATIONS = [
    {
        "participants": ("sarah.chen@example.com", "maria.rodriguez@example.com"),
        "messages": [
            ("sarah.chen@example.com", "Hi Maria! I saw we're both working on the transition to structured literacy with large multilingual populations. How is El Paso approaching the dual-language piece?"),
            ("maria.rodriguez@example.com", "Hi Sarah! Great to connect. We're piloting a bilingual structured literacy framework in 5 schools this year. The biggest challenge has been finding materials that align with both SoR and biliteracy goals."),
            ("sarah.chen@example.com", "That's exactly our struggle too. Would you be open to a call next week to compare notes on materials you've evaluated?"),
            ("maria.rodriguez@example.com", "Absolutely! I'd love that. Let me know what works for your schedule."),
        ],
    },
    {
        "participants": ("marcus.williams@example.com", "michael.obrien@example.com"),
        "messages": [
            ("marcus.williams@example.com", "Michael, I noticed your district is also tackling K-2 foundational reading. Our scores are really low and we're looking for turnaround strategies. Any wins you can share?"),
            ("michael.obrien@example.com", "Marcus, we adopted UFLI Foundations last year and paired it with weekly coaching cycles. Early data shows 15% improvement in DIBELS composite scores at K-1. Happy to share our implementation plan."),
            ("marcus.williams@example.com", "That's incredible progress. We've been looking at UFLI as well. Would love to see your coaching cycle structure."),
        ],
    },
    {
        "participants": ("james.morrison@example.com", "aisha.johnson@example.com"),
        "messages": [
            ("james.morrison@example.com", "Aisha, I see you're scaling literacy coaching too. We're trying to build a unified coaching framework — how are you approaching consistency across buildings?"),
            ("aisha.johnson@example.com", "James! We created a coaching playbook with observation rubrics tied directly to our new curriculum. Coaches use it for every classroom visit. It's made a huge difference in consistency."),
        ],
    },
    {
        "participants": ("robert.kim@example.com", "patricia.hernandez@example.com"),
        "messages": [
            ("robert.kim@example.com", "Patricia, our districts seem to face similar challenges with ESL populations and aligning MTSS. Have you found any assessment tools that work well for multilingual learners in your RTI framework?"),
            ("patricia.hernandez@example.com", "Robert, we've been using IDEL alongside DIBELS for our Spanish-speaking students and MAP Reading Fluency for progress monitoring. It gives us a much better picture than English-only screeners."),
            ("robert.kim@example.com", "That's a great approach. We're currently English-only in our screening and I think it's masking needs. I'll look into IDEL."),
        ],
    },
    {
        "participants": ("rebecca.torres@example.com", "david.thornton@example.com"),
        "messages": [
            ("rebecca.torres@example.com", "David, I saw you're working on family engagement for early literacy in a rural district. We're trying to expand our family literacy nights but transportation is a barrier. Any creative solutions?"),
            ("david.thornton@example.com", "Rebecca, we moved most of our family engagement to a hybrid model — short video tutorials parents can watch at home plus monthly in-person events at community centers rather than schools. Participation doubled."),
            ("rebecca.torres@example.com", "Hybrid is smart. We haven't tried the video approach yet. Would you be willing to share some of your materials?"),
            ("david.thornton@example.com", "Of course! I'll put together a shared folder with our parent-facing videos and facilitator guides. They're in English and Spanish."),
        ],
    },
]


def seed_problems(db) -> list[ProblemStatement]:
    """Insert curated problem statements if they don't already exist."""
    existing = db.query(ProblemStatement).first()
    if existing:
        print("Problem statements already exist — skipping.")
        return db.query(ProblemStatement).order_by(ProblemStatement.display_order).all()

    problems = []
    for ps in PROBLEM_STATEMENTS:
        problem = ProblemStatement(**ps)
        db.add(problem)
        problems.append(problem)

    db.commit()
    for p in problems:
        db.refresh(p)
    print(f"Inserted {len(problems)} problem statements.")
    return problems


def find_district(db, name_fragment: str) -> District | None:
    """Look up a district by partial name match (case-insensitive)."""
    return (
        db.query(District)
        .filter(District.name.ilike(f"%{name_fragment}%"))
        .first()
    )


def seed_users(db, problems: list[ProblemStatement]) -> list[User]:
    """Create 20 seed member users and link them to districts & problems."""
    existing = db.query(User).filter(User.email == SEED_USERS[0]["email"]).first()
    if existing:
        print("Seed users already exist — skipping.")
        return db.query(User).filter(User.role == "member").all()

    created_users: list[User] = []
    password_hash = hash_password("password123")
    now = datetime.utcnow()

    for i, u in enumerate(SEED_USERS):
        district = find_district(db, u["district_name"])
        if district is None:
            print(f"  WARNING: District matching '{u['district_name']}' not found — skipping {u['name']}")
            continue

        user = User(
            email=u["email"],
            password_hash=password_hash,
            name=u["name"],
            title=u["title"],
            role="member",
            district_id=district.id,
            created_at=now - timedelta(days=random.randint(1, 90)),
            last_active_at=now - timedelta(hours=random.randint(0, 72)),
        )
        db.add(user)
        db.flush()  # get user.id

        # Assign problems
        for idx in u["problem_indices"]:
            if idx < len(problems):
                up = UserProblem(
                    user_id=user.id,
                    problem_id=problems[idx].id,
                    selected_at=user.created_at,
                )
                db.add(up)

        created_users.append(user)

    db.commit()
    print(f"Created {len(created_users)} seed users.")
    return created_users


def seed_admin(db) -> User:
    """Create the admin user if it doesn't exist."""
    existing = db.query(User).filter(User.email == "admin@upstreamliteracy.com").first()
    if existing:
        print("Admin user already exists — skipping.")
        return existing

    admin = User(
        email="admin@upstreamliteracy.com",
        password_hash=hash_password("admin123"),
        name="Upstream Literacy Team",
        title="Platform Administrator",
        role="admin",
        district_id=None,
        created_at=datetime.utcnow() - timedelta(days=120),
        last_active_at=datetime.utcnow(),
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    print("Created admin user (admin@upstreamliteracy.com).")
    return admin


def seed_extended_profiles(db):
    """Add free-text challenge descriptions (and embeddings) for users that have them."""
    for u_data in SEED_USERS:
        if u_data["challenge_text"] is None:
            continue

        user = db.query(User).filter(User.email == u_data["email"]).first()
        if user is None:
            continue

        existing = db.query(UserProfileExtended).filter(UserProfileExtended.user_id == user.id).first()
        if existing:
            continue

        embedding = None
        try:
            emb = generate_embedding(u_data["challenge_text"])
            if emb:
                embedding = emb
        except Exception as exc:
            print(f"  Could not generate embedding for {user.name}: {exc}")

        profile = UserProfileExtended(
            user_id=user.id,
            challenge_text=u_data["challenge_text"],
            challenge_embedding=embedding,
            bio=None,
            updated_at=datetime.utcnow(),
        )
        db.add(profile)

    db.commit()
    count = db.query(UserProfileExtended).count()
    print(f"Extended profiles with challenge text: {count}")


def seed_conversations(db):
    """Create sample conversations between users."""
    existing = db.query(Conversation).first()
    if existing:
        print("Conversations already exist — skipping.")
        return

    now = datetime.utcnow()

    for i, convo_data in enumerate(SAMPLE_CONVERSATIONS):
        # Look up participant users
        p1 = db.query(User).filter(User.email == convo_data["participants"][0]).first()
        p2 = db.query(User).filter(User.email == convo_data["participants"][1]).first()
        if p1 is None or p2 is None:
            print(f"  Skipping conversation {i+1} — participant not found.")
            continue

        convo = Conversation(
            created_at=now - timedelta(days=random.randint(3, 30)),
        )
        db.add(convo)
        db.flush()

        # Add participants
        for participant in (p1, p2):
            cp = ConversationParticipant(
                conversation_id=convo.id,
                user_id=participant.id,
                joined_at=convo.created_at,
                last_read_at=now - timedelta(hours=random.randint(0, 24)),
            )
            db.add(cp)

        # Add messages
        base_time = convo.created_at
        for j, (sender_email, body) in enumerate(convo_data["messages"]):
            sender = p1 if sender_email == p1.email else p2
            msg = Message(
                conversation_id=convo.id,
                sender_id=sender.id,
                body=body,
                is_system=False,
                created_at=base_time + timedelta(hours=j * 2 + random.randint(0, 60) / 60.0),
            )
            db.add(msg)

    db.commit()
    count = db.query(Conversation).count()
    print(f"Created {count} sample conversations.")


def run_seed():
    """Main seed entry point."""
    print("=" * 60)
    print("Upstream Literacy — Database Seed")
    print("=" * 60)

    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("Database tables created (or verified).")

    db = SessionLocal()
    try:
        # 1. Import NCES districts
        print("\n--- Importing NCES district data ---")
        import_nces_data(db)

        # 2. Seed problem statements
        print("\n--- Seeding problem statements ---")
        problems = seed_problems(db)

        # 3. Seed member users
        print("\n--- Seeding user profiles ---")
        seed_users(db, problems)

        # 4. Seed admin user
        print("\n--- Seeding admin user ---")
        seed_admin(db)

        # 5. Seed extended profiles with challenge text + embeddings
        print("\n--- Seeding extended profiles ---")
        seed_extended_profiles(db)

        # 6. Seed conversations
        print("\n--- Seeding sample conversations ---")
        seed_conversations(db)

        print("\n" + "=" * 60)
        print("Seed complete!")
        print("=" * 60)
    finally:
        db.close()


if __name__ == "__main__":
    run_seed()
