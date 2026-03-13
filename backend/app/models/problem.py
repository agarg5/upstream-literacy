from datetime import datetime

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class ProblemStatement(Base):
    __tablename__ = "problem_statements"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String, nullable=True)
    display_order = Column(Integer, nullable=True, default=0)

    # Relationships
    user_problems = relationship("UserProblem", back_populates="problem")


class UserProblem(Base):
    __tablename__ = "user_problems"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    problem_id = Column(Integer, ForeignKey("problem_statements.id"), primary_key=True)
    selected_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="problems")
    problem = relationship("ProblemStatement", back_populates="user_problems")
