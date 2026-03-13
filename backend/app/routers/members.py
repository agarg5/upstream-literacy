from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models.user import User
from app.models.district import District
from app.models.problem import ProblemStatement, UserProblem
from app.models.profile import UserProfileExtended
from app.services.auth import get_current_user
from app.services.matching import calculate_match_score, get_shared_problems

router = APIRouter(prefix="/api/members", tags=["members"])


def _build_user_data(user, db):
    """Build dict with user data needed for matching."""
    problem_links = db.query(UserProblem).filter(UserProblem.user_id == user.id).all()
    problem_ids = [lnk.problem_id for lnk in problem_links]
    problems = db.query(ProblemStatement).filter(ProblemStatement.id.in_(problem_ids)).all() if problem_ids else []
    district = db.query(District).filter(District.id == user.district_id).first() if user.district_id else None
    profile_ext = db.query(UserProfileExtended).filter(UserProfileExtended.user_id == user.id).first()

    return {
        "user": user,
        "problem_ids": problem_ids,
        "problems": [{"id": p.id, "title": p.title, "description": p.description, "category": p.category} for p in problems],
        "district": district,
        "district_type": district.type if district else None,
        "enrollment": district.enrollment if district else 0,
        "frl_pct": district.free_reduced_lunch_pct if district else 0,
        "esl_pct": district.esl_pct if district else 0,
        "challenge_embedding": list(profile_ext.challenge_embedding) if profile_ext and profile_ext.challenge_embedding is not None and len(profile_ext.challenge_embedding) > 0 else None,
        "challenge_text": profile_ext.challenge_text if profile_ext else None,
        "bio": profile_ext.bio if profile_ext else None,
    }


def _format_member(user_data, match_score=None, shared_problems=None):
    user = user_data["user"]
    district = user_data["district"]
    return {
        "id": user.id,
        "name": user.name,
        "title": user.title,
        "district": {
            "id": district.id, "nces_id": district.nces_id, "name": district.name,
            "state": district.state, "city": district.city, "type": district.type,
            "enrollment": district.enrollment,
            "free_reduced_lunch_pct": district.free_reduced_lunch_pct,
            "esl_pct": district.esl_pct,
        } if district else None,
        "problems": user_data["problems"],
        "match_score": round(match_score * 100) if match_score is not None else None,
        "shared_problems": shared_problems or [],
        "challenge_text": user_data.get("challenge_text"),
        "bio": user_data.get("bio"),
    }


@router.get("/search")
def search_members(
    district_type: Optional[str] = Query(None),
    size_min: Optional[int] = Query(None),
    size_max: Optional[int] = Query(None),
    frl_min: Optional[float] = Query(None),
    frl_max: Optional[float] = Query(None),
    esl_min: Optional[float] = Query(None),
    esl_max: Optional[float] = Query(None),
    state: Optional[str] = Query(None),
    problem_ids: Optional[str] = Query(None),  # comma-separated
    sort_by: str = Query("best_match"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(User).filter(User.id != current_user.id, User.role != "admin")

    # Join with district for filtering
    if any([district_type, size_min, size_max, frl_min, frl_max, esl_min, esl_max, state]):
        q = q.join(District, User.district_id == District.id)
        if district_type:
            q = q.filter(District.type == district_type)
        if size_min is not None:
            q = q.filter(District.enrollment >= size_min)
        if size_max is not None:
            q = q.filter(District.enrollment <= size_max)
        if frl_min is not None:
            q = q.filter(District.free_reduced_lunch_pct >= frl_min)
        if frl_max is not None:
            q = q.filter(District.free_reduced_lunch_pct <= frl_max)
        if esl_min is not None:
            q = q.filter(District.esl_pct >= esl_min)
        if esl_max is not None:
            q = q.filter(District.esl_pct <= esl_max)
        if state:
            q = q.filter(District.state == state)

    # Filter by problem IDs
    target_problem_ids = []
    if problem_ids:
        target_problem_ids = [int(x) for x in problem_ids.split(",") if x.strip()]
        if target_problem_ids:
            user_ids_with_problems = (
                db.query(UserProblem.user_id)
                .filter(UserProblem.problem_id.in_(target_problem_ids))
                .distinct()
                .all()
            )
            matching_user_ids = [uid for (uid,) in user_ids_with_problems]
            q = q.filter(User.id.in_(matching_user_ids))

    users = q.all()

    # Build current user data for matching
    current_data = _build_user_data(current_user, db)

    # Score and sort
    results = []
    for user in users:
        user_data = _build_user_data(user, db)
        score = calculate_match_score(current_data, user_data)
        shared = get_shared_problems(current_data["problems"], user_data["problems"])
        results.append((user_data, score, shared))

    if sort_by == "best_match":
        results.sort(key=lambda x: x[1], reverse=True)
    elif sort_by == "district_similarity":
        results.sort(key=lambda x: x[1], reverse=True)  # already weighted
    elif sort_by == "recently_active":
        results.sort(key=lambda x: x[0]["user"].last_active_at or x[0]["user"].created_at, reverse=True)

    # Paginate
    start = (page - 1) * limit
    page_results = results[start:start + limit]

    return {
        "total": len(results),
        "page": page,
        "limit": limit,
        "results": [_format_member(ud, score, shared) for ud, score, shared in page_results],
    }


@router.get("/recommended")
def recommended_members(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """AI-recommended matches for current user."""
    other_users = db.query(User).filter(User.id != current_user.id, User.role != "admin").all()
    current_data = _build_user_data(current_user, db)

    results = []
    for user in other_users:
        user_data = _build_user_data(user, db)
        score = calculate_match_score(current_data, user_data)
        shared = get_shared_problems(current_data["problems"], user_data["problems"])
        results.append((user_data, score, shared))

    results.sort(key=lambda x: x[1], reverse=True)
    top = results[:10]

    return [_format_member(ud, score, shared) for ud, score, shared in top]


@router.get("/{member_id}")
def get_member(
    member_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == member_id).first()
    if not user:
        return {"error": "Not found"}

    user_data = _build_user_data(user, db)
    current_data = _build_user_data(current_user, db)
    score = calculate_match_score(current_data, user_data)
    shared = get_shared_problems(current_data["problems"], user_data["problems"])

    result = _format_member(user_data, score, shared)
    result["commonalities"] = {
        "shared_problems": shared,
        "same_district_type": current_data["district_type"] == user_data["district_type"],
        "similar_size": abs((current_data.get("enrollment", 0) - user_data.get("enrollment", 0))) < 20000,
        "similar_frl": abs((current_data.get("frl_pct", 0) - user_data.get("frl_pct", 0))) < 0.15,
        "similar_esl": abs((current_data.get("esl_pct", 0) - user_data.get("esl_pct", 0))) < 0.15,
    }
    return result
