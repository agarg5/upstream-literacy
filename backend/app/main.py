from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.database import engine, Base
from app.routers import auth, profile, districts, problems, members, conversations, admin

# Import models so they register with Base
import app.models  # noqa

settings = get_settings()

app = FastAPI(title="Upstream Literacy API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(districts.router)
app.include_router(problems.router)
app.include_router(members.router)
app.include_router(conversations.router)
app.include_router(admin.router)


@app.on_event("startup")
def on_startup():
    from sqlalchemy import text
    Base.metadata.create_all(bind=engine)
    # Auto-seed if the database is empty (first deploy)
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT COUNT(*) FROM users"))
            count = result.scalar()
        if count == 0:
            from app.seed import run_seed
            run_seed()
    except Exception as e:
        print(f"Auto-seed check/run failed (may be first startup): {e}")


@app.get("/api/health")
def health():
    return {"status": "ok"}
