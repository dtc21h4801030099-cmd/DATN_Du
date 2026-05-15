from datetime import datetime
from pydantic import BaseModel, field_validator


class MajorCreate(BaseModel):
    name: str
    code: str | None = None
    description: str | None = None
    subject_group: str | None = None
    benchmark: float
    quota: int
    university_id: int

    @field_validator('benchmark')
    @classmethod
    def validate_benchmark(cls, v):
        if v < 0 or v > 30:
            raise ValueError('Điểm chuẩn phải nằm trong khoảng 0 đến 30')
        return v

    @field_validator('quota')
    @classmethod
    def validate_quota(cls, v):
        if v < 0:
            raise ValueError('Chỉ tiêu không được âm')
        return v


class MajorUpdate(BaseModel):
    name: str | None = None
    code: str | None = None
    description: str | None = None
    subject_group: str | None = None
    benchmark: float | None = None
    quota: int | None = None
    university_id: int | None = None

    @field_validator('benchmark')
    @classmethod
    def validate_benchmark(cls, v):
        if v is not None and (v < 0 or v > 30):
            raise ValueError('Điểm chuẩn phải nằm trong khoảng 0 đến 30')
        return v


class MajorOut(BaseModel):
    id: int
    name: str
    code: str | None
    description: str | None
    subject_group: str | None
    benchmark: float | None
    quota: int | None
    university_id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class MajorWithUniversity(MajorOut):
    university_name: str | None = None
    approved_count: int = 0
