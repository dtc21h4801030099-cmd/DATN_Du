from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session
from typing import Dict, List

from app.core.deps import get_db, get_current_user, require_admin
from app.models.user import User
from app.models.major import Major
from app.models.registration import MajorRegistration
from app.schemas.registration import (
    RegistrationCreate,
    RegistrationStatusUpdate,
    RegistrationOut,
    RegistrationWithDetails,
)

router = APIRouter(prefix="/registrations", tags=["Registrations"])


@router.post("", response_model=RegistrationOut, status_code=status.HTTP_201_CREATED)
def register_major(
    payload: RegistrationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    major = db.query(Major).filter(Major.id == payload.major_id).first()
    if not major:
        raise HTTPException(status_code=404, detail="Ngành học không tồn tại")

    existing = (
        db.query(MajorRegistration)
        .filter(
            MajorRegistration.user_id == current_user.id,
            MajorRegistration.major_id == payload.major_id,
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Bạn đã đăng ký ngành học này rồi")

    if payload.expected_score is not None and major.benchmark is not None:
        if payload.expected_score < major.benchmark:
            raise HTTPException(
                status_code=400,
                detail=f"Điểm dự kiến ({payload.expected_score}) thấp hơn điểm chuẩn của ngành ({major.benchmark} điểm). Bạn không thể đăng ký ngành này.",
            )

    if major.quota is not None:
        if major.quota == 0:
            raise HTTPException(status_code=400, detail="Ngành học này hiện không tuyển sinh, không thể đăng ký")
        approved_count = (
            db.query(func.count(MajorRegistration.id))
            .filter(MajorRegistration.major_id == payload.major_id, MajorRegistration.status == "approved")
            .scalar()
        )
        if approved_count >= major.quota:
            raise HTTPException(status_code=400, detail="Ngành học này đã đủ chỉ tiêu, không thể đăng ký thêm")

    reg = MajorRegistration(
        user_id=current_user.id,
        major_id=payload.major_id,
        expected_score=payload.expected_score,
        subject_group=payload.subject_group,
        notes=payload.notes,
    )
    db.add(reg)
    db.commit()
    db.refresh(reg)
    return reg


@router.get("/my", response_model=List[RegistrationWithDetails])
def my_registrations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    regs = (
        db.query(MajorRegistration)
        .filter(MajorRegistration.user_id == current_user.id)
        .order_by(MajorRegistration.created_at.desc())
        .all()
    )
    result = []
    for r in regs:
        data = RegistrationWithDetails.model_validate(r)
        data.user_name = current_user.full_name
        data.user_email = current_user.email
        if r.major:
            data.major_name = r.major.name
            data.major_quota = r.major.quota
            if r.major.university:
                data.university_name = r.major.university.name
        approved_count = (
            db.query(func.count(MajorRegistration.id))
            .filter(
                MajorRegistration.major_id == r.major_id,
                MajorRegistration.status == "approved",
            )
            .scalar()
        )
        data.major_approved_count = approved_count
        result.append(data)
    return result


@router.delete("/{reg_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel_registration(
    reg_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    reg = (
        db.query(MajorRegistration)
        .filter(
            MajorRegistration.id == reg_id,
            MajorRegistration.user_id == current_user.id,
        )
        .first()
    )
    if not reg:
        raise HTTPException(status_code=404, detail="Không tìm thấy đăng ký")
    if reg.status != "pending":
        raise HTTPException(status_code=400, detail="Chỉ có thể hủy đăng ký ở trạng thái chờ duyệt")
    db.delete(reg)
    db.commit()


@router.get("/counts", response_model=Dict[int, dict])
def registration_counts(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    rows = (
        db.query(
            MajorRegistration.major_id,
            MajorRegistration.status,
            func.count(MajorRegistration.id).label("cnt"),
        )
        .group_by(MajorRegistration.major_id, MajorRegistration.status)
        .all()
    )
    result: Dict[int, dict] = {}
    for major_id, status_val, cnt in rows:
        if major_id not in result:
            result[major_id] = {"total": 0, "pending": 0, "approved": 0, "rejected": 0}
        result[major_id]["total"] += cnt
        result[major_id][status_val] += cnt
    return result


@router.get("/major/{major_id}", response_model=List[RegistrationWithDetails])
def registrations_by_major(
    major_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    regs = (
        db.query(MajorRegistration)
        .filter(MajorRegistration.major_id == major_id)
        .order_by(MajorRegistration.created_at.desc())
        .all()
    )
    result = []
    for r in regs:
        data = RegistrationWithDetails.model_validate(r)
        if r.user:
            data.user_name = r.user.full_name
            data.user_email = r.user.email
        if r.major:
            data.major_name = r.major.name
            if r.major.university:
                data.university_name = r.major.university.name
        result.append(data)
    return result


@router.put("/{reg_id}/status", response_model=RegistrationOut)
def update_registration_status(
    reg_id: int,
    payload: RegistrationStatusUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    if payload.status not in ("pending", "approved", "rejected"):
        raise HTTPException(status_code=400, detail="Trạng thái không hợp lệ")
    reg = db.query(MajorRegistration).filter(MajorRegistration.id == reg_id).first()
    if not reg:
        raise HTTPException(status_code=404, detail="Không tìm thấy đăng ký")

    if payload.status == "approved":
        major = db.query(Major).filter(Major.id == reg.major_id).first()
        if major and major.quota:
            approved_count = (
                db.query(func.count(MajorRegistration.id))
                .filter(
                    MajorRegistration.major_id == reg.major_id,
                    MajorRegistration.status == "approved",
                    MajorRegistration.id != reg_id,
                )
                .scalar()
            )
            if approved_count >= major.quota:
                raise HTTPException(
                    status_code=400,
                    detail=f"Ngành học đã đủ chỉ tiêu ({major.quota} thí sinh). Không thể duyệt thêm.",
                )

    reg.status = payload.status
    db.commit()
    db.refresh(reg)
    return reg
