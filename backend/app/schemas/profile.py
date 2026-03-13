from typing import Optional

from pydantic import BaseModel, ConfigDict

from .district import DistrictResponse
from .problem import ProblemResponse


class ProfileUpdate(BaseModel):
    district_id: Optional[int] = None
    problem_ids: Optional[list[int]] = None
    challenge_text: Optional[str] = None
    bio: Optional[str] = None
    name: Optional[str] = None
    title: Optional[str] = None


class ProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    name: str
    title: str
    role: str
    district: Optional[DistrictResponse] = None
    problems: list[ProblemResponse] = []
    challenge_text: Optional[str] = None
    bio: Optional[str] = None
