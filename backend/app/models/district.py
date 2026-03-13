from datetime import datetime

from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.orm import relationship

from app.database import Base


class District(Base):
    __tablename__ = "districts"

    id = Column(Integer, primary_key=True, index=True)
    nces_id = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
    state = Column(String, nullable=False)
    city = Column(String, nullable=True)
    type = Column(String, nullable=True)  # urban, suburban, rural
    enrollment = Column(Integer, nullable=True)
    free_reduced_lunch_pct = Column(Float, nullable=True)
    esl_pct = Column(Float, nullable=True)
    updated_at = Column(DateTime, nullable=True, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    users = relationship("User", back_populates="district")
