from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=False)
    title = Column(String, nullable=True)
    role = Column(String, nullable=False, default="member")  # member, moderator, admin
    district_id = Column(Integer, ForeignKey("districts.id"), nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    last_active_at = Column(DateTime, nullable=True, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    district = relationship("District", back_populates="users")
    profile_extended = relationship("UserProfileExtended", back_populates="user", uselist=False)
    problems = relationship("UserProblem", back_populates="user")
    sent_messages = relationship("Message", back_populates="sender")
    conversation_participations = relationship("ConversationParticipant", back_populates="user")
    moderation_actions = relationship("ModerationAction", back_populates="admin")
