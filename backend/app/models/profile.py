from datetime import datetime

from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship

from app.database import Base


class UserProfileExtended(Base):
    __tablename__ = "user_profiles_extended"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    challenge_text = Column(Text, nullable=True)
    challenge_embedding = Column(JSON, nullable=True)  # list[float] of length 1536
    bio = Column(Text, nullable=True)
    updated_at = Column(DateTime, nullable=True, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="profile_extended")
