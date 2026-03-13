from typing import Optional

from pydantic import BaseModel, ConfigDict


class ProblemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    display_order: int
