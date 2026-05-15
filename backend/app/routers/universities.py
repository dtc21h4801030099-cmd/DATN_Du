from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.deps import get_db, require_admin
from app.models.user import User
from app.models.university import University
from app.models.major import Major
from app.models.registration import MajorRegistration
from app.schemas.university import UniversityCreate, UniversityUpdate, UniversityOut

router = APIRouter(prefix="/universities", tags=["Universities"])


@router.get("", response_model=List[UniversityOut])
def list_universities(search: str = "", db: Session = Depends(get_db)):
    query = db.query(University)
    if search:
        query = query.filter(University.name.ilike(f"%{search}%"))
    return query.order_by(University.name).all()


@router.get("/{uni_id}", response_model=UniversityOut)
def get_university(uni_id: int, db: Session = Depends(get_db)):
    uni = db.query(University).filter(University.id == uni_id).first()
    if not uni:
        raise HTTPException(status_code=404, detail="Không tìm thấy trường đại học")
    return uni


@router.post("", response_model=UniversityOut, status_code=status.HTTP_201_CREATED)
def create_university(
    payload: UniversityCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    if db.query(University).filter(University.name == payload.name).first():
        raise HTTPException(status_code=400, detail="Trường đại học đã tồn tại")
    uni = University(**payload.model_dump())
    db.add(uni)
    db.commit()
    db.refresh(uni)
    return uni


@router.put("/{uni_id}", response_model=UniversityOut)
def update_university(
    uni_id: int,
    payload: UniversityUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    uni = db.query(University).filter(University.id == uni_id).first()
    if not uni:
        raise HTTPException(status_code=404, detail="Không tìm thấy trường đại học")
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(uni, field, value)
    db.commit()
    db.refresh(uni)
    return uni


@router.delete("/{uni_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_university(
    uni_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    uni = db.query(University).filter(University.id == uni_id).first()
    if not uni:
        raise HTTPException(status_code=404, detail="Không tìm thấy trường đại học")
    major_ids = [m.id for m in db.query(Major.id).filter(Major.university_id == uni_id).all()]
    if major_ids:
        db.query(MajorRegistration).filter(MajorRegistration.major_id.in_(major_ids)).delete(synchronize_session=False)
        db.query(Major).filter(Major.university_id == uni_id).delete(synchronize_session=False)
    db.delete(uni)
    db.commit()
