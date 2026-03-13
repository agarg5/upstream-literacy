from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ConversationParticipant(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    title: str


class MessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    sender_id: int
    sender_name: str
    body: str
    is_system: bool = False
    created_at: datetime


class ConversationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    participants: list[ConversationParticipant] = []
    last_message: Optional[MessageResponse] = None
    unread_count: int = 0
    created_at: datetime


class SendMessage(BaseModel):
    body: str = Field(..., min_length=1)


class CreateConversation(BaseModel):
    recipient_id: int
