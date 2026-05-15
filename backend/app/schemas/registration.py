from datetime import datetime
from pydantic import BaseModel


class RegistrationCreate(BaseModel):
    major_id: int
    expected_score: float | None = None
    subject_group: str | None = None
    notes: str | None = None


class RegistrationStatusUpdate(BaseModel):
    status: str  # pending | approved | rejected


class RegistrationOut(BaseModel):
    id: int
    user_id: int
    major_id: int
    expected_score: float | None
    subject_group: str | None
    notes: str | None
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class RegistrationWithDetails(RegistrationOut):
    user_name: str | None = None
    user_email: str | None = None
    major_name: str | None = None
    university_name: str | None = None
    major_quota: int | None = None
    major_approved_count: int | None = None
