from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field

from .district import DistrictResponse
from .problem import ProblemResponse


class MemberSearchParams(BaseModel):
    district_type: Optional[str] = None
    size_min: Optional[int] = None
    size_max: Optional[int] = None
    frl_min: Optional[float] = Field(default=None, ge=0, le=100)
    frl_max: Optional[float] = Field(default=None, ge=0, le=100)
    esl_min: Optional[float] = Field(default=None, ge=0, le=100)
    esl_max: Optional[float] = Field(default=None, ge=0, le=100)
    state: Optional[str] = None
    problem_ids: Optional[list[int]] = None
    sort_by: str = Field(default="best_match")
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=20, ge=1, le=100)


class MemberCard(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    title: str
    district: Optional[DistrictResponse] = None
    problems: list[ProblemResponse] = []
    match_score: Optional[float] = None
    shared_problems: Optional[list[ProblemResponse]] = None


class MemberProfile(MemberCard):
    challenge_text: Optional[str] = None
    bio: Optional[str] = None
    commonalities: Optional[dict[str, Any]] = None
