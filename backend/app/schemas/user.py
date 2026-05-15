import re
from datetime import datetime, date
from pydantic import BaseModel, EmailStr, field_validator
from typing import Literal


def _validate_phone(v: str | None) -> str | None:
    if v is None or v == '':
        return v
    if not re.match(r'^0\d{9}$', v):
        raise ValueError('Số điện thoại phải gồm 10 chữ số và bắt đầu bằng số 0')
    return v


class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    phone: str | None = None
    password: str

    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v):
        return _validate_phone(v)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    full_name: str
    email: str
    phone: str | None
    date_of_birth: date | None
    gender: str | None
    address: str | None
    interests: str | None
    role: str
    is_locked: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    full_name: str | None = None
    phone: str | None = None
    date_of_birth: date | None = None
    gender: str | None = None
    address: str | None = None
    interests: str | None = None

    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v):
        return _validate_phone(v)


class PasswordChange(BaseModel):
    old_password: str
    new_password: str


class AdminPasswordReset(BaseModel):
    new_password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
