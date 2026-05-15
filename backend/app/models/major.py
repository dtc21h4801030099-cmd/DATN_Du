from datetime import datetime
from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Major(Base):
    __tablename__ = "majors"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(200), index=True)
    code: Mapped[str | None] = mapped_column(String(20), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    subject_group: Mapped[str | None] = mapped_column(String(50), nullable=True)
    benchmark: Mapped[float | None] = mapped_column(Float, nullable=True)
    quota: Mapped[int | None] = mapped_column(Integer, nullable=True)
    university_id: Mapped[int] = mapped_column(Integer, ForeignKey("universities.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    university: Mapped["University"] = relationship("University", back_populates="majors")
    registrations: Mapped[list["MajorRegistration"]] = relationship("MajorRegistration", back_populates="major")
