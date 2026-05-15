from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.deps import get_db, require_admin
from app.models.faq import FAQ
from app.schemas.faq import FAQCreate, FAQUpdate, FAQOut

router = APIRouter(prefix="/faq", tags=["FAQ"])


@router.get("", response_model=List[FAQOut])
def list_faqs(db: Session = Depends(get_db)):
    return db.query(FAQ).order_by(FAQ.created_at.desc()).all()


@router.post("", response_model=FAQOut)
def create_faq(
    payload: FAQCreate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    faq = FAQ(question=payload.question, answer=payload.answer)
    db.add(faq)
    db.commit()
    db.refresh(faq)
    return faq


@router.put("/{faq_id}", response_model=FAQOut)
def update_faq(
    faq_id: int,
    payload: FAQUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    faq = db.query(FAQ).filter(FAQ.id == faq_id).first()
    if not faq:
        raise HTTPException(status_code=404, detail="FAQ không tồn tại")
    faq.question = payload.question
    faq.answer = payload.answer
    db.commit()
    db.refresh(faq)
    return faq


@router.delete("/{faq_id}")
def delete_faq(
    faq_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    faq = db.query(FAQ).filter(FAQ.id == faq_id).first()
    if not faq:
        raise HTTPException(status_code=404, detail="FAQ không tồn tại")
    db.delete(faq)
    db.commit()
    return {"ok": True}
