from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.district import District
from app.models.problem import ProblemStatement, UserProblem
from app.models.profile import UserProfileExtended
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, UserResponse
from app.services.auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        email=req.email,
        password_hash=hash_password(req.password),
        name=req.name,
        title=req.title,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token)


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    district = None
    if current_user.district_id:
        d = db.query(District).filter(District.id == current_user.district_id).first()
        if d:
            district = {
                "id": d.id, "nces_id": d.nces_id, "name": d.name,
                "state": d.state, "city": d.city, "type": d.type,
                "enrollment": d.enrollment,
                "free_reduced_lunch_pct": d.free_reduced_lunch_pct,
                "esl_pct": d.esl_pct,
            }

    problem_links = db.query(UserProblem).filter(UserProblem.user_id == current_user.id).all()
    problem_ids = [lnk.problem_id for lnk in problem_links]
    problems = db.query(ProblemStatement).filter(ProblemStatement.id.in_(problem_ids)).all() if problem_ids else []

    profile_ext = db.query(UserProfileExtended).filter(
        UserProfileExtended.user_id == current_user.id
    ).first()

    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "title": current_user.title,
        "role": current_user.role,
        "district_id": current_user.district_id,
        "district": district,
        "problems": [{"id": p.id, "title": p.title, "description": p.description, "category": p.category} for p in problems],
        "challenge_text": profile_ext.challenge_text if profile_ext else None,
        "bio": profile_ext.bio if profile_ext else None,
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
    }
