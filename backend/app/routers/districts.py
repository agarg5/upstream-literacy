from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models.district import District

router = APIRouter(prefix="/api/districts", tags=["districts"])


@router.get("/search")
def search_districts(
    query: str = Query("", min_length=0),
    state: str = Query(None),
    limit: int = Query(20, le=100),
    db: Session = Depends(get_db),
):
    q = db.query(District)
    if query:
        q = q.filter(District.name.ilike(f"%{query}%"))
    if state:
        q = q.filter(District.state == state)
    districts = q.order_by(District.enrollment.desc()).limit(limit).all()
    return [
        {
            "id": d.id, "nces_id": d.nces_id, "name": d.name,
            "state": d.state, "city": d.city, "type": d.type,
            "enrollment": d.enrollment,
            "free_reduced_lunch_pct": d.free_reduced_lunch_pct,
            "esl_pct": d.esl_pct,
        }
        for d in districts
    ]


@router.get("/{district_id}")
def get_district(district_id: int, db: Session = Depends(get_db)):
    d = db.query(District).filter(District.id == district_id).first()
    if not d:
        return {"error": "Not found"}
    return {
        "id": d.id, "nces_id": d.nces_id, "name": d.name,
        "state": d.state, "city": d.city, "type": d.type,
        "enrollment": d.enrollment,
        "free_reduced_lunch_pct": d.free_reduced_lunch_pct,
        "esl_pct": d.esl_pct,
    }
