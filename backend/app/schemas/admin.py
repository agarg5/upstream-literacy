from pydantic import BaseModel, Field


class AdminStatsResponse(BaseModel):
    total_users: int
    total_conversations: int
    total_messages: int
    active_users_7d: int
    matches_made: int


class ModerationActionCreate(BaseModel):
    target_type: str = Field(..., pattern=r"^(user|message|conversation)$")
    target_id: int
    action: str = Field(..., pattern=r"^(flag|remove|warn|join_conversation)$")
    reason: str
