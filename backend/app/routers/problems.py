from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.problem import ProblemStatement

router = APIRouter(prefix="/api/problems", tags=["problems"])


@router.get("")
def list_problems(db: Session = Depends(get_db)):
    problems = db.query(ProblemStatement).order_by(ProblemStatement.display_order).all()
    return [
        {"id": p.id, "title": p.title, "description": p.description, "category": p.category, "display_order": p.display_order}
        for p in problems
    ]
