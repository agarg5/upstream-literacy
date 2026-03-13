from datetime import datetime

from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector

from app.database import Base


class UserProfileExtended(Base):
    __tablename__ = "user_profiles_extended"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    challenge_text = Column(Text, nullable=True)
    challenge_embedding = Column(Vector(1536), nullable=True)
    bio = Column(Text, nullable=True)
    updated_at = Column(DateTime, nullable=True, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="profile_extended")
