from datetime import datetime
from sqlalchemy import DateTime, Enum, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class MajorRegistration(Base):
    __tablename__ = "major_registrations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    major_id: Mapped[int] = mapped_column(Integer, ForeignKey("majors.id"))
    expected_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    subject_group: Mapped[str | None] = mapped_column(String(50), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(
        Enum("pending", "approved", "rejected"), default="pending"
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    user: Mapped["User"] = relationship("User", back_populates="registrations")
    major: Mapped["Major"] = relationship("Major", back_populates="registrations")
