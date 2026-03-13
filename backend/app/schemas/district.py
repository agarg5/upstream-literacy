from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class DistrictResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nces_id: str
    name: str
    state: str
    city: str
    type: str
    enrollment: int
    free_reduced_lunch_pct: float
    esl_pct: float


class DistrictSearchParams(BaseModel):
    query: str
    state: Optional[str] = None
    limit: int = Field(default=20, ge=1, le=100)
