from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.problem import UserProblem
from app.models.profile import UserProfileExtended
from app.schemas.profile import ProfileUpdate
from app.services.auth import get_current_user
from app.services.embedding import generate_embedding
from datetime import datetime

router = APIRouter(prefix="/api/profile", tags=["profile"])


@router.put("")
def update_profile(req: ProfileUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if req.name is not None:
        current_user.name = req.name
    if req.title is not None:
        current_user.title = req.title
    if req.district_id is not None:
        current_user.district_id = req.district_id

    if req.problem_ids is not None:
        db.query(UserProblem).filter(UserProblem.user_id == current_user.id).delete()
        for pid in req.problem_ids:
            db.add(UserProblem(user_id=current_user.id, problem_id=pid))

    profile_ext = db.query(UserProfileExtended).filter(
        UserProfileExtended.user_id == current_user.id
    ).first()
    if not profile_ext:
        profile_ext = UserProfileExtended(user_id=current_user.id)
        db.add(profile_ext)

    if req.challenge_text is not None:
        profile_ext.challenge_text = req.challenge_text
        if req.challenge_text.strip():
            embedding = generate_embedding(req.challenge_text)
            if embedding:
                profile_ext.challenge_embedding = embedding
        profile_ext.updated_at = datetime.utcnow()

    if req.bio is not None:
        profile_ext.bio = req.bio
        profile_ext.updated_at = datetime.utcnow()

    current_user.last_active_at = datetime.utcnow()
    db.commit()
    return {"status": "ok"}
