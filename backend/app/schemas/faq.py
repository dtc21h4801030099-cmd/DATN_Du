from datetime import datetime
from pydantic import BaseModel


class FAQCreate(BaseModel):
    question: str
    answer: str


class FAQUpdate(BaseModel):
    question: str
    answer: str


class FAQOut(BaseModel):
    id: int
    question: str
    answer: str
    created_at: datetime

    model_config = {"from_attributes": True}
